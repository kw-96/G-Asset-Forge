// styled-components主题类型声明
import 'styled-components';
import { ITheme } from './index';

declare module 'styled-components' {
  export interface DefaultTheme extends ITheme {}
}