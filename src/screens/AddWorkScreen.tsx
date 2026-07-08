import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { AppContainer, Text, Button, Divider, GlassCard } from '@components/common';
import { WorksRepository } from '../repository/works.repository';
import { Work, WorkStatus, WorkCategory, WorkPriority } from '@models/index';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { theme } from '@theme/index';
import {
  ArrowLeft,
  Save,
  Camera,
  Image as ImageIcon,
  Link2,
  Trash2,
  X,
  Calendar,
} from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'AddWork'>;

export const AddWorkScreen: React.FC<Props> = ({ navigation }) => {
  const worksRepo = useMemo(() => new WorksRepository(), []);

  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [priority, setPriority] = useState<WorkPriority>(WorkPriority.MEDIUM);
  const [category, setCategory] = useState<WorkCategory>(WorkCategory.TODAY);
  const [description, setDescription] = useState('');
  const [deadlineString, setDeadlineString] = useState('');
  const [links, setLinks] = useState<{ id: string; url: string; title: string }[]>([]);
  const [images, setImages] = useState<{ id: string; imagePath: string }[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');

  const handleSelectImage = useCallback((source: 'camera' | 'gallery') => {
    const options = { mediaType: 'photo' as const, quality: 0.8, saveToPhotos: true };
    const callback = (response: any) => {
      if (response.didCancel) return;
      if (response.errorMessage) { Alert.alert('Error', response.errorMessage); return; }
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.uri) {
          setImages(prev => [...prev, {
            id: 'img-' + Math.random().toString(36).substring(2, 9),
            imagePath: asset.uri,
          }]);
        }
      }
    };
    if (source === 'camera') { launchCamera(options as any, callback); }
    else { launchImageLibrary(options as any, callback); }
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const handleAddLink = useCallback(() => {
    if (!newLinkUrl.trim()) { Alert.alert('Validation', 'Link URL is required.'); return; }
    const cleanUrl = newLinkUrl.trim();
    setLinks(prev => [...prev, {
      id: 'link-' + Math.random().toString(36).substring(2, 9),
      url: cleanUrl,
      title: newLinkTitle.trim() || cleanUrl,
    }]);
    setNewLinkUrl('');
    setNewLinkTitle('');
  }, [newLinkUrl, newLinkTitle]);

  const handleRemoveLink = useCallback((id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id));
  }, []);

  const handleSave = useCallback(() => {
    if (!title.trim()) { Alert.alert('Validation', 'Task title is required.'); return; }

    const cleanRef = reference.trim();
    if (cleanRef && worksRepo.referenceExists(cleanRef)) {
      Alert.alert('Duplicate Reference', `A task with reference "${cleanRef}" already exists.`);
      return;
    }

    let parsedDeadline: Date | undefined;
    if (deadlineString.trim()) {
      const parts = deadlineString.trim().split('-');
      if (parts.length === 3) {
        const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (!isNaN(dateObj.getTime())) { parsedDeadline = dateObj; }
        else { Alert.alert('Validation', 'Deadline date is invalid. Use YYYY-MM-DD.'); return; }
      } else { Alert.alert('Validation', 'Deadline format is invalid. Use YYYY-MM-DD.'); return; }
    }

    const newWorkId = 'work-' + Math.random().toString(36).substring(2, 15);
    const newWork: Work = {
      id: newWorkId,
      title: title.trim(),
      reference: cleanRef || undefined,
      description: description.trim() || undefined,
      priority,
      category,
      deadline: parsedDeadline,
      status: WorkStatus.TODO,
      createdAt: new Date(),
      updatedAt: new Date(),
      images: images.map(img => ({ id: img.id, workId: newWorkId, imagePath: img.imagePath })),
      links: links.map(link => ({ id: link.id, workId: newWorkId, url: link.url, title: link.title || undefined })),
    };

    try {
      worksRepo.create(newWork);
      Alert.alert('Success', 'Task created successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error: any) {
      Alert.alert('Save Error', error.message || 'Failed to save the task.');
    }
  }, [title, reference, priority, category, description, deadlineString, images, links, worksRepo, navigation]);

  const PRIORITY_OPTIONS = [
    { value: WorkPriority.LOW, color: theme.colors.priorityLow, bg: theme.colors.priorityLowBg, label: 'Low' },
    { value: WorkPriority.MEDIUM, color: theme.colors.priorityMedium, bg: theme.colors.priorityMediumBg, label: 'Medium' },
    { value: WorkPriority.HIGH, color: theme.colors.priorityHigh, bg: theme.colors.priorityHighBg, label: 'High' },
  ];

  return (
    <AppContainer safeAreaSides={['top', 'left', 'right']} style={styles.container}>
      {/* ─── Nav Bar ─── */}
      <View style={styles.navBar}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <Text variant="titleMedium" fontWeight="bold">New Task</Text>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Save size={16} color="#FFFFFF" />
          <Text variant="caption" fontWeight="bold" style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* ─── Title ─── */}
        <View style={styles.inputGroup}>
          <Text variant="overline" color="textSecondary" style={styles.label}>TITLE *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="What needs to be done?"
            placeholderTextColor={theme.colors.textTertiary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* ─── Reference ─── */}
        <View style={styles.inputGroup}>
          <Text variant="overline" color="textSecondary" style={styles.label}>REFERENCE CODE</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. REF-1002 (optional)"
            placeholderTextColor={theme.colors.textTertiary}
            value={reference}
            onChangeText={setReference}
            autoCapitalize="characters"
          />
        </View>

        {/* ─── Category Toggle ─── */}
        <View style={styles.inputGroup}>
          <Text variant="overline" color="textSecondary" style={styles.label}>CATEGORY</Text>
          <View style={styles.segmentControl}>
            <TouchableOpacity
              style={[styles.segmentTab, category === WorkCategory.TODAY && styles.segmentTabActive]}
              onPress={() => setCategory(WorkCategory.TODAY)}
            >
              <Text variant="bodySmall" fontWeight="semiBold" style={category === WorkCategory.TODAY ? styles.segmentTextActive : styles.segmentText}>
                Today's Routine
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentTab, category === WorkCategory.OTHER && styles.segmentTabActive]}
              onPress={() => setCategory(WorkCategory.OTHER)}
            >
              <Text variant="bodySmall" fontWeight="semiBold" style={category === WorkCategory.OTHER ? styles.segmentTextActive : styles.segmentText}>
                Upcoming
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Priority ─── */}
        <View style={styles.inputGroup}>
          <Text variant="overline" color="textSecondary" style={styles.label}>PRIORITY</Text>
          <View style={styles.priorityRow}>
            {PRIORITY_OPTIONS.map(item => {
              const isSelected = priority === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.priorityChip,
                    { borderColor: isSelected ? item.color : theme.colors.border },
                    isSelected && { backgroundColor: item.bg },
                  ]}
                  onPress={() => setPriority(item.value)}
                >
                  <View style={[styles.priorityDot, { backgroundColor: item.color }]} />
                  <Text variant="bodySmall" fontWeight="semiBold" style={{ color: isSelected ? item.color : theme.colors.textSecondary }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ─── Description ─── */}
        <View style={styles.inputGroup}>
          <Text variant="overline" color="textSecondary" style={styles.label}>DESCRIPTION</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Add details about this task..."
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* ─── Deadline ─── */}
        <View style={styles.inputGroup}>
          <Text variant="overline" color="textSecondary" style={styles.label}>DEADLINE</Text>
          <View style={styles.deadlineRow}>
            <Calendar size={16} color={theme.colors.textTertiary} style={styles.deadlineIcon} />
            <TextInput
              style={[styles.textInput, styles.deadlineInput]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.textTertiary}
              value={deadlineString}
              onChangeText={setDeadlineString}
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* ─── Links ─── */}
        <Text variant="overline" color="textTertiary" style={styles.sectionHeader}>LINKS & BOOKMARKS</Text>
        <GlassCard style={styles.linkForm} elevation="xs">
          <TextInput
            style={[styles.textInput, styles.linkInput]}
            placeholder="Link label (optional)"
            placeholderTextColor={theme.colors.textTertiary}
            value={newLinkTitle}
            onChangeText={setNewLinkTitle}
          />
          <TextInput
            style={[styles.textInput, styles.linkInput]}
            placeholder="https://..."
            placeholderTextColor={theme.colors.textTertiary}
            value={newLinkUrl}
            onChangeText={setNewLinkUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
          <Pressable style={styles.addLinkBtn} onPress={handleAddLink}>
            <Link2 size={14} color={theme.colors.primary} />
            <Text variant="bodySmall" fontWeight="semiBold" color="primary">Add Link</Text>
          </Pressable>
        </GlassCard>

        {links.length > 0 && (
          <View style={styles.linksList}>
            {links.map(l => (
              <View key={l.id} style={styles.linkRow}>
                <View style={styles.linkIconBox}>
                  <Link2 size={12} color={theme.colors.primary} />
                </View>
                <View style={styles.linkText}>
                  <Text variant="bodySmall" fontWeight="semiBold" numberOfLines={1}>{l.title}</Text>
                  <Text variant="caption" color="textSecondary" numberOfLines={1}>{l.url}</Text>
                </View>
                <Pressable style={styles.removeBtn} onPress={() => handleRemoveLink(l.id)}>
                  <X size={14} color={theme.colors.danger} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Divider style={styles.divider} />

        {/* ─── Images ─── */}
        <Text variant="overline" color="textTertiary" style={styles.sectionHeader}>IMAGE ATTACHMENTS</Text>
        <View style={styles.imagePickerRow}>
          <Pressable style={styles.imagePickerBtn} onPress={() => handleSelectImage('camera')}>
            <Camera size={18} color={theme.colors.primary} />
            <Text variant="bodySmall" fontWeight="semiBold" color="primary">Camera</Text>
          </Pressable>
          <Pressable style={styles.imagePickerBtn} onPress={() => handleSelectImage('gallery')}>
            <ImageIcon size={18} color={theme.colors.secondary} />
            <Text variant="bodySmall" fontWeight="semiBold" style={styles.galleryText}>Gallery</Text>
          </Pressable>
        </View>

        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScrollContent}>
            {images.map(img => (
              <View key={img.id} style={styles.imageWrapper}>
                <Image source={{ uri: img.imagePath }} style={styles.previewImage} />
                <Pressable style={styles.removeImageBtn} onPress={() => handleRemoveImage(img.id)}>
                  <Trash2 size={12} color="#FFFFFF" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        <Divider style={styles.divider} />

        {/* ─── Actions ─── */}
        <View style={styles.actionRow}>
          <Button title="Save Task" variant="primary" onPress={handleSave} style={styles.actionBtnFlex} />
          <Button title="Cancel" variant="outlined" onPress={() => navigation.goBack()} style={styles.actionBtnFlex} />
        </View>
      </ScrollView>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.background },
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
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
  },
  saveBtnText: { color: '#FFFFFF' },
  scrollContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  inputGroup: { marginBottom: theme.spacing.md },
  label: { marginBottom: 6 },
  textInput: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    color: theme.colors.textPrimary,
    fontSize: 15,
    ...theme.elevation.xs,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 3,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
  },
  segmentTabActive: {
    backgroundColor: theme.colors.card,
    ...theme.elevation.xs,
  },
  segmentText: { color: theme.colors.textSecondary },
  segmentTextActive: { color: theme.colors.primary },
  priorityRow: { flexDirection: 'row', gap: theme.spacing.sm },
  priorityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    backgroundColor: theme.colors.card,
    ...theme.elevation.xs,
  },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  deadlineRow: { flexDirection: 'row', alignItems: 'center' },
  deadlineIcon: { position: 'absolute', left: 14, zIndex: 1 },
  deadlineInput: { flex: 1, paddingLeft: 40 },
  divider: { marginVertical: theme.spacing.lg },
  sectionHeader: { marginBottom: theme.spacing.sm },
  linkForm: { padding: theme.spacing.md, marginBottom: theme.spacing.sm },
  linkInput: { marginBottom: theme.spacing.sm },
  addLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  linksList: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  linkIconBox: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: { flex: 1 },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  imagePickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.elevation.xs,
  },
  galleryText: { color: theme.colors.secondary },
  imageScrollContent: { gap: theme.spacing.sm, paddingVertical: theme.spacing.sm },
  imageWrapper: { position: 'relative' },
  previewImage: {
    width: 90,
    height: 90,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.border,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: theme.colors.danger,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: { flexDirection: 'row', gap: theme.spacing.md },
  actionBtnFlex: { flex: 1 },
});
