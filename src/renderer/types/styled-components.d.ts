// 扩展 styled-components 的默认主题类型
import 'styled-components';
import { ITheme } from '../ui/theme';

declare module 'styled-components' {
  export interface DefaultTheme extends ITheme {}
}
