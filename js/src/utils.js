/**
 * Sets a variable to a default value if undefined.
 * @param {*} variable Variable to check.
 * @param {*} defaultValue Default value.
 * @returns Returns the default value if the variable is undefined, hte variable itself if not.
 */
const toDefaultIfUndefined = (variable, defaultValue) => {
    return (typeof variable === 'undefined' ? defaultValue : variable);
}

/**
 * Constrains a variable into a [min, max] interval.
 * @param {*} value Input value.
 * @param {*} min Min value.
 * @param {*} max Max value.
 * @returns 
 */
const constrain = (value, min, max) => {
    return value > max ? max : (value < min ? min : value);
}