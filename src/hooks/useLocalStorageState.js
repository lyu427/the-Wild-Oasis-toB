import { useState, useEffect } from "react";
// 这个hook只在DarkModeContext中被用到
// 用于将状态持久化存储到本地存储

export function useLocalStorageState(initialState, key) {
  const [value, setValue] = useState(function () {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialState;
  });
  // 如果localStorage没有存"isDarkMode"，就是用系统偏好设置
  // 当向 useState 传递的是一个函数时 React 内部做了优化————这个函数只会在组件第一次挂载时执行一次。在后续的重新渲染中，React 会直接忽略这个函数，不再执行它。
  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key],
  );

  return [value, setValue];
}
