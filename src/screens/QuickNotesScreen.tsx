import React from 'react';
import { StyleSheet } from 'react-native';
import { AppContainer, Text } from '@components/common';

export const QuickNotesScreen: React.FC = () => {
  return (
    <AppContainer style={styles.container}>
      <Text variant="h2" color="primary">
        Quick Notes
      </Text>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
