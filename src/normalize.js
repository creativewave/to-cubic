
import Maybe from './lib/Maybe'
import { Segment } from './types'
import getCubicFromArc from './lib/getCubicFromArc'
import last from './lib/last'
import mapValues from './lib/mapValues'

/**
 * normalizePoints :: Number -> Definition -> Definition
 *
 * Definition => [Command]
 * Command => { type: String, points: [Point] }
 * Point => { [Parameter]: Number }
 *
 * It should return a `Definition` with a total of `Point`s equal to the given
 * `Number` for its second `Command`, by adding (cloning its) `Point`s.
 *
 * It should evenly clone its `Point`s among the initial ones.
 *
 * It should clone a `Point` using the last position `Point`: x x a  ->  a a a.
 */
export const normalizePoints = minPoints => definition => {

    const [startCommand, drawCommand, endCommand] = definition

    if (drawCommand.points.length === minPoints) {
        return definition
    }

    while (drawCommand.points.length < minPoints) {

        const clones = minPoints - drawCommand.points.length
        const delta = Math.ceil(drawCommand.points.length / clones) * Segment.c.length || Segment.c.length
        const [startControl, endControl, ...rest] = drawCommand.points

        drawCommand.points = rest.reduce(
            (points, point, index) => {
                if (index % delta === 0 && ((points.length + Segment.c.length + 1) <= minPoints)) {
                    points.push(point, point, point, point)
                    return points
                }
                points.push(point)
                return points
            },
            [startControl, endControl])
    }

    return [startCommand, drawCommand, endCommand]
}

/**
 * normalizeCommand :: Group -> [...Point] -> Command -> [...Point]
 *
 * Definition => [Command]
 * Command => { type: String, points: [Point] }
 * Point => { [Parameter]: Number }
 *
 * It should transform each `Point` from a `Command` of any type to a `C`ubic`
 * `Command` `Point`.
 *
 * Memo: specification for each transformation by `Command` type are described
 * in ./README.md.
 *
 * TODO(refactoring): with fresh eyes...
 */
export const normalizeCommand = startPoint => (points, command, commandIndex, commands) => {

    if (command.type === 'C') {
        points.push(...command.points.map(point => mapValues(point, Number)))
        return points
    }

    const type = command.type.toLowerCase()
    const SegmentLength = Segment[type].length

    for (let pointIndex = 0; pointIndex < command.points.length; pointIndex++) {

        // Last end position point (x, y)
        const { x, y } =  last(points) || startPoint
        // Last end control point (x2, y2)
        const startControl = Maybe(points[points.length - 2])
            .orElse(() => Maybe(commands[commandIndex - 1])
                .chain(({ type: previousType }) => {
                    // See ./README.md for the special case handled here.
                    switch (previousType) {
                        case 'C':
                        case 'c':
                        case 'S':
                        case 's':
                            return Maybe(type === 's' ? points[points.length - 2] : null)
                        case 'Q':
                        case 'q':
                        case 'T':
                        case 't':
                            return Maybe(type === 't' ? points[points.length - 2] : null)
                        default:
                            return Maybe()
                    }
                }))
            .map(({ x: x2, y: y2 }) => ({ x: (x * 2) - x2, y: (y * 2) - y2 }))
            .getOrElse({ x, y })

        // (First) point of the current command
        const point = mapValues(command.points[pointIndex], Number)
        // (End) point of the current command
        const position = mapValues(command.points[pointIndex + SegmentLength - 1], Number)

        switch (command.type) {
            case 'A':
                points.push(...getCubicFromArc({ x, y }, point))
                break
            case 'a':
                points.push(...getCubicFromArc({ x, y }, { ...point, x: point.x + x, y: point.y + y }))
                break
            case 'c':
                points.push(...[
                    point,
                    mapValues(command.points[pointIndex + 1], Number),
                    position,
                ].map(p => ({ x: p.x + x, y: p.y + y })))
                break
            case 'L':
                points.push({ x, y }, point, position)
                break
            case 'l':
                points.push({ x, y }, ...[point, position].map(p => ({ x: p.x + x, y: p.y + y })))
                break
            case 'H':
                points.push({ x, y }, { ...point, y }, { ...position, y })
                break
            case 'h':
                points.push({ x, y }, { x: point.x + x, y }, { x: position.x + x, y })
                break
            case 'Q':
                points.push(
                    { x: x + (2 / 3 * (point.x - x)), y: y + (2 / 3 * (point.y - y)) },
                    { x: position.x + (2 / 3 * (point.x - position.x)), y: position.y + (2 / 3 * (point.y - position.y)) },
                    position)
                break
            case 'q':
                points.push(
                    { x: x + (2 / 3 * point.x), y: y + (2 / 3 * point.y) },
                    { x: position.x + x + (2 / 3 * (point.x - position.x)), y: position.y + (y + (2 / 3 * (point.y - position.y))) },
                    { x: position.x + x, y: position.y + y })
                break
            case 'V':
                points.push({ x, y }, { ...point, x }, { ...position, x })
                break
            case 'v':
                points.push({ x, y }, { x, y: point.y + y }, { x, y: position.y + y })
                break
            case 'S':
                points.push(startControl, point, position)
                break
            case 's':
                points.push(startControl, ...[point, position].map(p => ({ x: p.x + x, y: p.y + y })))
                break
            case 'T':
                points.push(
                    startControl,
                    {
                        x: point.x > x ? point.x + (x - startControl.x) : point.x - (x - startControl.x),
                        y: point.y > y ? point.y + (y - startControl.y) : point.y - (y - startControl.y),
                    },
                    position)
                break
            case 't':
                points.push(
                    startControl,
                    {
                        x: point.x + x > x ? point.x + x + (x - startControl.x) : point.x + x - (x - startControl.x),
                        y: point.y + y > y ? point.y + y + (y - startControl.y) : point.y + y - (y - startControl.y),
                    },
                    { x: position.x + x, y: position.y + y })
                break
        }
        pointIndex += SegmentLength - 1
        continue
    }

    return points
}

