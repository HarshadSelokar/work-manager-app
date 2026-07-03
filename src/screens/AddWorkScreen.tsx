import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { AppContainer, Text, Button, Divider } from '@components/common';
import { WorksRepository } from '../repository/works.repository';
import { Work, WorkStatus, WorkCategory, WorkPriority } from '@models/index';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { theme } from '@theme/index';

type Props = NativeStackScreenProps<RootStackParamList, 'AddWork'>;

export const AddWorkScreen: React.FC<Props> = ({ navigation }) => {
  const worksRepo = useMemo(() => new WorksRepository(), []);

  // Form States
  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [priority, setPriority] = useState<WorkPriority>(WorkPriority.MEDIUM);
  const [category, setCategory] = useState<WorkCategory>(WorkCategory.TODAY);
  const [description, setDescription] = useState('');
  const [deadlineString, setDeadlineString] = useState(''); // YYYY-MM-DD
  const [links, setLinks] = useState<{ id: string; url: string; title: string }[]>([]);
  const [images, setImages] = useState<{ id: string; imagePath: string }[]>([]);

  // Link Temp States
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');

  // Image Upload Actions
  const handleSelectImage = useCallback((source: 'camera' | 'gallery') => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8,
      saveToPhotos: true,
    };

    const callback = (response: any) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.uri) {
          const newImg = {
            id: 'img-' + Math.random().toString(36).substring(2, 9),
            imagePath: asset.uri,
          };
          setImages(prev => [...prev, newImg]);
        }
      }
    };

    if (source === 'camera') {
      launchCamera(options as any, callback);
    } else {
      launchImageLibrary(options as any, callback);
    }
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  // Link Management Actions
  const handleAddLink = useCallback(() => {
    if (!newLinkUrl.trim()) {
      Alert.alert('Validation', 'Link URL is required.');
      return;
    }
    const cleanUrl = newLinkUrl.trim();
    const newLink = {
      id: 'link-' + Math.random().toString(36).substring(2, 9),
      url: cleanUrl,
      title: newLinkTitle.trim() || cleanUrl,
    };
    setLinks(prev => [...prev, newLink]);
    setNewLinkUrl('');
    setNewLinkTitle('');
  }, [newLinkUrl, newLinkTitle]);

  const handleRemoveLink = useCallback((id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id));
  }, []);

  // Save Action
  const handleSave = useCallback(() => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Task title is required.');
      return;
    }

    const cleanRef = reference.trim();
    if (cleanRef) {
      const exists = worksRepo.referenceExists(cleanRef);
      if (exists) {
        Alert.alert('Duplicate Reference', `A task with reference code "${cleanRef}" already exists.`);
        return;
      }
    }

    let parsedDeadline: Date | undefined = undefined;
    if (deadlineString.trim()) {
      const parts = deadlineString.trim().split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const dateObj = new Date(y, m, d);
        if (!isNaN(dateObj.getTime())) {
          parsedDeadline = dateObj;
        } else {
          Alert.alert('Validation', 'Deadline date is invalid. Please use YYYY-MM-DD.');
          return;
        }
      } else {
        Alert.alert('Validation', 'Deadline date format is invalid. Please use YYYY-MM-DD.');
        return;
      }
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
      images: images.map(img => ({
        id: img.id,
        workId: newWorkId,
        imagePath: img.imagePath,
      })),
      links: links.map(link => ({
        id: link.id,
        workId: newWorkId,
        url: link.url,
        title: link.title || undefined,
      })),
    };

    try {
      worksRepo.create(newWork);
      Alert.alert('Success', 'Task created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Save Error', error.message || 'Failed to save the task.');
    }
  }, [title, reference, priority, category, description, deadlineString, images, links, worksRepo, navigation]);

  return (
    <AppContainer safeAreaSides={['top', 'left', 'right']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text variant="displaySmall" fontWeight="bold">
            Create Routine Task
          </Text>
          <Text variant="bodyMedium" color="textSecondary">
            Fill in details to catalog a new work item.
          </Text>
        </View>

        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text variant="overline" color="textSecondary" style={styles.label}>
            Title *
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="What needs to be done?"
            placeholderTextColor={theme.colors.textTertiary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Reference Input */}
        <View style={styles.inputGroup}>
          <Text variant="overline" color="textSecondary" style={styles.label}>
            Reference Code (Unique identifier)
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. REF-1002"
            placeholderTextColor={theme.colors.textTertiary}
            value={reference}
            onChangeText={setReference}
            autoCapitalize="characters"
          />
        </View>

        {/* Category Selector */}
        <View style={styles.inputGroup}>
          <Text variant="overline" color="textSecondary" style={styles.label}>
            Category Target
          </Text>
          <View style={styles.selectorContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.selectorTab,
                category === WorkCategory.TODAY && styles.selectorTabActive,
              ]}
              onPress={() => setCategory(WorkCategory.TODAY)}
            >
              <Text
                fontWeight="semiBold"
                style={[
                  styles.selectorText,
                  category === WorkCategory.TODAY && styles.selectorTextActive,
                ]}
              >
                Today's Routine
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.selectorTab,
                category === WorkCategory.OTHER && styles.selectorTabActive,
              ]}
              onPress={() => setCategory(WorkCategory.OTHER)}
            >
              <Text
                fontWeight="semiBold"
                style={[
                  styles.selectorText,
                  category === WorkCategory.OTHER && styles.selectorTextActive,
                ]}
              >
                Upcoming Backlog
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Priority Segmented Chips Selector */}
        <View style={styles.inputGroup}>
          <Text variant="overline" color="textSecondary" style={styles.label}>
            Priority Status
          </Text>
          <View style={styles.priorityContainer}>
            {[
              { value: WorkPriority.LOW, color: theme.colors.priorityLow, bg: theme.colors.priorityLowBg, label: 'Low' },
              { value: WorkPriority.MEDIUM, color: theme.colors.priorityMedium, bg: theme.colors.priorityMediumBg, label: 'Medium' },
              { value: WorkPriority.HIGH, color: theme.colors.priorityHigh, bg: theme.colors.priorityHighBg, label: 'High' }
            ].map(item => {
              const isSelected = priority === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  activeOpacity={0.7}
                  style={[
                    styles.priorityChip,
                    { borderColor: isSelected ? item.color : theme.colors.border },
                    isSelected && { backgroundColor: item.bg }
                  ]}
                  onPress={() => setPriority(item.value)}
                >
                  <Text
                    fontWeight="semiBold"
                    style={{ color: isSelected ? item.color : theme.colors.textSecondary }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text variant="overline" color="textSecondary" style={styles.label}>
            Description
          </Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Add details about this work task..."
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Deadline Input */}
        <View style={styles.inputGroup}>
          <Text variant="overline" color="textSecondary" style={styles.label}>
            Deadline (YYYY-MM-DD)
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 2026-07-15"
            placeholderTextColor={theme.colors.textTertiary}
            value={deadlineString}
            onChangeText={setDeadlineString}
          />
        </View>

        <Divider style={styles.sectionDivider} />

        {/* Link Management */}
        <Text variant="overline" color="textTertiary" style={styles.sectionHeader}>
          Links & Bookmarks
        </Text>

        <View style={styles.linkForm}>
          <TextInput
            style={[styles.textInput, styles.linkInput]}
            placeholder="Link Title (e.g. Reference Specs)"
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
          <Button title="Add Bookmark Link" variant="secondary" onPress={handleAddLink} />
        </View>

        {links.length > 0 && (
          <View style={styles.attachmentContainer}>
            {links.map(l => (
              <View key={l.id} style={styles.linkBadge}>
                <View style={styles.linkTextWrapper}>
                  <Text variant="bodyLarge" fontWeight="medium" numberOfLines={1}>
                    {l.title}
                  </Text>
                  <Text variant="caption" color="textSecondary" numberOfLines={1}>
                    {l.url}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveLink(l.id)}>
                  <Text variant="bodyMedium" fontWeight="bold" style={{ color: theme.colors.priorityHigh }}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <Divider style={styles.sectionDivider} />

        {/* Image Attachments */}
        <Text variant="overline" color="textTertiary" style={styles.sectionHeader}>
          Image Attachments
        </Text>

        <View style={styles.imageSelectorRow}>
          <Button title="📸  Use Camera" variant="secondary" onPress={() => handleSelectImage('camera')} style={{ flex: 1 }} />
          <Button title="🖼️  Open Gallery" variant="secondary" onPress={() => handleSelectImage('gallery')} style={{ flex: 1 }} />
        </View>

        {images.length > 0 && (
          <ScrollView horizontal style={styles.imageList} contentContainerStyle={styles.imageContent} showsHorizontalScrollIndicator={false}>
            {images.map(img => (
              <View key={img.id} style={styles.imageWrapper}>
                <Image source={{ uri: img.imagePath }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.deleteImageBadge}
                  onPress={() => handleRemoveImage(img.id)}
                >
                  <Text variant="caption" fontWeight="bold" style={{ color: '#ffffff' }}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        <Divider style={styles.sectionDivider} />

        {/* Screen Bottom Actions */}
        <View style={styles.actionRow}>
          <Button title="Save Task" variant="primary" onPress={handleSave} style={styles.actionBtn} />
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
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
  header: {
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  textInput: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontSize: 15,
    ...theme.elevation.xs,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 3,
  },
  selectorTab: {
    flex: 1,
    paddingVertical: theme.spacing.sm - 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
  },
  selectorTabActive: {
    backgroundColor: theme.colors.card,
    ...theme.elevation.xs,
  },
  selectorText: {
    color: theme.colors.textSecondary,
  },
  selectorTextActive: {
    color: theme.colors.primary,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  priorityChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    backgroundColor: theme.colors.card,
    ...theme.elevation.xs,
  },
  sectionDivider: {
    marginVertical: theme.spacing.lg,
  },
  sectionHeader: {
    marginBottom: theme.spacing.sm,
  },
  linkForm: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.elevation.xs,
  },
  linkInput: {
    marginBottom: theme.spacing.sm,
  },
  attachmentContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.elevation.xs,
  },
  linkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  linkTextWrapper: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  imageSelectorRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  imageList: {
    marginVertical: theme.spacing.sm,
  },
  imageContent: {
    gap: theme.spacing.sm,
  },
  imageWrapper: {
    position: 'relative',
  },
  previewImage: {
    width: 90,
    height: 90,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.border,
  },
  deleteImageBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.danger,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
});
