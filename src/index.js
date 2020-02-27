
import normalize from './normalize'
import parse from './parse'
import serialize from './serialize'

export default definitions => serialize(normalize(parse(definitions)))
