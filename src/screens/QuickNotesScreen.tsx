import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, FlatList, ListRenderItem, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '@navigation/types';
import { AppContainer, Text, EmptyState, LoadingView, FABMenu, GradientBackground } from '@components/common';
import { NoteCard } from '@components/note/NoteCard';
import { NotesRepository } from '../repository/notes.repository';
import { Note } from '@models/index';
import { theme } from '@theme/index';
import { Plus, FileText, Search, StickyNote } from 'lucide-react-native';

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

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchNotes();
    }, [fetchNotes])
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchNotes();
    setTimeout(() => { setIsRefreshing(false); }, 400);
  }, [fetchNotes]);

  const handleCardPress = useCallback(
    (id: string) => { navigation.navigate('NoteDetails', { noteId: id }); },
    [navigation]
  );

  const renderItem: ListRenderItem<Note> = useCallback(
    ({ item }) => <NoteCard note={item} onPress={handleCardPress} />,
    [handleCardPress]
  );

  const keyExtractor = useCallback((item: Note) => item.id, []);

  const fabOptions = useMemo(() => [
    {
      label: 'New Task',
      icon: <Plus size={18} color="#FFFFFF" />,
      onPress: () => navigation.navigate('AddWork'),
      color: theme.colors.primary,
    },
    {
      label: 'Quick Note',
      icon: <FileText size={18} color="#FFFFFF" />,
      onPress: () => navigation.navigate('AddNote'),
      color: theme.colors.secondary,
    },
    {
      label: 'Search',
      icon: <Search size={18} color="#FFFFFF" />,
      onPress: () => navigation.navigate('Search'),
      color: theme.colors.elevated,
    },
  ], [navigation]);

  return (
    <AppContainer safeAreaSides={['top', 'left', 'right']} style={styles.container}>
      <GradientBackground>
        <View style={styles.header}>
          <View style={styles.headerIconRow}>
            <View style={styles.headerIcon}>
              <StickyNote size={20} color={theme.colors.secondary} />
            </View>
            <View>
              <Text variant="displaySmall" fontWeight="bold">Quick Notes</Text>
              <Text variant="bodySmall" color="textSecondary">
                {notes.length > 0 ? `${notes.length} note${notes.length > 1 ? 's' : ''}` : 'Capture your thoughts'}
              </Text>
            </View>
          </View>
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
                icon={<StickyNote size={48} color={theme.colors.secondary} />}
                title="No notes yet!"
                description="Capture ideas, reminders, or thoughts instantly. Tap + to write your first note."
                actionLabel="Write Note"
                onAction={() => navigation.navigate('AddNote')}
                style={styles.emptyState}
              />
            }
          />
        )}

        <FABMenu options={fabOptions} />
      </GradientBackground>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.background },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnWrapper: {
    paddingHorizontal: theme.spacing.sm,
  },
  listContent: {
    paddingBottom: 110,
    paddingTop: theme.spacing.xs,
  },
  emptyState: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
});
