import React from 'react';
import { StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { AppContainer, Text } from '@components/common';
import { theme } from '@theme/index';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkDetails'>;

export const WorkDetailsScreen: React.FC<Props> = ({ route }) => {
  const { workId } = route.params;

  return (
    <AppContainer style={styles.container}>
      <Text variant="h2" color="primary" style={styles.title}>
        Work Details Screen
      </Text>
      <Text variant="bodyLarge" color="textSecondary">
        Work ID: {workId}
      </Text>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
});
