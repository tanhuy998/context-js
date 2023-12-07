const isES6Class = require('../../utils/isES6Class.js');
const ContextHandler = require('../handler/contextHandler.js');
const ErrorHandler = require('../handler/errorHandler.js');
const isPipeline = require('./isPipeline.js');

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

    static get PIPELINE() {

        return 4;
    }

    static get ERROR_HANDLER() {

        return 5;
    }
    

    static classify(_unknown) {
        
        if (typeof _unknown !== 'function') {

            if (isPipeline(_unknown)) {

                return this.PIPELINE;
            }

            throw new TypeError('handler passed to phases must be type of function');
        }
        
        if (_unknown.prototype instanceof ErrorHandler) {

            return this.ERROR_HANDLER;
        }
        else if (_unknown.prototype instanceof ContextHandler) {

            return this.REGULAR;
        }

        if (isES6Class(_unknown)) {

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