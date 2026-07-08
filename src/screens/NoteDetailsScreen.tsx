import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { AppContainer, Text, Button, GlassCard, GradientBackground } from '@components/common';
import { NotesRepository } from '../repository/notes.repository';
import { WorksRepository } from '../repository/works.repository';
import { Note, Work, WorkStatus, WorkCategory, WorkPriority } from '@models/index';
import { theme } from '@theme/index';
import {
  ArrowLeft,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
  X,
  FileText,
  Calendar,
} from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'NoteDetails'>;

export const NoteDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { noteId } = route.params;
  const notesRepo = useMemo(() => new NotesRepository(), []);
  const worksRepo = useMemo(() => new WorksRepository(), []);
  const [note, setNote] = useState<Note | null>(null);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

  useEffect(() => {
    try {
      const data = notesRepo.findById(noteId);
      setNote(data);
    } catch (err) {
      console.error('Failed to load note:', err);
    }
  }, [noteId, notesRepo]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'This will permanently delete the note and all its attachments.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              notesRepo.delete(noteId);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete note.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleConvertToWork = () => {
    if (!note) return;
    Alert.alert(
      'Convert to Task',
      'Select a category for the new task:',
      [
        { text: "Today's Routine", onPress: () => performConversion(WorkCategory.TODAY) },
        { text: 'Upcoming Backlog', onPress: () => performConversion(WorkCategory.OTHER) },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const performConversion = (targetCategory: WorkCategory) => {
    if (!note) return;
    const newWorkId = 'work-' + Math.random().toString(36).substring(2, 15);
    const convertedTitle = note.title ? note.title.trim() : note.content.trim().substring(0, 50) + '...';
    const convertedRef = 'REF-N-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newWork: Work = {
      id: newWorkId,
      title: convertedTitle,
      reference: convertedRef,
      description: note.content,
      priority: WorkPriority.MEDIUM,
      category: targetCategory,
      status: WorkStatus.TODO,
      createdAt: new Date(),
      updatedAt: new Date(),
      images: note.images.map(img => ({
        id: 'img-' + Math.random().toString(36).substring(2, 9),
        workId: newWorkId,
        imagePath: img.imagePath,
      })),
      links: [],
    };
    try {
      worksRepo.create(newWork);
      notesRepo.delete(note.id);
      Alert.alert('Converted!', `Note converted to task: "${convertedTitle}"`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Conversion failed.');
    }
  };

  if (!note) {
    return (
      <AppContainer style={styles.errorContainer}>
        <Text variant="displaySmall" color="danger">Note Not Found</Text>
        <Button title="Go Back" variant="secondary" onPress={() => navigation.goBack()} />
      </AppContainer>
    );
  }

  return (
    <AppContainer safeAreaSides={['top', 'left', 'right']} style={styles.container}>
      <GradientBackground>
        {/* ─── Nav Bar ─── */}
        <View style={styles.navBar}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={theme.colors.textPrimary} />
          </Pressable>
          <View style={styles.navCenter}>
            <FileText size={15} color={theme.colors.secondary} />
            <Text variant="bodyMedium" fontWeight="semiBold" color="textSecondary">Quick Note</Text>
          </View>
          <Pressable style={styles.deleteNavBtn} onPress={handleDelete}>
            <Trash2 size={18} color={theme.colors.danger} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* ─── Title & Date ─── */}
          <View style={styles.headerBlock}>
            <Text variant="displaySmall" fontWeight="bold" style={styles.titleText}>
              {note.title || 'Untitled Note'}
            </Text>
            <View style={styles.dateLine}>
              <Calendar size={12} color={theme.colors.textTertiary} />
              <Text variant="caption" color="textTertiary">
                {note.createdAt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
            </View>
          </View>

          {/* ─── Content ─── */}
          <GlassCard style={styles.contentCard} elevation="xs">
            <Text variant="bodyLarge" style={styles.contentText}>
              {note.content}
            </Text>
            <Text variant="caption" color="textTertiary" style={styles.charCount}>
              {note.content.length} characters
            </Text>
          </GlassCard>

          {/* ─── Images ─── */}
          {note.images && note.images.length > 0 ? (
            <View style={styles.imagesSection}>
              <Text variant="overline" color="textTertiary" style={styles.imagesLabel}>
                ATTACHMENTS · {note.images.length}
              </Text>
              <View style={styles.imagesGrid}>
                {note.images.map(img => (
                  <TouchableOpacity
                    key={img.id}
                    style={styles.imageThumb}
                    onPress={() => setPreviewImageUri(img.imagePath)}
                  >
                    <Image source={{ uri: img.imagePath }} style={styles.thumbnailImage} />
                    <View style={styles.imageOverlay}>
                      <ImageIcon size={12} color="rgba(255,255,255,0.8)" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* ─── Actions ─── */}
          <View style={styles.actionsBlock}>
            <Button
              title="Convert to Task"
              variant="primary"
              icon={<RefreshCw size={16} color="#FFFFFF" />}
              onPress={handleConvertToWork}
            />
            <Button
              title="Delete Note"
              variant="danger"
              icon={<Trash2 size={16} color="#FFFFFF" />}
              onPress={handleDelete}
            />
          </View>
        </ScrollView>

        {/* ─── Image Preview Modal ─── */}
        <Modal visible={previewImageUri !== null} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalCloseBtn} onPress={() => setPreviewImageUri(null)}>
              <X size={22} color="#FFFFFF" />
            </Pressable>
            {previewImageUri ? (
              <Image source={{ uri: previewImageUri }} style={styles.fullscreenImage} resizeMode="contain" />
            ) : null}
          </View>
        </Modal>
      </GradientBackground>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.background },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  deleteNavBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  headerBlock: { marginBottom: theme.spacing.md },
  titleText: { lineHeight: 34, marginBottom: 6 },
  dateLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  contentCard: { padding: theme.spacing.md, marginBottom: theme.spacing.lg },
  contentText: { lineHeight: 26, color: theme.colors.textSecondary },
  charCount: { marginTop: theme.spacing.sm, textAlign: 'right' },
  imagesSection: { marginBottom: theme.spacing.lg },
  imagesLabel: { marginBottom: theme.spacing.sm },
  imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  imageThumb: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    ...theme.elevation.xs,
  },
  thumbnailImage: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
    padding: 3,
  },
  actionsBlock: { gap: theme.spacing.sm },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 44,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fullscreenImage: { width: '90%', height: '80%' },
});
