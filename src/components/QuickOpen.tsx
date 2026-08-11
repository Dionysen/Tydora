import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { readDir } from "@tauri-apps/plugin-fs";
import { VaultInfo } from "../Sidebar";
import { useDebounce } from "../hooks/useDebounce";

interface QuickOpenProps {
  vault: VaultInfo | null;
  vaults: VaultInfo[];  // 所有已打开的知识库
  recentFiles: string[];
  currentFilePath: string | null;
  files?: FileItem[];  // Optional: external file list
  onSelect: (path: string) => void;
  onSelectVault: (vaultPath: string) => void;  // 选中知识库在新窗口打开
  onClose: () => void;
}

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

// 递归获取仓库中所有文件
async function getAllFiles(dirPath: string): Promise<FileItem[]> {
  const files: FileItem[] = [];

  async function walk(dir: string) {
    try {
      const entries = await readDir(dir);
      for (const entry of entries) {
        if (entry.name?.startsWith(".")) continue;
        const sep = navigator.platform?.toLowerCase().includes("win") ? "\\" : "/";
        const fullPath = dir.endsWith(sep) ? dir + entry.name : dir + sep + entry.name;
        if (entry.isDirectory) {
          await walk(fullPath);
        } else if (entry.isFile) {
          files.push({
            name: entry.name || "",
            path: fullPath,
            isDirectory: false,
          });
        }
      }
    } catch {
      // 忽略访问错误
    }
  }

  await walk(dirPath);
  return files;
}

// 文件名匹配度评分（用于排序）
function matchScore(file: FileItem, query: string): number {
  const name = file.name.toLowerCase();
  const q = query.toLowerCase();
  const nameWithoutExt = name.replace(/\.[^.]+$/, "");

  // 精确匹配文件名（不含扩展名）
  if (nameWithoutExt === q) return 100;
  // 文件名开头匹配
  if (nameWithoutExt.startsWith(q)) return 80;
  // 文件名包含查询词
  if (name.includes(q)) return 60;
  // 路径中包含
  if (file.path.toLowerCase().includes(q)) return 40;
  return 0;
}

// 高亮匹配文字
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lower.indexOf(lowerQuery);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="quick-open-highlight">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

// 从路径获取文件名
function getFileName(path: string): string {
  const sep = navigator.platform?.toLowerCase().includes("win") ? "\\" : "/";
  return path.split(sep).pop() || path;
}

const QUICKOPEN_DEBOUNCE = 120; // ms — 快速打开防抖延迟，比查找对话框更短以保持响应感

