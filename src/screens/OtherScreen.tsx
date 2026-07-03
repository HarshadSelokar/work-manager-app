import React from 'react';
import { StyleSheet } from 'react-native';
import { AppContainer, Text } from '@components/common';

export const OtherScreen: React.FC = () => {
  return (
    <AppContainer style={styles.container}>
      <Text variant="h2" color="primary">
        Other Screen
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
