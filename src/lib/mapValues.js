
/**
 * mapValues :: ({ [Prop]: b } -> (b -> c)) -> { [Prop]: c }
 *
 * Prop => String|Number|Symbol
 */
const mapValues = (obj, transform) =>
    Object.entries(obj).reduce(
        (obj, [prop, value]) => {
            obj[prop] = transform(value)
            return obj
        },
        {})

export default mapValues
