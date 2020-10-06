
1. [Types and terminology](#types-and-terminology)
2. [Transforming a command segment to a cubic command segment](#transforming-a-command-segment-to-a-cubic-command-segment)

# Types and terminology

`Command => { type: String, points: [Point] }`
`Point => { [Parameter]: Number }`
`Segment => ...Point`

Note: `Segment` is not a concrete sequence type like `[Point]`, ie. it is only a conceptual type.

**Command:** a definition of movement(s) on the SVG canvas.

**Command type:** a letter for the command type, eg. `m`oving at a position, drawing a `l`ine or a `c`urve, or closing the path with `z`.

**Command segment:** a sequence of command points describing a single movement to an end point.

**Command point:** a map of parameters, eg. `{ x: Number, y: Number }`.

# Transforming a command segment to a cubic command segment

Below is a list of `Segment` definitions sorted by `Command` type.

Note: for clarity purpose, the type of a `Point` is replaced with `Point => [Number]`.

| Type  | Segment                            |
| ----- | ---------------------------------- |
| **L** | [Lx, Ly]                           |
| **l** | [lx, ly]                           |
| **H** | [Hx]                               |
| **h** | [hx]                               |
| **V** | [Vy]                               |
| **v** | [vy]                               |
| **S** | [Sx1, Sy1], [Sx2, Sy2]             |
| **s** | [sx1, sy1], [sx2, sy2]             |
| **c** | [cx1, cy1], [cx2, cy2], [cx3, cy3] |
| **Q** | [Qx1, Qy1], [Qx2, Qy2]             |
| **q** | [qx1, qy1], [qx2, qy2]             |
| **T** | [Tx1, Ty1]                         |
| **t** | [tx1, ty1]                         |
| **A** | [Arx, Ary, Aa, Af1, Af2, Ax, Ay]   |
| **a** | [arx, ary, aa, af1, af2, ax, ay]   |

Below is a list of transformations for each `Segment` by command type.

For clarity purpose, `P`revious is an alias to the previous segment whose conceptual type is `Segment => [x1, y1], [x2, y2], [x, y]`, where:

- `[x2, y2]` is the end control `Point` of the last (cubic) `Segment`
- `[x, y]` is the end position `Point` of the last (cubic) `Segment`

| Type  | Transformation from [P, Segment[Type]] to [P, Segment.C]              |
| ----- | --------------------------------------------------------------------- |
| **L** | [P, [x, y], [Lx, Ly], [Lx, Ly]                                        |
| **l** | [P, [x, y], [lx + x, ly + y], [lx + x, ly + y]]                       |
| **H** | [P, [x, y], [Hx, y], [Hx, y]]                                         |
| **h** | [P, [x, y], [hx + x, y], [hx + x, y]]                                 |
| **V** | [P, [x, y], [x, Vy], [x, Vy]]                                         |
| **v** | [P, [x, y], [x, vy + y], [x, vy + y]]                                 |
| **S** | [P, [x, y]*, [Sx1, Sy1], [Sx2, Sy2]]                                  |
| **s** | [P, [x, y]*, [sx1 + x, sy1 + y], [sx2 + x, sy2 + y]]                  |
| **c** | [P, [cx1 + x, cy1 + y], [cx2 + x, cy2 + y], [cx3 + x, cy3 + y]]       |
| **Q** | [P, [x + 2/3 * (Qx1 - x), y + 2/3 * (Qy1 - y)], [Qx2 + 2/3 * (Qx1 - Qx2), Qy2 + 2/3 * (Qy1 - Qy2)], [Qx2, Qy2]] |
| **q** | [P, [x + 2/3 * qx1, y + 2/3 * qy1], [qx2 + x + 2/3 * (qx1 - qx2), qy2 + y + 2/3 * (qy1 - qy2)], [qx2 + x, qy2 + y]] |
| **T** | [P, [x, y]*, [Tx > x ? Tx + (x - x2) : Tx - (x - x2), Ty > y ? Ty + (y - y2) : Ty - (y - y2)], [Tx, Ty]] |
| **t** | [P, [x, y]*, [Tx + x > x ? Tx + x + (x - x2) : Ty + y - (y - y2), Ty + y > y ? Ty + y + (y - y2) : Ty + y - (y - y2)], [tx + x, ty + y]] |
| **A** | [P, [?], [?], [Ax, Ay]]                                               |
| **a** | [P, [?], [?], [ax + x, ay + y]]                                       |

**(*) Special case:** consecutive segments from command types `s|S` or `t|T` should use the previous end position `Point` as their start control `Point` if the last segment is not a cubic or quadratic command, respectively. Otherwhise, its start control `Point` should be a reflection of the previous end control `Point` by using the previous end position `Point` as the anchor point of a symetric transformation:

| Type  | Transformation from [P, Segment[Type]] to [P, Segment.C] |
| ----- | -------------------------------------------------------- |
| **S** | [P, [x * 2 - x2, y * 2 - y2], ...                        |
| **s** | [P, [x * 2 - x2, y * 2 - y2], ...                        |
| **T** | [P, [x * 2 - x2, y * 2 - y2], ...                        |
| **t** | [P, [x * 2 - x2, y * 2 - y2], ...                        |

[Specification](https://www.w3.org/TR/SVG11/paths.html#PathDataCubicBezierCommands).
[Specification](https://www.w3.org/TR/SVG11/implnote.html#PathElementImplementationNotes).

The result of this behavior is that:

- if a command type `s|S` follows a command of the same "parent" type, ie. a cubic bézier curve, it will get its path slightly shifted as its start control `Point` will reflect the previous end control `Point` instead of being "null", ie. at the previous end position `Point`
- if a command type `t|T` doesn't follow a command of the same "parent" type, ie. a quadratic bezier curve, it will be rendered flat as it will only have its end position `Point`, which is not enough to draw a curve

Another fact is that a `s|S` command type can be used alone but not `t|T`.

Heuristic facts:

- total of transformed types: 15
- types using [x, y] for their start control `Point`: 8/15 (uppercase or lowercase l, h, v, s*, t*)
- types using [draw.x ? draw.x + x : x, draw.y ? draw.y + y : y] for their end control `Point`: 5/15 (l, h, v, s, c)
- types using [draw.x + x, draw.y + y] for their end position `Point`: 6/15 (l, h, v, s, c, a)
