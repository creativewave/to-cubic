/**
 * Internet Systems Consortium license
 * ===================================
 *
 * Copyright (c) `2017`, `Colin Meinke`
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose
 * with or without fee is hereby granted, provided that the above copyright notice
 * and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
 * OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
 * TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
 * THIS SOFTWARE.
 */
/**
 * https://github.com/colinmeinke/svg-arc-to-cubic-bezier/
 *
 * Notice: the original file has been modified to
 *
 * 1. be annotated with the implementation notes from the specification to make
 * a "conversion from endpoint to center parameterization"
 * 2. use the names defined in the specification for arc endpoints parameters,
 * as functions parameters names
 * 3. receive the previous position `Point` as a separate argument
 * 4. return each cubic command `Point` as `{ x: Number, y: Number }` instead of
 * `[Number, Number]`
 * 5. adapt some coding style
 */

const TAU = Math.PI * 2

const mapToEllipse = ({ control: { x, y }, rx, ry, cosphi, sinphi, cx, cy }) => {

    x *= rx
    y *= ry

    const xp = cosphi * x - sinphi * y
    const yp = sinphi * x + cosphi * y

    return { x: xp + cx, y: yp + cy }
}

const approxUnitArc = (ang1, ang2) => {
    // See http://spencermortensen.com/articles/bezier-circle/ for the derivation
    // of this constant.
    // Note: We need to keep the sign of ang2, because this determines the
    //       direction of the arc using the sweep-flag parameter.
    const c = 0.551915024494 * (ang2 < 0 ? -1 : 1)

    const x1 = Math.cos(ang1)
    const y1 = Math.sin(ang1)
    const x2 = Math.cos(ang1 + ang2)
    const y2 = Math.sin(ang1 + ang2)

    return [
        { x: x1 - y1 * c, y: y1 + x1 * c },
        { x: x2 + y2 * c, y: y2 - x2 * c },
        { x: x2, y: y2 },
    ]
}

const vectorAngle = (ux, uy, vx, vy) => {

    const sign = (ux * vy - uy * vx < 0) ? -1 : 1
    const umag = Math.sqrt(ux * ux + uy * uy)
    const vmag = Math.sqrt(ux * ux + uy * uy)
    const dot = ux * vx + uy * vy

    let div = dot / (umag * vmag)

    if (div > 1) {
        div = 1
    }

    if (div < -1) {
        div = -1
    }

    return sign * Math.acos(div)
}

/**
 * getArcCenter :: [ArcPoint] => [CenterPoint, Angle]
 *
 * CenterPoint => { cx: Number, cy: Number }
 * Angle => { start: Number, diff: Number }
 *
 * It should return "`cx`, `cy`, `θ1`, `Δθ`" "given the following variables:
 * `x1`, `y1`, `x2`, `y2`, `fA`, `fS`, `rx`, `ry`, `φ`".
 *
 * It shound return the arc `CenterPoint`, its start `Angle` and the difference
 * between its start and end `Angle`s, given a collection of `ArcPoint`s.
 */
const getArcCenter = ({ fA, rx, ry, fS, x1, y1, x2, y2, sinphi, cosphi, x1p, y1p }) => {

    // Step 1 (next part): compute (x1′, y1′)
    const rxsq = Math.pow(rx, 2)
    const rysq = Math.pow(ry, 2)
    const x1psq = Math.pow(x1p, 2)
    const y1psq = Math.pow(y1p, 2)

    let radicant = (rxsq * rysq) - (rxsq * y1psq) - (rysq * x1psq)

    if (radicant < 0) {
        radicant = 0
    }

    radicant /= (rxsq * y1psq) + (rysq * x1psq)
    radicant = Math.sqrt(radicant) * (fA === fS ? -1 : 1)

    // Step 2: compute (cx′, cy′)
    const centerXp = radicant * rx / ry * y1p
    const centerYp = radicant * -ry / rx * x1p

    // Step 3: compute (cx, cy) from (cx′, cy′)
    const centerX = cosphi * centerXp - sinphi * centerYp + (x1 + x2) / 2
    const centerY = sinphi * centerXp + cosphi * centerYp + (y1 + y2) / 2

    const vx1 = (x1p - centerXp) / rx
    const vy1 = (y1p - centerYp) / ry
    const vx2 = (-x1p - centerXp) / rx
    const vy2 = (-y1p - centerYp) / ry

    let ang1 = vectorAngle(1, 0, vx1, vy1)
    let ang2 = vectorAngle(vx1, vy1, vx2, vy2)

    if (fS === 0 && ang2 > 0) {
        ang2 -= TAU
    }

    if (fS === 1 && ang2 < 0) {
        ang2 += TAU
    }

    return [{ cx: centerX, cy: centerY }, { start: ang1, diff: ang2 }]
}

/**
 * getCubicFromArc :: Point -> [ArcPoint] -> [Point]
 *
 * ArcPoint :: { [EndpointParameterName]: Number }
 * Point :: { x: Number, y: Number }
 */
const getCubicFromArc = ({ x: x1, y: y1 }, { rx, ry, angle, fA, fS, x: x2, y: y2 }) => {

    const curves = []

    if (rx === 0 || ry === 0) {
        return []
    }

    // Step 1: compute (x1′, y1′)
    const sinphi = Math.sin(angle * TAU / 360)
    const cosphi = Math.cos(angle * TAU / 360)
    const x1p = cosphi * (x1 - x2) / 2 + sinphi * (y1 - y2) / 2
    const y1p = -sinphi * (x1 - x2) / 2 + cosphi * (y1 - y2) / 2

    if (x1p === 0 && y1p === 0) {
        return []
    }

    rx = Math.abs(rx)
    ry = Math.abs(ry)

    const lambda = Math.pow(x1p, 2) / Math.pow(rx, 2)
                 + Math.pow(y1p, 2) / Math.pow(ry, 2)

    if (lambda > 1) {
        rx *= Math.sqrt(lambda)
        ry *= Math.sqrt(lambda)
    }

    // Step 2-4 (next steps are in `getArcCenter`)
    let [{ cx, cy }, { start, diff }] = getArcCenter({ x1, y1, x2, y2, rx, ry, fA, fS, sinphi, cosphi, x1p, y1p })

    // Note: this is where numbers get wrong (imho)...
    // If 'diff' == 90.0000000001, then `ratio` will evaluate to 1.0000000001.
    // This causes `segments` to be greater than one, which is an unecessary
    // split, and adds extra points to the bezier curve. To alleviate this,
    // ratio is rounded to 1.0 when close to 1.0.
    let ratio = Math.abs(diff) / (TAU / 4)
    if (Math.abs(1.0 - ratio) < 0.0000001) {
        ratio = 1.0
    }
    const segments = Math.max(Math.ceil(ratio), 1)
    diff /= segments
    for (let i = 0; i < segments; i++) {
        curves.push(approxUnitArc(start, diff))
        start += diff
    }

    return curves.reduce((points, curve) => {

        const { x: x1, y: y1 } = mapToEllipse({ control: curve[0], rx, ry, cosphi, sinphi, cx, cy })
        const { x: x2, y: y2 } = mapToEllipse({ control: curve[1], rx, ry, cosphi, sinphi, cx, cy })
        const { x, y } = mapToEllipse({ control: curve[2], rx, ry, cosphi, sinphi, cx, cy })

        points.push({ x: x1, y: y1 }, { x: x2, y: y2 }, { x, y })

        return points
    }, [])
}

export default getCubicFromArc
