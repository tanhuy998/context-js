const self = require("reflectype/src/utils/self.js");
const { ABORT_PIPELINE, ROLL_BACK, DISMISS, CONSTRUCTOR, DISMISS_ERROR_PHASE } = require("../constants");
const ErrorHandlerConventionError = require("../errors/pipeline/ErrorHandlerConventionError.js");
const ContextHandler = require("./contextHandler.js");
const ErrorHandlerAcceptableStrategy = require("./errorHandlerAcceptableStrategy.js");
const { decoratePseudoConstructor } = require("../../utils/metadata.js");
const ErrorHandlerAcceptableMatcher = require("./errorHandlerAcceptableMatcher.js");

/**
 * @typedef {import('../pipeline/payload/breakpoint.js')} BreakPoint
 */

const ErrorHandlerClass = module.exports = class ErrorHandler extends ContextHandler {

    //#error;

    /**@type {BreakPoint} */
    #breakPoint;

    /**@type {ErrorHandlerAcceptableMatcher} */
    #acceptableMatcher;

    /**@returns {any} */
    get error() {

        return this.devise;
    }

    /**@returns {BreakPoint} */
    get breakPoint() {

        return this.#breakPoint;
    }

    /**@returns {any} */
    get originError() {

        return this.#breakPoint?.originError;
    }

    /**
     * 
     * @param {ErrorHandlerAcceptableMatcher} acceptableMatcher 
     */
    [CONSTRUCTOR](acceptableMatcher) {
        console.log('ErrorHandler constructor')

        this.#acceptableMatcher = acceptableMatcher;
        this.#init();
    }

    /**
     * 
     * @param {BreakPoint} _breakPoint 
     * @param {any} _error 
     */
    constructor(_breakPoint, _error) {

        super(_breakPoint.context, _error);

        this.#breakPoint = _breakPoint;
    }

    #init() {
        console.log('ErrorHandle initialization')
        this.#checkAcceptable();
    }

    #checkAcceptable() {

        const matchAcceptable = this.#isAcceptableError();
        const matchOriginAcceptable = this.#isOriginAcceptableError();

        if (!matchAcceptable && !matchOriginAcceptable) {
            console.log('not acceptable')
            throw DISMISS_ERROR_PHASE;
        }

        console.log('accept error')
        return;
    }

    /**
     * 
     * @param {string} _field 
     * @returns {boolean}
     */
    #_checkAcceptableFrom(_field = 'accept') {

        const acceptableErrors = this[_field];
        console.log([_field], 1)
        if (acceptableErrors === undefined || acceptableErrors === null) {

            return true;
        }
        console.log([_field], 2)
        if (Array.isArray(acceptableErrors) && acceptableErrors.length > 0) {

            const errorFieldName = new ErrorHandlerAcceptableStrategy(_field).errorFieldName;

            const actualError = this[errorFieldName];

            const theActualErrorType = actualError ?? ;
            
            return acceptableErrors.includes(theActualErrorType);
        }
        else {
            console.log([_field], 3)
            throw new ErrorHandlerConventionError(`ErrorHandler.${_field} must be an array and not empty`);
        }
    }

    /**
     * 
     * @returns {boolean}
     */
    #isAcceptableError() {
        console.log(1);
        return this.#_checkAcceptableFrom('accept');
    }

    /**
     * 
     * @returns {boolean}
     */
    #isOriginAcceptableError() {
        console.log(2);
        return this.#_checkAcceptableFrom('acceptOrigin');
    }

    handle() {

        
    }

    /**
     * @throws
     */
    abort() {

        throw ABORT_PIPELINE;
    }

    /**
     * @throws
     */
    rollBack() {

        throw ROLL_BACK;
    }

    /**
     * @throws
     */
    dismiss() {

        throw DISMISS;
    }
}

decoratePseudoConstructor(ErrorHandlerClass, {
    defaultParamsType: [ErrorHandlerAcceptableMatcher]
});

decoratePseudoConstructor(ErrorHandlerAcceptableMatcher, {
    defaultParamsType: [ErrorHandlerClass]
});