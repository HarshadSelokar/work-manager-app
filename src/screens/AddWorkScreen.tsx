import React from 'react';
import { StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { AppContainer, Text } from '@components/common';

type Props = NativeStackScreenProps<RootStackParamList, 'AddWork'>;

export const AddWorkScreen: React.FC<Props> = () => {
  return (
    <AppContainer style={styles.container}>
      <Text variant="h2" color="primary">
        Add Work Screen
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
