// 实时联动：编辑器内容 / 设置变化 → 防抖重建卡片
import { useCallback, useEffect, useRef, useState } from "react";
import { buildXhsCards } from "./render";
import type { XhsSettings, XhsCard } from "./types";

export interface XhsPreviewState {
  cards: XhsCard[];
  building: boolean;
  error: string | null;
  warnings: string[];
  /** 手动触发重建（如「重新生成」按钮） */
  rebuild: () => void;
}

export function useXhsPreview(opts: {
  /** 是否启用（分栏打开且处于 IR 模式） */
  enabled: boolean;
  /** 内容联动信号（markdown 字符串） */
  content: string;
  settings: XhsSettings;
  getContentElement: () => HTMLElement | null;
  editorTheme: string;
  title: string;
}): XhsPreviewState {
  const { enabled, content, settings, getContentElement, editorTheme, title } = opts;

  const [cards, setCards] = useState<XhsCard[]>([]);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const versionRef = useRef(0);
  const getContentRef = useRef(getContentElement);
  const editorThemeRef = useRef(editorTheme);
  const titleRef = useRef(title);
  const settingsRef = useRef(settings);

  getContentRef.current = getContentElement;
  editorThemeRef.current = editorTheme;
  titleRef.current = title;
  settingsRef.current = settings;

  const runBuild = useCallback(async () => {
    const version = ++versionRef.current;
    setBuilding(true);
    setError(null);
    try {
      const result = await buildXhsCards({
        getContentElement: getContentRef.current,
        editorTheme: editorThemeRef.current,
        settings: settingsRef.current,
        title: titleRef.current,
      });
      if (version !== versionRef.current) return; // 过期结果丢弃
      setCards(result.cards);
      setWarnings(result.warnings);
    } catch (e) {
      if (version !== versionRef.current) return;
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (version === versionRef.current) setBuilding(false);
    }
  }, []);

  // 初始 + 设置变化（300ms 防抖）
  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(runBuild, 300);
    return () => clearTimeout(timer);
  }, [enabled, settings, runBuild]);

  // 内容变化（600ms 防抖；首次构建交给上面的 settings effect）
  const firstRunRef = useRef(true);
  useEffect(() => {
    if (!enabled) return;
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    const timer = setTimeout(runBuild, 600);
    return () => clearTimeout(timer);
  }, [content, enabled, runBuild]);

  // enabled 变回 false 时重置首次标志，下次打开能正确首次构建
  useEffect(() => {
    if (!enabled) firstRunRef.current = true;
  }, [enabled]);

  return { cards, building, error, warnings, rebuild: runBuild };
}
