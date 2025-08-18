/**
 * 文本工具 - 提供文本创建和编辑功能
 * @description 支持富文本编辑、字体管理、文本样式等功能
 * @author 开发团队
 */
import { BlendMode, ElementType, TextStyle, type CanvasElement } from '../../../../interfaces/types/canvas';
import { UnifiedPerformanceMonitor } from '../../utils/performance/UnifiedPerformanceMonitor';

/**
 * 文本对齐方式
 */
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * 文本装饰
 */
export type TextDecoration = 'none' | 'underline' | 'overline' | 'line-through';

/**
 * 字体样式
 */
export type FontStyle = 'normal' | 'italic' | 'oblique';

/**
 * 字体粗细
 */
export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 'normal' | 'bold';

/**
 * 文本设置接口
 */
export interface TextSettings {
    fontSize: number;
    fontFamily: string;
    fontWeight: FontWeight;
    fontStyle: FontStyle;
    textAlign: TextAlign;
    textDecoration: TextDecoration;
    lineHeight: number;
    letterSpacing: number;
    color: string;
    backgroundColor?: string;
    padding: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}

/**
 * 文本编辑状态接口
 */
export interface TextEditState {
    isEditing: boolean;
    elementId: string | null;
    cursorPosition: number;
    selectionStart: number;
    selectionEnd: number;
    content: string;
}

/**
 * 文本度量信息接口
 */
export interface TextMetrics {
    width: number;
    height: number;
    lineCount: number;
    actualBoundingBoxAscent: number;
    actualBoundingBoxDescent: number;
}

/**
 * 文本工具类
 * @description 提供完整的文本创建和编辑功能
 */
export class TextTool {
    private editState: TextEditState = {
        isEditing: false,
        elementId: null,
        cursorPosition: 0,
        selectionStart: 0,
        selectionEnd: 0,
        content: '',
    };

    private settings: TextSettings = {
        fontSize: 16,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontWeight: 400,
        fontStyle: 'normal',
        textAlign: 'left',
        textDecoration: 'none',
        lineHeight: 1.5,
        letterSpacing: 0,
        color: '#000000',
        padding: {
            top: 8,
            right: 12,
            bottom: 8,
            left: 12,
        },
    };

    private canvas: HTMLCanvasElement | null = null;
    private context: CanvasRenderingContext2D | null = null;

    constructor(initialSettings?: Partial<TextSettings>) {
        if (initialSettings) {
            this.settings = { ...this.settings, ...initialSettings };
        }
        this.initializeCanvas();
    }

