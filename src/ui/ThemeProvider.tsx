import React from 'react';
import { ThemeProvider as SCThemeProvider } from 'styled-components';
import { theme } from '../design-tokens/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <SCThemeProvider theme={theme}>
      {children}
    </SCThemeProvider>
  );
};

export default ThemeProvider;
