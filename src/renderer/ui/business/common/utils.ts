/**
 * Suika核心工具函数
 * 提取自 suika/packages/common/src/common.ts
 */

/**
 * 找出离 value 最近的 segment 的倍数值
 */
export const getClosestTimesVal = (value: number, segment: number) => {
  const n = Math.floor(value / segment);
  const left = segment * n;
  const right = segment * (n + 1);
  return value - left <= right - value ? left : right;
};

/**
 * Canvas 中绘制，必须为 x.5 才能绘制一列单独像素，
 * 否则会因为抗锯齿，绘制两列像素，且一个为半透明，导致一种模糊的效果
 *
 * 这个方法会得到值最接近的 x.5 值。
 */
export const nearestPixelVal = (n: number) => {
  const left = Math.floor(n);
  const right = Math.ceil(n);
  return (n - left < right - n ? left : right) + 0.5;
};

/**
 * 保留指定小数位数
 */
export const remainDecimal = (num: number, precision = 2) => {
  return Number(num.toFixed(precision));
};

/**
 * 获取设备像素比
 */
export const getDevicePixelRatio = () => {
  return window.devicePixelRatio || 1;
};

/**
 * 在排序数组中找最接近的值
 */
export const getClosestValInSortedArr = (
  sortedArr: number[],
  target: number,
) => {
  if (sortedArr.length === 0) {
    throw new Error('sortedArr can not be empty');
  }
  if (sortedArr.length === 1) {
    return sortedArr[0];
  }

  let left = 0;
  let right = sortedArr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (sortedArr[mid] === target) {
      return sortedArr[mid];
    } else if (sortedArr[mid]! < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // check if left or right is out of bound
  if (left >= sortedArr.length) {
    return sortedArr[right]!;
  }
  if (right < 0) {
    return sortedArr[left]!;
  }

  // check which one is closer
  return Math.abs(sortedArr[right]! - target) <=
    Math.abs(sortedArr[left]! - target)
    ? sortedArr[right]!
    : sortedArr[left]!;
};
