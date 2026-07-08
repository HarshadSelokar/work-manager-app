import React, { useState, useMemo, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '@navigation/types';
import {
  AppContainer,
  Text,
  Button,
  PriorityBadge,
  StatusChip,
  DeadlineChip,
  GlassCard,
  GradientBackground,
} from '@components/common';
import { WorksRepository } from '../repository/works.repository';
import { Work, WorkStatus, WorkPriority } from '@models/index';
import { theme } from '@theme/index';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Link2,
  Image as ImageIcon,
  CheckCircle2,
  RotateCcw,
  Zap,
  X,
  ExternalLink,
} from 'lucide-react-native';
import { Linking } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkDetails'>;

export const WorkDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { workId } = route.params;
  const worksRepo = useMemo(() => new WorksRepository(), []);
  const [work, setWork] = useState<Work | null>(null);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

  const fetchWorkDetails = useCallback(() => {
    try {
      const data = worksRepo.findById(workId);
      setWork(data);
    } catch (error) {
      console.error('Failed to load task details:', error);
    }
  }, [workId, worksRepo]);

  useFocusEffect(
    useCallback(() => { fetchWorkDetails(); }, [fetchWorkDetails])
  );

  const handleToggleCompletion = useCallback(() => {
    if (!work) return;
    const newStatus = work.status === WorkStatus.COMPLETED ? WorkStatus.IN_PROGRESS : WorkStatus.COMPLETED;
    const updated: Work = { ...work, status: newStatus, updatedAt: new Date() };
    try {
      worksRepo.update(updated);
      fetchWorkDetails();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update task status.');
    }
  }, [work, worksRepo, fetchWorkDetails]);

  const updatePriority = useCallback((newPriority: WorkPriority) => {
    if (!work) return;
    const updated: Work = { ...work, priority: newPriority, updatedAt: new Date() };
    try {
      worksRepo.update(updated);
      fetchWorkDetails();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update priority.');
    }
  }, [work, worksRepo, fetchWorkDetails]);

  const handleChangePriority = useCallback(() => {
    if (!work) return;
    Alert.alert(
      'Change Priority',
      'Select a new priority level:',
      [
        { text: 'Low', onPress: () => updatePriority(WorkPriority.LOW) },
        { text: 'Medium', onPress: () => updatePriority(WorkPriority.MEDIUM) },
        { text: 'High', onPress: () => updatePriority(WorkPriority.HIGH) },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  }, [work, updatePriority]);

  const handleOpenLink = useCallback((url: string) => {
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) { Linking.openURL(url); }
        else { Alert.alert('Invalid URL', `Cannot open: ${url}`); }
      })
      .catch(err => console.error('Link error', err));
  }, []);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Task',
      'This will permanently delete the task and all its attachments.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              worksRepo.delete(workId);
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete task.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [workId, worksRepo, navigation]);

  if (!work) {
    return (
      <AppContainer style={styles.errorContainer}>
        <Text variant="displaySmall" color="danger">Task Not Found</Text>
        <Button title="Go Back" variant="secondary" onPress={() => navigation.goBack()} />
      </AppContainer>
    );
  }

  const isCompleted = work.status === WorkStatus.COMPLETED;

  return (
    <AppContainer safeAreaSides={['top', 'left', 'right']} style={styles.container}>
      <GradientBackground>
        {/* ─── Nav Header ─── */}
        <View style={styles.navBar}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={theme.colors.textPrimary} />
          </Pressable>
          <View style={styles.navActions}>
            <Pressable
              style={styles.navIconBtn}
              onPress={() => navigation.navigate('EditWork', { workId: work.id })}
            >
              <Edit3 size={18} color={theme.colors.textSecondary} />
            </Pressable>
            <Pressable style={[styles.navIconBtn, styles.navDeleteBtn]} onPress={handleDelete}>
              <Trash2 size={18} color={theme.colors.danger} />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* ─── Title & Badges ─── */}
          <View style={styles.titleBlock}>
            <Text variant="displaySmall" fontWeight="bold" style={styles.titleText}>
              {work.title}
            </Text>
            <View style={styles.badgeRow}>
              <PriorityBadge priority={work.priority} size="md" />
              <StatusChip status={work.status} size="md" />
              {work.reference ? (
                <View style={styles.refBadge}>
                  <Text variant="caption" color="textSecondary" fontWeight="semiBold">
                    #{work.reference}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* ─── Meta Grid ─── */}
          <GlassCard style={styles.metaCard} elevation="sm">
            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Text variant="overline" color="textTertiary">Category</Text>
                <Text variant="bodyMedium" fontWeight="semiBold" style={styles.metaValue}>
                  {work.category.toUpperCase()}
                </Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Text variant="overline" color="textTertiary">Status</Text>
                <Text
                  variant="bodyMedium"
                  fontWeight="semiBold"
                  style={[styles.metaValue, { color: isCompleted ? theme.colors.success : theme.colors.info }]}
                >
                  {work.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              {work.deadline ? (
                <>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Text variant="overline" color="textTertiary">Deadline</Text>
                    <DeadlineChip deadline={work.deadline} />
                  </View>
                </>
              ) : null}
            </View>
          </GlassCard>

          {/* ─── Description ─── */}
          {work.description ? (
            <View style={styles.section}>
              <Text variant="overline" color="textTertiary" style={styles.sectionLabel}>
                Description
              </Text>
              <GlassCard style={styles.descCard} elevation="xs">
                <Text variant="bodyLarge" style={styles.descText}>
                  {work.description}
                </Text>
              </GlassCard>
            </View>
          ) : null}

          {/* ─── Links ─── */}
          {work.links && work.links.length > 0 && (
            <View style={styles.section}>
              <Text variant="overline" color="textTertiary" style={styles.sectionLabel}>
                Links & Bookmarks · {work.links.length}
              </Text>
              <View style={styles.linksContainer}>
                {work.links.map(l => (
                  <Pressable
                    key={l.id}
                    style={styles.linkCard}
                    onPress={() => handleOpenLink(l.url)}
                    android_ripple={{ color: 'rgba(124, 92, 252, 0.1)' }}
                  >
                    <View style={styles.linkIconBox}>
                      <Link2 size={14} color={theme.colors.primary} />
                    </View>
                    <View style={styles.linkContent}>
                      <Text variant="bodyMedium" fontWeight="semiBold" color="primary" numberOfLines={1}>
                        {l.title || l.url}
                      </Text>
                      <Text variant="caption" color="textTertiary" numberOfLines={1}>
                        {l.url}
                      </Text>
                    </View>
                    <ExternalLink size={14} color={theme.colors.textTertiary} />
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* ─── Images ─── */}
          {work.images && work.images.length > 0 && (
            <View style={styles.section}>
              <Text variant="overline" color="textTertiary" style={styles.sectionLabel}>
                Image Attachments · {work.images.length}
              </Text>
              <View style={styles.imagesGrid}>
                {work.images.map(img => (
                  <TouchableOpacity
                    key={img.id}
                    activeOpacity={0.85}
                    style={styles.imageThumb}
                    onPress={() => setPreviewImageUri(img.imagePath)}
                  >
                    <Image source={{ uri: img.imagePath }} style={styles.thumbnailImage} />
                    <View style={styles.imageOverlay}>
                      <ImageIcon size={14} color="rgba(255,255,255,0.8)" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ─── Timestamps ─── */}
          <GlassCard style={styles.auditCard} elevation="xs">
            <Text variant="caption" color="textTertiary">
              Created: {work.createdAt.toLocaleString()}
            </Text>
            <Text variant="caption" color="textTertiary" style={styles.updatedAt}>
              Updated: {work.updatedAt.toLocaleString()}
            </Text>
          </GlassCard>

          {/* ─── Action Buttons ─── */}
          <View style={styles.actionsBlock}>
            <Button
              title={isCompleted ? 'Restore to In Progress' : 'Mark as Completed'}
              variant={isCompleted ? 'secondary' : 'primary'}
              icon={isCompleted
                ? <RotateCcw size={16} color={theme.colors.primary} />
                : <CheckCircle2 size={16} color="#FFFFFF" />
              }
              onPress={handleToggleCompletion}
            />
            <View style={styles.actionsRow}>
              <Button
                title="Edit"
                variant="outlined"
                icon={<Edit3 size={15} color={theme.colors.textPrimary} />}
                onPress={() => navigation.navigate('EditWork', { workId: work.id })}
                style={styles.actionBtnHalf}
              />
              <Button
                title="Priority"
                variant="outlined"
                icon={<Zap size={15} color={theme.colors.warning} />}
                onPress={handleChangePriority}
                style={styles.actionBtnHalf}
              />
            </View>
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
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navActions: { flexDirection: 'row', gap: theme.spacing.sm },
  navIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navDeleteBtn: { borderColor: 'rgba(239, 68, 68, 0.25)' },
  scrollContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.sm,
  },
  titleBlock: { marginBottom: theme.spacing.md },
  titleText: { lineHeight: 34, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flexWrap: 'wrap' },
  refBadge: {
    backgroundColor: theme.colors.elevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.round,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metaCard: { marginBottom: theme.spacing.lg, padding: 0, overflow: 'hidden' },
  metaGrid: { flexDirection: 'row', alignItems: 'stretch' },
  metaItem: { flex: 1, padding: theme.spacing.md, gap: 4 },
  metaDivider: { width: 1, backgroundColor: theme.colors.divider },
  metaValue: { color: theme.colors.textPrimary, marginTop: 2 },
  section: { marginBottom: theme.spacing.lg },
  sectionLabel: { marginBottom: theme.spacing.sm },
  descCard: { padding: theme.spacing.md },
  descText: { lineHeight: 22, color: theme.colors.textSecondary },
  linksContainer: { gap: theme.spacing.sm },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.elevation.xs,
  },
  linkIconBox: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkContent: { flex: 1 },
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
    borderRadius: 6,
    padding: 3,
  },
  auditCard: { padding: theme.spacing.md, gap: 4, marginBottom: theme.spacing.md },
  updatedAt: { marginTop: 2 },
  actionsBlock: { gap: theme.spacing.sm },
  actionsRow: { flexDirection: 'row', gap: theme.spacing.sm },
  actionBtnHalf: { flex: 1 },
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
