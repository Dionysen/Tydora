import { useState, useEffect, useCallback, useRef } from "react";
import type { EditorHandle } from "../Editor/types";
import "./FindReplaceDialog.css";

interface FindReplaceDialogProps {
  editorHandle: EditorHandle | null;
  mode: "find" | "replace";
  onClose: () => void;
}

export default function FindReplaceDialog({ editorHandle, mode: initialMode, onClose }: FindReplaceDialogProps) {
  const [query, setQuery] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matches, setMatches] = useState<Array<{ from: number; to: number }>>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [mode, setMode] = useState(initialMode);
  const findInputRef = useRef<HTMLInputElement>(null);

  // Update mode when prop changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Auto-focus find input on mount
  useEffect(() => {
    findInputRef.current?.focus();
  }, []);

  // Perform search when query changes
  const doSearch = useCallback((q: string) => {
    if (!editorHandle || !q) {
      setMatches([]);
      setCurrentIndex(-1);
      editorHandle?.clearHighlight();
      return;
    }
    const results = editorHandle.findMatches(q);
    setMatches(results);
    if (results.length > 0) {
      setCurrentIndex(0);
      editorHandle.selectAndScroll(results[0].from, results[0].to);
      editorHandle.highlightSearch(q);
    } else {
      setCurrentIndex(-1);
      editorHandle.clearHighlight();
    }
  }, [editorHandle]);

  useEffect(() => {
    doSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Navigate to next match
  const goToNext = useCallback(() => {
    if (matches.length === 0) return;
    const next = (currentIndex + 1) % matches.length;
    setCurrentIndex(next);
    editorHandle?.selectAndScroll(matches[next].from, matches[next].to);
  }, [matches, currentIndex, editorHandle]);

  // Navigate to previous match
  const goToPrev = useCallback(() => {
    if (matches.length === 0) return;
    const prev = (currentIndex - 1 + matches.length) % matches.length;
    setCurrentIndex(prev);
    editorHandle?.selectAndScroll(matches[prev].from, matches[prev].to);
  }, [matches, currentIndex, editorHandle]);

  // Replace current match
  const replaceCurrent = useCallback(() => {
    if (!editorHandle || matches.length === 0 || currentIndex < 0 || currentIndex >= matches.length) return;
    const match = matches[currentIndex];
    editorHandle.replaceAt(match.from, match.to, replaceText);
    // Refresh matches after replace
    const newResults = editorHandle.findMatches(query);
    setMatches(newResults);
    if (newResults.length > 0) {
      const newIdx = Math.min(currentIndex, newResults.length - 1);
      setCurrentIndex(newIdx);
      editorHandle.selectAndScroll(newResults[newIdx].from, newResults[newIdx].to);
    } else {
      setCurrentIndex(-1);
      editorHandle.clearHighlight();
    }
  }, [editorHandle, matches, currentIndex, replaceText, query]);

  // Replace all matches
  const replaceAll = useCallback(() => {
    if (!editorHandle || matches.length === 0) return;
    // Replace from last to first to preserve positions
    for (let i = matches.length - 1; i >= 0; i--) {
      editorHandle.replaceAt(matches[i].from, matches[i].to, replaceText);
    }
    setMatches([]);
    setCurrentIndex(-1);
    editorHandle.clearHighlight();
  }, [editorHandle, matches, replaceText]);

  // Keyboard shortcuts inside dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (mode === "replace") {
          replaceCurrent();
        } else {
          goToNext();
        }
      } else if (e.key === "Escape") {
        editorHandle?.clearHighlight();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, replaceCurrent, goToNext, onClose, editorHandle]);

  return (
    <div className="find-replace-dialog">
      <div className="find-replace-row">
        <div className="find-replace-input-group">
          <svg className="find-replace-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"/>
          </svg>
          <input
            ref={findInputRef}
            className="find-replace-input"
            type="text"
            placeholder="查找..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <span className="find-replace-count">
              {matches.length > 0 ? `${currentIndex + 1}/${matches.length}` : "0/0"}
            </span>
          )}
        </div>
        <button
          className="find-replace-nav-btn"
          onClick={goToPrev}
          disabled={matches.length === 0}
          title="上一个匹配"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M3.47 7.78a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 1.06L5.06 7.25h7.69a.75.75 0 0 1 0 1.5H5.06l2.72 2.72a.75.75 0 1 1-1.06 1.06L3.47 8.28Z"/>
          </svg>
        </button>
        <button
          className="find-replace-nav-btn"
          onClick={goToNext}
          disabled={matches.length === 0}
          title="下一个匹配"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M12.53 8.22a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L10.94 8.75H3.25a.75.75 0 0 1 0-1.5h7.69L8.22 4.53a.75.75 0 1 1 1.06-1.06l3.25 3.25Z"/>
          </svg>
        </button>
        <button
          className="find-replace-close-btn"
          onClick={() => {
            editorHandle?.clearHighlight();
            onClose();
          }}
          title="关闭"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/>
          </svg>
        </button>
      </div>

      {mode === "replace" && (
        <div className="find-replace-row">
          <div className="find-replace-input-group">
            <svg className="find-replace-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M1.97 9.53a.75.75 0 0 1 0-1.06l2-2a.75.75 0 0 1 1.06 1.06l-.72.72h5.44a3.25 3.25 0 0 0 0-6.5H4.5a.75.75 0 0 1 0-1.5h5.25a4.75 4.75 0 1 1 0 9.5H4.31l.72.72a.75.75 0 1 1-1.06 1.06l-2-2Zm10.06-3.06a.75.75 0 0 1 0 1.06l-2 2a.75.75 0 1 1-1.06-1.06l.72-.72H4.25a3.25 3.25 0 0 0 0 6.5h5.25a.75.75 0 0 1 0 1.5H4.25a4.75 4.75 0 1 1 0-9.5h5.44l-.72-.72a.75.75 0 0 1 1.06-1.06l2 2Z"/>
            </svg>
            <input
              className="find-replace-input"
              type="text"
              placeholder="替换为..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
            />
          </div>
          <button
            className="find-replace-action-btn"
            onClick={replaceCurrent}
            disabled={matches.length === 0}
          >
            替换
          </button>
          <button
            className="find-replace-action-btn find-replace-all-btn"
            onClick={replaceAll}
            disabled={matches.length === 0}
          >
            全部替换
          </button>
        </div>
      )}
    </div>
  );
}
