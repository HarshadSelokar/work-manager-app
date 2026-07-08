import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Alert, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppContainer, Text, Divider, GlassCard, GradientBackground, ProgressRing, StatisticCard } from '@components/common';
import { WorksRepository } from '../repository/works.repository';
import { theme } from '@theme/index';
import {
  Database,
  Download,
  Upload,
  Palette,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Layers,
  StickyNote,
  Info,
  Code2,
} from 'lucide-react-native';

export const SettingsScreen: React.FC = () => {
  const worksRepo = useMemo(() => new WorksRepository(), []);
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
      console.error('Failed to load statistics:', error);
    }
  }, [worksRepo]);

  useFocusEffect(
    useCallback(() => { loadStatistics(); }, [loadStatistics])
  );

  const handleResetDatabase = useCallback(() => {
    Alert.alert(
      'Reset Database',
      'This will permanently delete all tasks, notes, links, and images. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset All Data',
          style: 'destructive',
          onPress: () => {
            try {
              worksRepo.resetDatabase();
              loadStatistics();
              Alert.alert('Done', 'Database cleared successfully.');
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
      const backupData = { exportedAt: new Date().toISOString(), version: '1.0.0', stats };
      Alert.alert('Export Preview', JSON.stringify(backupData, null, 2).substring(0, 500) + '...');
    } catch {
      Alert.alert('Export Failed', 'An error occurred during export.');
    }
  }, [stats]);

  const handleImportDatabase = useCallback(() => {
    Alert.alert('Import Database', 'Database import from JSON backup is a placeholder feature.');
  }, []);

  const handleToggleTheme = useCallback(() => {
    Alert.alert('Theme Settings', 'Dynamic theme configuration is a placeholder. Dark mode is default.');
  }, []);

  const completionRate = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  }, [stats]);

  const SETTINGS_ROWS = [
    { icon: <Download size={18} color={theme.colors.primary} />, label: 'Export Database Backup', bg: theme.colors.primaryLight, onPress: handleExportDatabase },
    { icon: <Upload size={18} color={theme.colors.secondary} />, label: 'Import Database Backup', bg: 'rgba(0, 240, 255, 0.1)', onPress: handleImportDatabase },
    { icon: <Palette size={18} color={theme.colors.warning} />, label: 'Customize Appearance', bg: 'rgba(245, 158, 11, 0.1)', onPress: handleToggleTheme },
  ];

  return (
    <AppContainer safeAreaSides={['top', 'left', 'right']} style={styles.container}>
      <GradientBackground>
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <View style={styles.headerIconRow}>
            <View style={styles.headerIcon}>
              <Database size={20} color={theme.colors.primary} />
            </View>
            <View>
              <Text variant="displaySmall" fontWeight="bold">Settings</Text>
              <Text variant="bodySmall" color="textSecondary">Stats, data, and preferences</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* ─── Completion Rate Hero Card ─── */}
          <GlassCard style={styles.heroCard} elevation="md">
            <View style={styles.heroContent}>
              <ProgressRing progress={completionRate / 100} size={72} strokeWidth={7} showPercent />
              <View style={styles.heroText}>
                <Text variant="titleMedium" fontWeight="bold">Task Completion</Text>
                <Text variant="bodySmall" color="textSecondary" style={styles.heroSub}>
                  {stats.completed} of {stats.total} tasks completed
                </Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
                </View>
              </View>
            </View>
          </GlassCard>

          {/* ─── Statistics Grid ─── */}
          <Text variant="overline" color="textTertiary" style={styles.sectionTitle}>STATISTICS</Text>
          <View style={styles.statsGrid}>
            <StatisticCard label="Total" value={stats.total} icon={<Layers size={16} color={theme.colors.primary} />} color={theme.colors.primary} />
            <StatisticCard label="Completed" value={stats.completed} icon={<CheckCircle2 size={16} color={theme.colors.success} />} color={theme.colors.success} />
          </View>
          <View style={[styles.statsGrid, styles.statsGridBottom]}>
            <StatisticCard label="Pending" value={stats.pending} icon={<Clock size={16} color={theme.colors.warning} />} color={theme.colors.warning} />
            <StatisticCard label="High Priority" value={stats.highPriority} icon={<TrendingUp size={16} color={theme.colors.danger} />} color={theme.colors.danger} />
          </View>
          <View style={[styles.statsGrid, styles.statsGridBottom]}>
            <StatisticCard label="Today's Tasks" value={stats.todayCount} icon={<AlertCircle size={16} color={theme.colors.info} />} color={theme.colors.info} />
            <StatisticCard label="Quick Notes" value={stats.notesCount} icon={<StickyNote size={16} color={theme.colors.primary} />} color={theme.colors.primary} />
          </View>

          <Divider style={styles.divider} />

          {/* ─── Preferences ─── */}
          <Text variant="overline" color="textTertiary" style={styles.sectionTitle}>DATA & PREFERENCES</Text>
          <GlassCard style={styles.optionsCard} elevation="sm">
            {SETTINGS_ROWS.map((row, i) => (
              <Pressable
                key={i}
                style={[styles.settingsRow, i < SETTINGS_ROWS.length - 1 && styles.settingsRowBorder]}
                onPress={row.onPress}
                android_ripple={{ color: 'rgba(255,255,255,0.04)' }}
              >
                <View style={[styles.rowIconBox, { backgroundColor: row.bg }]}>
                  {row.icon}
                </View>
                <Text variant="bodyMedium" fontWeight="semiBold" style={styles.rowLabel}>
                  {row.label}
                </Text>
                <ChevronRight size={16} color={theme.colors.textTertiary} />
              </Pressable>
            ))}
          </GlassCard>

          <Divider style={styles.divider} />

          {/* ─── Danger Zone ─── */}
          <Text variant="overline" style={styles.dangerSectionTitle}>DANGER ZONE</Text>
          <GlassCard style={styles.dangerCard} elevation="sm">
            <Pressable style={styles.settingsRow} onPress={handleResetDatabase}>
              <View style={styles.dangerIconBox}>
                <AlertTriangle size={18} color={theme.colors.danger} />
              </View>
              <View style={styles.dangerTextBlock}>
                <Text variant="bodyMedium" fontWeight="bold" style={styles.dangerLabel}>Reset Application Data</Text>
                <Text variant="caption" color="textSecondary">Permanently deletes all tasks, notes, and attachments.</Text>
              </View>
              <ChevronRight size={16} color={theme.colors.danger} />
            </Pressable>
          </GlassCard>

          <Divider style={styles.divider} />

          {/* ─── About ─── */}
          <Text variant="overline" color="textTertiary" style={styles.sectionTitle}>ABOUT</Text>
          <GlassCard style={styles.aboutCard} elevation="xs">
            <View style={styles.aboutRow}>
              <View style={styles.aboutIcon}>
                <Info size={18} color={theme.colors.secondary} />
              </View>
              <View>
                <Text variant="titleMedium" fontWeight="bold">Work Manager</Text>
                <Text variant="caption" color="textSecondary">Version 1.0.0 · Offline-First SQLite</Text>
              </View>
            </View>
            <View style={styles.aboutRow}>
              <View style={styles.aboutIcon}>
                <Code2 size={18} color={theme.colors.primary} />
              </View>
              <Text variant="bodySmall" color="textSecondary" style={styles.aboutDesc}>
                Built with React Native CLI · JSI SQLite Driver · SOLID repository pattern · Clean Architecture
              </Text>
            </View>
          </GlassCard>
        </ScrollView>
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
  headerIconRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xxl,
  },
  heroCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  heroText: { flex: 1, gap: 4 },
  heroSub: { lineHeight: 16 },
  progressTrack: {
    height: 4,
    backgroundColor: theme.colors.divider,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: 2,
  },
  sectionTitle: { marginBottom: theme.spacing.sm },
  statsGrid: { flexDirection: 'row', gap: theme.spacing.sm },
  statsGridBottom: { marginTop: theme.spacing.sm, marginBottom: 0 },
  divider: { marginVertical: theme.spacing.lg },
  optionsCard: { overflow: 'hidden', padding: 0 },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  rowIconBox: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1 },
  dangerSectionTitle: { marginBottom: theme.spacing.sm, color: theme.colors.danger },
  dangerCard: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
    padding: 0,
    overflow: 'hidden',
  },
  dangerIconBox: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerTextBlock: { flex: 1 },
  dangerLabel: { color: theme.colors.danger },
  aboutCard: { padding: theme.spacing.md, gap: theme.spacing.md },
  aboutRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm },
  aboutIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutDesc: { flex: 1, lineHeight: 18 },
});
