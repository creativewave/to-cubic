
import Maybe from './lib/Maybe'
import { Point } from './types'
import last from './lib/last'

/**
 * parseDefinition :: String -> Definition
 *
 * Definition => [Command]
 * Command => { type: String, points: [Point] }
 * Point => { [Parameter]: String }
 *
 * It should return a collection of `Command`s given a `String` representing the
 * `d`efinition attribute of an SVG `<path>`.
 */
export const parseDefinition = definition => {
    let hasBreak = false
    return [...definition].reduce(
        (commands, char) => {
            // Breaking char
            if (/[,\n\r\s\t]/i.test(char)) {
                hasBreak = true
                return commands
            }
            // New command
            if (/[a-z]/i.test(char)) {
                commands.push({ points: [], type: char })
                return commands
            }
            const command = last(commands)
            const point = last(command.points)
            const Params = Point[command.type.toLowerCase()]
            const { currentParam, isNewParamChar, isNewSegmentChar, nextParam } = Maybe(point)
                .map(point => {
                    const currentParamsLength = Object.keys(point).length
                    const currentParamIndex = currentParamsLength - 1
                    let isNewParamChar = hasBreak
                    if (char === '-') {
                        isNewParamChar = true
                    } else if (char === '.' && point[Params[currentParamIndex]].includes('.')) {
                        isNewParamChar = true
                        char = '0.'
                    } else if (command.type.toLowerCase() === 'a'
                        && (currentParamIndex === 3 || currentParamIndex === 4)) {
                        isNewParamChar = true
                    }
                    return {
                        char,
                        currentParam: Params[currentParamIndex],
                        isNewParamChar,
                        isNewSegmentChar: isNewParamChar && ((currentParamsLength % Params.length) === 0),
                        nextParam: Params[currentParamIndex + 1],
                    }
                })
                .getOrElse({ currentParam: Params[0], isNewParamChar: false, isNewSegmentChar: true })
            hasBreak = false
            // New segment (set char as the first character of the first parameter of a new point)
            if (isNewSegmentChar) {
                command.points.push({ [Params[0]]: char })
                return commands
            }
            // New parameter (set char as the first character of a new parameter in the current point)
            if (isNewParamChar) {
                point[nextParam] = char
                return commands
            }
            // New character (concat char to the current parameter of the current point)
            point[currentParam] += char
            return commands
        },
        [])
}

/**
 * parse :: [String] -> [Definition]
 */
const parse = definitions => definitions.map(parseDefinition)

export default parse
