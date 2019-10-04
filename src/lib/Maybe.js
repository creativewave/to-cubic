
/**
 * Maybe :: a -> Maybe a
 */
const Maybe = a => {
    const isNothing = a === null || a === undefined
    const maybe = {
        chain(fn) {
            return isNothing ? maybe : fn(a)
        },
        getOrElse(b) {
            return isNothing ? b : a
        },
        map(fn) {
            return isNothing ? maybe : Maybe(fn(a))
        },
        orElse(fn) {
            return isNothing ? fn() : maybe
        },
    }
    return maybe
}

export default Maybe
