import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useXhsSettings } from "./useXhsSettings";
import { useXhsPreview } from "./useXhsPreview";
import { saveXhsCards, saveCardImage, openDirectory } from "./save";
import { XHS_THEMES } from "./themes";
import { XHS_FONT_OPTIONS } from "./fonts";
import { XHS_FONT_SIZES, type XhsCard, type XhsFontFamily, type XhsFontSize } from "./types";
import type { EditorMode } from "../../Editor";
import "./XhsPreviewPanel.css";

interface XhsPreviewPanelProps {
  title: string;
  content: string;
  viewMode: EditorMode;
  getContentElement: () => HTMLElement | null;
  editorTheme: string;
  width: number;
  onWidthChange: (w: number) => void;
  onClose: () => void;
}

export function XhsPreviewPanel({
  title,
  content,
  viewMode,
  getContentElement,
  editorTheme,
  width,
  onWidthChange,
  onClose,
}: XhsPreviewPanelProps) {
  const { t } = useTranslation();
  const { settings, updateSettings } = useXhsSettings();
  const enabled = viewMode === "ir";
  const { cards, building, error } = useXhsPreview({
    enabled,
    content,
    settings,
    getContentElement,
    editorTheme,
    title,
  });

  const [exporting, setExporting] = useState(false);
  const [savedDir, setSavedDir] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  // 放大预览当前展示的卡片下标（null = 未放大）
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  // 使用说明弹窗
  const [helpOpen, setHelpOpen] = useState(false);

  // ── 左侧分隔条拖拽（向左拖 = 增大栏宽）──
  const [resizing, setResizing] = useState(false);
  const startRef = useRef({ x: 0, width: 0 });
  const handleResizeDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setResizing(true);
      startRef.current = { x: e.clientX, width };
    },
    [width],
  );
  useEffect(() => {
    if (!resizing) return;
    const move = (e: MouseEvent) => {
      const delta = startRef.current.x - e.clientX;
      const w = Math.max(320, Math.min(720, startRef.current.width + delta));
      onWidthChange(w);
    };
    const up = () => setResizing(false);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
  }, [resizing, onWidthChange]);

  // ── 与编辑器滚动同步 ──
  const cardsRef = useRef<HTMLDivElement>(null);

  const syncCardsFromEditor = useCallback((editorEl: HTMLElement) => {
    const cardsEl = cardsRef.current;
    if (!cardsEl) return;
    const maxEditor = editorEl.scrollHeight - editorEl.clientHeight;
    const maxCards = cardsEl.scrollHeight - cardsEl.clientHeight;
    if (maxEditor <= 0 || maxCards <= 0) return;
    cardsEl.scrollTop = (editorEl.scrollTop / maxEditor) * maxCards;
  }, []);

  // 捕获阶段监听编辑器 .tiptap-editor 的滚动，映射到卡片预览
  useEffect(() => {
    const onScroll = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target && target.classList && target.classList.contains("tiptap-editor")) {
        syncCardsFromEditor(target);
      }
    };
    document.addEventListener("scroll", onScroll, true);
    return () => document.removeEventListener("scroll", onScroll, true);
  }, [syncCardsFromEditor]);

  // 首次构建完成后，把卡片预览对齐编辑器当前滚动位置
  const prevCardCountRef = useRef(0);
  useEffect(() => {
    if (cards.length > 0 && prevCardCountRef.current === 0) {
      const editorEl = document.querySelector(".tiptap-editor") as HTMLElement | null;
      if (editorEl) syncCardsFromEditor(editorEl);
    }
    prevCardCountRef.current = cards.length;
  }, [cards, syncCardsFromEditor]);

  const isBusy = exporting || building;

  const handleExport = useCallback(async () => {
    if (exporting || cards.length === 0) return;
    setExporting(true);
    setActionError(null);
    setSavedDir(null);
    try {
      const dir = await saveXhsCards(cards, title);
      if (dir) setSavedDir(dir);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setExporting(false);
    }
  }, [exporting, cards, title]);

  const handleDownloadCard = useCallback(
    async (card: XhsCard) => {
      setActionError(null);
      try {
        await saveCardImage(card, title);
      } catch (e) {
        setActionError(e instanceof Error ? e.message : String(e));
      }
    },
    [title],
  );

  const handleOpenDir = useCallback(() => {
    if (savedDir) void openDirectory(savedDir).catch(() => {});
  }, [savedDir]);

  // 放大视图键盘操作：←/→ 切换卡片，Esc 关闭
  useEffect(() => {
    if (zoomIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setZoomIndex(null);
      } else if (e.key === "ArrowRight") {
        setZoomIndex((i) => (i === null || i >= cards.length - 1 ? i : i + 1));
      } else if (e.key === "ArrowLeft") {
        setZoomIndex((i) => (i === null || i <= 0 ? i : i - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomIndex, cards.length]);

  // 放大期间卡片重建（数量变化）时，把下标限制在有效范围内
  useEffect(() => {
    if (zoomIndex !== null && cards.length === 0) setZoomIndex(null);
  }, [cards.length, zoomIndex]);

  const errorText =
    error === "XHS_SOURCE_MODE"
      ? t("xhs.sourceModeHint")
      : error === "XHS_EMPTY"
        ? t("xhs.emptyHint")
        : error;

  return (
    <div className={`xhs-panel${resizing ? " resizing" : ""}`} style={{ width }}>
      <div className="xhs-resize-handle" onMouseDown={handleResizeDown} />

      <div className="xhs-panel-header">
        <svg
          className="xhs-panel-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2.5" y="3.5" width="19" height="17" rx="3" />
          <circle cx="8.5" cy="8.5" r="2" />
          <polyline points="5 17 9.5 12.5 13.5 16 18 10.5" />
        </svg>
        <span className="xhs-panel-title">{t("xhs.title")}</span>
      </div>

      <div className="xhs-toolbar">
        <div className="xhs-toolbar-row">
          <select
            className="xhs-select"
            value={settings.themeId}
            onChange={(e) => updateSettings({ themeId: e.target.value })}
            disabled={isBusy}
            title={t("xhs.themeLabel")}
          >
            {XHS_THEMES.map((th) => (
              <option key={th.id} value={th.id}>
                {t(`xhs.themes.${th.id}`, th.name)}
              </option>
            ))}
          </select>

          <div className="xhs-segmented xhs-segmented-ratio">
            {(["3:4", "3:5", "1:1"] as const).map((r) => (
              <button
                key={r}
                className={settings.ratio === r ? "active" : ""}
                onClick={() => updateSettings({ ratio: r })}
                disabled={isBusy}
                title={r}
              >
                {r}
              </button>
            ))}
          </div>

          <select
            className="xhs-select"
            value={settings.fontFamily}
            onChange={(e) => updateSettings({ fontFamily: e.target.value as XhsFontFamily })}
            disabled={isBusy}
            title={t("xhs.fontFamily")}
          >
            {XHS_FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {t(`xhs.fonts.${f.labelKey}`)}
              </option>
            ))}
          </select>

          <select
            className="xhs-select"
            value={String(settings.fontSize)}
            onChange={(e) => updateSettings({ fontSize: Number(e.target.value) as XhsFontSize })}
            disabled={isBusy}
            title={t("xhs.fontSize")}
          >
            {XHS_FONT_SIZES.map((s) => (
              <option key={s} value={String(s)}>
                {s}
              </option>
            ))}
          </select>

          <label className="xhs-check" title={t("xhs.gridLinesHint")}>
            <input
              type="checkbox"
              checked={settings.gridLines}
              onChange={(e) => updateSettings({ gridLines: e.target.checked })}
              disabled={isBusy}
            />
            <span>{t("xhs.gridLines")}</span>
          </label>
        </div>
      </div>

      <div className="xhs-status">
        <div className="xhs-status-row">
          <button className="xhs-close xhs-status-close" onClick={onClose} title={t("xhs.close")} disabled={isBusy}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1.5" y="1.5" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="1.4" />
              <rect x="10.5" y="2.5" width="5" height="13" rx="1" fill="currentColor" opacity="0.25" />
              <line x1="10.5" y1="2.5" x2="10.5" y2="15.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
          {viewMode === "sv" ? (
            <span className="xhs-status-hint">{t("xhs.sourceModeHint")}</span>
          ) : building ? (
            <span className="xhs-status-building">{t("xhs.building")}</span>
          ) : error ? (
            <span className="xhs-status-error">{t("xhs.error")}: {errorText}</span>
          ) : (
            <span className="xhs-status-count">
              {t("xhs.totalCards", { count: cards.length })}
              <button
                className="xhs-help-btn"
                onClick={() => setHelpOpen(true)}
                title={t("xhs.help")}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9.5" />
                  <path d="M9.2 9a3 3 0 0 1 5.6 1.3c0 1.6-2.6 2.2-2.6 3.7" />
                  <line x1="12" y1="17.2" x2="12.01" y2="17.2" />
                </svg>
              </button>
            </span>
          )}
          <span className="xhs-status-actions">
            <button
              className="xhs-action-btn xhs-action-primary"
              onClick={handleExport}
              disabled={isBusy || cards.length === 0 || viewMode !== "ir"}
            >
              {exporting ? t("xhs.exporting") : t("xhs.export")}
            </button>
            {savedDir && (
              <button className="xhs-action-btn" onClick={handleOpenDir}>
                {t("xhs.openFolder")}
              </button>
            )}
          </span>
        </div>
        {actionError && <div className="xhs-action-error">{actionError}</div>}
        {savedDir && (
          <div className="xhs-action-ok">{t("xhs.exportSuccess", { count: cards.length, dir: savedDir })}</div>
        )}
      </div>

      <div className="xhs-cards" ref={cardsRef}>
        {viewMode === "ir" &&
          cards.map((card, idx) => (
            <div
              key={card.index}
              className="xhs-card-item"
              onClick={() => setZoomIndex(idx)}
              title={t("xhs.zoomHint")}
            >
              <img src={card.pngDataUrl} alt={`${card.index + 1}/${card.total}`} />
              <button
                className="xhs-card-download"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleDownloadCard(card);
                }}
                title={t("xhs.download")}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>
          ))}
      </div>



      {helpOpen && (
        <div className="xhs-help-overlay" onClick={() => setHelpOpen(false)}>
          <div className="xhs-help-body" onClick={(e) => e.stopPropagation()}>
            <div className="xhs-help-header">
              <span className="xhs-help-title">{t("xhs.helpTitle")}</span>
              <button className="xhs-help-close" onClick={() => setHelpOpen(false)} title={t("xhs.close")}>
                ✕
              </button>
            </div>
            <div className="xhs-help-content">
              <p>{t("xhs.helpIntro")}</p>
              <h4>{t("xhs.helpRuleTitle")}</h4>
              <ul>
                <li>{t("xhs.helpRule1")}</li>
                <li>{t("xhs.helpRule2")}</li>
                <li>{t("xhs.helpRule3")}</li>
              </ul>
              <h4>{t("xhs.helpExampleTitle")}</h4>
              <pre className="xhs-help-example">{t("xhs.helpExample")}</pre>
            </div>
            <div className="xhs-help-footer">
              <button className="xhs-action-btn xhs-action-primary" onClick={() => setHelpOpen(false)}>
                {t("xhs.helpClose")}
              </button>
            </div>
          </div>
        </div>
      )}

      {zoomIndex !== null && cards[zoomIndex] && (
        <div className="xhs-zoom-overlay" onClick={() => setZoomIndex(null)}>
          <div className="xhs-zoom-body">
            {/* 仅卡片区域拦截点击；点击空白处（body）冒泡到遮罩关闭 */}
            <div className="xhs-zoom-stage" onClick={(e) => e.stopPropagation()}>
              <button
                className="xhs-zoom-close"
                onClick={() => setZoomIndex(null)}
                title={t("xhs.close")}
              >
                ✕
              </button>
              <img src={cards[zoomIndex].pngDataUrl} alt="preview" />
              <span className="xhs-zoom-page">
                {zoomIndex + 1} / {cards.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
