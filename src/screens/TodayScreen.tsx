import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, FlatList, ListRenderItem, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '@navigation/types';
import { AppContainer, Text, EmptyState, LoadingView } from '@components/common';
import { WorkCard } from '@components/work/WorkCard';
import { WorksRepository } from '../repository/works.repository';
import { Work, WorkPriority, WorkCategory } from '@models/index';
import { theme } from '@theme/index';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Today'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Priority numerical weights for ordering
const priorityWeights: Record<WorkPriority, number> = {
  [WorkPriority.HIGH]: 3,
  [WorkPriority.MEDIUM]: 2,
  [WorkPriority.LOW]: 1,
};

export const TodayScreen: React.FC<Props> = ({ navigation }) => {
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const worksRepo = useMemo(() => new WorksRepository(), []);

  // Fetch today's tasks whenever screen becomes focused
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      try {
        const data = worksRepo.findByCategory(WorkCategory.TODAY);
        setWorks(data);
      } catch (error) {
        console.error('Failed to load today\'s tasks:', error);
      } finally {
        setIsLoading(false);
      }
    }, [worksRepo])
  );

  // Memoized sorting algorithm: ordering by priority first, then earliest deadline (createdAt)
  const sortedWorks = useMemo(() => {
    return [...works].sort((a, b) => {
      const priorityDiff = priorityWeights[b.priority] - priorityWeights[a.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }, [works]);

  // Stable navigation trigger
  const handleCardPress = useCallback(
    (id: string) => {
      navigation.navigate('WorkDetails', { workId: id });
    },
    [navigation]
  );

  // Stable list item renderer
  const renderItem: ListRenderItem<Work> = useCallback(
    ({ item }) => <WorkCard work={item} onPress={handleCardPress} />,
    [handleCardPress]
  );

  // Stable key extractor
  const keyExtractor = useCallback((item: Work) => item.id, []);

  return (
    <AppContainer style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1" color="primary">
          Today's Routine
        </Text>
        <Text variant="bodyMedium" color="textSecondary">
          Focus on details and prioritize high importance tasks first.
        </Text>
      </View>

      {isLoading ? (
        <LoadingView message="Loading tasks..." />
      ) : (
        <FlatList
          data={sortedWorks}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              title="All clear for today!"
              description="You don't have any tasks scheduled. Tap Add Work or take a rest."
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
    marginBottom: theme.spacing.lg,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
});
