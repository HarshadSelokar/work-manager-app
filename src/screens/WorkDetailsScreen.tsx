import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '@navigation/types';
import { AppContainer, Text, Button, PriorityBadge, DeadlineChip, Divider } from '@components/common';
import { WorksRepository } from '../repository/works.repository';
import { Work, WorkStatus, WorkPriority } from '@models/index';
import { theme } from '@theme/index';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkDetails'>;

export const WorkDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { workId } = route.params;
  const worksRepo = useMemo(() => new WorksRepository(), []);
  const [work, setWork] = useState<Work | null>(null);

  // For fullscreen image preview modal
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

  const fetchWorkDetails = useCallback(() => {
    try {
      const data = worksRepo.findById(workId);
      setWork(data);
    } catch (error) {
      console.error('Failed to load task details:', error);
    }
  }, [workId, worksRepo]);

  // Load details on mount and focus (in case edited)
  useFocusEffect(
    useCallback(() => {
      fetchWorkDetails();
    }, [fetchWorkDetails])
  );

  // Completion Toggle Actions
  const handleToggleCompletion = useCallback(() => {
    if (!work) {
      return;
    }
    const newStatus =
      work.status === WorkStatus.COMPLETED ? WorkStatus.IN_PROGRESS : WorkStatus.COMPLETED;
    const updated: Work = {
      ...work,
      status: newStatus,
      updatedAt: new Date(),
    };

    try {
      worksRepo.update(updated);
      fetchWorkDetails();
      Alert.alert('Success', `Task marked as ${newStatus.replace('_', ' ')}.`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update task status.');
    }
  }, [work, worksRepo, fetchWorkDetails]);

  // Change Priority Actions
  const handleChangePriority = useCallback(() => {
    if (!work) {
      return;
    }
    Alert.alert(
      'Change Priority',
      'Select a priority level for this task:',
      [
        {
          text: 'LOW',
          onPress: () => updatePriority(WorkPriority.LOW),
        },
        {
          text: 'MEDIUM',
          onPress: () => updatePriority(WorkPriority.MEDIUM),
        },
        {
          text: 'HIGH',
          onPress: () => updatePriority(WorkPriority.HIGH),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  }, [work]);

  const updatePriority = (newPriority: WorkPriority) => {
    if (!work) {
      return;
    }
    const updated: Work = {
      ...work,
      priority: newPriority,
      updatedAt: new Date(),
    };

    try {
      worksRepo.update(updated);
      fetchWorkDetails();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update task priority.');
    }
  };

  // Open URL Link
  const handleOpenLink = useCallback((url: string) => {
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Invalid URL', `Cannot open address: ${url}`);
        }
      })
      .catch(err => console.error('An error occurred linking', err));
  }, []);

  // Delete Action
  const handleDelete = useCallback(() => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to permanently delete this task? All attached links and images will be cascade deleted.',
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
        <Text variant="displaySmall" color="danger" style={styles.errorText}>
          Task Not Found
        </Text>
        <Button title="Go Back" variant="secondary" onPress={() => navigation.goBack()} />
      </AppContainer>
    );
  }

  const isCompleted = work.status === WorkStatus.COMPLETED;

  return (
    <AppContainer safeAreaSides={['top', 'left', 'right']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Block */}
        <View style={styles.headerBlock}>
          <View style={styles.titleRow}>
            <Text variant="displaySmall" fontWeight="bold" style={styles.title}>
              {work.title}
            </Text>
          </View>
          <View style={styles.badgeRow}>
            <PriorityBadge priority={work.priority} size="md" />
            {work.reference ? (
              <Text variant="caption" color="textSecondary" style={styles.refText}>
                #{work.reference}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Status / Category / Deadline Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <Text variant="overline" color="textTertiary">
              Status
            </Text>
            <Text variant="bodyLarge" fontWeight="semiBold" style={[styles.gridValue, { color: isCompleted ? theme.colors.success : theme.colors.primary }]}>
              {work.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text variant="overline" color="textTertiary">
              Category
            </Text>
            <Text variant="bodyLarge" fontWeight="semiBold" style={styles.gridValue}>
              {work.category.toUpperCase()}
            </Text>
          </View>
          {work.deadline ? (
            <View style={styles.gridItem}>
              <Text variant="overline" color="textTertiary" style={{ marginBottom: 4 }}>
                Deadline
              </Text>
              <DeadlineChip deadline={work.deadline} />
            </View>
          ) : null}
        </View>

        {/* Description Section */}
        {work.description ? (
          <View style={styles.sectionBlock}>
            <Text variant="overline" color="textTertiary" style={styles.sectionTitle}>
              Description
            </Text>
            <Text variant="bodyLarge" style={styles.descriptionText}>
              {work.description}
            </Text>
          </View>
        ) : null}

        {/* Bookmarks Section */}
        {work.links && work.links.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text variant="overline" color="textTertiary" style={styles.sectionTitle}>
              Links & Bookmarks ({work.links.length})
            </Text>
            <View style={styles.linksContainer}>
              {work.links.map(l => (
                <TouchableOpacity key={l.id} activeOpacity={0.7} style={styles.linkCard} onPress={() => handleOpenLink(l.url)}>
                  <Text variant="bodyLarge" fontWeight="semiBold" color="primary" numberOfLines={1}>
                    🔗  {l.title || l.url}
                  </Text>
                  <Text variant="caption" color="textTertiary" numberOfLines={1} style={{ marginTop: 2 }}>
                    {l.url}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Images Grid Section */}
        {work.images && work.images.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text variant="overline" color="textTertiary" style={styles.sectionTitle}>
              Image Attachments ({work.images.length})
            </Text>
            <View style={styles.imagesGrid}>
              {work.images.map(img => (
                <TouchableOpacity
                  key={img.id}
                  activeOpacity={0.8}
                  style={styles.imageCard}
                  onPress={() => setPreviewImageUri(img.imagePath)}
                >
                  <Image source={{ uri: img.imagePath }} style={styles.gridImage} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Divider style={styles.sectionDivider} />

        {/* Audit Timestamps */}
        <View style={styles.auditBlock}>
          <Text variant="caption" color="textTertiary">
            Created: {work.createdAt.toLocaleString()}
          </Text>
          <Text variant="caption" color="textTertiary">
            Last Updated: {work.updatedAt.toLocaleString()}
          </Text>
        </View>

        <Divider style={styles.sectionDivider} />

        {/* Action Controls Menu */}
        <View style={styles.actionsMenu}>
          <Button
            title={isCompleted ? '↩️  Undo Task Completion' : '✅  Mark as Completed'}
            variant={isCompleted ? 'secondary' : 'primary'}
            onPress={handleToggleCompletion}
          />
          <View style={styles.buttonRow}>
            <Button
              title="✏️  Edit Task"
              variant="secondary"
              onPress={() => navigation.navigate('EditWork', { workId: work.id })}
              style={styles.btnThird}
            />
            <Button
              title="⚡  Priority"
              variant="secondary"
              onPress={handleChangePriority}
              style={styles.btnThird}
            />
            <Button
              title="🗑️  Delete"
              variant="danger"
              onPress={handleDelete}
              style={styles.btnThird}
            />
          </View>
        </View>
      </ScrollView>

      {/* Fullscreen Image Preview Modal */}
      <Modal visible={previewImageUri !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setPreviewImageUri(null)}>
            <Text variant="bodyLarge" fontWeight="bold" style={{ color: '#ffffff' }}>
              ✕ Close Preview
            </Text>
          </TouchableOpacity>
          {previewImageUri ? (
            <Image source={{ uri: previewImageUri }} style={styles.fullscreenImage} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    marginBottom: theme.spacing.md,
  },
  headerBlock: {
    marginBottom: theme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    lineHeight: 34,
    color: theme.colors.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  refText: {
    fontStyle: 'italic',
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.elevation.xs,
  },
  gridItem: {
    flex: 1,
  },
  gridValue: {
    marginTop: 4,
    color: theme.colors.textPrimary,
  },
  sectionBlock: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.xs,
  },
  descriptionText: {
    lineHeight: 22,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.textSecondary,
    ...theme.elevation.xs,
  },
  linksContainer: {
    gap: theme.spacing.sm,
  },
  linkCard: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    ...theme.elevation.xs,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  imageCard: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    ...theme.elevation.xs,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  sectionDivider: {
    marginVertical: theme.spacing.md,
  },
  auditBlock: {
    gap: 4,
  },
  actionsMenu: {
    gap: theme.spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  btnThird: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    zIndex: 10,
  },
  fullscreenImage: {
    width: '90%',
    height: '80%',
  },
});
