const self = require("reflectype/src/utils/self.js");
const { CONSTRUCTOR, DISMISS_ERROR_PHASE } = require("../constants");
const ErrorHandlerConventionError = require("../errors/pipeline/ErrorHandlerConventionError.js");
const ErrorHandlerAcceptanceStrategy = require("./errorHandlerAcceptanceStrategy.js");
const matchType = require("reflectype/src/libs/matchType.js");

/**
 * @typedef {import('./errorHandler.js')} ErrorHandler
 */

module.exports = class ErrorHandlerAcceptanceMatcher {

    static fields = [
        'accept', 'acceptOrigin'
    ];

    /**@type {ErrorHandler} */
    #handlerObject;

    /**@type {Map<String, Set?>} */
    #acceptErrorTypes;

    /**
     * @returns {boolean}
     */
    get isSelective() {

        const acceptList = this.#handlerObject?.accept;
        const acceptOriginList = this.#handlerObject?.acceptOrigin;

        const firstCond = acceptList === undefined || acceptList === null;
        const secondCond = acceptOriginList === undefined || acceptOriginList === null;
        
        return !(firstCond && secondCond);
    }

    /**
     * 
     * @param {ErrorHandler} _errorHanlderObj 
     */
    [CONSTRUCTOR](_errorHanlderObj) {

        this.#handlerObject = _errorHanlderObj;

        this.#init();
    }

    #init() {

        if (!this.isSelective) {

            return;
        }

        const errorHanlderObj = this.#handlerObject;

        this.#acceptErrorTypes = new Map([
            ['accept', new Set( errorHanlderObj?.accept)],
            ['acceptOrigin', new Set(errorHanlderObj?.acceptOrigin)]
        ]);
    }

    /**
     * 
     * @returns {boolean}
     */
    #checkAcceptableError() {
        
        const matchAcceptable = this.#isAcceptableError();

        if (matchAcceptable === true) {
            
            return true;
        }

        const matchOriginAcceptable = this.#isOriginAcceptableError();

        if (matchOriginAcceptable === true) {
            
            return true;
        }

        if (matchAcceptable === false || matchOriginAcceptable === false) {
            
            return false;
        }

        if (matchAcceptable === undefined && matchOriginAcceptable === undefined) {

            return true;
        }
    }

    /**
     * 
     * @param {string} _field 
     * @returns {boolean}
     */
    #_checkAcceptableFrom(_field = 'accept') {

        const errorFieldName = new ErrorHandlerAcceptanceStrategy(_field).errorFieldName;
        
        const actualError = this.#handlerObject[errorFieldName];

        const acceptanceSet = this.#acceptErrorTypes.get(_field);

        if (!acceptanceSet) {
        
            return undefined;
        }

        if (acceptanceSet.has(actualError)) {
            /**
             *  when actualError matches an immediate value
             */
            return true;
        }

        return this.#lookupType(actualError, acceptanceSet);
    }

    /**
     * 
     * @returns {boolean}
     */
    #isAcceptableError() {
        
        return this.#_checkAcceptableFrom('accept');
    }

    /**
     * 
     * @returns {boolean}
     */
    #isOriginAcceptableError() {
        
        return this.#_checkAcceptableFrom('acceptOrigin');
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
    match() {

        if (!this.isSelective) {
            
            return true;
        }
        
        return this.#checkAcceptableError();
    }
}