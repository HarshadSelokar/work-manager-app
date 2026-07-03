import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, SectionList, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '@navigation/types';
import { AppContainer, Text, EmptyState, SectionHeader, LoadingView, FABMenu } from '@components/common';
import { WorkCard } from '@components/work/WorkCard';
import { WorksRepository } from '../repository/works.repository';
import { Work, WorkPriority, WorkCategory, WorkStatus } from '@models/index';
import { theme } from '@theme/index';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Other'>,
  NativeStackScreenProps<RootStackParamList>
>;

const priorityWeights: Record<WorkPriority, number> = {
  [WorkPriority.HIGH]: 3,
  [WorkPriority.MEDIUM]: 2,
  [WorkPriority.LOW]: 1,
};

export const OtherScreen: React.FC<Props> = ({ navigation }) => {
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const worksRepo = useMemo(() => new WorksRepository(), []);

  const fetchTasks = useCallback(() => {
    try {
      const data = worksRepo.findByCategory(WorkCategory.OTHER);
      setWorks(data);
    } catch (error) {
      console.error('Failed to load other tasks:', error);
    }
  }, [worksRepo]);

  // Fetch 'other' tasks whenever screen gets focused
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

  // Group and sort works into Overdue, Tomorrow, This Week, Later, and No Deadline sections
  const sections = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    const overdueList: Work[] = [];
    const tomorrowList: Work[] = [];
    const thisWeekList: Work[] = [];
    const laterList: Work[] = [];
    const noDeadlineList: Work[] = [];

    works.forEach(work => {
      // Filter out completed tasks as they belong in Completed tab
      if (work.status === WorkStatus.COMPLETED) {
        return;
      }

      if (!work.deadline) {
        noDeadlineList.push(work);
        return;
      }

      const dueDate = new Date(work.deadline);
      dueDate.setHours(0, 0, 0, 0);

      const dueTime = dueDate.getTime();
      const todayTime = today.getTime();
      const tomorrowTime = tomorrow.getTime();
      const weekTime = sevenDaysLater.getTime();

      if (dueTime < todayTime) {
        overdueList.push(work);
      } else if (dueTime === tomorrowTime) {
        tomorrowList.push(work);
      } else if (dueTime > tomorrowTime && dueTime <= weekTime) {
        thisWeekList.push(work);
      } else {
        laterList.push(work);
      }
    });

    const sortComparator = (a: Work, b: Work) => {
      const aTime = a.deadline ? a.deadline.getTime() : 0;
      const bTime = b.deadline ? b.deadline.getTime() : 0;
      const timeDiff = aTime - bTime;
      if (timeDiff !== 0) {
        return timeDiff;
      }
      return priorityWeights[b.priority] - priorityWeights[a.priority];
    };

    overdueList.sort(sortComparator);
    tomorrowList.sort(sortComparator);
    thisWeekList.sort(sortComparator);
    laterList.sort(sortComparator);

    noDeadlineList.sort((a, b) => {
      const priorityDiff = priorityWeights[b.priority] - priorityWeights[a.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const result = [];
    if (overdueList.length > 0) {
      result.push({
        title: 'Overdue Tasks',
        accentColor: theme.colors.priorityHigh,
        data: overdueList,
      });
    }
    if (tomorrowList.length > 0) {
      result.push({
        title: 'Tomorrow',
        accentColor: theme.colors.priorityMedium,
        data: tomorrowList,
      });
    }
    if (thisWeekList.length > 0) {
      result.push({
        title: 'This Week',
        accentColor: theme.colors.primary,
        data: thisWeekList,
      });
    }
    if (laterList.length > 0) {
      result.push({
        title: 'Later',
        accentColor: theme.colors.secondary,
        data: laterList,
      });
    }
    if (noDeadlineList.length > 0) {
      result.push({
        title: 'No Deadline Set',
        accentColor: theme.colors.textSecondary,
        data: noDeadlineList,
      });
    }
    return result;
  }, [works]);

  const handleCardPress = useCallback(
    (id: string) => {
      navigation.navigate('WorkDetails', { workId: id });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Work }) => <WorkCard work={item} onPress={handleCardPress} />,
    [handleCardPress]
  );

  const renderSectionHeader = useCallback(
    ({ section: { title, accentColor, data } }: { section: { title: string; accentColor?: string; data: Work[] } }) => (
      <SectionHeader title={title} count={data.length} accentColor={accentColor} />
    ),
    []
  );

  const keyExtractor = useCallback((item: Work) => item.id, []);

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
          Upcoming Planner
        </Text>
        <Text variant="bodyMedium" color="textSecondary">
          Monitor your backlog milestones and plan future works.
        </Text>
      </View>

      {isLoading ? (
        <LoadingView message="Loading routine backlog..." />
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              emoji="📅"
              title="No upcoming works!"
              description="Your backlog planner is empty. Tap Add Work to schedule future items."
              actionLabel="Add Work"
              onAction={() => navigation.navigate('AddWork')}
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
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 90, // Leave space for FAB
  },
  emptyState: {
    marginTop: theme.spacing.xl,
  },
});
