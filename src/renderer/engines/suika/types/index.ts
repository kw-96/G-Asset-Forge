// Suika引擎类型定义
export interface ISuikaPoint {
  x: number;
  y: number;
}

export interface ISuikaSize {
  width: number;
  height: number;
}

export interface ISuikaBounds extends ISuikaPoint, ISuikaSize {}

export interface ISuikaTransform {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface ISuikaStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

export interface ISuikaGraphicsAttrs extends ISuikaTransform, ISuikaStyle {
  id: string;
  type: string;
  visible: boolean;
  locked: boolean;
  name?: string;
}

// 导出核心类
export { SuikaEditor, type ISuikaEditorOptions } from '../core/editor';
export { ViewportManager, type IViewport } from '../core/viewport-manager';
export { ZoomManager } from '../core/zoom-manager';
export { SceneGraph } from '../core/scene-graph';
export { ToolManager, type ITool } from '../core/tool-manager';
export { CommandManager, BaseCommand, type ICommand } from '../core/command-manager';
