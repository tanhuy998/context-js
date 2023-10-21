const ContextHandler = require('../handler/constextHandler.js');

module.exports = class HandlerKind {

    static get FUNCTION() {

        return 1;
    }

    static get ES6_CLASS() {

        return 2;
    }

    static get REGULAR() {

        return 3;
    }

    static isES6Class(_unknown) {

        return _unknown.toString().match(/^class.+\{|function.+\{.*\s*_classCallCheck/)
    }

    static classify(_unknown) {
        
        if (typeof _unknown !== 'function') {

            throw new TypeError('handler passed to phases must be type of function');
        }
        
        if (_unknown.prototype instanceof ContextHandler) {

            return this.REGULAR;
        }

        if (this.isES6Class(_unknown)) {

            if (typeof _unknown.prototype.handle === 'function') {

                return this.ES6_CLASS;
            }
            
            else {

                throw new Error(`class [${_unknown.name}] is missing handle() method`);
            }
        }

        return this.FUNCTION;
    }

    constructor() {

        throw new Error('instantiating this class is not allowed');
    }
}