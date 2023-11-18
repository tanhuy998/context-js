const self = require("reflectype/src/utils/self.js");
const { ABORT_PIPELINE, ROLL_BACK, DISMISS, CONSTRUCTOR, DISMISS_ERROR_PHASE } = require("../constants");
const ErrorHandlerConventionError = require("../errors/pipeline/errorHandlerConventionError.js");
const ContextHandler = require("./contextHandler.js");
const { decoratePseudoConstructor } = require("../../utils/metadata.js");
const ErrorHandlerAcceptanceMatcher = require("./errorHandlerAcceptanceMatcher.js");
const ConventionError = require("../errors/conventionError.js");

/**
 * @typedef {import('../pipeline/payload/breakpoint.js')} BreakPoint
 */

const ErrorHandlerClass = module.exports = class ErrorHandler extends ContextHandler {

    //#error;

    /**@type {BreakPoint} */
    #breakPoint;

    /**@type {ErrorHandlerAcceptanceMatcher} */
    #matcher;

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
     * @param {ErrorHandlerAcceptanceMatcher} acceptableMatcher 
     */
    [CONSTRUCTOR](acceptableMatcher) {
        // 

        this.#matcher = acceptableMatcher;
        this.#init();
    }

    /**
     * 
     * @param {BreakPoint} _breakPoint 
     * @param {any} _error 
     */
    constructor(_breakPoint, _error) {
        // 
        super(_breakPoint.context, _error);

        this.#breakPoint = _breakPoint;
    }

    #init() {
        // 
        this.#decideToHandle();
    }

    #decideToHandle() {

        try {

            if (!this.#matcher.match()) {

                this.handle = function () {
                    
                    return this.error;
                }
            } 
        } 
        catch (exception) {
            
            this.#handleException(exception);
        }
    }

    #handleException(exception) {

        if (exception === DISMISS_ERROR_PHASE) {
                
            throw exception;
        }
        else if (exception instanceof ConventionError) {

            throw new ErrorHandlerConventionError(exception.message, exception.reason);
        }
        else {

            throw new ErrorHandlerConventionError(exception?.message, exception);
        }
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
    defaultParamsType: [ErrorHandlerAcceptanceMatcher]
});

decoratePseudoConstructor(ErrorHandlerAcceptanceMatcher, {
    defaultParamsType: [ContextHandler]
});