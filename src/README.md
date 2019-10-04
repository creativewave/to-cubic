
1. [Types and terminology](#types-and-terminology)
2. [Transforming a point to a cubic command point](#transforming-a-point-to-a-cubic-command-point)

# Types and terminology

**Command:** a definition of a movement on the SVG canvas.

**Command type:** a letter for the movement type, eg. `m`oving without drawing anything, drawing a `l`ine or a `c`urve, or closing the path with `z`.

**Command point:** a collection of grouped parameters describing one or multiple movements from a start point to an end point, ie. in vector graphic softwares for a cubic command, one or multiple points attached to a pair of curve handles.

**Command group:** parameters gathered in a record to ease the math to convert a command into a cubic command, ie. `{ x: Number, y: Number }` for a parameter of a cubic command.

# Transforming a point to a cubic command point

Below is a list of `Group`ed (object) `Parameter`s (property names) sorted by `Command` type.

For clarity purpose, the type `Parameter => { a }` is replaced with `Parameter => [a]`.

| Type  | Point => [Group], Group => [Parameter] |
| ----- | -------------------------------------- |
| **L** | [Lx, Ly]                               |
| **l** | [lx, ly]                               |
| **H** | [Hx]                                   |
| **h** | [hx]                                   |
| **V** | [Vy]                                   |
| **v** | [vy]                                   |
| **S** | [Sx1, Sy1], [Sx2, Sy2]                 |
| **s** | [sx1, sy1], [sx2, sy2]                 |
| **c** | [cx1, cy1], [cx2, cy2], [cx3, cy3]     |
| **Q** | [Qx1, Qy1], [Qx2, Qy2]                 |
| **q** | [qx1, qy1], [qx2, qy2]                 |
| **T** | [Tx1, Ty1]                             |
| **t** | [tx1, ty1]                             |
| **A** | [Arx, Ary, Aa, Af1, Af2, Ax, Ay]       |
| **a** | [arx, ary, aa, af1, af2, ax, ay]       |

Below is a list of transformations for each `Point` by command type.

For clarity purpose, `P`revious is an alias to the previous point which has the type `Point => [x1, y1], [x2, y2], [x, y]`, where:

- `[x2, y2]` are the end control `Parameters` of the last (cubic) `Point`
- `[x, y]` are the end position `Parameters` of the last (cubic) `Point`

| Type  | Transformation from [P, Point[Type]] to [P, Point.C] |
| ----- | ---------------------------------------------------- |
| **L** | [P, [x, y], [Lx, Ly], [Lx, Ly]                       |
| **l** | [P, [x, y], [lx + x, ly + y], [lx + x, ly + y]]      |
| **H** | [P, [x, y], [Hx, y], [Hx, y]]                        |
| **h** | [P, [x, y], [hx + x, y], [hx + x, y]]                |
| **V** | [P, [x, y], [x, Vy], [x, Vy]]                        |
| **v** | [P, [x, y], [x, vy + y], [x, vy + y]]                |
| **S** | [P, [x, y]*, [Sx1, Sy1], [Sx2, Sy2]]                 |
| **s** | [P, [x, y]*, [sx1 + x, sy1 + y], [sx2 + x, sy2 + y]] |
| **c** | [P, [cx1 + x, cy1 + y], [cx2 + x, cy2 + y], [cx3 + x, cy3 + y]]       |
| **Q** | [P, [x + 2/3 * (Qx1 - x), y + 2/3 * (Qy1 - y)], [Qx2 + 2/3 * (Qx1 - Qx2), Qy2 + 2/3 * (Qy1 - Qy2)], [Qx2, Qy2]] |
| **q** | [P, [x + 2/3 * qx1, y + 2/3 * qy1], [qx2 + x + 2/3 * (qx1 - qx2), qy2 + y + 2/3 * (qy1 - qy2)], [qx2 + x, qy2 + y]] |
| **T** | [P, [x, y]*, [Tx > x ? Tx + (x - x2) : Tx - (x - x2), Ty > y ? Ty + (y - y2) : Ty - (y - y2)], [Tx, Ty]] |
| **t** | [P, [x, y]*, [Tx + x > x ? Tx + x + (x - x2) : Ty + y - (y - y2), Ty + y > y ? Ty + y + (y - y2) : Ty + y - (y - y2)], [tx + x, ty + y]] |
| **A** | [P, [?], [?], [Ax, Ay]]                              |
| **a** | [P, [?], [?], [ax + x, ay + y]]                      |

**(*) Special case:** consecutive points from command types `s|S` or `t|T` should use the previous end point parameters as their start control parameters if the last point is not from a cubic or a quadratic command, respectively. Otherwhise, its start control parameters should be a reflection of the previous end control parameters using the previous end point parameters as the anchor point of a symetric transformation:

| Type  | Transformation from [P, Point[Type]] to [P, Point.C] |
| ----- | ---------------------------------------------------- |
| **S** | [P, [x * 2 - x2, y * 2 - y2], ...                    |
| **s** | [P, [x * 2 - x2, y * 2 - y2], ...                    |
| **T** | [P, [x * 2 - x2, y * 2 - y2], ...                    |
| **t** | [P, [x * 2 - x2, y * 2 - y2], ...                    |

[Specification](https://www.w3.org/TR/SVG11/paths.html#PathDataCubicBezierCommands).
[Specification](https://www.w3.org/TR/SVG11/implnote.html#PathElementImplementationNotes).

The result of this behavior is that:

- if a command type `s|S` follows a command which has the same "parent" type, ie. a cubic bézier curve, it will get its path slightly shifted as its start control parameter will reflect the previous end control parameters instead of being "null", ie. at the previous end position
- if a command type `t|T` doesn't follow a command which has the same "parent" type, ie. a quadratic bézier curve, it will be rendered flat as it will only have its endpoint parameters, which is not enough to draw a curve

Another fact is that a `s|S` command type is usable independently but `t|T` is not.

Heuristic facts:

- total of transformed types: 15
- types using [x, y] for their start control point: 8/15 (uppercase or lowercase l, h, v, s*, t*)
- types using [draw.x ? draw.x + x : x, draw.y ? draw.y + y : y] for their end control point: 5/15 (l, h, v, s, c)
- types using [draw.x + x, draw.y + y] for their end position point: 6/15 (l, h, v, s, c, a)
