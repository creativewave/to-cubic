
/**
 * getFormattedPoint :: (Point -> Boolean) -> String
 */
const getFormattedPoint = ({ x, y }, isFirstPoint = false) =>
    `${(x < 0 || isFirstPoint) ? '' : ' '}${x}${y < 0 ? '' : ' '}${y}`

/**
 * serializeCommand :: Definition -> String
 *
 * Definition => [Command]
 * Command => { type: String, points: [Point] }
 * Point => { [Parameter]: Number }
 */
export const serializeCommands = commands => commands
    .slice(1)
    .reduce(
        (d, { type, points }) => `${d}${type}${points.reduce(
            (segment, point, index) => `${segment}${getFormattedPoint(point, index === 0)}`,
            '')}`,
        `M${getFormattedPoint(commands[0].points[0], true)}`)

/**
 * serialize :: [Definition] -> [String]
 */
const serialize = definitions => definitions.map(serializeCommands)

export default serialize
