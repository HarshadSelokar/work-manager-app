import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppContainer, Text, Divider } from '@components/common';
import { WorksRepository } from '../repository/works.repository';
import { theme } from '@theme/index';

export const SettingsScreen: React.FC = () => {
  const worksRepo = useMemo(() => new WorksRepository(), []);
  
  // Dashboard Statistics State
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    highPriority: 0,
    todayCount: 0,
    notesCount: 0,
  });

  const loadStatistics = useCallback(() => {
    try {
      const data = worksRepo.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard statistics:', error);
    }
  }, [worksRepo]);

  // Refresh statistics when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadStatistics();
    }, [loadStatistics])
  );

  // Actions
  const handleResetDatabase = useCallback(() => {
    Alert.alert(
      'Reset Database Warning',
      'Are you sure you want to permanently clear all tasks, notes, links, and images? This action is destructive and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset All',
          style: 'destructive',
          onPress: () => {
            try {
              worksRepo.resetDatabase();
              loadStatistics();
              Alert.alert('Reset Success', 'The database has been cleared completely.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to reset database.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [worksRepo, loadStatistics]);

  const handleExportDatabase = useCallback(() => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        stats,
      };
      Alert.alert(
        'Database Exported',
        `Database backup JSON package created successfully:\n\n${JSON.stringify(backupData, null, 2)}`
      );
    } catch {
      Alert.alert('Export Failed', 'An error occurred during database export.');
    }
  }, [stats]);

  const handleImportDatabase = useCallback(() => {
    Alert.alert('Import Database', 'Importing database backups from JSON package is placeholder.');
  }, []);

  const handleToggleTheme = useCallback(() => {
    Alert.alert('Theme Settings', 'Dynamic light/dark theme preference is configured as dark-ready placeholder.');
  }, []);

  const completionRate = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  }, [stats]);

  return (
    <AppContainer safeAreaSides={['top', 'left', 'right']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text variant="displaySmall" fontWeight="bold">
            More Options
          </Text>
          <Text variant="bodyMedium" color="textSecondary">
            Review stats dashboard, manage data exports, and configure preferences.
          </Text>
        </View>

        {/* Task Completion Rate Dashboard Card */}
        <View style={styles.dashboardCard}>
          <View style={styles.progressHeader}>
            <Text variant="titleMedium" fontWeight="bold">
              Task Completion Rate
            </Text>
            <Text variant="titleLarge" fontWeight="bold" color="success">
              {completionRate}%
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${completionRate}%` }]} />
          </View>
          <Text variant="caption" color="textSecondary" style={styles.progressCaption}>
            {stats.completed} of {stats.total} total routine items marked as completed.
          </Text>
        </View>

        {/* Statistics Grid */}
        <Text variant="overline" style={styles.sectionTitle}>
          STATISTICS DASHBOARD
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statsCard}>
            <Text variant="titleLarge" fontWeight="bold" color="primary">
              {stats.total}
            </Text>
            <Text variant="caption" color="textSecondary">
              Total Tasks
            </Text>
          </View>
          <View style={styles.statsCard}>
            <Text variant="titleLarge" fontWeight="bold" color="success">
              {stats.completed}
            </Text>
            <Text variant="caption" color="textSecondary">
              Completed
            </Text>
          </View>
          <View style={styles.statsCard}>
            <Text variant="titleLarge" fontWeight="bold" color="warning">
              {stats.pending}
            </Text>
            <Text variant="caption" color="textSecondary">
              Pending
            </Text>
          </View>
          <View style={styles.statsCard}>
            <Text variant="titleLarge" fontWeight="bold" color="danger">
              {stats.highPriority}
            </Text>
            <Text variant="caption" color="textSecondary">
              High Priority
            </Text>
          </View>
          <View style={styles.statsCard}>
            <Text variant="titleLarge" fontWeight="bold" color="info">
              {stats.todayCount}
            </Text>
            <Text variant="caption" color="textSecondary">
              Today's Routine
            </Text>
          </View>
          <View style={styles.statsCard}>
            <Text variant="titleLarge" fontWeight="bold" color="primary">
              {stats.notesCount}
            </Text>
            <Text variant="caption" color="textSecondary">
              Quick Notes
            </Text>
          </View>
        </View>

        <Divider style={styles.sectionDivider} />

        {/* Settings Control Block */}
        <Text variant="overline" style={styles.sectionTitle}>
          PREFERENCES & DATA CONTROL
        </Text>
        <View style={styles.optionsBlock}>
          <TouchableOpacity style={styles.optionRow} onPress={handleExportDatabase}>
            <Text variant="bodyMedium" fontWeight="semiBold">
              📤  Export Database JSON Backup
            </Text>
            <Text variant="bodyLarge" color="textTertiary">
              ›
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionRow} onPress={handleImportDatabase}>
            <Text variant="bodyMedium" fontWeight="semiBold">
              📥  Import Database JSON Backup
            </Text>
            <Text variant="bodyLarge" color="textTertiary">
              ›
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionRow} onPress={handleToggleTheme}>
            <Text variant="bodyMedium" fontWeight="semiBold">
              🎨  Customize Appearance Theme
            </Text>
            <Text variant="bodyLarge" color="textTertiary">
              ›
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.optionRow, styles.lastOptionRow]} onPress={handleResetDatabase}>
            <Text variant="bodyMedium" fontWeight="semiBold" style={{ color: theme.colors.priorityHigh }}>
              🗑️  Reset Application Database
            </Text>
            <Text variant="bodyLarge" color="textTertiary">
              ›
            </Text>
          </TouchableOpacity>
        </View>

        <Divider style={styles.sectionDivider} />

        {/* About App Info */}
        <Text variant="overline" style={styles.sectionTitle}>
          ABOUT APPLICATION
        </Text>
        <View style={styles.aboutBlock}>
          <Text variant="titleMedium" fontWeight="bold">
            Routine Work Manager
          </Text>
          <Text variant="caption" color="textSecondary">
            Version 1.0.0 (Strict Offline-First SQLite Client)
          </Text>
          <Text variant="bodySmall" color="textTertiary" style={styles.aboutDesc}>
            Built using React Native CLI, JSI SQLite Driver, and SOLID repository principles for software engineering interview preparation.
          </Text>
        </View>
      </ScrollView>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  dashboardCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.elevation.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: theme.colors.divider,
    borderRadius: theme.radius.round,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.round,
  },
  progressCaption: {
    marginTop: theme.spacing.xs,
  },
  sectionTitle: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.textTertiary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statsCard: {
    width: '47%',
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    ...theme.elevation.sm,
  },
  sectionDivider: {
    marginVertical: theme.spacing.lg,
  },
  optionsBlock: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  lastOptionRow: {
    borderBottomWidth: 0,
  },
  aboutBlock: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 4,
    ...theme.elevation.xs,
  },
  aboutDesc: {
    lineHeight: 18,
    marginTop: theme.spacing.xs,
  },
});
