import 'styled-components';
import { Theme } from './design-tokens/theme';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
