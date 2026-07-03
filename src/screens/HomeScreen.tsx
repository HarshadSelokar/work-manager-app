import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppContainer, Text, Button } from '@components/common';
import { theme } from '@theme/index';

export const HomeScreen: React.FC = () => {
  const handlePress = () => {
    console.log('Button pressed on HomeScreen!');
  };

  return (
    <AppContainer style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" color="primary" align="center" style={styles.title}>
          Welcome to Work Manager
        </Text>
        <Text
          variant="bodyLarge"
          color="textSecondary"
          align="center"
          style={styles.subtitle}
        >
          Your senior mentor React Native playground. Clean architecture, TypeScript type
          safety, and path mapping config are ready.
        </Text>
        <Button title="Get Started" onPress={handlePress} variant="primary" />
        <Button
          title="Warning Action"
          onPress={() => console.log('Danger pressed')}
          variant="danger"
        />
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    marginBottom: theme.spacing.xl,
  },
});
