
import { Group } from './types'
import Maybe from './lib/Maybe'
import last from './lib/last'

/**
 * parseDefinition :: String -> Definition
 *
 * Definition => [Command]
 * Command => { type: String, points: [...Point] }
 * Point => [Group]
 * Group => { [Parameter]: String }
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
            const group = last(command.points)
            const Params = Group[command.type.toLowerCase()]
            const { currentParam, isNewGroupChar, isNewParamChar, nextParam } = Maybe(group)
                .map(group => {
                    const currentParamsLength = Object.keys(group).length
                    const currentParamIndex = currentParamsLength - 1
                    let isNewParamChar = hasBreak
                    if (char === '-') {
                        isNewParamChar = true
                    } else if (char === '.' && group[Params[currentParamIndex]].includes('.')) {
                        isNewParamChar = true
                        char = '0.'
                    } else if (
                        command.type.toLowerCase() === 'a'
                        && (char === '0' || char === '1')
                        && (currentParamIndex === 3 || currentParamIndex === 4)) {
                        isNewParamChar = true
                    }
                    return {
                        char,
                        currentParam: Params[currentParamIndex],
                        isNewGroupChar: isNewParamChar && ((currentParamsLength % Params.length) === 0),
                        isNewParamChar,
                        nextParam: Params[currentParamIndex + 1],
                    }
                })
                .getOrElse({ currentParam: Params[0], isNewGroupChar: true, isNewParamChar: false })
            hasBreak = false
            // New group (set char as the first character of the first parameter of a new group)
            if (isNewGroupChar) {
                command.points.push({ [Params[0]]: char })
                return commands
            }
            // New parameter (set char as the first character of the next parameter of the current group)
            if (isNewParamChar) {
                group[nextParam] = char
                return commands
            }
            // New character (concat the next character of the current parameter of the current group)
            group[currentParam] += char
            return commands
        },
        [])
}

/**
 * parse :: [String] -> [Definition]
 */
const parse = definitions => definitions.map(parseDefinition)

export default parse