export default function QuickOpen({ vault, vaults, recentFiles, currentFilePath, files: externalFiles, onSelect, onSelectVault, onClose }: QuickOpenProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query.trim(), QUICKOPEN_DEBOUNCE);
  const [allFiles, setAllFiles] = useState<FileItem[] | null>(null);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isKeyboardNavRef = useRef(false);
  const keyboardNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 标记键盘导航激活，短暂忽略鼠标 hover
  const markKeyboardNav = useCallback(() => {
    isKeyboardNavRef.current = true;
    if (keyboardNavTimerRef.current) clearTimeout(keyboardNavTimerRef.current);
    keyboardNavTimerRef.current = setTimeout(() => {
      isKeyboardNavRef.current = false;
    }, 200);
  }, []);

  // 鼠标 hover 设置选中项（仅在非键盘导航时生效）
  const handleItemMouseEnter = useCallback((idx: number) => {
    if (isKeyboardNavRef.current) return;
    setSelectedIndex(idx);
  }, []);

  // 将最近访问文件路径转换为 FileItem 格式（使用 useMemo 避免每次渲染创建新数组），并排除当前打开的文件
  const recentFileItems = useMemo(() => recentFiles
    .filter((path) => path !== currentFilePath)
    .map((path) => ({
      name: getFileName(path),
      path,
      isDirectory: false,
    })), [recentFiles, currentFilePath]);

  // 如果提供了外部文件列表，直接使用
  const useExternalFiles = externalFiles && externalFiles.length > 0;

  // 初始化：显示最近访问文件或外部文件列表
  useEffect(() => {
    if (useExternalFiles && externalFiles) {
      // 使用外部文件列表，直接进入搜索模式
      setSearchMode(true);
      setFilteredFiles(externalFiles.slice(0, 50));
      setSelectedIndex(0);
    } else if (!query.trim()) {
      setSearchMode(false);
      setFilteredFiles(recentFileItems);
      setSelectedIndex(0);
    }
  }, [query, recentFileItems, externalFiles, useExternalFiles]);

  // 当用户输入搜索词时，加载所有文件并切换到搜索模式
  useEffect(() => {
    if (useExternalFiles) return; // 使用外部文件时不需要加载
    if (!vault) return;

    // 没有输入搜索词时，不加载所有文件
    if (!query.trim()) return;

    // 有搜索词时，切换到搜索模式
    setSearchMode(true);

    // 如果还没有加载所有文件，先加载
    if (allFiles === null && !loading) {
      setLoading(true);
      getAllFiles(vault.path).then((files) => {
        files.sort((a, b) => a.name.localeCompare(b.name));
        setAllFiles(files);
        setLoading(false);
      });
    }
  }, [query, vault, allFiles, loading, useExternalFiles]);

  // 搜索过滤 — 使用防抖查询避免每次按键都过滤全量文件
  useEffect(() => {
    if (!searchMode) return;

    const q = debouncedQuery;
    const sourceFiles = useExternalFiles && externalFiles ? externalFiles : allFiles;

    if (!q) {
      setFilteredFiles(useExternalFiles && externalFiles ? externalFiles.slice(0, 50) : recentFileItems);
      setSelectedIndex(0);
      return;
    }

    if (!sourceFiles) return;

    const matched = sourceFiles
      .map((f) => ({ file: f, score: matchScore(f, q) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.file.name.localeCompare(b.file.name))
      .map(({ file }) => file)
      .slice(0, 50);

    setFilteredFiles(matched);
    setSelectedIndex(0);
  }, [searchMode, allFiles, debouncedQuery, recentFileItems, externalFiles, useExternalFiles]);

  // 匹配知识库名称 — 使用防抖查询
  const matchedVaults = useMemo(() => {
    if (!searchMode) return [];
    const q = debouncedQuery.toLowerCase();
    if (!q) return [];
    return vaults
      .filter((v) => v.name.toLowerCase().includes(q))
      .map((v) => ({ name: v.name, path: v.path }));
  }, [searchMode, debouncedQuery, vaults]);

  // 综合项目数（文件 + 知识库），用于键盘导航边界
  const totalItems = filteredFiles.length + matchedVaults.length;

  // 滚动选中项到可见区域
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll(".quick-open-item");
    const selected = items[selectedIndex];
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, filteredFiles, matchedVaults]);

  // 键盘事件处理
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Ctrl+J 向下选择（Vim 风格）
      if ((e.ctrlKey || e.metaKey) && e.key === "j") {
        e.preventDefault();
        markKeyboardNav();
        setSelectedIndex((i) => Math.min(i + 1, totalItems - 1));
        return;
      }
      // Ctrl+K 向上选择（Vim 风格）
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        markKeyboardNav();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          markKeyboardNav();
          setSelectedIndex((i) => Math.min(i + 1, totalItems - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          markKeyboardNav();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex < filteredFiles.length) {
            // 文件项
            const file = filteredFiles[selectedIndex];
            if (file) onSelect(file.path);
          } else {
            // 知识库项
            const vault = matchedVaults[selectedIndex - filteredFiles.length];
            if (vault) onSelectVault(vault.path);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredFiles, matchedVaults, totalItems, selectedIndex, onSelect, onSelectVault, onClose],
  );

  // 聚焦输入框
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 复制路径用于显示
  const getDisplayPath = (path: string): string => {
    if (!vault) return path;
    const sep = navigator.platform?.toLowerCase().includes("win") ? "\\" : "/";
    const vaultPathWithSep = vault.path.endsWith(sep) ? vault.path : vault.path + sep;
    return path.replace(vaultPathWithSep, "");
  };

  return (
    <div className="quick-open-overlay" onClick={onClose}>
      <div
        className="quick-open-dialog"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="quick-open-header">
          <span className="quick-open-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
          <input
            ref={inputRef}
            type="text"
            className="quick-open-input"
            placeholder={t("quickOpen.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="quick-open-results" ref={listRef}>
          {loading && searchMode && (
            <div className="quick-open-empty">{t("quickOpen.searching")}</div>
          )}

          {!loading && !searchMode && filteredFiles.length === 0 && (
            <div className="quick-open-empty">
              <div className="quick-open-empty-title">{t("quickOpen.recentFiles")}</div>
              <div className="quick-open-empty-hint">{t("quickOpen.searchHint")}</div>
            </div>
          )}

          {!loading && searchMode && filteredFiles.length === 0 && matchedVaults.length === 0 && (
            <div className="quick-open-empty">{t("quickOpen.noMatch")}</div>
          )}

          {!loading && filteredFiles.length > 0 && (
            <>
              {!searchMode && (
                <div className="quick-open-section-label">{t("quickOpen.recentAccess")}</div>
              )}
              {filteredFiles.map((file, idx) => (
                <div
                  key={file.path}
                  className={`quick-open-item${idx === selectedIndex ? " selected" : ""}`}
                  onClick={() => {
                    onSelect(file.path);
                    inputRef.current?.focus();
                  }}
                  onMouseEnter={() => handleItemMouseEnter(idx)}
                >
                  <span className="quick-open-item-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>
                  <span className="quick-open-item-name">
                    {highlightMatch(file.name, searchMode ? query : "")}
                  </span>
                  <span className="quick-open-item-path">
                    {highlightMatch(getDisplayPath(file.path), searchMode ? query : "")}
                  </span>
                </div>
              ))}
            </>
          )}

          {!loading && matchedVaults.length > 0 && (
            <>
              <div className="quick-open-section-label">{t("quickOpen.vault")}</div>
              {matchedVaults.map((vault, vi) => {
                const idx = filteredFiles.length + vi;
                return (
                  <div
                    key={`vault-${vault.path}`}
                    className={`quick-open-item${idx === selectedIndex ? " selected" : ""}`}
                    onClick={() => {
                      onSelectVault(vault.path);
                      inputRef.current?.focus();
                    }}
                    onMouseEnter={() => handleItemMouseEnter(idx)}
                  >
                    <span className="quick-open-item-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
                    <span className="quick-open-item-name">
                      {highlightMatch(vault.name, query)}
                    </span>
                    <span className="quick-open-item-path">
                      {highlightMatch(vault.path, query)}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="quick-open-footer">
          <span className="quick-open-hint">
            <kbd>↑</kbd> <kbd>↓</kbd> or <kbd>Ctrl+J</kbd> <kbd>Ctrl+K</kbd> {t("quickOpen.select")}&nbsp;
            <kbd>Enter</kbd> {t("quickOpen.open")}&nbsp;
            <kbd>Esc</kbd> {t("quickOpen.close")}
          </span>
          <span className="quick-open-count">
            {searchMode ? t("quickOpen.results", { count: totalItems }) : t("quickOpen.recentFilesCount", { count: filteredFiles.length })}
          </span>
        </div>
      </div>
    </div>
  );
}