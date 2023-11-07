const { ABORT_PIPELINE, ROLL_BACK, DISMISS } = require("../constants");
const ContextHandler = require("./contextHandler.js");

/**
 * @typedef {import('../pipeline/payload/breakpoint.js')} BreakPoint
 */

module.exports = class ErrorHandler extends ContextHandler {

    //#error;

    /**@type {BreakPoint} */
    #breakPoint;

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
     * @param {BreakPoint} _breakPoint 
     * @param {any} _error 
     */
    constructor(_breakPoint, _error) {

        super(_breakPoint.context, _error);

        this.#breakPoint = _breakPoint;
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