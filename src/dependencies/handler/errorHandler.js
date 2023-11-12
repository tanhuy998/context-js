const self = require("reflectype/src/utils/self.js");
const { ABORT_PIPELINE, ROLL_BACK, DISMISS, CONSTRUCTOR, DISMISS_ERROR_PHASE } = require("../constants");
const ErrorHandlerConventionError = require("../errors/pipeline/ErrorHandlerConventionError.js");
const ContextHandler = require("./contextHandler.js");
const ErrorHandlerAcceptableStrategy = require("./errorHandlerAcceptanceStrategy.js");
const { decoratePseudoConstructor } = require("../../utils/metadata.js");
const ErrorHandlerAcceptanceMatcher = require("./errorHandlerAcceptanceMatcher.js");
const ConventionError = require("../errors/pipeline/conventionError.js");

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
        // console.log(.*)

        this.#matcher = acceptableMatcher;
        this.#init();
    }

    /**
     * 
     * @param {BreakPoint} _breakPoint 
     * @param {any} _error 
     */
    constructor(_breakPoint, _error) {
        // console.log(.*)
        super(_breakPoint.context, _error);

        this.#breakPoint = _breakPoint;
    }

    #init() {
        // console.log(.*)
        this.#checkAcceptableError();
    }

    #checkAcceptableError() {

        try {

            this.#matcher.match();

        } catch (error) {
            console.log(error)
            if (error === DISMISS_ERROR_PHASE || error instanceof ConventionError) {
                // console.log(.*)
                throw error;
            }
            else {

                throw new ConventionError(error?.message, error);
            }
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