import type { DefaultTheme } from 'styled-components';
import type { CustomTheme } from './theme';

// Extend styled-components DefaultTheme with our custom theme properties
declare module 'styled-components' {
  export interface DefaultTheme extends CustomTheme {}
}
