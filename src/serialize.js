
import round from './lib/round.js'

/**
 * getFormattedPoint :: (Point -> Number|void -> Boolean) -> String
 */
const getFormattedPoint = ({ x, y }, precision, isFirstPoint) =>
    `${(x < 0 || isFirstPoint) ? '' : ' '}${round(precision, x)}${y < 0 ? '' : ' '}${round(precision, y)}`

/**
 * serializeCommand :: Definition -> String
 *
 * Definition => [Command]
 * Command => { type: String, points: [Point] }
 * Point => { [Parameter]: Number }
 */
export const serializeCommands = precision => commands => commands
    .slice(1)
    .reduce(
        (d, { type, points }) => `${d}${type}${points.reduce(
            (segment, point, index) => `${segment}${getFormattedPoint(point, precision, index === 0)}`,
            '')}`,
        `M${getFormattedPoint(commands[0].points[0], precision, true)}`)

/**
 * serialize :: [Definition] -> [String]
 */
const serialize = (definitions, precision) => definitions.map(serializeCommands(precision))

export default serialize
