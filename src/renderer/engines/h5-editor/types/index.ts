// H5-Editor类型定义
export interface IH5Point {
  x: number;
  y: number;
}

export interface IH5Size {
  width: number;
  height: number;
}

export interface IH5Bounds extends IH5Point, IH5Size {}

// 导出核心类型和类
export {
  H5Editor,
  type IH5EditorOptions,
  type IH5Page,
  type IH5Component,
  type IH5EditorEvents
} from '../core/h5-editor';