const self = require("reflectype/src/utils/self.js");
const { CONSTRUCTOR, DISMISS_ERROR_PHASE } = require("../constants");
const ErrorHandlerConventionError = require("../errors/pipeline/ErrorHandlerConventionError.js");
const ErrorHandlerAcceptanceStrategy = require("./errorHandlerAcceptanceStrategy.js");
const matchType = require("reflectype/src/libs/matchType.js");

/**
 * @typedef {import('./errorHandler.js')} ErrorHandler
 */

module.exports = class ErrorHandlerAcceptanceMatcher {

    /**@type {Array<any>} */
    #accept;

    /**@type {Array<any>} */
    #acceptOrigin;

    /**@type {ErrorHandler} */
    #handlerObject;

    /**@type {Set<any>} */
    #immediateAcceptValue;

    #immediateAcceptOriginValue;

    get accept() {

        return this.#accept;
    }

    get acceptOrigin() {

        return this.#acceptOrigin;
    }

    get immediateAcceptValue() {

        return this.#immediateAcceptValue;
    }

    get immediateAcceptOriginValue() {

        return this.#immediateAcceptOriginValue;
    }

    /**
     * 
     * @param {ErrorHandler} _errorHanlderObj 
     */
    [CONSTRUCTOR](_errorHanlderObj) {

        // console.log(.*)
        this.#accept = _errorHanlderObj?.accept;
        this.#acceptOrigin = _errorHanlderObj?.acceptOrigin;
        this.#handlerObject = _errorHanlderObj;

        this.#init();
    }

    #init() {

        this.#resolveImmediateValueFromAcceptanceList();
    }
    
    #resolveImmediateValueFromAcceptanceList() {

        const fromAccept = (this.#accept ?? []).filter((element) => {

            return typeof element !== 'functtion';
        })

        const fromAcceptOrigin = (this.#acceptOrigin ?? []).filter((element) => {

            return typeof element !== 'functtion';
        })

        this.#immediateAcceptValue = new Set(fromAccept);
        this.#immediateAcceptOriginValue = new Set(fromAcceptOrigin);
    }

    #checkAcceptableError() {
        
        const matchAcceptable = this.#isAcceptableError();

        if (matchAcceptable) {
            console.log([], 1)
            return;
        }


        const matchOriginAcceptable = this.#isOriginAcceptableError();
        // console.log(.*)

        if (matchOriginAcceptable) {
            console.log([], 2);
            return;
        }

        //throw DISMISS_ERROR_PHASE;

        if (matchAcceptable === false || matchOriginAcceptable === false) {
            console.log()
            throw DISMISS_ERROR_PHASE;
        }

        // // console.log(.*)
        // return;
    }

    /**
     * 
     * @param {string} _field 
     * @returns {boolean}
     */
    #_checkAcceptableFrom(_field = 'accept') {

        const errorFieldName = new ErrorHandlerAcceptanceStrategy(_field).errorFieldName;
        
        const actualError = this.#handlerObject[errorFieldName];

        // console.log(.*)
        if (this.#matchImmediateValues(actualError, _field)) {

            return true;
        }

        const acceptableErrors = this[_field];
        // console.log(.*)
        if (acceptableErrors === undefined || acceptableErrors === null) {

            return undefined;
        }
        // console.log(.*)
        if (Array.isArray(acceptableErrors) && acceptableErrors.length > 0) {
            
            return this.lookup(actualError, acceptableErrors);
        }
        else {
            // console.log(.*)
            throw new ErrorHandlerConventionError(`ErrorHandler.${_field} must be an array and not empty`);
        }
    }

    #matchImmediateValues(_error, _field) {

        const immediateField = `immediate${_field}`;

        return this[immediateField]?.has(_error);
    }

    /**
     * 
     * @returns {boolean}
     */
    #isAcceptableError() {
        // console.log(.*)
        return this.#_checkAcceptableFrom('accept');
    }

    /**
     * 
     * @returns {boolean}
     */
    #isOriginAcceptableError() {
        // console.log(.*)
        return this.#_checkAcceptableFrom('acceptOrigin');
    }

    lookup(_error, _acceptanceList = []) {

        // let theActualErrorType;

        // if (_error === undefined || _error === null) {

        //     theActualErrorType = _error;
        // }
        // else {
            
        //     theActualErrorType = self(_error);
        // }
            
        for (const acceptableType of _acceptanceList) {

            if (typeof acceptableType !== 'function') {

                continue;
            }

            if (matchType(acceptableType, _error)) {

                return true;
            }
        }

        return false;
    }

    match() {

        if (!this.#isSelective()) {
            console.log('is not selective')
            return;
        }
        // console.log(.*)
        this.#checkAcceptableError();
    }

    #isSelective() {

        const acceptList = this.#accept;
        const acceptOriginList = this.#acceptOrigin;

        const firstCond = acceptList === undefined || acceptList === null;
        const secondCond = acceptOriginList === undefined || acceptOriginList === null;
        
        return !(firstCond && secondCond);
    }
}