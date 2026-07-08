import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, SectionList, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '@navigation/types';
import {
  AppContainer,
  Text,
  EmptyState,
  SectionHeader,
  LoadingView,
  FABMenu,
  GradientBackground,
} from '@components/common';
import { WorkCard } from '@components/work/WorkCard';
import { WorksRepository } from '../repository/works.repository';
import { Work, WorkPriority, WorkCategory, WorkStatus } from '@models/index';
import { theme } from '@theme/index';
import { Plus, FileText, Search, CalendarDays } from 'lucide-react-native';

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
    setTimeout(() => { setIsRefreshing(false); }, 400);
  }, [fetchTasks]);

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
      if (work.status === WorkStatus.COMPLETED) return;
      if (!work.deadline) { noDeadlineList.push(work); return; }

      const dueDate = new Date(work.deadline);
      dueDate.setHours(0, 0, 0, 0);
      const dueTime = dueDate.getTime();

      if (dueTime < today.getTime()) {
        overdueList.push(work);
      } else if (dueTime === tomorrow.getTime()) {
        tomorrowList.push(work);
      } else if (dueTime > tomorrow.getTime() && dueTime <= sevenDaysLater.getTime()) {
        thisWeekList.push(work);
      } else {
        laterList.push(work);
      }
    });

    const sortComparator = (a: Work, b: Work) => {
      const aTime = a.deadline ? a.deadline.getTime() : 0;
      const bTime = b.deadline ? b.deadline.getTime() : 0;
      const timeDiff = aTime - bTime;
      if (timeDiff !== 0) return timeDiff;
      return priorityWeights[b.priority] - priorityWeights[a.priority];
    };

    overdueList.sort(sortComparator);
    tomorrowList.sort(sortComparator);
    thisWeekList.sort(sortComparator);
    laterList.sort(sortComparator);
    noDeadlineList.sort((a, b) => {
      const pd = priorityWeights[b.priority] - priorityWeights[a.priority];
      if (pd !== 0) return pd;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const result = [];
    if (overdueList.length > 0) {
      result.push({ title: 'Overdue', accentColor: theme.colors.danger, data: overdueList });
    }
    if (tomorrowList.length > 0) {
      result.push({ title: 'Tomorrow', accentColor: theme.colors.warning, data: tomorrowList });
    }
    if (thisWeekList.length > 0) {
      result.push({ title: 'This Week', accentColor: theme.colors.primary, data: thisWeekList });
    }
    if (laterList.length > 0) {
      result.push({ title: 'Later', accentColor: theme.colors.secondary, data: laterList });
    }
    if (noDeadlineList.length > 0) {
      result.push({ title: 'No Deadline', accentColor: theme.colors.textSecondary, data: noDeadlineList });
    }
    return result;
  }, [works]);

  const handleCardPress = useCallback(
    (id: string) => { navigation.navigate('WorkDetails', { workId: id }); },
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
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <View style={styles.headerIconRow}>
            <View style={styles.headerIcon}>
              <CalendarDays size={20} color={theme.colors.primary} />
            </View>
            <View>
              <Text variant="displaySmall" fontWeight="bold">Upcoming</Text>
              <Text variant="bodySmall" color="textSecondary">Plan and manage your backlog</Text>
            </View>
          </View>
        </View>

        {isLoading ? (
          <LoadingView message="Loading backlog..." />
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
                icon={<CalendarDays size={48} color={theme.colors.primary} />}
                title="No upcoming tasks!"
                description="Your backlog is clear. Schedule future tasks to stay organized."
                actionLabel="Add Work"
                onAction={() => navigation.navigate('AddWork')}
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
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 110,
  },
  emptyState: {
    marginTop: theme.spacing.xl,
  },
});
