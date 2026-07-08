import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { AppContainer, Text, EmptyState, LoadingView, SearchBar, Divider, GradientBackground } from '@components/common';
import { WorkCard } from '@components/work/WorkCard';
import { NoteCard } from '@components/note/NoteCard';
import { WorksRepository } from '../repository/works.repository';
import { NotesRepository } from '../repository/notes.repository';
import { Work, Note, WorkPriority, WorkStatus } from '@models/index';
import { theme } from '@theme/index';
import { Search, RotateCcw, FileText, CheckSquare } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

type SearchTab = 'tasks' | 'notes';
type SortOption = 'title' | 'priority' | 'deadline' | 'created_at' | 'updated_at';

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const worksRepo = useMemo(() => new WorksRepository(), []);
  const notesRepo = useMemo(() => new NotesRepository(), []);

  const [activeTab, setActiveTab] = useState<SearchTab>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterDeadline, setFilterDeadline] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [works, setWorks] = useState<Work[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery, filterPriority, filterStatus, filterCategory, filterDeadline, sortBy, worksRepo, notesRepo]);

  React.useEffect(() => {
    const debounce = setTimeout(() => { triggerSearch(); }, 300);
    return () => clearTimeout(debounce);
  }, [triggerSearch]);

  const handleWorkPress = useCallback(
    (id: string) => { navigation.navigate('WorkDetails', { workId: id }); },
    [navigation]
  );

  const handleNotePress = useCallback(
    (id: string) => { navigation.navigate('NoteDetails', { noteId: id }); },
    [navigation]
  );

  const handleResetFilters = useCallback(() => {
    setFilterPriority(''); setFilterStatus(''); setFilterCategory(''); setFilterDeadline(''); setSortBy('title');
  }, []);

  // Filters Reset Action

  return (
    <AppContainer safeAreaSides={['top', 'left', 'right']} style={styles.container}>
      <GradientBackground>
        {/* ─── Search Bar ─── */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={activeTab === 'tasks' ? 'Search tasks...' : 'Search notes...'}
            style={styles.searchBar}
            autoFocus
          />
        </View>

        {/* ─── Tab Toggle ─── */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tabBtn, activeTab === 'tasks' && styles.tabBtnActive]}
            onPress={() => setActiveTab('tasks')}
          >
            <CheckSquare size={14} color={activeTab === 'tasks' ? theme.colors.primary : theme.colors.textTertiary} />
            <Text variant="bodySmall" fontWeight="semiBold" style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>
              Tasks {works.length > 0 ? `(${works.length})` : ''}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabBtn, activeTab === 'notes' && styles.tabBtnActive]}
            onPress={() => setActiveTab('notes')}
          >
            <FileText size={14} color={activeTab === 'notes' ? theme.colors.primary : theme.colors.textTertiary} />
            <Text variant="bodySmall" fontWeight="semiBold" style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
              Notes {notes.length > 0 ? `(${notes.length})` : ''}
            </Text>
          </Pressable>
        </View>

        {/* ─── Filters (Tasks only) ─── */}
        {activeTab === 'tasks' && (
          <View style={styles.filtersBlock}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
              <View style={styles.filterGroup}>
                <Text variant="caption" color="textTertiary" style={styles.filterLabel}>Priority</Text>
                <View style={styles.filterChipRow}>
                  {['', ...Object.values(WorkPriority)].map(p => (
                    <FilterChip key={p} label={p === '' ? 'All' : p} active={filterPriority === p} onPress={() => setFilterPriority(p)} />
                  ))}
                </View>
              </View>
              <Divider style={styles.filterGroupDivider} />
              <View style={styles.filterGroup}>
                <Text variant="caption" color="textTertiary" style={styles.filterLabel}>Status</Text>
                <View style={styles.filterChipRow}>
                  {['', ...Object.values(WorkStatus)].map(s => (
                    <FilterChip key={s} label={s === '' ? 'All' : s.replace('_', ' ')} active={filterStatus === s} onPress={() => setFilterStatus(s)} />
                  ))}
                </View>
              </View>
              <Divider style={styles.filterGroupDivider} />
              <View style={styles.filterGroup}>
                <Text variant="caption" color="textTertiary" style={styles.filterLabel}>Sort by</Text>
                <View style={styles.filterChipRow}>
                  {(['title', 'priority', 'deadline', 'created_at'] as SortOption[]).map(o => (
                    <FilterChip key={o} label={o.replace('_', ' ')} active={sortBy === o} onPress={() => setSortBy(o)} />
                  ))}
                </View>
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.resetBtn} onPress={handleResetFilters}>
              <RotateCcw size={12} color={theme.colors.primary} />
              <Text variant="caption" fontWeight="bold" color="primary">Reset</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Results ─── */}
        {isLoading ? (
          <LoadingView message="Searching..." />
        ) : activeTab === 'tasks' ? (
          <FlatList
            data={works}
            renderItem={({ item }) => <WorkCard work={item} onPress={handleWorkPress} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                icon={<Search size={48} color={theme.colors.textSecondary} />}
                title={searchQuery ? 'No tasks found' : 'Search for tasks'}
                description={searchQuery ? 'Try different keywords or reset filters.' : 'Type something to search across all tasks.'}
              />
            }
          />
        ) : (
          <FlatList
            key={activeTab}
            data={notes}
            renderItem={({ item }) => <NoteCard note={item} onPress={handleNotePress} />}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                icon={<Search size={48} color={theme.colors.textSecondary} />}
                title={searchQuery ? 'No notes found' : 'Search for notes'}
                description={searchQuery ? 'Try different keywords.' : 'Type something to search your notes.'}
              />
            }
          />
        )}
      </GradientBackground>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.background },
  searchSection: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  searchBar: { ...theme.elevation.sm },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabBtnActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  tabText: { color: theme.colors.textTertiary },
  tabTextActive: { color: theme.colors.primary },
  filtersBlock: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
  },
  filtersScroll: { gap: theme.spacing.md, paddingRight: theme.spacing.md },
  filterGroup: { gap: 6 },
  filterLabel: { letterSpacing: 0.3 },
  filterChipRow: { flexDirection: 'row', gap: 5 },
  filterGroupDivider: { height: 1, width: 1, marginHorizontal: 4, opacity: 0 },
  filterChip: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.round,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  filterChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  chipText: { color: theme.colors.textSecondary },
  chipTextActive: { color: theme.colors.primary },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-end',
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  listContent: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xl },
  columnWrapper: { paddingHorizontal: theme.spacing.xs },
});

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = React.memo(({ label, active, onPress }) => (
  <Pressable style={[styles.filterChip, active && styles.filterChipActive]} onPress={onPress}>
    <Text variant="caption" fontWeight="semiBold" style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </Text>
  </Pressable>
));

