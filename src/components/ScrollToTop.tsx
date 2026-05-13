import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * 路由切换时,把 window 与所有可滚动容器(AppLayout 的 main)滚动到顶部。
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
    // AppLayout 内部 main 使用 overflow-auto,需要单独重置
    document
      .querySelectorAll<HTMLElement>("main")
      .forEach((el) => {
        el.scrollTop = 0;
      });
  }, [pathname]);

  return null;
}
