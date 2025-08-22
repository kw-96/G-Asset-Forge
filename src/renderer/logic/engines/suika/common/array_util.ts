/**
 * 数组工具函数 - 高性能数组操作方法
 * @description 提供不依赖this的数组方法，性能更优
 * @author Suika团队
 */

/**
 * forEach - 高性能遍历
 */
export const forEach = <T>(
  array: T[],
  cb: (item: T, index: number) => void,
) => {
  for (let i = 0, len = array.length; i < len; i++) {
    cb(array[i]!, i);
  }
};

export const arrMap = <T, U>(
  array: T[],
  cb: (item: T, index: number) => U,
): U[] => {
  const ret: U[] = [];
  for (let i = 0, len = array.length; i < len; i++) {
    ret.push(cb(array[i]!, i));
  }
  return ret;
};

/**
 * map with revert - 反向映射
 */
export const arrMapRevert = <T, U>(
  array: T[],
  cb: (item: T, index: number) => U,
): U[] => {
  const ret: U[] = [];
  for (let i = array.length - 1; i >= 0; i--) {
    ret.push(cb(array[i]!, i));
  }
  return ret;
};

export const arrEvery = <T>(
  array: T[],
  cb: (item: T, index: number) => unknown,
): boolean => {
  for (let i = 0, len = array.length; i < len; i++) {
    if (!cb(array[i]!, i)) {
      return false;
    }
  }
  return true;
};

export const swap = <T>(arr: T[], i: number, j: number) => {
  const tmp = arr[i]!;
  arr[i] = arr[j]!;
  arr[j] = tmp;
};