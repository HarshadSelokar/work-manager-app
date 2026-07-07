import React from 'react';
import { View, ViewStyle, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@theme/index';

interface AppContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  safeAreaSides?: Array<'top' | 'bottom' | 'left' | 'right'>;
}

export const AppContainer: React.FC<AppContainerProps> = ({
  children,
  style,
  safeAreaSides = ['top', 'bottom'],
}) => {
  const insets = useSafeAreaInsets();

  const containerStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: safeAreaSides.includes('top') ? insets.top : 0,
    paddingBottom: safeAreaSides.includes('bottom') ? insets.bottom : 0,
    paddingLeft: safeAreaSides.includes('left') ? insets.left : 0,
    paddingRight: safeAreaSides.includes('right') ? insets.right : 0,
  };

  return (
    <View style={[containerStyle, style]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
        translucent
      />
      {children}
    </View>
  );
};
