

/**
 * @typedef {import('./payload/pipelinePayload.js')} PipelinePayload
 */

const PipablePhaseAbortionError = require('../errors/pipeline/pipablePhaseAbortionError.js');
const Breakpoint = require('./payload/breakpoint.js');
const PipablePhase = require('./phase/PipablePhase.js');

module.exports = class ErrorTracer {

    #payload;

    /**@type {any | Breakpoint} */
    #pipelineError;

    #actualError;   

    /**@type {boolean} */
    #isHandled;

    /**@type {boolean} */
    #isCausedByPipeablePhase;

    get actualError() {

        return this.#actualError;
    }

    get errorToHandle() {

        if (this.#isCausedByPipeablePhase) {

            const breakPoint = this.#pipelineError;

            const pipablePhase = this.#payload.currentPhase;

            return new PipablePhaseAbortionError(pipablePhase, breakPoint);
        }
        
        return this.#actualError;
    }

    /**
     * 
     * @param {PipelinePayload} _payload 
     * @param {any | BreakPoint} _error 
     */
    constructor(_payload, _error) {

        this.#payload = _payload;

        this.#pipelineError = _error;

        this.#init();
    }

    #init() {

        const isPipablePhase = this.#payload.currentPhase instanceof PipablePhase;

        const errorIsBreakPoint = this.#pipelineError instanceof Breakpoint;
    

        if (isPipablePhase && errorIsBreakPoint) {

            this.#isCausedByPipeablePhase = true;

            this.#checkIfErrorIsHandledByPipeabePhase();

            const isErrorHandled = this.#isHandled;

            const breakPoint = this.#pipelineError;

            this.#actualError = isErrorHandled ? breakPoint.lastCaughtError : breakPoint.originError;
        }
        else {

            this.#isCausedByPipeablePhase = false;

            this.#actualError = this.#pipelineError;
        }
    }

    #checkIfErrorIsHandledByPipeabePhase() {

        if (!this.#isCausedByPipeablePhase) {

            return;
        }

        /**@type {Breakpoint} */
        const breakPoint = this.#pipelineError;

        const brOrignError = breakPoint.originError;

        const brLastError = breakPoint.lastCaughtError;

        this.#isHandled = (brOrignError !== brLastError && breakPoint.trace.length > 1);
    }
}