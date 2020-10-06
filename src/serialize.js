
/**
 * serializeCommand :: Definition -> String
 *
 * Definition => [Command]
 * Command => { type: String, points: [Point] }
 * Point => { [Parameter]: Number }
 */
export const serializeCommands = commands => commands
    .slice(0, -1)
    .reduce((d, { type, points }) => {
        const firstPoint = `${points[0].x}${points[0].y < 0 ? '' : ' '}${points[0].y}`
        return `${d}${type}${points.slice(1).reduce(
            (point, { x, y }) =>
                `${point}${x < 0 ? '' : ' '}${x}${y < 0 ? '' : ' '}${y}`,
            `${firstPoint}`)}`
    }, '')
    .concat('z')

/**
 * serialize :: [Definition] -> [String]
 */
const serialize = definitions => definitions.map(serializeCommands)

export default serialize
