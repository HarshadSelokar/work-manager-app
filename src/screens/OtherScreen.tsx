import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, SectionList, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '@navigation/types';
import { AppContainer, Text, EmptyState, SectionHeader, LoadingView } from '@components/common';
import { WorkCard } from '@components/work/WorkCard';
import { WorksRepository } from '../repository/works.repository';
import { Work, WorkPriority, WorkCategory } from '@models/index';
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
  const worksRepo = useMemo(() => new WorksRepository(), []);

  // Fetch 'other' tasks whenever screen gets focused
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      try {
        const data = worksRepo.findByCategory(WorkCategory.OTHER);
        setWorks(data);
      } catch (error) {
        console.error('Failed to load other tasks:', error);
      } finally {
        setIsLoading(false);
      }
    }, [worksRepo])
  );

  // Group and sort works into Upcoming, Future, and No Deadline sections
  const sections = useMemo(() => {
    const upcomingList: Work[] = [];
    const futureList: Work[] = [];
    const noDeadlineList: Work[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysLater = new Date(today.getTime() + 86400000 * 7);

    for (const work of works) {
      if (!work.deadline) {
        noDeadlineList.push(work);
      } else {
        const dueDate = new Date(work.deadline);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate.getTime() <= sevenDaysLater.getTime()) {
          upcomingList.push(work);
        } else {
          futureList.push(work);
        }
      }
    }

    const sortComparator = (a: Work, b: Work) => {
      const aTime = a.deadline ? a.deadline.getTime() : 0;
      const bTime = b.deadline ? b.deadline.getTime() : 0;
      const timeDiff = aTime - bTime;
      if (timeDiff !== 0) {
        return timeDiff;
      }
      return priorityWeights[b.priority] - priorityWeights[a.priority];
    };

    upcomingList.sort(sortComparator);
    futureList.sort(sortComparator);

    noDeadlineList.sort((a, b) => {
      const priorityDiff = priorityWeights[b.priority] - priorityWeights[a.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const result = [];
    if (upcomingList.length > 0) {
      result.push({ title: 'Upcoming Tasks', data: upcomingList });
    }
    if (futureList.length > 0) {
      result.push({ title: 'Future Tasks', data: futureList });
    }
    if (noDeadlineList.length > 0) {
      result.push({ title: 'No Deadline Set', data: noDeadlineList });
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
    ({ section: { title } }: { section: { title: string } }) => <SectionHeader title={title} />,
    []
  );

  const keyExtractor = useCallback((item: Work) => item.id, []);

  return (
    <AppContainer style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1" color="primary">
          Backlog & Routine
        </Text>
        <Text variant="bodyMedium" color="textSecondary">
          Monitor future milestones and manage tasks with fluid deadlines.
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
          ListEmptyComponent={
            <EmptyState
              title="No upcoming works!"
              description="Your backlog is empty. Tap Add Work to queue up future routine tasks."
            />
          }
        />
      )}
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
  },
  header: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
});
