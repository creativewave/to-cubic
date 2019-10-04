
import normalize from './normalize'
import parse from './parse'
import serialize from './serialize'

export const toCubic = definitions => serialize(normalize(parse(definitions)))

export default toCubic
