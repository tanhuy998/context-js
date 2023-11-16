const matchType = require("reflectype/src/libs/matchType.js");
const ContextLockable = require("../lockable/contextLockable.js");
const {EventEmitter} = require('node:events');
const { OCCUR_ERROR, NO_ERROR } = require("./constant.js");

/**
 * ErrorCollector collect error of a specific function.
 */
module.exports = class ErrorCollector extends ContextLockable {

    lockActions = ['registerError'];

    /**@type {ErrorHandler} */
    #handlerObject;

    #exceptErrors = new Set();

    /**@type {Map<string, Set>} */
    #registeredErrors = new Map();

    #currentError;

    #currentField;

    #event = new EventEmitter();

    get error() {

        return this.#currentError;
    }

    get field() {

        return this.#currentField;
    }

    get exceptions() {

        return this.#exceptErrors;
    }
    /**
     * @returns {boolean}
     */
    get isSelective() {

        return this.#registeredErrors.size > 0;
    }

    constructor(_context) {

        super(_context);

        this.#init();
    }

    #init() {

        if (!this.isSelective) {

            return;
        }


    }

    /**
     * 
     * @param {string} _field 
     * @returns {boolean}
     */
    _check(error, _field = 'default') {

        const acceptanceSet = this.#registeredErrors.get(_field);

        if (!acceptanceSet) {
        
            return false;
        }

        if (acceptanceSet.has(error)) {
            /**
             *  when actualError matches an immediate value
             */
            return true;
        }

        return this.#lookupType(error, acceptanceSet);
    }

    
    /**
     * find best match error types, check on inheritance (classes and interfaces)
     * 
     * @param {any} _error 
     * @param {Iterable<any>} _acceptanceList 
     * @returns {boolean}
     */
    #lookupType(_error, _acceptanceList = []) {

        for (const acceptableType of _acceptanceList) {

            const matchOptionalPattern = this.#checkOptionalPattern({
                expect: acceptableType, 
                error: _error
            });

            if (matchOptionalPattern) {

                return true;
            }

            const match = matchType(acceptableType, _error);

            if (match) {

                return true;
            }
        }

        return false;
    }

    #checkOptionalPattern({expect, error}) {

        if (typeof expect === 'function') {

            return false;
        }

        return this.#likable({expect, error});
    }

    #likable({expect, error}) {

        if (typeof expect !== 'object' || typeof error !== 'object') {

            return false;
        }
        
        const expectPropNames = Object.getOwnPropertyNames(expect);
        const expectAcceptances = expectPropNames.map(_name => expect[_name]);

        const errorFilteredPropNames = Object.getOwnPropertyNames(error).filter(_name => expectPropNames.includes(_name));

        if (expectPropNames.length > errorFilteredPropNames.length) {

            return false;
        }
        
        for (const propName of errorFilteredPropNames) {

            const prop = error[propName]

            const matchType = this.#lookupType(prop, expectAcceptances);

            if (!matchType) {

                return false;
            }
        }

        return true;
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


       for (const field of this.#registeredErrors.keys()) {

            if (this._check(_error, field)) {

                return field;
            }
       }
    }

    #matchExceptError(_error) {

        const exceptions = this.#exceptErrors;

        return this.#lookupType(_error, exceptions);
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

        this.#rollBackState();
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

    #setHandlingState({error, category}) {

        this.#currentError = error;
        this.#currentField = category;
    }

    #rollBackState() {

        this.#currentError = undefined;
        this.#currentField = undefined;
    }

    /**
     * 
     * @param {string} _field 
     * @param {any} _type 
     */
    registerError(_type, _field = 'default') {

        if (this.#registeredErrors.has(_field)) {

            return this.#registeredErrors.set(_field, new Set([_type]));
        }
        
        this.#registeredErrors.get(_field).add(_type);
    }

    whenErrorOccur(_func) {

        this.#event.on(OCCUR_ERROR, _func);
    }

    whenNoError(_func) {

        this.#event.on(NO_ERROR, _func);
    }
}