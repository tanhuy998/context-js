'use strict'

/**
 * @typedef {import('./payload/pipelinePayload.js')} PipelinePayload
 * @typedef {import('./payload/breakpoint.js')} BreakPoint
 */

const PipablePhaseAbortionError = require('../errors/pipeline/pipablePhaseAbortionError.js');
const ErrorHandlingPolicy = require('./errorHandlingPolicy.js');
const Breakpoint = require('./payload/breakpoint.js');
const PipablePhase = require('./phase/PipablePhase.js');

/**
 * @description
 * 
 */
module.exports = class ErrorTracer {

    #payload;

    /**
     * The error that is passed as constructor argument.
     * if the error caused by a mainline pipeline phase, it is the actual error.
     * if the error caused by a mainline pipable phase, it is a pipeline breakpoint.
     * 
     * @type {any | Breakpoint} 
     */
    #initialError;

    /**@type {any} */
    #actualError;   

    /**@type {boolean} */
    #isCausedByPipeablePhase;

    #policy;

    get isCausedByPipablePhase() {

        return this.#isCausedByPipeablePhase;
    }

    /**
     *  The error that caused by one of the following situation:
     *  1. error caused by a mainline PipelinePhase
     *  2. error caused by a mainline PipablePhase (the error is the breakpoint object)
     *    + returns the last traced error of the pipable phase's error handling progress
     *    + otherwise, return the breakpoint's origin error.
     * 
     * @type {any}
     */
    get actualError() {

        return this.#actualError;
    }

    /**
     * The error that the pipeline will take to dispatch to an error controller to handle
     * 
     * @type {any}
     */
    get errorToHandle() {

        if (!this.#isCausedByPipeablePhase || 
        this.#policy === ErrorHandlingPolicy.SUMMARIZE) {

            return this.#actualError;
        }

        const breakPoint = this.#initialError;
        const pipablePhase = this.#payload.currentPhase;

        return new PipablePhaseAbortionError(pipablePhase, breakPoint);
    }

    /**
     * 
     * @param {PipelinePayload} _payload 
     * @param {any | BreakPoint} _error 
     * @param {ErrorHandlingPolicy} _policy
     */
    constructor(_payload, _error, _policy = ErrorHandlingPolicy.DEATAIL) {

        this.#payload = _payload;
        this.#initialError = _error;
        this.#policy = _policy;

        this.#init();
    }

    #init() {

        this.#validatePolicy();
        this.#analyze();
    }

    #analyze() {

        const isPipablePhase = this.#payload.currentPhase instanceof PipablePhase;
        const isBreakPoint = this.#initialError instanceof Breakpoint;

        if (isPipablePhase && isBreakPoint) {

            this.#isCausedByPipeablePhase = true;

            /**@type {BreakPoint} */
            const breakPoint = this.#initialError;

            this.#actualError = breakPoint.isErrorOverloaded ? 
                                breakPoint.lastTracedError : breakPoint.originError;
        }
        else {

            this.#isCausedByPipeablePhase = false;
            this.#actualError = this.#initialError;
        }
    }

    #validatePolicy() {

        const policy = this.#policy;

        this.#policy = [ErrorHandlingPolicy.DEATAIL, ErrorHandlingPolicy.SUMMARIZE]
                        .includes(policy) ?
                        policy : ErrorHandlingPolicy.DEATAIL;
    }
}