
[![CircleCI](https://circleci.com/gh/creativewave/to-cubic.svg?style=svg)](https://circleci.com/gh/creativewave/to-cubic)

# to-cubic

1. [About](#about)
2. [Installation](#installation)
3. [Usage](#usage)

## About

`to-cubic` transforms the `d`efinition of multiple SVG `<path>`s in order that they all use cubic commands and the same number of commands.

**Demo:** [CodePen](https://codepen.io/creative-wave/pen/qBBWdQO).

This is required to animate between definitions:

> Path data animation is only possible when each path data specification within an animation specification has exactly the same list of path data commands as the `d` attribute.

[Current recommandation](https://www.w3.org/TR/SVG11/paths.html#DAttribute).

> For animation, two `d` property values can only be interpolated smoothly when the path data strings contain have the same structure, (i.e. exactly the same number and types of path data commands which are in the same order).

[Candidate recommandation](https://svgwg.org/svg2-draft/paths.html#DProperty).

This as an alternative to the [GreenSock morphSVG plugin](https://greensock.com/morphSVG), which is not free but has some extra features.

All command types are supported – `m`, `l`, `h`, `v`, `s`, `c`, `q`, `t`, `a`, `z` – either relative (lowercase) or absolute (uppercase). The only rule is that a definition should not include a moving command (`m` or `M`) that is not the first command.

## Installation

```shell
  npm i @cdoublev/to-cubic
```

## Usage

**With npx (LTS or current NodeJS version):**

```shell
npx to-cubic [-r|--round <precision>] <input.(c|m)?js> [output.txt]
```

Depending on its extension (and/or your `package.json`), the first argument should be a path to an input file that exports your path defintions, either as an ES or a CommonJS module:

```js
export default ['M...', 'M...']
// Or (CommonJS): module.exports = ['M...', 'M...']
```

If the second argument isn't provided, the transformed definitions will be forwarded to the standard output, otherwise they will be saved in the correspond path:

```txt
M...
M...
```

**With import/require:**

```js
    import toCubic from '@cdoublev/to-cubic'
    // Or (CommonJS): const toCubic = require('@cdoublev/to-cubic')

    const path = document.getElementById('my-path')
    const precision = 4
    const [from, to] = toCubic([
        'M0 0h10v10H0z',
        'M5 0A5 5 0 0 0 10 5A5 5 0 0 0 5 10A5 5 0 0 0 0 5A5 5 0 0 0 5 0z',
    ], 4)

    // Animate from square to circle in 2s (using the Web Animation API)
    path.animate({ d: [`path('${from}')`, `path('${to}')`] }, 2000)
```

## TODO

- Performances: measure performances of each processing task
