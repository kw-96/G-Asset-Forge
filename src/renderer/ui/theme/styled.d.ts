// styled-components主题类型声明
import 'styled-components';
import { Theme } from './ThemeProvider';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}