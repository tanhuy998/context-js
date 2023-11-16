const self = require("reflectype/src/utils/self.js");
const { CONSTRUCTOR, DISMISS_ERROR_PHASE } = require("../constants");
const ErrorHandlerConventionError = require("../errors/pipeline/ErrorHandlerConventionError.js");
const matchType = require("reflectype/src/libs/matchType.js");
const ContextLockable = require("../lockable/contextLockable.js");


module.exports = class ErrorCollector extends ContextLockable {

    lockActions = ['registerError'];

    /**@type {ErrorHandler} */
    #handlerObject;

    /**@type {Map<string, Set>} */
    #registeredErrors = new Map();

    #currentError;

    #currentField;

    get error() {

        return this.#currentError;
    }

    get field() {

        return this.#currentField;
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

        if (acceptanceSet.has(actualError)) {
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
        
       for (const field of this.#registeredErrors.keys()) {

            if (this._check(_error, field)) {

                return field;
            }
       }
    }

    /**
     * 
     * @param {any} error 
     */
    #resolve(_error) {

        if (!this.isSelective) {

            throw _error;
        }

        const matchField = this.match(_error);

        const registeredErrorType = this.#registeredErrors.get(matchField);

        this.#setHandlingState({
            error: _error,
            category: matchField
        })

        this.handleError();

        this.#rollBackState();
    }

    handleError() {


    }
 
    /**
     * 
     * @param {Function} _func 
     */
    collect(_func) {

        if (typeof _func !== 'function') {

            return;
        }

        try {

            const funcResult = _func();

            if (funcResult instanceof Promise) {

                return funcResult.catch((function(error) {

                    this.#resolve(error);
                }).bind(this));
            }
            else {

                return funcResult;
            }
        }
        catch (err) {

            return this.#resolve(err);
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
}