/**
 * 网格组件 - 响应式网格布局系统
 * 基于CSS Grid的灵活布局解决方案
 */

import React from 'react';
import styled, { css } from 'styled-components';
import { mixins } from '../../../../theme/mixins';
import type { Theme } from '../../../../theme';

interface GridProps {
  /** 列数 */
  columns?: number | Partial<Record<keyof Theme['breakpoints'], number>>;
  /** 行数 */
  rows?: number;
  /** 间距 */
  gap?: keyof Theme['spacing'];
  /** 列间距 */
  columnGap?: keyof Theme['spacing'];
  /** 行间距 */
  rowGap?: keyof Theme['spacing'];
  /** 对齐方式 */
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  /** 内容对齐 */
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  /** 子元素 */
  children: React.ReactNode;
  /** 自定义类名 */
  className?: string;
}

interface GridItemProps {
  /** 列跨度 */
  colSpan?: number | Partial<Record<keyof Theme['breakpoints'], number>>;
  /** 行跨度 */
  rowSpan?: number;
  /** 列起始位置 */
  colStart?: number;
  /** 行起始位置 */
  rowStart?: number;
  /** 子元素 */
  children: React.ReactNode;
  /** 自定义类名 */
  className?: string;
}

const StyledGrid = styled.div<{
  $columns?: number | Partial<Record<keyof Theme['breakpoints'], number>>;
  $rows?: number;
  $gap?: keyof Theme['spacing'];
  $columnGap?: keyof Theme['spacing'];
  $rowGap?: keyof Theme['spacing'];
  $alignItems?: string;
  $justifyContent?: string;
}>`
  display: grid;
  
  /* 基础网格设置 */
  ${({ $columns }) => {
    if (typeof $columns === 'number') {
      return css`
        grid-template-columns: repeat(${$columns}, 1fr);
      `;
    }
    return css`
      grid-template-columns: repeat(1, 1fr);
    `;
  }}
  
  ${({ $rows }) => $rows && css`
    grid-template-rows: repeat(${$rows}, 1fr);
  `}
  
  /* 间距设置 */
  ${({ $gap, theme }) => $gap && css`
    gap: ${theme.spacing[$gap]};
  `}
  
  ${({ $columnGap, theme }) => $columnGap && css`
    column-gap: ${theme.spacing[$columnGap]};
  `}
  
  ${({ $rowGap, theme }) => $rowGap && css`
    row-gap: ${theme.spacing[$rowGap]};
  `}
  
  /* 对齐设置 */
  ${({ $alignItems }) => $alignItems && css`
    align-items: ${$alignItems};
  `}
  
  ${({ $justifyContent }) => $justifyContent && css`
    justify-content: ${$justifyContent};
  `}
  
  /* 响应式列数 */
  ${({ $columns }) => {
    if (typeof $columns === 'object' && $columns) {
      return Object.entries($columns).map(([breakpoint, cols]) => {
        const bp = breakpoint as keyof Theme['breakpoints'];
        return mixins.responsive.above(bp)(css`
          grid-template-columns: repeat(${cols}, 1fr);
        `);
      });
    }
    return '';
  }}
`;

const StyledGridItem = styled.div<{
  $colSpan?: number | Partial<Record<keyof Theme['breakpoints'], number>>;
  $rowSpan?: number;
  $colStart?: number;
  $rowStart?: number;
}>`
  /* 基础跨度设置 */
  ${({ $colSpan }) => {
    if (typeof $colSpan === 'number') {
      return css`
        grid-column: span ${$colSpan};
      `;
    }
    return '';
  }}
  
  ${({ $rowSpan }) => $rowSpan && css`
    grid-row: span ${$rowSpan};
  `}
  
  ${({ $colStart }) => $colStart && css`
    grid-column-start: ${$colStart};
  `}
  
  ${({ $rowStart }) => $rowStart && css`
    grid-row-start: ${$rowStart};
  `}
  
  /* 响应式跨度 */
  ${({ $colSpan }) => {
    if (typeof $colSpan === 'object' && $colSpan) {
      return Object.entries($colSpan).map(([breakpoint, span]) => {
        const bp = breakpoint as keyof Theme['breakpoints'];
        return mixins.responsive.above(bp)(css`
          grid-column: span ${span};
        `);
      });
    }
    return '';
  }}
`;

/**
 * 网格容器组件 - 提供响应式网格布局
 * 
 * @example
 * ```tsx
 * <Grid columns={{ xs: 1, sm: 2, lg: 3 }} gap="md">
 *   <GridItem colSpan={{ xs: 1, sm: 2 }}>
 *     <div>内容</div>
 *   </GridItem>
 * </Grid>
 * ```
 */
export const Grid: React.FC<GridProps> = ({
  columns = 1,
  rows,
  gap = 'md',
  columnGap,
  rowGap,
  alignItems,
  justifyContent,
  children,
  className,
}) => {
  const gridProps: any = {
    $columns: columns,
    className,
  };

  if (rows !== undefined) gridProps.$rows = rows;
  if (gap !== undefined) gridProps.$gap = gap;
  if (columnGap !== undefined) gridProps.$columnGap = columnGap;
  if (rowGap !== undefined) gridProps.$rowGap = rowGap;
  if (alignItems !== undefined) gridProps.$alignItems = alignItems;
  if (justifyContent !== undefined) gridProps.$justifyContent = justifyContent;

  return (
    <StyledGrid {...gridProps}>
      {children}
    </StyledGrid>
  );
};

/**
 * 网格项组件 - 网格布局中的单个项目
 * 
 * @example
 * ```tsx
 * <GridItem colSpan={2} rowSpan={1}>
 *   <div>跨两列的内容</div>
 * </GridItem>
 * ```
 */
export const GridItem: React.FC<GridItemProps> = ({
  colSpan,
  rowSpan,
  colStart,
  rowStart,
  children,
  className,
}) => {
  const gridItemProps: any = {
    className,
  };

  if (colSpan !== undefined) gridItemProps.$colSpan = colSpan;
  if (rowSpan !== undefined) gridItemProps.$rowSpan = rowSpan;
  if (colStart !== undefined) gridItemProps.$colStart = colStart;
  if (rowStart !== undefined) gridItemProps.$rowStart = rowStart;

  return (
    <StyledGridItem {...gridItemProps}>
      {children}
    </StyledGridItem>
  );
};

export type { GridProps };
export type { GridItemProps };
export { Grid as FigmaGrid };
export { GridItem as FigmaGridItem };