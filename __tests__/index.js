
// eslint-disable-next-line node/no-extraneous-import
import { describe, expect, it } from '@jest/globals'
import normalize, { normalizeTypes } from '../src/normalize'
import { parseDefinition } from '../src/parse'
import { serializeCommands } from '../src/serialize'

/**
 * Debug all command types with:
 * <svg viewBox="0 0 4 4">
 *   <path d="M0 2 <initial-type> <...initial-points> z" fill="#ff000033" />
 *   <path d="M0 2 C <...normalized-points> z"           fill="#ff000033" />
 * </svg>
 */

/* eslint-disable array-element-newline */
const commands = {
    A: {
        normalized: {
            points: [
                { x: 0, y: 3.54 }, { x: 1.67, y: 4.5 }, { x: 3, y: 3.73 },
                { x: 3.62, y: 3.37 }, { x: 4, y: 2.71 }, { x: 4, y: 2 },
                { x: 4, y: 0.46 }, { x: 2.33, y: -0.5 }, { x: 1, y: 0.27 },
                { x: 0.38, y: 0.63 }, { x: 0, y: 1.29 }, { x: 0, y: 2 },
            ],
            type: 'C',
        },
        parsed: {
            points: [
                { angle: '0', fA: '1', fS: '0', rx: '2', ry: '2', x: '4', y: '2' },
                { angle: '0', fA: '1', fS: '0', rx: '2', ry: '2', x: '0', y: '2' },
            ],
            type: 'A',
        },
        raw: 'A2 2 0 10 4 2 2 2 0 1 0 0 2',
    },
    C: {
        normalized: {
            points: [
                { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 },
                { x: 3, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 },
                { x: 4, y: 2 }, { x: 0, y: 2 }, { x: 0, y: 2 },
            ],
            type: 'C',
        },
        parsed: {
            points: [
                { x: '0', y: '1' }, { x: '1', y: '0' }, { x: '2', y: '0' },
                { x: '3', y: '0' }, { x: '4', y: '1' }, { x: '4', y: '2' },
            ],
            type: 'C',
        },
        raw: 'C0 1 1 0 2 0 3 0 4 1 4 2',
    },
    H: {
        normalized: {
            points: [
                { x: 0, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 2 },
                { x: 2, y: 2 }, { x: 4, y: 2 }, { x: 4, y: 2 },
                { x: 4, y: 2 }, { x: 0, y: 2 }, { x: 0, y: 2 },
            ],
            type: 'C',
        },
        parsed: {
            points: [{ x: '2' }, { x: '4' }],
            type: 'H',
        },
        raw: 'H2 4',
    },
    L: {
        normalized: {
            points: [
                { x: 0, y: 2 }, { x: 4, y: 0 }, { x: 4, y: 0 },
                { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 4, y: 4 },
                { x: 4, y: 4 }, { x: 0, y: 2 }, { x: 0, y: 2 },
            ],
            type: 'C',
        },
        parsed: {
            points: [{ x: '4', y: '0' }, { x: '4', y: '4' }],
            type: 'L',
        },
        raw: 'L4 0 4 4',
    },
    M: {
        normalized: { points: [{ x: 0, y: 2 }], type: 'M' },
        parsed: { points: [{ x: '0', y: '2' }], type: 'M' },
        raw: 'M0 2',
    },
    Q: {
        normalized: {
            points: [
                { x: 0 + ((2 / 3) * (1 - 0)), y: 2 + ((2 / 3) * (0 - 2)) },
                { x: 2 + ((2 / 3) * (1 - 2)), y: 2 + ((2 / 3) * (0 - 2)) },
                { x: 2, y: 2 },
                { x: 2 + ((2 / 3) * (3 - 2)), y: 2 + ((2 / 3) * (0 - 2)) },
                { x: 4 + ((2 / 3) * (3 - 4)), y: 2 + ((2 / 3) * (0 - 2)) },
                { x: 4, y: 2 },
                { x: 4, y: 2 }, { x: 0, y: 2 }, { x: 0, y: 2 },
            ],
            type: 'C',
        },
        parsed: { points: [{ x: '1', y: '0' }, { x: '2', y: '2' }, { x: '3', y: '0' }, { x: '4', y: '2' }], type: 'Q' },
        raw: 'Q1 0 2 2 3 0 4 2',
    },
    S: {
        normalized: {
            points: [
                { x: 0, y: 2 }, { x: 0, y: 0 }, { x: 2, y: 0 },
                { x: 4, y: 0 }, { x: 4, y: 2 }, { x: 4, y: 2 },
                { x: 4, y: 2 }, { x: 0, y: 2 }, { x: 0, y: 2 },
            ],
            type: 'C',
        },
        parsed: {
            points: [{ x: '0', y: '0' }, { x: '2', y: '0' }, { x: '4', y: '2' }, { x: '4', y: '2' }],
            type: 'S',
        },
        raw: 'S0 0 2 0 4 2 4 2',
    },
    T: {
        /**
         * normalized :: void -> Command
         *
         * Memo: a getter is used in order to keep test cases idiomatic, and to
         * use variables required to avoid false negative test result related to
         * rounding errors.
         *
         * Memo: `t|T` are pointless without a previous `q|Q` (see /README.md).
         *
         * TODO: search for some "official" maths to convert T to C.
         */
        get normalized() {
            const [Q1, { x: Qx2, y: Qy2 }, { x: Qx, y: Qy }] = [
                { x: 0 + ((2 / 3) * (1 - 0)), y: 2 + ((2 / 3) * (0 - 2)) },
                { x: 2 + ((2 / 3) * (1 - 2)), y: 2 + ((2 / 3) * (0 - 2)) },
                { x: 2, y: 2 },
            ] // = commands.Q.normalized.points.slice(0, 3)
            const T1x2 = 4 > Qx ? 4 + (Qx - (4 - Qx2)) : 4 - (Qx - (4 - Qx2))
            const T1y2 = 2 > Qy ? 2 + (Qy - (4 - Qy2)) : 2 - (Qy - (4 - Qy2))
            const T2x2 = 6 + (4 - (8 - T1x2))
            const T2y2 = 2 - (2 - (4 - T1y2))

            return {
                points: [
                    Q1, { x: Qx2, y: Qy2 }, { x: Qx, y: Qy },
                    { x: 4 - Qx2, y: 4 - Qy2 }, { x: T1x2, y: T1y2 }, { x: 4, y: 2 },
                    { x: 8 - T1x2, y: 4 - T1y2 }, { x: T2x2, y: T2y2 }, { x: 6, y: 2 },
                    { x: 6, y: 2 }, { x: 0, y: 2 }, { x: 0, y: 2 },
                ],
                type: 'C',
            }
        },
        parsed: { points: [{ x: '4', y: '2' }, { x: '6', y: '2' }], type: 'T' },
        raw: 'T4 2 6 2',
    },
    V: {
        normalized: {
            points: [
                { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 3 },
                { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 0, y: 4 },
                { x: 0, y: 4 }, { x: 0, y: 2 }, { x: 0, y: 2 },
            ],
            type: 'C',
        },
        parsed: {
            points: [{ y: '3' }, { y: '4' }],
            type: 'V',
        },
        raw: 'V3 4',
    },
    z: {
        normalized: { points: [], type: 'z' },
        parsed: { points: [], type: 'z' },
        raw: 'z',
    },
}
const shapes = {
    // 10 position points
    clover: {
        normalized: [
            { points: [{ x: 8, y: 5 }], type: 'M' },
            {
                points: [
                    { x: 9.32, y: 4.22 }, { x: 9.3, y: 2.29 }, { x: 7.96, y: 1.54 },
                    { x: 6.73, y: 0.85 }, { x: 5.2, y: 1.61 }, { x: 5, y: 3 },
                    { x: 5, y: 1.46 }, { x: 3.33, y: 0.5 }, { x: 2, y: 1.27 },
                    { x: 0.67, y: 2.04 }, { x: 0.67, y: 3.96 }, { x: 2, y: 4.73 },
                    { x: 2.3, y: 4.91 }, { x: 2.65, y: 5 }, { x: 3, y: 5 },
                    { x: 0.82, y: 4.23 }, { x: -1.37, y: 6.11 }, { x: -0.94, y: 8.38 },
                    { x: -0.52, y: 10.65 }, { x: 2.21, y: 11.61 }, { x: 3.96, y: 10.11 },
                    { x: 4.58, y: 9.58 }, { x: 4.95, y: 8.81 }, { x: 5, y: 8 },
                    { x: 6.15, y: 9.15 }, { x: 8.13, y: 8.63 }, { x: 8.55, y: 7.05 },
                    { x: 8.75, y: 6.32 }, { x: 8.54, y: 5.54 }, { x: 8, y: 5 },
                ],
                type: 'C',
            },
            { points: [], type: 'z' },
        ],
        parsed: [
            { points: [{ x: '8', y: '5' }], type: 'M' },
            {
                points: [
                    { angle: '0', fA: '1', fS: '0', rx: '2', ry: '2', x: '-3', y: '-2' },
                    { angle: '0', fA: '1', fS: '0', rx: '2', ry: '2', x: '-2', y: '2' },
                    { angle: '0', fA: '1', fS: '0', rx: '3', ry: '3', x: '2', y: '3' },
                    { angle: '0', fA: '1', fS: '0', rx: '2', ry: '2', x: '3', y: '-3' },
                ],
                type: 'a',
            },
            { points: [], type: 'z' },
        ],
        raw: 'M8 5a2 2 0 1 0-3-2 2 2 0 1 0-2 2 3 3 0 1 0 2 3 2 2 0 1 0 3-3z',
    },
    // 8 position points (including 1 implicite closing line command)
    hexagon: {
        normalized: [
            { points: [{ x: 3, y: 10 }], type: 'M' },
            {
                points: [
                    { x: 3, y: 10 }, { x: 0, y: 7 }, { x: 0, y: 7 },
                    { x: 0, y: 7 }, { x: 0, y: 7 }, { x: 0, y: 7 },
                    { x: 0, y: 7 }, { x: 0, y: 3 }, { x: 0, y: 3 },
                    { x: 0, y: 3 }, { x: 3, y: 0 }, { x: 3, y: 0 },
                    { x: 3, y: 0 }, { x: 7, y: 0 }, { x: 7, y: 0 },
                    { x: 7, y: 0 }, { x: 10, y: 3 }, { x: 10, y: 3 },
                    { x: 10, y: 3 }, { x: 10, y: 3 }, { x: 10, y: 3 },
                    { x: 10, y: 3 }, { x: 10, y: 7 }, { x: 10, y: 7 },
                    { x: 10, y: 7 }, { x: 7, y: 10 }, { x: 7, y: 10 },
                    { x: 7, y: 10 }, { x: 3, y: 10 }, { x: 3, y: 10 },
                ],
                type: 'C',
            },
            { points: [], type: 'z' },
        ],
        parsed: [
            { points: [{ x: '3', y: '10' }], type: 'M' },
            { points: [{ x: '0', y: '7' }], type: 'L' },
            { points: [{ y: '3' }], type: 'V' },
            { points: [{ x: '3', y: '-3' }], type: 'l' },
            { points: [{ x: '4' }], type: 'h' },
            { points: [{ x: '3', y: '3' }], type: 'l' },
            { points: [{ y: '4' }], type: 'v' },
            { points: [{ x: '-3', y: '3' }], type: 'l' },
            { points: [], type: 'z' },
        ],
        raw: 'M3 10L0 7V3l3-3h4l3 3v4l-3 3z',
    },
    // 10 position points (including 1 implicite closing line command)
    star: {
        normalized: [
            { points: [{ x: 5, y: 0 }], type: 'M' },
            {
                points: [
                    { x: 5, y: 0 }, { x: 7, y: 3 }, { x: 7, y: 3 },
                    { x: 7, y: 3 }, { x: 10, y: 4 }, { x: 10, y: 4 },
                    { x: 10, y: 4 }, { x: 7, y: 6 }, { x: 7, y: 6 },
                    { x: 7, y: 6 }, { x: 8, y: 10 }, { x: 8, y: 10 },
                    { x: 8, y: 10 }, { x: 5, y: 8 }, { x: 5, y: 8 },
                    { x: 5, y: 8 }, { x: 2, y: 10 }, { x: 2, y: 10 },
                    { x: 2, y: 10 }, { x: 3, y: 6 }, { x: 3, y: 6 },
                    { x: 3, y: 6 }, { x: 0, y: 4 }, { x: 0, y: 4 },
                    { x: 0, y: 4 }, { x: 3, y: 3 }, { x: 3, y: 3 },
                    { x: 3, y: 3 }, { x: 5, y: 0 }, { x: 5, y: 0 },
                ],
                type: 'C',
            },
            { points: [], type: 'z' },
        ],
        parsed: [
            { points: [{ x: '5', y: '0' }], type: 'M' },
            {
                points: [
                    { x: '2', y: '3' }, { x: '3', y: '1' }, { x: '-3', y: '2' },
                    { x: '1', y: '4' }, { x: '-3', y: '-2' }, { x: '-3', y: '2' },
                    { x: '1', y: '-4' }, { x: '-3', y: '-2' }, { x: '3', y: '-1' },
                ],
                type: 'l',
            },
            { points: [], type: 'z' },
        ],
        raw: 'M5 0l2 3 3 1-3 2 1 4-3-2-3 2 1-4-3-2 3-1z',
    },
    // 3 position points (including 1 implicite closing line command)
    triangle: {
        explicited: [
            { points: [{ x: 0, y: 0 }], type: 'M' },
            {
                points: [
                    { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 1 },
                    { x: 1, y: 1 }, { x: 2, y: 0 }, { x: 2, y: 0 },
                    { x: 2, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
                ],
                type: 'C',
            },
            { points: [], type: 'z' },
        ],
        normalized: [
            { points: [{ x: 0, y: 0 }], type: 'M' },
            {
                points: [
                    { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 1 },
                    { x: 1, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 1 },
                    { x: 1, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 1 },
                    { x: 1, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 1 },
                    { x: 1, y: 1 }, { x: 2, y: 0 }, { x: 2, y: 0 },
                    { x: 2, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 0 },
                    { x: 2, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 0 },
                    { x: 2, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
                    { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
                    { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
                ],
                type: 'C',
            },
            { points: [], type: 'z' },
        ],
        parsed: [
            { points: [{ x: '0', y: '0' }], type: 'M' },
            { points: [{ x: '1', y: '1' }], type: 'L' },
            { points: [{ x: '2', y: '0' }], type: 'L' },
            { points: [], type: 'z' },
        ],
        raw: 'M0 0L1 1L2 0z',
    },
}
/* eslint-enable array-element-newline */

describe('definition#parse()', () => {
    it('should parse a command type L', () => {

        const actual = parseDefinition(commands.L.raw)
        const expected = [commands.L.parsed]

        expect(actual).toEqual(expected)
    })
    it('should parse a command type H', () => {

        const actual = parseDefinition(commands.H.raw)
        const expected = [commands.H.parsed]

        expect(actual).toEqual(expected)
    })
    it('should parse a command type V', () => {

        const actual = parseDefinition(commands.V.raw)
        const expected = [commands.V.parsed]

        expect(actual).toEqual(expected)
    })
    it('should parse a command type C', () => {

        const actual = parseDefinition(commands.C.raw)
        const expected = [commands.C.parsed]

        expect(actual).toEqual(expected)
    })
    it('should parse a command type S', () => {

        const actual = parseDefinition(commands.S.raw)
        const expected = [commands.S.parsed]

        expect(actual).toEqual(expected)
    })
    it('should parse a command type Q', () => {

        const actual = parseDefinition(commands.Q.raw)
        const expected = [commands.Q.parsed]

        expect(actual).toEqual(expected)
    })
    it('should parse a command type T', () => {

        const actual = parseDefinition(commands.T.raw)
        const expected = [commands.T.parsed]

        expect(actual).toEqual(expected)
    })
    it('should parse a command type A', () => {

        const actual = parseDefinition(commands.A.raw)
        const expected = [commands.A.parsed]

        expect(actual).toEqual(expected)
    })
    it('should parse a <path> definition', () => {

        const actual = parseDefinition(shapes.clover.raw)
        const expected = shapes.clover.parsed

        expect(actual).toEqual(expected)
    })
    it('should parse a <path> definition with implicit 0 (eg. "1.2.3")', () => {

        const actual = parseDefinition('L1.2.3')
        const expected = [{ points: [{ x: '1.2', y: '0.3' }], type: 'L' }]

        expect(actual).toEqual(expected)
    })
    it('should parse a <path> definition with multiple consecutive spaces', () => {

        const actual = parseDefinition('L0  1  H   1')
        const expected = [{ points: [{ x: '0', y: '1' }], type: 'L' }, { points: [{ x: '1' }], type: 'H' }]

        expect(actual).toEqual(expected)
    })
})

describe('definition#normalize()', () => {
    it('should normalize command type L -> C', () => {

        const actual = normalizeTypes([commands.M.parsed, commands.L.parsed, commands.z.parsed])
        const expected = [commands.M.normalized, commands.L.normalized, commands.z.normalized]

        expect(actual).toEqual(expected)
    })
    it('should normalize command type l -> C', () => {

        const actual = normalizeTypes([
            commands.M.parsed,
            { points: [{ x: '4', y: '-2' }, { x: '0', y: '4' }], type: 'l' },
            commands.z.parsed,
        ])
        const expected = [commands.M.normalized, commands.L.normalized, commands.z.normalized]

        expect(actual).toEqual(expected)
    })
    it('should normalize command type H -> C', () => {

        const actual = normalizeTypes([commands.M.parsed, commands.H.parsed, commands.z.parsed])
        const expected = [commands.M.normalized, commands.H.normalized, commands.z.normalized]

        expect(actual).toEqual(expected)
    })
    it('should normalize command type h -> C', () => {

        const actual = normalizeTypes([
            commands.M.parsed,
            { points: [{ x: '2' }, { x: '2' }], type: 'h' },
            commands.z.parsed,
        ])
        const expected = [commands.M.normalized, commands.H.normalized, commands.z.normalized]

        expect(actual).toEqual(expected)
    })
    it('should normalize command type V -> C', () => {

        const actual = normalizeTypes([commands.M.parsed, commands.V.parsed, commands.z.parsed])
        const expected = [commands.M.normalized, commands.V.normalized, commands.z.normalized]

        expect(actual).toEqual(expected)
    })
    it('should normalize command type v -> C', () => {

        const actual = normalizeTypes([
            commands.M.parsed,
            { points: [{ y: '1' }, { y: '1' }], type: 'v' },
            commands.z.parsed,
        ])
        const expected = [commands.M.normalized, commands.V.normalized, commands.z.normalized]

        expect(actual).toEqual(expected)
    })
    it('should normalize command type c -> C', () => {

        const actual = normalizeTypes([
            commands.M.parsed,
            {
                points: [
                    { x: '0', y: '-1' },
                    { x: '1', y: '-2' },
                    { x: '2', y: '-2' },
                    { x: '1', y: '0' },
                    { x: '2', y: '1' },
                    { x: '2', y: '2' },
                ],
                type: 'c',
            },
            commands.z.parsed,
        ])
        const expected = [commands.M.normalized, commands.C.normalized, commands.z.normalized]

        expect(actual).toEqual(expected)
    })
    it('should normalize command type S -> C', () => {

        const actual = normalizeTypes([commands.M.parsed, commands.S.parsed, commands.z.parsed])
        const expected = [commands.M.normalized, commands.S.normalized, commands.z.normalized]

        expect(actual).toEqual(expected)
    })
    it('should normalize command type s -> C', () => {

        const actual = normalizeTypes([
            commands.M.parsed,
            { points: [{ x: '0', y: '-2' }, { x: '2', y: '-2' }, { x: '2', y: '2' }, { x: '2', y: '2' }], type: 's' },
            commands.z.parsed,
        ])
        const expected = [commands.M.normalized, commands.S.normalized, commands.z.normalized]

        expect(actual).toEqual(expected)
    })
    it('should normalize command type Q -> C', () => {

        const actual = normalizeTypes([commands.M.parsed, commands.Q.parsed, commands.z.parsed])
        const expected = [commands.M.normalized, commands.Q.normalized, commands.z.normalized]

        expect(actual).toEqual(expected)
    })
    it('should normalize command type q -> C', () => {

        const actual = normalizeTypes([
            commands.M.parsed,
            { points: [{ x: '1', y: '-2' }, { x: '2', y: '0' }, { x: '1', y: '-2' }, { x: '2', y: '0' }], type: 'q' },
            commands.z.parsed,
        ])
        const expected = [commands.M.normalized, commands.Q.normalized, commands.z.normalized]

        expect(actual).toEqual(expected)
    })
    it('should normalize command type T -> C', () => {

        const actual = normalizeTypes([
            commands.M.parsed,
            { points: commands.Q.parsed.points.slice(0, 2), type: 'Q' },
            commands.T.parsed,
            commands.z.parsed,
        ])
        const expected = [commands.M.normalized, commands.T.normalized, commands.z.normalized]

        expect(actual).toEqual(expected)
    })
    it('should normalize command type t -> C', () => {

        const actual = normalizeTypes([
            commands.M.parsed,
            { points: commands.Q.parsed.points.slice(0, 2), type: 'Q' },
            { points: [{ x: '2', y: '0' }, { x: '2', y: '0' }], type: 't' },
            commands.z.parsed,
        ])
        const expected = [commands.M.normalized, commands.T.normalized, commands.z.normalized]

        expect(actual).toEqual(expected)
    })
    it('should normalize command type A -> C', () => {

        const actual = normalizeTypes([commands.M.parsed, commands.A.parsed, commands.z.parsed])
        const expected = [commands.M.normalized, commands.A.normalized, commands.z.normalized]

        expect(actual).toEqual(expected)
    })
    it('should normalize command type a -> C', () => {

        const actual = normalizeTypes([
            commands.M.parsed,
            {
                points: [
                    { angle: '0', fA: '1', fS: '0', rx: '2', ry: '2', x: '4', y: '0' },
                    { angle: '0', fA: '1', fS: '0', rx: '2', ry: '2', x: '-4', y: '0' },
                ],
                type: 'a',
            },
            commands.z.parsed,
        ])
        const expected = [commands.M.normalized, commands.A.normalized, commands.z.normalized]

        expect(actual).toEqual(expected)
    })
    it('should normalize a <path> definition', () => {

        const actual = normalizeTypes(shapes.clover.parsed)
        const expected = shapes.clover.normalized

        expect(actual).toEqual(expected)
    })
    it('should normalize a <path> definition closing with an implicit line command', () => {

        const actual = normalizeTypes(shapes.triangle.parsed)
        const expected = shapes.triangle.explicited

        expect(actual).toEqual(expected)
    })
    it('should normalize a <path> definition that is not closed', () => {

        const actual = normalizeTypes([commands.M.parsed, commands.L.parsed])
        const expected = [
            commands.M.normalized,
            {
                points: [
                    { x: 0, y: 2 },
                    { x: 4, y: 0 },
                    { x: 4, y: 0 },
                    { x: 4, y: 0 },
                    { x: 4, y: 4 },
                    { x: 4, y: 4 },
                ],
                type: 'C',
            },
        ]

        expect(actual).toEqual(expected)
    })
    it('should normalize a collection of <path> definitions', () => {

        const actual = normalize(Object.values(shapes).map(shape => shape.parsed))

        Object.keys(shapes).forEach((name, shape) => {
            expect(actual[shape]).toEqual(shapes[name].normalized)
            expect(actual[shape][1].points).toHaveLength(shapes[name].normalized[1].points.length)
        })
        actual.slice(1).forEach(([, { points }]) => expect(points).toHaveLength(actual[0][1].points.length))
    })
})

describe('definition#serialize()', () => {
    it('should serialize a normalized <path> definition', () => {

        const actual = serializeCommands(shapes.clover.normalized)
        const expected = 'M8 5C9.32 4.22 9.3 2.29 7.96 1.54 6.73 0.85 5.2 1.61 5 3 5 1.46 3.33 0.5 2 1.27 0.67 2.04 0.67 3.96 2 4.73 2.3 4.91 2.65 5 3 5 0.82 4.23-1.37 6.11-0.94 8.38-0.52 10.65 2.21 11.61 3.96 10.11 4.58 9.58 4.95 8.81 5 8 6.15 9.15 8.13 8.63 8.55 7.05 8.75 6.32 8.54 5.54 8 5z'

        expect(actual).toEqual(expected)
    })
})
