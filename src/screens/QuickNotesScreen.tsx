import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, FlatList, ListRenderItem, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '@navigation/types';
import { AppContainer, Text, EmptyState, LoadingView, FABMenu } from '@components/common';
import { NoteCard } from '@components/note/NoteCard';
import { NotesRepository } from '../repository/notes.repository';
import { Note } from '@models/index';
import { theme } from '@theme/index';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'QuickNotes'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const QuickNotesScreen: React.FC<Props> = ({ navigation }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const notesRepo = useMemo(() => new NotesRepository(), []);

  const fetchNotes = useCallback(() => {
    try {
      const data = notesRepo.findAll();
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [notesRepo]);

  // Load notes on focus
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchNotes();
    }, [fetchNotes])
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchNotes();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  }, [fetchNotes]);

  const handleCardPress = useCallback(
    (id: string) => {
      navigation.navigate('NoteDetails', { noteId: id });
    },
    [navigation]
  );

  const renderItem: ListRenderItem<Note> = useCallback(
    ({ item }) => <NoteCard note={item} onPress={handleCardPress} />,
    [handleCardPress]
  );

  const keyExtractor = useCallback((item: Note) => item.id, []);

  const fabOptions = useMemo(() => [
    {
      label: 'Add Work',
      icon: '➕',
      onPress: () => navigation.navigate('AddWork'),
    },
    {
      label: 'Quick Note',
      icon: '✏️',
      onPress: () => navigation.navigate('AddNote'),
    },
    {
      label: 'Search',
      icon: '🔍',
      onPress: () => navigation.navigate('Search'),
    },
  ], [navigation]);

  return (
    <AppContainer safeAreaSides={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <Text variant="displaySmall" fontWeight="bold">
          Quick Scribbles
        </Text>
        <Text variant="bodyMedium" color="textSecondary">
          Jot down sudden thoughts. Convert them to official routine tasks later.
        </Text>
      </View>

      {isLoading ? (
        <LoadingView message="Loading notes..." />
      ) : (
        <FlatList
          data={notes}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              emoji="✏️"
              title="No scribbles yet!"
              description="Keep thoughts fresh. Tap the + FAB below to jot down a quick note."
              actionLabel="Write Note"
              onAction={() => navigation.navigate('AddNote')}
              style={styles.emptyState}
            />
          }
        />
      )}

      {/* Global FAB Menu */}
      <FABMenu options={fabOptions} />
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
  },
  listContent: {
    paddingBottom: 90, // Leave space for FAB
  },
  emptyState: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
});
