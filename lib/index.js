
import normalize from './normalize.js'
import parse from './parse.js'
import serialize from './serialize.js'

export default (definitions, precision) => serialize(normalize(parse(definitions)), precision)
