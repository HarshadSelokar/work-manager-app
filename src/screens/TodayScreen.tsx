import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '@navigation/types';
import { AppContainer, Text, EmptyState, LoadingView, StatChip, SectionHeader, FABMenu } from '@components/common';
import { WorkCard } from '@components/work/WorkCard';
import { WorksRepository } from '../repository/works.repository';
import { Work, WorkPriority, WorkCategory, WorkStatus } from '@models/index';
import { theme } from '@theme/index';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Today'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const TodayScreen: React.FC<Props> = ({ navigation }) => {
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const worksRepo = useMemo(() => new WorksRepository(), []);

  const fetchTasks = useCallback(() => {
    try {
      const data = worksRepo.findByCategory(WorkCategory.TODAY);
      setWorks(data);
    } catch (error) {
      console.error('Failed to load today\'s tasks:', error);
    }
  }, [worksRepo]);

  // Fetch tasks on screen focus
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchTasks();
      setIsLoading(false);
    }, [fetchTasks])
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchTasks();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  }, [fetchTasks]);

  const handleCardPress = useCallback(
    (id: string) => {
      navigation.navigate('WorkDetails', { workId: id });
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

    return { total, completed: completedCount, overdue: overdueCount };
  }, [works, dashboardBuckets]);

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

  if (isLoading) {
    return <LoadingView message="Loading dashboard..." />;
  }

  const hasTasks = works.length > 0;

  return (
    <AppContainer safeAreaSides={['top', 'left', 'right']} style={styles.container}>
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
          <Text variant="bodyLarge" color="textSecondary">
            {formattedDate}
          </Text>
        </View>

        {/* Dashboard Stat Chips */}
        <View style={styles.statsRow}>
          <StatChip value={stats.total} label="Total Tasks" color={theme.colors.primary} style={styles.statChip} />
          <StatChip value={stats.completed} label="Completed" color={theme.colors.success} style={styles.statChip} />
          <StatChip value={stats.overdue} label="Overdue" color={theme.colors.priorityHigh} style={styles.statChip} />
        </View>

        {!hasTasks ? (
          <EmptyState
            emoji="✨"
            title="All clear for today!"
            description="No tasks scheduled. Relax or tap the FAB below to schedule a new task."
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
      </ScrollView>

      {/* Global FAB Menu */}
      <FABMenu options={fabOptions} />
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
    paddingBottom: 90, // Leave space for FAB
  },
  headerBlock: {
    marginBottom: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  statChip: {
    flex: 1,
  },
  emptyState: {
    marginTop: theme.spacing.xl,
  },
  sectionsList: {
    gap: theme.spacing.md,
  },
});
