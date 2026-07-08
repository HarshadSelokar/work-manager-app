import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '@navigation/types';
import {
  AppContainer,
  Text,
  EmptyState,
  LoadingView,
  SectionHeader,
  FABMenu,
  GradientBackground,
  GlassCard,
  ProgressRing,
  StatisticCard,
} from '@components/common';
import { WorkCard } from '@components/work/WorkCard';
import { WorksRepository } from '../repository/works.repository';
import { NotesRepository } from '../repository/notes.repository';
import { Work, WorkPriority, WorkCategory, WorkStatus, Note } from '@models/index';
import { theme } from '@theme/index';
import {
  Target,
  AlertCircle,
  Plus,
  FileText,
  Search,
  ChevronRight,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Layers,
} from 'lucide-react-native';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Today'>,
  NativeStackScreenProps<RootStackParamList>
>;

const { width } = Dimensions.get('window');

export const TodayScreen: React.FC<Props> = ({ navigation }) => {
  const [works, setWorks] = useState<Work[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const worksRepo = useMemo(() => new WorksRepository(), []);
  const notesRepo = useMemo(() => new NotesRepository(), []);

  const fetchData = useCallback(() => {
    try {
      const todayTasks = worksRepo.findByCategory(WorkCategory.TODAY);
      const allNotes = notesRepo.findAll();
      setWorks(todayTasks);
      setNotes(allNotes.slice(0, 6));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }, [worksRepo, notesRepo]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchData();
      setIsLoading(false);
    }, [fetchData])
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData();
    setTimeout(() => { setIsRefreshing(false); }, 400);
  }, [fetchData]);

  const handleCardPress = useCallback(
    (id: string) => { navigation.navigate('WorkDetails', { workId: id }); },
    [navigation]
  );

  const handleNotePress = useCallback(
    (id: string) => { navigation.navigate('NoteDetails', { noteId: id }); },
    [navigation]
  );

  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }, []);

  const dashboardBuckets = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const overdue: Work[] = [];
    const highPriority: Work[] = [];
    const routine: Work[] = [];
    const completed: Work[] = [];

    works.forEach(work => {
      if (work.status === WorkStatus.COMPLETED) {
        completed.push(work);
      } else {
        const isOverdue = work.deadline && new Date(work.deadline).getTime() < todayStart.getTime();
        if (isOverdue) {
          overdue.push(work);
        } else if (work.priority === WorkPriority.HIGH) {
          highPriority.push(work);
        } else {
          routine.push(work);
        }
      }
    });

    return { overdue, highPriority, routine, completed };
  }, [works]);

  const stats = useMemo(() => {
    const total = works.length;
    const completedCount = works.filter(w => w.status === WorkStatus.COMPLETED).length;
    const overdueCount = dashboardBuckets.overdue.length;
    const pendingCount = total - completedCount;
    const highCount = dashboardBuckets.highPriority.length;
    return { total, completed: completedCount, overdue: overdueCount, pending: pendingCount, high: highCount };
  }, [works, dashboardBuckets]);

  const todaysFocus = useMemo(() => {
    const pending = [...dashboardBuckets.overdue, ...dashboardBuckets.highPriority, ...dashboardBuckets.routine];
    if (pending.length === 0) return null;
    const high = pending.find(w => w.priority === WorkPriority.HIGH);
    if (high) return high;
    const withDeadline = pending.find(w => w.deadline !== undefined);
    if (withDeadline) return withDeadline;
    return pending[0];
  }, [dashboardBuckets]);

  const completionProgress = useMemo(() => {
    return stats.total > 0 ? stats.completed / stats.total : 0;
  }, [stats]);

  const motivationalMessage = useMemo(() => {
    if (stats.total === 0) return 'Start fresh — add your first task.';
    if (completionProgress === 1) return 'Outstanding! All tasks completed. 🎉';
    if (completionProgress >= 0.7) return 'Almost there! Just a few more.';
    if (completionProgress >= 0.4) return 'Great momentum! Keep it up.';
    return `${stats.pending} task${stats.pending > 1 ? 's' : ''} waiting for your attention.`;
  }, [stats, completionProgress]);

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

  if (isLoading) {
    return <LoadingView message="Loading dashboard..." />;
  }

  const hasTasks = works.length > 0;

  return (
    <AppContainer safeAreaSides={['top', 'left', 'right']} style={styles.container}>
      <GradientBackground>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* ─── Header ─── */}
          <View style={styles.headerBlock}>
            <View style={styles.headerRow}>
              <View style={styles.headerTextBlock}>
                <Text variant="displaySmall" fontWeight="bold" style={styles.greetingText}>
                  {greeting} 👋
                </Text>
                <Text variant="bodyMedium" color="textSecondary" style={styles.dateText}>
                  {formattedDate}
                </Text>
              </View>
              <Pressable style={styles.searchIconBtn} onPress={() => navigation.navigate('Search')}>
                <Search size={20} color={theme.colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* ─── Hero Progress Card ─── */}
          <GlassCard style={styles.progressHeroCard} elevation="md">
            <View style={styles.progressContent}>
              <ProgressRing progress={completionProgress} size={72} strokeWidth={7} showPercent />
              <View style={styles.progressTextSection}>
                <Text variant="titleMedium" fontWeight="bold">Today's Progress</Text>
                <Text variant="bodySmall" color="textSecondary" style={styles.progressSubtext}>
                  {motivationalMessage}
                </Text>
                {stats.total > 0 && (
                  <Text variant="caption" color="primary" fontWeight="bold">
                    {stats.completed} of {stats.total} tasks done
                  </Text>
                )}
              </View>
            </View>
          </GlassCard>

          {/* ─── Stat Chips Row ─── */}
          {hasTasks && (
            <View style={styles.statsRow}>
              <StatisticCard
                label="Pending"
                value={stats.pending}
                icon={<Layers size={16} color={theme.colors.primary} />}
                color={theme.colors.primary}
              />
              <StatisticCard
                label="Completed"
                value={stats.completed}
                icon={<CheckCircle2 size={16} color={theme.colors.success} />}
                color={theme.colors.success}
              />
              <StatisticCard
                label="Overdue"
                value={stats.overdue}
                icon={<AlertTriangle size={16} color={theme.colors.danger} />}
                color={theme.colors.danger}
              />
              <StatisticCard
                label="Priority"
                value={stats.high}
                icon={<TrendingUp size={16} color={theme.colors.warning} />}
                color={theme.colors.warning}
              />
            </View>
          )}

          {/* ─── Quick Actions ─── */}
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('AddWork')}>
              <View style={[styles.qaIcon, styles.qaIconPurple]}>
                <Plus size={16} color={theme.colors.primary} />
              </View>
              <Text variant="caption" fontWeight="semiBold" color="textSecondary">New Task</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('AddNote')}>
              <View style={[styles.qaIcon, styles.qaIconBlue]}>
                <FileText size={16} color={theme.colors.secondary} />
              </View>
              <Text variant="caption" fontWeight="semiBold" color="textSecondary">Note</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('Search')}>
              <View style={[styles.qaIcon, styles.qaIconGray]}>
                <Search size={16} color={theme.colors.textSecondary} />
              </View>
              <Text variant="caption" fontWeight="semiBold" color="textSecondary">Search</Text>
            </TouchableOpacity>
          </View>

          {/* ─── Today's Focus ─── */}
          {todaysFocus && (
            <View style={styles.focusSection}>
              <SectionHeader title="Today's Focus" count={1} accentColor={theme.colors.secondary} />
              <GlassCard style={styles.focusCard} elevation="md">
                <View style={styles.focusHeader}>
                  <View style={styles.focusHeaderTitle}>
                    <Target size={14} color={theme.colors.secondary} />
                    <Text variant="overline" color="textSecondary" style={styles.focusLabel}>
                      PRIMARY OBJECTIVE
                    </Text>
                  </View>
                  {todaysFocus.priority === WorkPriority.HIGH && (
                    <View style={styles.criticalBadge}>
                      <AlertCircle size={10} color={theme.colors.priorityHigh} />
                      <Text variant="caption" style={styles.criticalText}>CRITICAL</Text>
                    </View>
                  )}
                </View>
                <Text variant="titleLarge" fontWeight="bold" style={styles.focusTitle} numberOfLines={2}>
                  {todaysFocus.title}
                </Text>
                {todaysFocus.description ? (
                  <Text variant="bodySmall" color="textSecondary" numberOfLines={2} style={styles.focusDesc}>
                    {todaysFocus.description}
                  </Text>
                ) : null}
                <View style={styles.focusFooter}>
                  <View style={styles.focusDeadline}>
                    <Clock size={12} color={theme.colors.textSecondary} />
                    <Text variant="caption" color="textSecondary">
                      {todaysFocus.deadline
                        ? new Date(todaysFocus.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'No deadline'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.focusViewBtn}
                    onPress={() => handleCardPress(todaysFocus.id)}
                  >
                    <Text variant="caption" fontWeight="bold" style={styles.focusViewBtnText}>
                      View details
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            </View>
          )}

          {/* ─── Task Sections ─── */}
          {!hasTasks ? (
            <EmptyState
              icon={<Target size={48} color={theme.colors.primary} />}
              title="All clear for today!"
              description="No tasks scheduled. Tap the + button to add your first task."
              actionLabel="Add Work"
              onAction={() => navigation.navigate('AddWork')}
              style={styles.emptyState}
            />
          ) : (
            <View style={styles.sectionsList}>
              {dashboardBuckets.overdue.length > 0 && (
                <View>
                  <SectionHeader title="Overdue" count={dashboardBuckets.overdue.length} accentColor={theme.colors.priorityHigh} />
                  {dashboardBuckets.overdue.map(work => (
                    <WorkCard key={work.id} work={work} onPress={handleCardPress} />
                  ))}
                </View>
              )}
              {dashboardBuckets.highPriority.length > 0 && (
                <View>
                  <SectionHeader title="High Priority" count={dashboardBuckets.highPriority.length} accentColor={theme.colors.warning} />
                  {dashboardBuckets.highPriority.map(work => (
                    <WorkCard key={work.id} work={work} onPress={handleCardPress} />
                  ))}
                </View>
              )}
              {dashboardBuckets.routine.length > 0 && (
                <View>
                  <SectionHeader title="Pending" count={dashboardBuckets.routine.length} accentColor={theme.colors.primary} />
                  {dashboardBuckets.routine.map(work => (
                    <WorkCard key={work.id} work={work} onPress={handleCardPress} />
                  ))}
                </View>
              )}
              {dashboardBuckets.completed.length > 0 && (
                <View>
                  <SectionHeader title="Completed" count={dashboardBuckets.completed.length} accentColor={theme.colors.success} />
                  {dashboardBuckets.completed.map(work => (
                    <WorkCard key={work.id} work={work} onPress={handleCardPress} />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ─── Quick Notes ─── */}
          {notes.length > 0 && (
            <View style={styles.notesSection}>
              <View style={styles.notesSectionHeader}>
                <SectionHeader title="Quick Notes" count={notes.length} accentColor={theme.colors.primary} />
                <TouchableOpacity onPress={() => navigation.navigate('QuickNotes')}>
                  <View style={styles.seeAllButton}>
                    <Text variant="caption" color="primary" fontWeight="semiBold">See All</Text>
                    <ChevronRight size={12} color={theme.colors.primary} />
                  </View>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.notesHorizontalScroll}
              >
                {notes.map(note => (
                  <TouchableOpacity
                    key={note.id}
                    activeOpacity={0.8}
                    onPress={() => handleNotePress(note.id)}
                    style={styles.notePreviewWrapper}
                  >
                    <GlassCard style={styles.notePreviewCard} elevation="xs">
                      <View style={styles.notePreviewHeader}>
                        <BookOpen size={10} color={theme.colors.primary} />
                      </View>
                      {note.title ? (
                        <Text variant="bodySmall" fontWeight="semiBold" numberOfLines={1} style={styles.notePreviewTitle}>
                          {note.title}
                        </Text>
                      ) : null}
                      <Text variant="caption" color="textSecondary" numberOfLines={4} style={styles.notePreviewContent}>
                        {note.content}
                      </Text>
                      <Text variant="caption" color="textTertiary" style={styles.notePreviewDate}>
                        {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </GlassCard>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        {/* ─── FAB ─── */}
        <FABMenu options={fabOptions} />
      </GradientBackground>
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
    paddingBottom: 120,
  },
  headerBlock: {
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextBlock: {
    flex: 1,
  },
  greetingText: {
    lineHeight: 30,
  },
  dateText: {
    marginTop: 2,
  },
  searchIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.xs,
  },
  progressHeroCard: {
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  progressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  progressTextSection: {
    flex: 1,
    gap: 3,
  },
  progressSubtext: {
    lineHeight: 17,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 34, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    gap: 6,
  },
  qaIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaIconPurple: { backgroundColor: 'rgba(124, 92, 252, 0.15)' },
  qaIconBlue: { backgroundColor: 'rgba(0, 240, 255, 0.12)' },
  qaIconGray: { backgroundColor: 'rgba(255, 255, 255, 0.06)' },
  focusSection: {
    marginBottom: theme.spacing.md,
  },
  focusCard: {
    borderColor: 'rgba(0, 240, 255, 0.2)',
    padding: theme.spacing.md,
  },
  focusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  focusHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  focusLabel: {
    marginLeft: 2,
  },
  criticalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
  },
  criticalText: {
    color: theme.colors.priorityHigh,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  focusTitle: {
    lineHeight: 22,
    marginBottom: 4,
  },
  focusDesc: {
    lineHeight: 16,
    marginBottom: theme.spacing.md,
  },
  focusFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  focusDeadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  focusViewBtn: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.sm,
  },
  focusViewBtnText: {
    color: theme.colors.background,
  },
  emptyState: {
    marginTop: theme.spacing.md,
    backgroundColor: 'rgba(26, 26, 34, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
    borderRadius: theme.radius.lg,
  },
  sectionsList: {
    gap: theme.spacing.sm,
  },
  notesSection: {
    marginTop: theme.spacing.lg,
  },
  notesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  notesHorizontalScroll: {
    paddingRight: theme.spacing.md,
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  notePreviewWrapper: {
    width: width * 0.43,
  },
  notePreviewCard: {
    height: 130,
    justifyContent: 'space-between',
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(26, 26, 34, 0.7)',
  },
  notePreviewHeader: {
    marginBottom: 4,
  },
  notePreviewTitle: {
    lineHeight: 16,
    marginBottom: 2,
  },
  notePreviewContent: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  notePreviewDate: {
    fontSize: 9,
    marginTop: 4,
  },
});
