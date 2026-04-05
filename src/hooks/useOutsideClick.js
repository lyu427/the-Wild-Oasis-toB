import { useEffect, useRef } from "react";

// 如果设置为 false （冒泡阶段），当你点击“打开”按钮时，弹窗刚打开，冒泡到 document 的点击事件就会立即触发 handleClick 。由于按钮不在刚生成的弹窗内， handler() 会立刻被执行，导致弹窗 刚打开就瞬间被关闭 。
//  设置为 true 后，事件在向下传播（捕获阶段）时就被处理了。这有效地避开了冒泡阶段带来的逻辑冲突。
export function useOutsideClick(handler, listenCapturing = true) {
  const ref = useRef();

  useEffect(
    function () {
      function handleClick(e) {
        if (ref.current && !ref.current.contains(e.target)) {
          handler();
        }
      }

      document.addEventListener("click", handleClick, listenCapturing);

      return () =>
        document.removeEventListener("click", handleClick, listenCapturing);
    },
    [handler, listenCapturing],
  );

  return ref;
}
