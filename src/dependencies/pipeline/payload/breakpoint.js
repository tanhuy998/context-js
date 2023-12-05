const ConventionError = require("../../errors/conventionError.js");
const PipelinePayload = require("./pipelinePayload.js");

/**
 * @typedef {import('../phase/phase.js')} Phase
 * @typedef {import('../../context/context.js')} Context
 * @typedef {import('../pipeline.js')} Pipeline
 * @typedef {import('../controller/errorController.js')} ErrorController
 */

module.exports = class Breakpoint extends PipelinePayload {

    #rollbackPoint;

    /**@type {boolean} */
    #hasOriginError = false;

    /**@type {Payload} */
    #rollbackPayload;

    #originError;

    /**
     * The error that started the error handler pipeline
     * 
     * @returns {any}
     */
    get originError() {

        return this.#originError;
    }
    
    /**
     * The error that dispatched by the previous ErrorHandler
     * 
     * @returns {any}
     */
    get lastCaughtError() {

        return super.lastHandledValue;
    }

    /**
     * Synonym for lastCaughtError
     * 
     * @type {any}
     */
    get lastTracedError() {

        return this.lastCaughtError;
    }

    /**
     * Synonym for originError
     * 
     * @returns {any}
     */
    get reason() {

        return this.#originError;
    }
    
    /**
     * The pipeline phase that caused the error
     * 
     * @returns {Phase}
     */
    get rollbackPoint() {

        return this.#rollbackPoint;
    }

    /**
     * the payload of the current pipeline 
     * 
     * @return {Payload}
     */
    get rollbackPayload() {

        return this.#rollbackPayload;
    }

    get isErrorOverloaded() {

        return this.trace.length > 1;
    }

    /**
     * 
     * @param {Context} _context 
     * @param {ErrorController} _errorController 
     * @param {Pipeline} _pipeline 
     * @param {Payload} _payload 
     */
    constructor(_context, _errorController, _pipeline, _payload) {

        super(...arguments);

        this.#rollbackPayload = _payload;

        this.#rollbackPoint = _payload.currentPhase;
    }

    setOriginError(_e) {

        if (this.#hasOriginError) {

            throw new ConventionError("breakpoint's origin error just be initialized once");
        }

        this.#originError = _e;
        this.#hasOriginError = true;
    }
}