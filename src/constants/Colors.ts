export const Colors = {
  light: {
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#1C1C1E',
    subtext: '#8E8E93',
    primary: '#007AFF',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
    border: '#C6C6C8',
    iconBackground: {
      blue: '#E5F1FF',
      green: '#E8F9EE',
      orange: '#FFF9E5',
      red: '#FFF2F0',
      gray: '#E5E5EA',
    }
  },
  dark: {
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    subtext: '#8E8E93',
    primary: '#0A84FF',
    success: '#30D158',
    warning: '#FF9F0A',
    danger: '#FF453A',
    border: '#38383A',
    iconBackground: {
      blue: '#003366',
      green: '#004411',
      orange: '#442200',
      red: '#440000',
      gray: '#3A3A3C',
    }
  }
};

export type ThemeColors = typeof Colors.light;
