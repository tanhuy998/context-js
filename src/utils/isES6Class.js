function isES6Class(_unknown) {

    return _unknown.toString().match(/^class.+\{|function.+\{.*\s*_classCallCheck/)
}

module.exports = isES6Class;