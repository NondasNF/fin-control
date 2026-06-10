import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color: string;
}

export function ProgressBar({ progress, color }: ProgressBarProps) {
  // Garante que o progresso esteja entre 0 e 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View 
          style={[
            styles.fill, 
            { width: `${clampedProgress}%`, backgroundColor: color }
          ]} 
        />
      </View>
      <Text style={styles.percentage}>{Math.round(clampedProgress)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 8,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    color: '#8E8E93',
    width: 30,
    textAlign: 'right',
  },
});
