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
import { AppContainer, Text, Button } from '@components/common';
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

  // 1. Image Upload Actions
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

  // 2. Link Management Actions
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

  // 3. Save Action
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
    <AppContainer>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text variant="h1" color="primary" style={styles.header}>
          New Task Details
        </Text>

        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text variant="bodyMedium" fontWeight="semiBold" style={styles.label}>
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
          <Text variant="bodyMedium" fontWeight="semiBold" style={styles.label}>
            Reference Code (Unique)
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

        {/* Category Segmented Selector */}
        <View style={styles.inputGroup}>
          <Text variant="bodyMedium" fontWeight="semiBold" style={styles.label}>
            Category
          </Text>
          <View style={styles.selectorRow}>
            <TouchableOpacity
              style={[
                styles.selectorButton,
                category === WorkCategory.TODAY && styles.selectorActive,
              ]}
              onPress={() => setCategory(WorkCategory.TODAY)}
            >
              <Text
                fontWeight="semiBold"
                color={category === WorkCategory.TODAY ? 'primary' : 'textSecondary'}
              >
                Today
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.selectorButton,
                category === WorkCategory.OTHER && styles.selectorActive,
              ]}
              onPress={() => setCategory(WorkCategory.OTHER)}
            >
              <Text
                fontWeight="semiBold"
                color={category === WorkCategory.OTHER ? 'primary' : 'textSecondary'}
              >
                Other (Backlog)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Priority Segmented Selector */}
        <View style={styles.inputGroup}>
          <Text variant="bodyMedium" fontWeight="semiBold" style={styles.label}>
            Priority
          </Text>
          <View style={styles.selectorRow}>
            {Object.values(WorkPriority).map(p => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.selectorButton,
                  priority === p && styles.selectorActive,
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  fontWeight="semiBold"
                  color={priority === p ? 'primary' : 'textSecondary'}
                >
                  {p.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text variant="bodyMedium" fontWeight="semiBold" style={styles.label}>
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
          <Text variant="bodyMedium" fontWeight="semiBold" style={styles.label}>
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

        {/* Link Management */}
        <View style={styles.sectionDivider} />
        <Text variant="h3" color="primary" style={styles.sectionHeader}>
          Links & Bookmarks
        </Text>

        <View style={styles.linkForm}>
          <TextInput
            style={[styles.textInput, styles.linkInput]}
            placeholder="Link Title (e.g. Documentation)"
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

        {links.length > 0 ? (
          <View style={styles.attachmentContainer}>
            {links.map(l => (
              <View key={l.id} style={styles.linkBadge}>
                <View style={styles.linkTextWrapper}>
                  <Text variant="bodyMedium" fontWeight="medium" numberOfLines={1}>
                    {l.title}
                  </Text>
                  <Text variant="caption" color="textSecondary" numberOfLines={1}>
                    {l.url}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveLink(l.id)}>
                  <Text color="danger" fontWeight="bold" style={styles.removeText}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        {/* Image Attachments */}
        <View style={styles.sectionDivider} />
        <Text variant="h3" color="primary" style={styles.sectionHeader}>
          Image Attachments
        </Text>

        <View style={styles.imageSelectorRow}>
          <TouchableOpacity
            style={styles.imageActionButton}
            onPress={() => handleSelectImage('camera')}
          >
            <Text color="primary" fontWeight="bold">
              📷 Use Camera
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageActionButton}
            onPress={() => handleSelectImage('gallery')}
          >
            <Text color="primary" fontWeight="bold">
              🖼 Open Gallery
            </Text>
          </TouchableOpacity>
        </View>

        {images.length > 0 ? (
          <ScrollView horizontal style={styles.imageList} contentContainerStyle={styles.imageContent}>
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
        ) : null}

        {/* Screen Bottom Actions */}
        <View style={styles.sectionDivider} />
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
  scrollContainer: {
    padding: theme.spacing.md,
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
  },
  textInput: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectorRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
  },
  selectorButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorActive: {
    backgroundColor: theme.colors.border,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  sectionHeader: {
    marginBottom: theme.spacing.sm,
  },
  linkForm: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  linkInput: {
    marginBottom: theme.spacing.sm,
  },
  attachmentContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
  },
  linkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  linkTextWrapper: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  removeText: {
    paddingHorizontal: theme.spacing.xs,
  },
  imageSelectorRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  imageActionButton: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: theme.radius.sm,
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
