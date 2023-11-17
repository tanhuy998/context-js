const matchType = require("reflectype/src/libs/matchType.js");
const ContextLockable = require("../lockable/contextLockable.js");
const {EventEmitter} = require('node:events');
const { OCCUR_ERROR, NO_ERROR, EXCEPTION } = require("./constant.js");
const ComponentCategory = require("../category/componentCategory.js");
const ContextExceptionErrorCategory = require("./contextExceptionErrorCategory.js");

/**
 * ErrorCollector collect error of a specific function.
 */
module.exports = class ErrorCollector extends ContextExceptionErrorCategory {

    #event = new EventEmitter();

    get exceptions() {

        return this.categories.get(EXCEPTION);
    }

    get isSelective() {

        return this.categories.size > 1;
    }

    constructor(_context) {

        super(_context);

        this.#init();
    }

    #init() {

        //this.categories.set(EXCEPTION, new Set());
    }

    /**
     * 
     * @returns {boolean}
     */
    match(_error) {

        if (!this.isSelective) {
            
            return true;
        }

        const matchExcepError = this.#matchExceptError(_error);

        if (matchExcepError) {

            return false;
        }


       for (const field of this.categories.keys()) {

            if (field === EXCEPTION) {

                continue;
            }

            if (this._check(_error, field)) {

                return field;
            }
       }
    }

    #matchExceptError(_error) {

        return this._check(_error, EXCEPTION);
    }

    /**
     * 
     * @param {any} error 
     */
    #handlerError(err, collectArgs = []) {

        if (!this.isSelective) {

            throw _error;
        }

        this.#event.emit(OCCUR_ERROR, err, collectArgs);
    }

    #handleResult(result, collectArgs = []) {

        this.#event.emit(NO_ERROR, result, collectArgs);
    }
 
    /**
     * 
     * @param {Function} _func 
     */
    collect(_func, {thisContext, args}) {

        if (typeof _func !== 'function') {

            return;
        }

        try {

            const funcResult = _func.call(thisContext, ...(args ?? []));

            if (funcResult instanceof Promise) {

                return funcResult.then((function(result) {

                    this.#handleResult(result, args);

                }).bind(this))
                .catch((function(error) {

                    this.#handlerError(error, args);

                }).bind(this));
            }
            else {

                return this.#handleResult(funcResult, args);
            }
        }
        catch (err) {

            return this.#handlerError(err, args);
        }
    }

    /**
     * 
     * @param {string} _field 
     * @param {any} _type 
     */
    registerError(_type, _field = 'default') {

        this.add(_field, _type);
    }

    whenErrorOccur(_func) {

        this.#event.on(OCCUR_ERROR, _func);
    }

    whenNoError(_func) {

        this.#event.on(NO_ERROR, _func);
    }
}