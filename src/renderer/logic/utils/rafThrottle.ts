/**
 * 节流 + requestAnimationFrame
 * 参考 Suika 的实现，确保每帧最多渲染一次
 */
export const rafThrottle = (callback: (...args: any) => void) => {
  let requestId: number | undefined;

  const throttled = function (...args: unknown[]) {
    if (requestId === undefined) {
      requestId = requestAnimationFrame(() => {
        requestId = undefined;
        callback(...args);
      });
    }
  };

  throttled.cancel = () => {
    if (requestId !== undefined) {
      cancelAnimationFrame(requestId);
    }
    requestId = undefined;
  };

  return throttled;
};
