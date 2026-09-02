import { useState, useCallback } from "react";
import i18n from "../i18n";

interface OutlineItem {
  level: number;
  text: string;
  line: number;
}

interface OutlineNode {
  item: OutlineItem;
  children: OutlineNode[];
  hasChildren: boolean;
}

function parseOutline(markdown: string): OutlineItem[] {
  const items: OutlineItem[] = [];
  const lines = markdown.split("\n");
  let inCodeBlock = false;
  let codeFence: { char: string; length: number } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fenceMatch = line.match(/^(`{3,}|~{3,})/);

    if (fenceMatch) {
      const fence = fenceMatch[1];
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeFence = { char: fence[0], length: fence.length };
      } else if (
        codeFence &&
        fence[0] === codeFence.char &&
        fence.length >= codeFence.length
      ) {
        inCodeBlock = false;
        codeFence = null;
      }
      continue;
    }

    if (inCodeBlock) continue;

    const m = line.match(/^(#{1,6})\s+(.+)/);
    if (m) {
      items.push({ level: m[1].length, text: m[2].trim(), line: i + 1 });
    }
  }
  return items;
}

function buildOutlineTree(items: OutlineItem[]): OutlineNode[] {
  const root: OutlineNode[] = [];
  const stack: { node: OutlineNode; level: number }[] = [];

  for (const item of items) {
    const node: OutlineNode = { item, children: [], hasChildren: false };

    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      const parent = stack[stack.length - 1].node;
      parent.children.push(node);
      parent.hasChildren = true;
    }

    stack.push({ node, level: item.level });
  }

  return root;
}

function OutlineNodeComp({
  node,
  depth,
  collapsedLines,
  activeLine,
  onToggle,
  onSelectHeading,
}: {
  node: OutlineNode;
  depth: number;
  collapsedLines: Set<number>;
  activeLine: number;
  onToggle: (line: number) => void;
  onSelectHeading: (level: number, text: string, line: number) => void;
}) {
  const isCollapsed = collapsedLines.has(node.item.line);
  const showChildren = node.hasChildren && !isCollapsed;
  const isActive = activeLine === node.item.line;

  return (
    <div className="outline-branch">
      <div
        className={`outline-node${isActive ? " active" : ""}`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
        title={node.item.text}
      >
        {node.hasChildren ? (
          <span
            className={`outline-chevron${isCollapsed ? "" : " expanded"}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.item.line);
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
        ) : (
          <span className="outline-icon-spacer" />
        )}
        <span className="outline-level">H{node.item.level}</span>
        <span
          className="outline-text"
          onClick={() => onSelectHeading(node.item.level, node.item.text, node.item.line)}
        >
          {node.item.text}
        </span>
      </div>

      {showChildren && node.children.length > 0 && (
        <div className="outline-children" style={{ "--outline-depth": depth } as React.CSSProperties}>
          {node.children.map((child) => (
            <OutlineNodeComp
              key={child.item.line}
              node={child}
              depth={depth + 1}
              collapsedLines={collapsedLines}
              activeLine={activeLine}
              onToggle={onToggle}
              onSelectHeading={onSelectHeading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function OutlinePanel({
  content,
  onSelectHeading,
}: {
  content: string;
  onSelectHeading: (level: number, text: string, line: number) => void;
}) {
  const items = parseOutline(content);
  const [collapsedLines, setCollapsedLines] = useState<Set<number>>(new Set());
  const [activeLine, setActiveLine] = useState<number>(0);

  const handleToggle = useCallback((line: number) => {
    setCollapsedLines((prev) => {
      const next = new Set(prev);
      if (next.has(line)) {
        next.delete(line);
      } else {
        next.add(line);
      }
      return next;
    });
  }, []);

  const handleSelectHeading = useCallback((level: number, text: string, line: number) => {
    setActiveLine(line);
    onSelectHeading(level, text, line);
  }, [onSelectHeading]);

  if (items.length === 0) {
    return (
      <div className="sidebar-tree sidebar-tree--no-footer-pad">
        <div className="tree-empty">{i18n.t("sidebar.outline.untitled")}</div>
        <div className="tree-empty-hint">{i18n.t("sidebar.outline.hint")}</div>
      </div>
    );
  }

  const tree = buildOutlineTree(items);

  return (
    <div className="sidebar-tree sidebar-tree--no-footer-pad">
      {tree.map((node) => (
        <OutlineNodeComp
          key={node.item.line}
          node={node}
          depth={0}
          collapsedLines={collapsedLines}
          activeLine={activeLine}
          onToggle={handleToggle}
          onSelectHeading={handleSelectHeading}
        />
      ))}
    </div>
  );
}
