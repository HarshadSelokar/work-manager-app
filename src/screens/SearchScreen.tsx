import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { AppContainer, Text, EmptyState, LoadingView, SearchBar, Divider } from '@components/common';
import { WorkCard } from '@components/work/WorkCard';
import { NoteCard } from '@components/note/NoteCard';
import { WorksRepository } from '../repository/works.repository';
import { NotesRepository } from '../repository/notes.repository';
import { Work, Note, WorkPriority, WorkStatus, WorkCategory } from '@models/index';
import { theme } from '@theme/index';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

type SearchTab = 'tasks' | 'notes';
type SortOption = 'title' | 'priority' | 'deadline' | 'created_at' | 'updated_at';

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const worksRepo = useMemo(() => new WorksRepository(), []);
  const notesRepo = useMemo(() => new NotesRepository(), []);

  // Search & Segment States
  const [activeTab, setActiveTab] = useState<SearchTab>('tasks');
  const [searchQuery, setSearchQuery] = useState('');

  // Filters (Tasks-only)
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterDeadline, setFilterDeadline] = useState<string>('');

  // Sorting
  const [sortBy, setSortBy] = useState<SortOption>('title');

  // Search Results
  const [works, setWorks] = useState<Work[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Trigger search dynamically
  const triggerSearch = useCallback(() => {
    setIsLoading(true);
    try {
      if (activeTab === 'tasks') {
        const filters = {
          priority: filterPriority || undefined,
          status: filterStatus || undefined,
          category: filterCategory || undefined,
          deadline: filterDeadline || undefined,
        };
        const res = worksRepo.searchAndFilter(searchQuery, filters, sortBy);
        setWorks(res);
      } else {
        const res = notesRepo.search(searchQuery);
        setNotes(res);
      }
    } catch (error) {
      console.error('Failed to run search query:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery, filterPriority, filterStatus, filterCategory, filterDeadline, sortBy, worksRepo, notesRepo]);

  // Run search when variables change
  React.useEffect(() => {
    const delayDebounce = setTimeout(() => {
      triggerSearch();
    }, 300); // 300ms debounce
    return () => clearTimeout(delayDebounce);
  }, [triggerSearch]);

  const handleWorkPress = useCallback(
    (id: string) => {
      navigation.navigate('WorkDetails', { workId: id });
    },
    [navigation]
  );

  const handleNotePress = useCallback(
    (id: string) => {
      navigation.navigate('NoteDetails', { noteId: id });
    },
    [navigation]
  );

  // Filters Reset Action
  const handleResetFilters = useCallback(() => {
    setFilterPriority('');
    setFilterStatus('');
    setFilterCategory('');
    setFilterDeadline('');
    setSortBy('title');
  }, []);

  return (
    <AppContainer safeAreaSides={['top', 'left', 'right']} style={styles.container}>
      {/* Search Input Bar Component */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={activeTab === 'tasks' ? 'Search tasks...' : 'Search scribbles...'}
        style={styles.searchBar}
        autoFocus
      />

      {/* Segment Selector Tabs */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.segmentButton, activeTab === 'tasks' && styles.segmentButtonActive]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text fontWeight="semiBold" style={[styles.segmentText, activeTab === 'tasks' && styles.segmentTextActive]}>
            Routine Tasks ({works.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.segmentButton, activeTab === 'notes' && styles.segmentButtonActive]}
          onPress={() => setActiveTab('notes')}
        >
          <Text fontWeight="semiBold" style={[styles.segmentText, activeTab === 'notes' && styles.segmentTextActive]}>
            Scribbles ({notes.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task Filters & Sort expander */}
      {activeTab === 'tasks' && (
        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {/* Priority Filter */}
            <View style={styles.pickerWrapper}>
              <Text variant="caption" color="textTertiary" fontWeight="semiBold" style={styles.pickerLabel}>
                PRIORITY:
              </Text>
              <View style={styles.filterChipRow}>
                {['', ...Object.values(WorkPriority)].map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.filterChip, filterPriority === p && styles.filterChipActive]}
                    onPress={() => setFilterPriority(p)}
                  >
                    <Text variant="caption" fontWeight="semiBold" style={[styles.chipText, filterPriority === p && styles.chipTextActive]}>
                      {p === '' ? 'ALL' : p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status Filter */}
            <View style={styles.pickerWrapper}>
              <Text variant="caption" color="textTertiary" fontWeight="semiBold" style={styles.pickerLabel}>
                STATUS:
              </Text>
              <View style={styles.filterChipRow}>
                {['', ...Object.values(WorkStatus)].map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.filterChip, filterStatus === s && styles.filterChipActive]}
                    onPress={() => setFilterStatus(s)}
                  >
                    <Text variant="caption" fontWeight="semiBold" style={[styles.chipText, filterStatus === s && styles.chipTextActive]}>
                      {s === '' ? 'ALL' : s.replace('_', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category Filter */}
            <View style={styles.pickerWrapper}>
              <Text variant="caption" color="textTertiary" fontWeight="semiBold" style={styles.pickerLabel}>
                CATEGORY:
              </Text>
              <View style={styles.filterChipRow}>
                {['', ...Object.values(WorkCategory)].map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.filterChip, filterCategory === c && styles.filterChipActive]}
                    onPress={() => setFilterCategory(c)}
                  >
                    <Text variant="caption" fontWeight="semiBold" style={[styles.chipText, filterCategory === c && styles.chipTextActive]}>
                      {c === '' ? 'ALL' : c.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Deadline Filter */}
            <View style={styles.pickerWrapper}>
              <Text variant="caption" color="textTertiary" fontWeight="semiBold" style={styles.pickerLabel}>
                DEADLINE:
              </Text>
              <View style={styles.filterChipRow}>
                {['', 'overdue', 'today', 'tomorrow', 'no_deadline'].map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.filterChip, filterDeadline === d && styles.filterChipActive]}
                    onPress={() => setFilterDeadline(d)}
                  >
                    <Text variant="caption" fontWeight="semiBold" style={[styles.chipText, filterDeadline === d && styles.chipTextActive]}>
                      {d === '' ? 'ALL' : d.replace('_', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sorting Selection */}
            <View style={styles.pickerWrapper}>
              <Text variant="caption" color="textTertiary" fontWeight="semiBold" style={styles.pickerLabel}>
                SORT BY:
              </Text>
              <View style={styles.filterChipRow}>
                {(['title', 'priority', 'deadline', 'created_at', 'updated_at'] as SortOption[]).map(o => (
                  <TouchableOpacity
                    key={o}
                    style={[styles.filterChip, sortBy === o && styles.filterChipActive]}
                    onPress={() => setSortBy(o)}
                  >
                    <Text variant="caption" fontWeight="semiBold" style={[styles.chipText, sortBy === o && styles.chipTextActive]}>
                      {o.replace('_', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <Divider style={styles.filterDivider} />
          
          <View style={styles.resetRow}>
            <TouchableOpacity onPress={handleResetFilters}>
              <Text variant="caption" fontWeight="bold" color="primary">
                🔄 RESET FILTERS
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search Results Display */}
      {isLoading ? (
        <LoadingView message="Searching database..." />
      ) : activeTab === 'tasks' ? (
        <FlatList
          data={works}
          renderItem={({ item }) => <WorkCard work={item} onPress={handleWorkPress} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              emoji="🔍"
              title="No tasks match query"
              description="Refine your keywords or tap Reset Filters to view full backlog."
            />
          }
        />
      ) : (
        <FlatList
          key={activeTab} // Force re-render grid layout safely
          data={notes}
          renderItem={({ item }) => <NoteCard note={item} onPress={handleNotePress} />}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              emoji="📝"
              title="No scribbles found"
              description="Try searching with other content keywords or write a new scribble."
            />
          }
        />
      )}
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  searchBar: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.elevation.xs,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 3,
    marginBottom: theme.spacing.md,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm - 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.card,
    ...theme.elevation.xs,
  },
  segmentText: {
    color: theme.colors.textSecondary,
  },
  segmentTextActive: {
    color: theme.colors.primary,
  },
  filtersWrapper: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderColor: theme.colors.border,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    ...theme.elevation.xs,
  },
  filtersScroll: {
    gap: theme.spacing.md,
    paddingBottom: 4,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  pickerLabel: {
    color: theme.colors.textTertiary,
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.round,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
  },
  filterChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  chipText: {
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.primary,
  },
  filterDivider: {
    marginVertical: theme.spacing.sm,
  },
  resetRow: {
    alignItems: 'flex-end',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xs,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
});
