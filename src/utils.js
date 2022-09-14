const toKebabCase = (val) => {
    return val.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

const hasProperty = (target, key) => {
    return Object.prototype.hasOwnProperty.call(target, key);
};

module.exports = {
    toKebabCase,
    hasProperty
};