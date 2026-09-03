import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { formatShortcutKey } from "../../Editor/shortcuts";
import {
  DEFAULT_SHORTCUTS,
  SHORTCUTS_KEY,
  type ShortcutItem,
} from "../../settings-store";

export function ShortcutsSettingsContent() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [recordingSearch, setRecordingSearch] = useState(false);
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>(() => {
    try {
      const saved = localStorage.getItem(SHORTCUTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = DEFAULT_SHORTCUTS.map((def) => {
          const savedItem = parsed.find((s: ShortcutItem) => s.id === def.id);
          return savedItem ? savedItem : def;
        });
        return merged;
      }
    } catch { }
    return DEFAULT_SHORTCUTS;
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingKeys, setEditingKeys] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(shortcuts));
  }, [shortcuts]);

  // 按分组整理快捷键
  const shortcutGroupNames: Record<string, string> = {
    "格式": t("settings.shortcuts.format", "格式"),
    "列表": t("settings.shortcuts.list", "列表"),
    "标题": t("settings.shortcuts.heading", "标题"),
    "插入": t("settings.shortcuts.insert", "插入"),
    "表格": t("settings.shortcuts.table", "表格"),
    "编辑": t("settings.shortcuts.edit", "编辑"),
    "视图": t("settings.shortcuts.view", "视图"),
    "模式": t("settings.shortcuts.mode", "模式"),
    "系统": t("settings.shortcuts.system", "系统"),
    "介绍": t("settings.shortcuts.intro", "介绍"),
    "查找替换": t("settings.shortcuts.findReplace", "查找替换"),
    "窗口": t("settings.shortcuts.window", "窗口"),
    "其他": t("settings.shortcuts.other"),
  };

  // 快捷键标签映射（根据 ID 转换为当前语言）
  const shortcutLabelMap: Record<string, string> = {
    bold: t("settings.shortcuts.labels.bold"),
    italic: t("settings.shortcuts.labels.italic"),
    strike: t("settings.shortcuts.labels.strike"),
    "inline-code": t("settings.shortcuts.labels.inline-code"),
    "code-block": t("settings.shortcuts.labels.code-block"),
    link: t("settings.shortcuts.labels.link"),
    highlight: t("settings.shortcuts.labels.highlight"),
    quote: t("settings.shortcuts.labels.quote"),
    hr: t("settings.shortcuts.labels.hr"),
    "unordered-list": t("settings.shortcuts.labels.unordered-list"),
    "ordered-list": t("settings.shortcuts.labels.ordered-list"),
    "check-list": t("settings.shortcuts.labels.check-list"),
    indent: t("settings.shortcuts.labels.indent"),
    outdent: t("settings.shortcuts.labels.outdent"),
    "task-toggle": t("settings.shortcuts.labels.task-toggle"),
    "heading-1": t("settings.shortcuts.labels.heading-1"),
    "heading-2": t("settings.shortcuts.labels.heading-2"),
    "heading-3": t("settings.shortcuts.labels.heading-3"),
    "heading-4": t("settings.shortcuts.labels.heading-4"),
    "heading-5": t("settings.shortcuts.labels.heading-5"),
    "heading-6": t("settings.shortcuts.labels.heading-6"),
    paragraph: t("settings.shortcuts.labels.paragraph"),
    table: t("settings.shortcuts.labels.table"),
    "insert-before": t("settings.shortcuts.labels.insert-before"),
    "insert-after": t("settings.shortcuts.labels.insert-after"),
    "table-row-above": t("settings.shortcuts.labels.table-row-above"),
    "table-row-below": t("settings.shortcuts.labels.table-row-below"),
    "table-col-left": t("settings.shortcuts.labels.table-col-left"),
    "table-col-right": t("settings.shortcuts.labels.table-col-right"),
    "table-row-delete": t("settings.shortcuts.labels.table-row-delete"),
    "table-col-delete": t("settings.shortcuts.labels.table-col-delete"),
    "table-align-left": t("settings.shortcuts.labels.table-align-left"),
    "table-align-center": t("settings.shortcuts.labels.table-align-center"),
    "table-align-right": t("settings.shortcuts.labels.table-align-right"),
    undo: t("settings.shortcuts.labels.undo"),
    redo: t("settings.shortcuts.labels.redo"),
    "select-all": t("settings.shortcuts.labels.select-all"),
    "toggle-sidebar": t("settings.shortcuts.labels.toggle-sidebar"),
    typewriter: t("settings.shortcuts.labels.typewriter"),
    "open-mindmap": t("settings.shortcuts.labels.open-mindmap"),
    "split-lr": t("settings.shortcuts.labels.split-lr", "左右分屏"),
    "split-tb": t("settings.shortcuts.labels.split-tb", "上下分屏"),
    "toggle-mode": t("settings.shortcuts.labels.toggle-mode"),
    escape: t("settings.shortcuts.labels.escape"),
    "quick-open": t("settings.shortcuts.labels.quick-open"),
    "command-palette": t("settings.shortcuts.labels.command-palette"),
    "open-settings": t("settings.shortcuts.labels.open-settings"),
  };
  const filteredShortcuts = shortcuts.filter((s) => {
    const query = search.toLowerCase();
    if (!query) return true;
    const translatedLabel = shortcutLabelMap[s.id] || s.label;
    if (translatedLabel.toLowerCase().includes(query)) return true;
    const keysStr = s.keys.join("+").toLowerCase();
    return keysStr.includes(query);
  });
  const groupedShortcuts = filteredShortcuts.reduce<Record<string, ShortcutItem[]>>((acc, shortcut) => {
    const group = shortcut.group || "其他";
    if (!acc[group]) acc[group] = [];
    acc[group].push(shortcut);
    return acc;
  }, {});

  const handleKeyDown = (e: KeyboardEvent) => {
    if (editingId === null && !recordingSearch) return;
    e.preventDefault();

    const keyMap: Record<string, string> = {
      "Control": "Ctrl",
      "Meta": "Ctrl",
      "Shift": "Shift",
      "Alt": "Alt",
      "ArrowUp": "↑",
      "ArrowDown": "↓",
      "ArrowLeft": "←",
      "ArrowRight": "→",
      "Enter": "Enter",
      "Escape": "Esc",
      "Backspace": "Backspace",
      "Delete": "Delete",
      "Tab": "Tab",
      "Space": "Space",
    };

    const key = keyMap[e.key] || e.key;

    if (e.key === "Escape") {
      if (recordingSearch) {
        setRecordingSearch(false);
        setSearch("");
      } else {
        setEditingId(null);
        setEditingKeys([]);
      }
      return;
    }

    if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;

    const newKeys: string[] = [];
    if (e.ctrlKey || e.metaKey) newKeys.push("Ctrl");
    if (e.shiftKey) newKeys.push("Shift");
    if (e.altKey) newKeys.push("Alt");
    newKeys.push(key);

    if (recordingSearch) {
      setSearch(newKeys.join("+"));
      setRecordingSearch(false);
      return;
    }

    setEditingKeys(newKeys);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingId, recordingSearch]);

  const startEditing = (id: string) => {
    const shortcut = shortcuts.find((s) => s.id === id);
    if (shortcut) {
      setEditingId(id);
      setEditingKeys([...shortcut.keys]);
    }
  };

  const saveShortcut = () => {
    if (editingId === null || editingKeys.length === 0) return;

    setShortcuts((prev) =>
      prev.map((s) => (s.id === editingId ? { ...s, keys: [...editingKeys] } : s))
    );
    setEditingId(null);
    setEditingKeys([]);
  };

  const resetShortcut = (id: string) => {
    const defaultShortcut = DEFAULT_SHORTCUTS.find((s) => s.id === id);
    if (defaultShortcut) {
      setShortcuts((prev) =>
        prev.map((s) => (s.id === id ? { ...s, keys: [...defaultShortcut.keys] } : s))
      );
    }
  };

  const resetAll = () => {
    if (confirm(t("settings.shortcuts.resetConfirm"))) {
      setShortcuts([...DEFAULT_SHORTCUTS]);
    }
  };

  return (
    <div className="settings-section">
      <div className="settings-search-wrapper">
        <div className={`settings-search-inner${recordingSearch ? " recording" : ""}`}>
          <input
            type="text"
            className="settings-search"
            placeholder={recordingSearch ? t("settings.shortcuts.keyRecordingPlaceholder") : t("settings.shortcuts.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            readOnly={recordingSearch}
          />
          <button
            className={`settings-record-btn${recordingSearch ? " active" : ""}`}
            onClick={() => {
              if (recordingSearch) {
                setRecordingSearch(false);
                setSearch("");
              } else {
                setRecordingSearch(true);
              }
            }}
            title={recordingSearch ? t("settings.shortcuts.cancelRecording") : t("settings.shortcuts.keyRecordingSearch")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
            </svg>
          </button>
        </div>
        <button className="settings-reset-all-btn" onClick={resetAll}>
          {t("settings.shortcuts.resetAll")}
        </button>
      </div>
      <div className="settings-shortcuts-list">
        {Object.entries(groupedShortcuts).map(([group, items]) => (
          <div key={group} className="settings-shortcut-group">
            <h4 className="settings-shortcut-group-title">{shortcutGroupNames[group] || group}</h4>
            {items.map((shortcut) => (
              <div key={shortcut.id} className="settings-shortcut-item">
                <span className="settings-shortcut-label">{shortcutLabelMap[shortcut.id] || shortcut.label}</span>
                <div className="settings-shortcut-actions">
                  <div
                    className={`settings-shortcut-keys${editingId === shortcut.id ? " editing" : ""}`}
                    onClick={() => startEditing(shortcut.id)}
                  >
                    {editingId === shortcut.id ? (
                      <>
                        {editingKeys.length > 0 ? (
                          editingKeys.map((key, j) => (
                            <span key={j}>
                              <kbd className="settings-kbd">{formatShortcutKey(key)}</kbd>
                              {j < editingKeys.length - 1 && <span className="settings-kbd-sep">+</span>}
                            </span>
                          ))
                        ) : (
                          <span className="settings-shortcut-hint">{t("settings.shortcuts.pressKeys")}</span>
                        )}
                        <button className="settings-shortcut-save" onClick={(e) => { e.stopPropagation(); saveShortcut(); }}>
                          ✓
                        </button>
                        <button className="settings-shortcut-cancel" onClick={(e) => { e.stopPropagation(); setEditingId(null); setEditingKeys([]); }}>
                          ✕
                        </button>
                      </>
                    ) : shortcut.keys.length > 0 ? (
                      shortcut.keys.map((key, j) => (
                        <span key={j}>
                          <kbd className="settings-kbd">{formatShortcutKey(key)}</kbd>
                          {j < shortcut.keys.length - 1 && <span className="settings-kbd-sep">+</span>}
                        </span>
                      ))
                    ) : (
                      <span className="settings-shortcut-hint">{t("settings.shortcuts.notSet")}</span>
                    )}
                  </div>
                  {editingId !== shortcut.id && (
                    <button
                      className="settings-shortcut-reset"
                      onClick={() => resetShortcut(shortcut.id)}
                      title={t("settings.shortcuts.resetToDefault")}
                    >
                      ↺
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