/**
 * normalizeCommands :: Definition -> Definition
 *
 * Definition => [Command]
 * Command => { type: String, points: [Point] }
 * Point => { [Parameter]: Number }
 *
 * It should return a `Definition` containing its first `Command` (type `M`), a
 * `C`ubic `Command` resulting from the transformation of its initial drawing
 * `Command`s (of any type), and a `Command` with a type `z`.
 *
 * It should append a `Command` with type `z` as a last `Command` when missing.
 *
 * It should append any line `Command` that is implicitly closing the path, ie:
 *   M 0 0, H 1, V 1, z  ->  M 0 0, H 1, V 1, L 0 0, z
 */
export const normalizeCommands = ([startCommand, ...drawCommands]) => {

    const commands = []
    const startPoint = mapValues(startCommand.points[0], Number)

    if (last(drawCommands).type !== 'z') {
        drawCommands.push({ points: [], type: 'z' })
    }

    const drawPoints = drawCommands.slice(0, -1).reduce(normalizeCommand(startPoint), [])
    const lastPoint = last(drawPoints)

    if (lastPoint.x !== startPoint.x || lastPoint.y !== startPoint.y) {
        drawPoints.push(lastPoint, startPoint, startPoint)
    }

    commands.push({ points: [startPoint], type: 'M' })
    commands.push({ points: drawPoints, type: 'C' })
    commands.push({ points: [], type: 'z' })

    return commands
}

/**
 * normalize :: [Definition] -> [Definition]
 *
 * Definition => [Command]
 * Command => { type: String, points: [Point] }
 * Point => { [Parameter]: String }
 *
 * It should return a collection of `Definition`s with the same `Point`s count.
 * It should return a collection of `Definition`s with the same `Command` type
 * at respective indexes.
 *
 * The first `Command` is presumed to have a type `M` and a single `Point`.
 * The last `Command` is presumed to have a type `z` and no `Point`.
 *
 * Memo: the most efficient way to fullfill those requirements is to normalize
 * each `Command` to a single `C`ubic `Command` first (except the last and first
 * `Command`), then normalize each `Definition` to have the same `Point`s count,
 * and GreenSock seems to apply the same steps: https://greensock.com/morphSVG
 */
const normalize = definitions => {
    // Step 1 (normalize commands types) + find max total of points (step 2)
    const { definitions: normalized, minPoints } = definitions.reduce(
        ({ definitions, minPoints }, definition) => {
            const normalized = normalizeCommands(definition)
            if (normalized[1].points.length > minPoints) {
                minPoints = normalized[1].points.length
            }
            definitions.push(normalized)
            return { definitions, minPoints }
        },
        { definitions: [], minPoints: 0 })
    // Step 2 (normalize total of points)
    return normalized.map(normalizePoints(minPoints))
}

export default normalize