    /**
     * 创建文本元素
     */
    createTextElement(x: number, y: number, content = '输入文本'): CanvasElement {
        const startTime = performance.now();
        UnifiedPerformanceMonitor.markStart('text-create', startTime);

        const metrics = this.measureText(content);
        const elementId = `text_${Date.now()}`;

        const textElement: CanvasElement = {
            id: elementId,
            name: `文本 ${new Date().toLocaleTimeString()}`,
            type: ElementType.TEXT,
            transform: {
                x: x - this.settings.padding.left,
                y: y - this.settings.padding.top,
                width: metrics.width + this.settings.padding.left + this.settings.padding.right,
                height: metrics.height + this.settings.padding.top + this.settings.padding.bottom,
            },
            visible: true,
            locked: false,
            fill: {
                type: 'solid',
                color: this.settings.backgroundColor || 'transparent'
            },
            stroke: {
                color: 'transparent',
                width: 0,
                style: 'solid'
            },
            opacity: 1,
            // 文本特定数据
            content,
            style: { ...this.settings } as unknown as TextStyle,
            blendMode: BlendMode.NORMAL,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.info('[text-tool] 创建文本元素', {
            id: elementId,
            content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
            size: { width: textElement.transform.width, height: textElement.transform.height },
        });

        UnifiedPerformanceMonitor.markEnd('text-create', startTime);
        return textElement;
    }

    /**
     * 开始编辑文本
     */
    startEditing(elementId: string, content: string): void {
        const startTime = performance.now();

        this.editState = {
            isEditing: true,
            elementId,
            cursorPosition: content.length,
            selectionStart: 0,
            selectionEnd: content.length,
            content,
        };

        console.debug('[text-tool] 开始编辑文本', {
            elementId,
            contentLength: content.length,
        });

        UnifiedPerformanceMonitor.recordMetric('text-edit-start', performance.now() - startTime);
    }

    /**
     * 更新文本内容
     */
    updateContent(content: string): void {
        if (!this.editState.isEditing) return;

        const startTime = performance.now();

        this.editState.content = content;
        this.editState.cursorPosition = Math.min(this.editState.cursorPosition, content.length);
        this.editState.selectionStart = Math.min(this.editState.selectionStart, content.length);
        this.editState.selectionEnd = Math.min(this.editState.selectionEnd, content.length);

        UnifiedPerformanceMonitor.recordMetric('text-content-update', performance.now() - startTime);
    }

    /**
     * 插入文本
     */
    insertText(text: string): void {
        if (!this.editState.isEditing) return;

        const startTime = performance.now();

        const { content, cursorPosition } = this.editState;
        const newContent = content.slice(0, cursorPosition) + text + content.slice(cursorPosition);

        this.editState.content = newContent;
        this.editState.cursorPosition += text.length;
        this.editState.selectionStart = this.editState.cursorPosition;
        this.editState.selectionEnd = this.editState.cursorPosition;

        UnifiedPerformanceMonitor.recordMetric('text-insert', performance.now() - startTime);
    }

    /**
     * 删除文本
     */
    deleteText(direction: 'backward' | 'forward' = 'backward'): void {
        if (!this.editState.isEditing) return;

        const startTime = performance.now();

        const { content, cursorPosition, selectionStart, selectionEnd } = this.editState;

        if (selectionStart !== selectionEnd) {
            // 删除选中的文本
            const newContent = content.slice(0, selectionStart) + content.slice(selectionEnd);
            this.editState.content = newContent;
            this.editState.cursorPosition = selectionStart;
            this.editState.selectionStart = selectionStart;
            this.editState.selectionEnd = selectionStart;
        } else {
            // 删除单个字符
            if (direction === 'backward' && cursorPosition > 0) {
                const newContent = content.slice(0, cursorPosition - 1) + content.slice(cursorPosition);
                this.editState.content = newContent;
                this.editState.cursorPosition--;
                this.editState.selectionStart = this.editState.cursorPosition;
                this.editState.selectionEnd = this.editState.cursorPosition;
            } else if (direction === 'forward' && cursorPosition < content.length) {
                const newContent = content.slice(0, cursorPosition) + content.slice(cursorPosition + 1);
                this.editState.content = newContent;
                // 光标位置不变
            }
        }

        UnifiedPerformanceMonitor.recordMetric('text-delete', performance.now() - startTime);
    }

    /**
     * 设置光标位置
     */
    setCursorPosition(position: number): void {
        if (!this.editState.isEditing) return;

        this.editState.cursorPosition = Math.max(0, Math.min(position, this.editState.content.length));
        this.editState.selectionStart = this.editState.cursorPosition;
        this.editState.selectionEnd = this.editState.cursorPosition;
    }

    /**
     * 设置文本选择
     */
    setSelection(start: number, end: number): void {
        if (!this.editState.isEditing) return;

        const contentLength = this.editState.content.length;
        this.editState.selectionStart = Math.max(0, Math.min(start, contentLength));
        this.editState.selectionEnd = Math.max(0, Math.min(end, contentLength));
        this.editState.cursorPosition = this.editState.selectionEnd;
    }

    /**
     * 选择全部文本
     */
    selectAll(): void {
        if (!this.editState.isEditing) return;

        this.editState.selectionStart = 0;
        this.editState.selectionEnd = this.editState.content.length;
        this.editState.cursorPosition = this.editState.content.length;
    }

    /**
     * 完成编辑
     */
    finishEditing(): CanvasElement | null {
        if (!this.editState.isEditing || !this.editState.elementId) return null;

        const startTime = performance.now();
        UnifiedPerformanceMonitor.markStart('text-finish-editing', startTime);

        const content = this.editState.content.trim();
        if (content.length === 0) {
            this.cancelEditing();
            UnifiedPerformanceMonitor.markEnd('text-finish-editing', startTime);
            return null;
        }

        const metrics = this.measureText(content);
        const elementId = this.editState.elementId;

        const updatedElement: CanvasElement = {
            id: elementId,
            name: `文本 ${new Date().toLocaleTimeString()}`,
            type: ElementType.TEXT,
            transform: {
                x: 0, // 将由调用者设置
                y: 0, // 将由调用者设置
                width: metrics.width + this.settings.padding.left + this.settings.padding.right,
                height: metrics.height + this.settings.padding.top + this.settings.padding.bottom,
            },
            visible: true,
            locked: false,
            fill: {
                type: 'solid',
                color: this.settings.backgroundColor || 'transparent'
            },
            stroke: {
                color: 'transparent',
                width: 0,
                style: 'solid'
            },
            opacity: 1,
            content,
            style: { ...this.settings } as unknown as TextStyle,
            blendMode: BlendMode.NORMAL,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.resetEditState();

        console.info('[text-tool] 完成文本编辑', {
            elementId,
            contentLength: content.length,
            size: { width: updatedElement.transform.width, height: updatedElement.transform.height },
        });

        UnifiedPerformanceMonitor.markEnd('text-finish-editing', startTime);
        return updatedElement;
    }

    /**
     * 取消编辑
     */
    cancelEditing(): void {
        if (this.editState.isEditing) {
            console.debug('[text-tool] 取消文本编辑', { elementId: this.editState.elementId });
        }
        this.resetEditState();
    }

    /**
     * 测量文本尺寸
     */
    measureText(content: string): TextMetrics {
        if (!this.context) {
            this.initializeCanvas();
        }

        if (!this.context) {
            return {
                width: content.length * this.settings.fontSize * 0.6,
                height: this.settings.fontSize * this.settings.lineHeight,
                lineCount: 1,
                actualBoundingBoxAscent: this.settings.fontSize * 0.8,
                actualBoundingBoxDescent: this.settings.fontSize * 0.2,
            };
        }

        const startTime = performance.now();

        // 设置字体样式
        this.context.font = this.getFontString();
        this.context.textAlign = 'left';
        this.context.textBaseline = 'top';

        const lines = content.split('\n');
        let maxWidth = 0;
        let totalHeight = 0;

        lines.forEach((line, index) => {
            const metrics = this.context!.measureText(line);
            maxWidth = Math.max(maxWidth, metrics.width);

            if (index === 0) {
                totalHeight += metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            } else {
                totalHeight += this.settings.fontSize * this.settings.lineHeight;
            }
        });

        const result: TextMetrics = {
            width: maxWidth,
            height: totalHeight,
            lineCount: lines.length,
            actualBoundingBoxAscent: this.settings.fontSize * 0.8,
            actualBoundingBoxDescent: this.settings.fontSize * 0.2,
        };

        UnifiedPerformanceMonitor.recordMetric('text-measure', performance.now() - startTime);
        return result;
    }

    /**
     * 更新设置
     */
    updateSettings(newSettings: Partial<TextSettings>): void {
        this.settings = { ...this.settings, ...newSettings };
        console.debug('[text-tool] 更新设置', {
            updatedKeys: Object.keys(newSettings),
            newSettings: this.settings,
        });
    }

    /**
     * 获取设置
     */
    getSettings(): TextSettings {
        return { ...this.settings };
    }

    /**
     * 获取编辑状态
     */
    getEditState(): TextEditState {
        return { ...this.editState };
    }

    /**
     * 检查是否正在编辑
     */
    get isEditing(): boolean {
        return this.editState.isEditing;
    }

    /**
     * 获取工具状态
     */
    getToolState() {
        return {
            isEditing: this.editState.isEditing,
            editingElementId: this.editState.elementId,
            contentLength: this.editState.content.length,
            cursorPosition: this.editState.cursorPosition,
            hasSelection: this.editState.selectionStart !== this.editState.selectionEnd,
            settings: this.settings,
        };
    }

    /**
     * 获取常用字体列表
     */
    static getCommonFonts(): string[] {
        return [
            'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            'Arial, sans-serif',
            'Helvetica, sans-serif',
            'Times New Roman, serif',
            'Georgia, serif',
            'Courier New, monospace',
            'Monaco, monospace',
            'Verdana, sans-serif',
            'Tahoma, sans-serif',
            'Comic Sans MS, cursive',
        ];
    }

    /**
     * 获取常用字体大小
     */
    static getCommonFontSizes(): number[] {
        return [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72];
    }

    // 私有方法

    /**
     * 初始化画布用于文本测量
     */
    private initializeCanvas(): void {
        try {
            this.canvas = document.createElement('canvas');
            this.context = this.canvas.getContext('2d');

            if (!this.context) {
                console.warn('[text-tool] 无法创建Canvas上下文，文本测量可能不准确');
            }
        } catch (error) {
            console.warn('[text-tool] 初始化Canvas失败:', error);
        }
    }

    /**
     * 获取字体字符串
     */
    private getFontString(): string {
        const { fontStyle, fontWeight, fontSize, fontFamily } = this.settings;
        return `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    }

    /**
     * 重置编辑状态
     */
    private resetEditState(): void {
        this.editState = {
            isEditing: false,
            elementId: null,
            cursorPosition: 0,
            selectionStart: 0,
            selectionEnd: 0,
            content: '',
        };
    }
}

export default TextTool;