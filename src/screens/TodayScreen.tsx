import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
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
} from '@components/common';
import { WorkCard } from '@components/work/WorkCard';
import { WorksRepository } from '../repository/works.repository';
import { NotesRepository } from '../repository/notes.repository';
import { Work, WorkPriority, WorkCategory, WorkStatus, Note } from '@models/index';
import { theme } from '@theme/index';
import { Target, AlertCircle, Plus, FileText, Search, ChevronRight, BookOpen, Clock } from 'lucide-react-native';

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
      setNotes(allNotes.slice(0, 5)); // Show top 5 recent notes
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }, [worksRepo, notesRepo]);

  // Fetch data on screen focus
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
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  }, [fetchData]);

  const handleCardPress = useCallback(
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

  // Greeting & Date calculations
  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const formattedDate = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  }, []);

  // Filter tasks into overdue, high-priority, routine pending, and completed categories
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

    return { total, completed: completedCount, overdue: overdueCount, pending: pendingCount };
  }, [works, dashboardBuckets]);

  // Today's Focus task selection (highest priority pending task, or first pending task)
  const todaysFocus = useMemo(() => {
    const pending = [...dashboardBuckets.overdue, ...dashboardBuckets.highPriority, ...dashboardBuckets.routine];
    if (pending.length === 0) return null;

    // Try to find high priority task first
    const high = pending.find(w => w.priority === WorkPriority.HIGH);
    if (high) return high;

    const overdue = pending.find(w => w.deadline !== undefined);
    if (overdue) return overdue;

    return pending[0];
  }, [dashboardBuckets]);

  const completionProgress = useMemo(() => {
    return stats.total > 0 ? stats.completed / stats.total : 0;
  }, [stats]);

  const motivationalMessage = useMemo(() => {
    if (stats.total === 0) return 'Add a task to start your day.';
    if (completionProgress === 1) return 'Outstanding! All tasks completed.';
    if (completionProgress >= 0.7) return 'Almost there! Keep pushing.';
    if (completionProgress >= 0.4) return 'Nice progress! Halfway through.';
    return `You have ${stats.pending} pending tasks for today.`;
  }, [stats, completionProgress]);

  const fabOptions = useMemo(() => [
    {
      label: 'Add Work',
      icon: <Plus size={18} color="#FFFFFF" />,
      onPress: () => navigation.navigate('AddWork'),
    },
    {
      label: 'Quick Note',
      icon: <FileText size={18} color="#FFFFFF" />,
      onPress: () => navigation.navigate('AddNote'),
    },
    {
      label: 'Search',
      icon: <Search size={18} color="#FFFFFF" />,
      onPress: () => navigation.navigate('Search'),
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
          {/* Welcome Greeting Header */}
          <View style={styles.headerBlock}>
            <Text variant="displaySmall" fontWeight="bold">
              {greeting}, Harshad
            </Text>
            <Text variant="bodyMedium" color="textSecondary">
              {formattedDate}
            </Text>
          </View>

          {/* Quick Actions Row */}
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('AddWork')}
            >
              <View style={[styles.actionIconBg, styles.actionIconPurple]}>
                <Plus size={16} color={theme.colors.primary} />
              </View>
              <Text variant="caption" fontWeight="semiBold" color="textSecondary">
                New Task
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('AddNote')}
            >
              <View style={[styles.actionIconBg, styles.actionIconBlue]}>
                <FileText size={16} color={theme.colors.secondary} />
              </View>
              <Text variant="caption" fontWeight="semiBold" color="textSecondary">
                New Note
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Search')}
            >
              <View style={[styles.actionIconBg, styles.actionIconWhite]}>
                <Search size={16} color="#FFFFFF" />
              </View>
              <Text variant="caption" fontWeight="semiBold" color="textSecondary">
                Search
              </Text>
            </TouchableOpacity>
          </View>

          {/* Overall Progress Ring Card */}
          <GlassCard style={styles.progressCard} elevation="sm">
            <View style={styles.progressContent}>
              <ProgressRing progress={completionProgress} size={64} strokeWidth={6} />
              <View style={styles.progressTextSection}>
                <Text variant="titleMedium" fontWeight="bold">
                  Today's Progress
                </Text>
                <Text variant="bodySmall" color="textSecondary" style={styles.progressSubtext}>
                  {motivationalMessage}
                </Text>
                {stats.total > 0 && (
                  <Text variant="caption" color="primary" fontWeight="bold">
                    {Math.round(completionProgress * 100)}% Completed ({stats.completed}/{stats.total})
                  </Text>
                )}
              </View>
            </View>
          </GlassCard>

          {/* Today's Focus Card */}
          {todaysFocus && (
            <View style={styles.focusSection}>
              <SectionHeader title="Today's Focus" count={1} accentColor={theme.colors.secondary} />
              <GlassCard style={styles.focusCard} elevation="md">
                <View style={styles.focusHeader}>
                  <View style={styles.focusHeaderTitle}>
                    <Target size={16} color={theme.colors.secondary} style={styles.focusIcon} />
                    <Text variant="overline" color="textSecondary">
                      PRIMARY OBJECTIVE
                    </Text>
                  </View>
                  {todaysFocus.priority === WorkPriority.HIGH && (
                    <View style={styles.focusPriorityBadge}>
                      <AlertCircle size={10} color={theme.colors.priorityHigh} />
                      <Text variant="overline" style={styles.focusPriorityText}>
                        CRITICAL
                      </Text>
                    </View>
                  )}
                </View>
                <Text variant="titleLarge" fontWeight="bold" style={styles.focusTaskTitle} numberOfLines={2}>
                  {todaysFocus.title}
                </Text>
                {todaysFocus.description ? (
                  <Text variant="bodySmall" color="textSecondary" style={styles.focusDesc} numberOfLines={2}>
                    {todaysFocus.description}
                  </Text>
                ) : null}
                
                <View style={styles.focusFooter}>
                  <View style={styles.focusDeadline}>
                    <Clock size={12} color={theme.colors.textSecondary} />
                    <Text variant="caption" color="textSecondary">
                      {todaysFocus.deadline
                        ? new Date(todaysFocus.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'No time set'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.focusActionButton}
                    onPress={() => handleCardPress(todaysFocus.id)}
                  >
                    <Text variant="caption" fontWeight="bold" color="textInverse">
                      View details
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            </View>
          )}

          {/* Task Sections */}
          {!hasTasks ? (
            <EmptyState
              icon={<Target size={48} color={theme.colors.primary} />}
              title="All clear for today!"
              description="No tasks scheduled. Relax or tap the add button above to schedule a new task."
              actionLabel="Add Work"
              onAction={() => navigation.navigate('AddWork')}
              style={styles.emptyState}
            />
          ) : (
            <View style={styles.sectionsList}>
              {/* Overdue Section */}
              {dashboardBuckets.overdue.length > 0 && (
                <View>
                  <SectionHeader title="Overdue Tasks" count={dashboardBuckets.overdue.length} accentColor={theme.colors.priorityHigh} />
                  {dashboardBuckets.overdue.map(work => (
                    <WorkCard key={work.id} work={work} onPress={handleCardPress} />
                  ))}
                </View>
              )}

              {/* High Priority Section */}
              {dashboardBuckets.highPriority.length > 0 && (
                <View>
                  <SectionHeader title="High Priority" count={dashboardBuckets.highPriority.length} accentColor={theme.colors.priorityMedium} />
                  {dashboardBuckets.highPriority.map(work => (
                    <WorkCard key={work.id} work={work} onPress={handleCardPress} />
                  ))}
                </View>
              )}

              {/* Today's Pending Section */}
              {dashboardBuckets.routine.length > 0 && (
                <View>
                  <SectionHeader title="Today's Pending" count={dashboardBuckets.routine.length} accentColor={theme.colors.primary} />
                  {dashboardBuckets.routine.map(work => (
                    <WorkCard key={work.id} work={work} onPress={handleCardPress} />
                  ))}
                </View>
              )}

              {/* Recently Completed Section */}
              {dashboardBuckets.completed.length > 0 && (
                <View>
                  <SectionHeader title="Recently Completed" count={dashboardBuckets.completed.length} accentColor={theme.colors.success} />
                  {dashboardBuckets.completed.map(work => (
                    <WorkCard key={work.id} work={work} onPress={handleCardPress} />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Quick Notes Section */}
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
                  >
                    <GlassCard style={styles.notePreviewCard} elevation="xs">
                      {note.title ? (
                        <Text variant="titleMedium" fontWeight="bold" numberOfLines={1} style={styles.noteTitle}>
                          {note.title}
                        </Text>
                      ) : null}
                      <Text variant="bodySmall" color="textSecondary" numberOfLines={3} style={styles.noteContent}>
                        {note.content}
                      </Text>
                      <View style={styles.noteCardFooter}>
                        <BookOpen size={10} color={theme.colors.textTertiary} />
                        <Text variant="caption" style={styles.noteDate} color="textTertiary">
                          {new Date(note.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </Text>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        {/* Global FAB Menu */}
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
    paddingBottom: 110, // Extra space to scroll past floating navigation & FAB
  },
  headerBlock: {
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
    backgroundColor: 'rgba(26, 26, 34, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
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
  },
  progressSubtext: {
    marginVertical: 2,
    lineHeight: 16,
  },
  focusSection: {
    marginBottom: theme.spacing.md,
  },
  focusCard: {
    borderColor: 'rgba(0, 240, 255, 0.25)', // Neon Blue translucent border
    backgroundColor: 'rgba(26, 26, 34, 0.85)',
    padding: theme.spacing.md,
  },
  focusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  focusHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  focusIcon: {
    marginRight: 2,
  },
  focusPriorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  focusTaskTitle: {
    fontSize: 16,
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
  },
  focusDeadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  focusActionButton: {
    backgroundColor: theme.colors.secondary, // Neon Blue active
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
  },
  emptyState: {
    marginTop: theme.spacing.md,
    backgroundColor: 'rgba(26, 26, 34, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: theme.radius.lg,
  },
  sectionsList: {
    gap: theme.spacing.md,
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
  notePreviewCard: {
    width: width * 0.44,
    height: 110,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(26, 26, 34, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  noteTitle: {
    fontSize: 13,
    lineHeight: 17,
    marginBottom: 2,
  },
  noteContent: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  noteCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  actionIconPurple: {
    backgroundColor: 'rgba(124, 92, 252, 0.15)',
  },
  actionIconBlue: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
  },
  actionIconWhite: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  focusPriorityText: {
    color: theme.colors.priorityHigh,
    fontSize: 8,
  },
  noteDate: {
    fontSize: 9,
  },
});
