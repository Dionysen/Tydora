---
title: Mind Map Settings
tags: [Settings]
---

# Mind Map Settings

This page configures the display parameters of [[08-Advanced-Features/02-Mind-Map]] and [[03-Knowledge-Management/04-Knowledge-Graph]], allowing you to adjust node density, line thickness, and physics layout to your preference.

> [!NOTE]
> Press `Ctrl+,` to open Settings, then switch to the "Mind Map" tab. The "Relationship Graph" group corresponds to the Knowledge Graph.

## Mind Map Settings

Based on Markmap rendering, adjustable parameters:

### Max Width

Set the **maximum width** of mind map nodes. Overly wide content will wrap, preventing a single node from stretching the canvas horizontally.

### Spacing

Set the **spacing** between nodes, controlling overall density.

### Animation Duration

Set the animation duration for expanding / collapsing nodes (in milliseconds). Lower values are snappier; higher values are smoother.

### Line Width

Set the thickness of connecting lines.

### Color Freeze Level

Set "from which level to start using different colors" to differentiate layers. For example, if set to 2, the root node and first-level nodes share the same color, while levels 2 and below use a color gradient to distinguish them, making depth easier to perceive.

## Knowledge Graph Settings

Based on D3.js force-directed graph, adjustable parameters:

### Node Size

Set the default radius of graph nodes. Notes with more links are rendered larger in the graph; this parameter sets the base size.

### Link Thickness

Set the default thickness of links. Higher-frequency links appear thicker.

### Force Strength

Adjust the **physics simulation strength** (charge force) of the force-directed graph. The more negative the value, the stronger the repulsion between nodes and the looser the layout; the closer to 0, the more easily they cluster together.

> [!TIP]
> When the repository has many links, increasing the absolute value of "Force Strength" makes clusters clearer; when links are sparse, reducing it prevents nodes from scattering too far apart.

## Related Documents

- [[08-Advanced-Features/02-Mind-Map]] — Mind map usage
- [[03-Knowledge-Management/04-Knowledge-Graph]] — Knowledge graph
- [[07-Settings/01-General-Settings]] — Basic settings
