---
title: Math Formulas
tags: [Editor]
---

# Math Formulas

Inimark supports **KaTeX** and **MathJax**, two math formula rendering engines, allowing you to write LaTeX formulas in both inline and block positions.

> [!NOTE]
> Formula rendering is enabled by default. If not needed, you can disable it in [[07-Settings/02-Editor-Settings]], or switch between KaTeX and MathJax engines.

## Inline Formulas

Wrap with a single dollar sign `$ ... $`:

```markdown
The mass-energy equation $E=mc^2$ is fundamental to physics.
```

Display effect: The mass-energy equation $E=mc^2$ is fundamental to physics.

## Block Formulas

Wrap with double dollar signs `$$ ... $$`; the formula will occupy its own line and be centered:

```markdown
$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$
```

## Common Syntax

### Superscripts and Subscripts

```markdown
$x^2$        → Superscript
$H_2O$       → Subscript
$x_i^{2n}$   → Combined superscript and subscript
```

### Fractions

```markdown
$\frac{a}{b}$
```

### Square Roots

```markdown
$\sqrt{x}$       → Square root
$\sqrt[n]{x}$    → nth root
```

### Summation, Integration, and Product

```markdown
$\sum_{i=1}^{n}$   → Summation
$\int_{a}^{b}$     → Integration
$\prod_{i=1}^{n}$  → Product
```

### Greek Letters

```markdown
$\alpha$ $\beta$ $\gamma$ $\delta$
$\pi$ $\sigma$ $\omega$ $\theta$
```

### Matrices

```markdown
$$
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
$$
```

### Multi-line Alignment

```markdown
$$
\begin{aligned}
a &= b + c \\
  &= d + e
\end{aligned}
$$
```

## Engine Switching

You can switch the rendering engine in the "Math Formulas" option of [[07-Settings/02-Editor-Settings]]:

- **KaTeX** — Fast rendering speed, good syntax compatibility, recommended for daily writing
- **MathJax** — More comprehensive functionality, supports more extended LaTeX syntax

> [!TIP]
> Most common formulas render correctly with both engines. If a complex formula errors under KaTeX, try switching to MathJax.

## Related Settings

- [[07-Settings/02-Editor-Settings]] — Formula engine selection and enable/disable

## Related Documents

- [[02-Editor/02-Markdown-Syntax]] — Basic syntax
- [[02-Editor/03-Code-Blocks]] — Code highlighting
- [[02-Editor/05-Mermaid-Diagrams]] — Diagram syntax
