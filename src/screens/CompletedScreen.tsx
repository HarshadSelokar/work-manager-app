import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, SectionList, View, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '@navigation/types';
import { AppContainer, Text, EmptyState, SectionHeader, LoadingView } from '@components/common';
import { WorkCard } from '@components/work/WorkCard';
import { WorksRepository } from '../repository/works.repository';
import { Work, WorkStatus } from '@models/index';
import { theme } from '@theme/index';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Completed'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const CompletedScreen: React.FC<Props> = ({ navigation }) => {
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const worksRepo = useMemo(() => new WorksRepository(), []);

  const fetchCompletedWorks = useCallback(() => {
    try {
      const data = worksRepo.findCompleted();
      setWorks(data);
    } catch (error) {
      console.error('Failed to load completed tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [worksRepo]);

  // Reload lists when focused
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchCompletedWorks();
    }, [fetchCompletedWorks])
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchCompletedWorks();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  }, [fetchCompletedWorks]);

  // Restore Work Action
  const handleRestoreWork = useCallback(
    (work: Work) => {
      const updated: Work = {
        ...work,
        status: WorkStatus.IN_PROGRESS,
        updatedAt: new Date(),
      };

      try {
        worksRepo.update(updated);
        fetchCompletedWorks();
        Alert.alert('Restored', `"${work.title}" has been restored to in-progress backlog.`);
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to restore task.');
      }
    },
    [worksRepo, fetchCompletedWorks]
  );

  // Permanent Delete Action
  const handleDeletePermanently = useCallback(
    (id: string) => {
      Alert.alert(
        'Delete Permanently',
        'Are you sure you want to permanently delete this task? This action is destructive and cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              try {
                worksRepo.delete(id);
                fetchCompletedWorks();
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to delete task.');
              }
            },
          },
        ],
        { cancelable: true }
      );
    },
    [worksRepo, fetchCompletedWorks]
  );

  // Card Tap Menu Dialog
  const handleCardPress = useCallback(
    (id: string) => {
      const targetWork = works.find(w => w.id === id);
      if (!targetWork) {
        return;
      }

      Alert.alert(
        'Task Options',
        `Manage completed task: "${targetWork.title}"`,
        [
          {
            text: 'View Details',
            onPress: () => navigation.navigate('WorkDetails', { workId: id }),
          },
          {
            text: 'Restore Task',
            onPress: () => handleRestoreWork(targetWork),
          },
          {
            text: 'Delete Permanently',
            style: 'destructive',
            onPress: () => handleDeletePermanently(id),
          },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    },
    [works, navigation, handleRestoreWork, handleDeletePermanently]
  );

  // Group completed works into Today, Yesterday, This Week, and Earlier timeline sections
  const sections = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

    const todayList: Work[] = [];
    const yesterdayList: Work[] = [];
    const thisWeekList: Work[] = [];
    const earlierList: Work[] = [];

    works.forEach(work => {
      const compDate = new Date(work.updatedAt || work.createdAt);
      compDate.setHours(0, 0, 0, 0);

      const compTime = compDate.getTime();
      const todayTime = today.getTime();
      const yesterdayTime = yesterday.getTime();
      const weekTime = startOfWeek.getTime();

      if (compTime === todayTime) {
        todayList.push(work);
      } else if (compTime === yesterdayTime) {
        yesterdayList.push(work);
      } else if (compTime >= weekTime) {
        thisWeekList.push(work);
      } else {
        earlierList.push(work);
      }
    });

    const result = [];
    if (todayList.length > 0) {
      result.push({ title: 'Today', data: todayList });
    }
    if (yesterdayList.length > 0) {
      result.push({ title: 'Yesterday', data: yesterdayList });
    }
    if (thisWeekList.length > 0) {
      result.push({ title: 'This Week', data: thisWeekList });
    }
    if (earlierList.length > 0) {
      result.push({ title: 'Earlier', data: earlierList });
    }
    return result;
  }, [works]);

  const renderItem = useCallback(
    ({ item }: { item: Work }) => <WorkCard work={item} onPress={handleCardPress} />,
    [handleCardPress]
  );

  const renderSectionHeader = useCallback(
    ({ section: { title, data } }: { section: { title: string; data: Work[] } }) => (
      <SectionHeader title={title} count={data.length} accentColor={theme.colors.success} />
    ),
    []
  );

  const keyExtractor = useCallback((item: Work) => item.id, []);

  return (
    <AppContainer safeAreaSides={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <Text variant="displaySmall" fontWeight="bold">
          Completed Achievements
        </Text>
        <Text variant="bodyMedium" color="textSecondary">
          {works.length === 0 ? 'No completed tasks yet.' : `${works.length} tasks completed successfully.`}
        </Text>
      </View>

      {isLoading ? (
        <LoadingView message="Loading completed tasks..." />
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
              emoji="🏆"
              title="No achievements yet!"
              description="Keep working! Once you mark a task as Done, it will appear here."
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
  header: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
});
