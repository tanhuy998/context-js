const isPipeline = require("./isPipeline");
//const Payload = require("./payload");

/**
 * @typedef {import('../context/context.js')} Context
 * @typedef {import('./pipeline.js')} Pipeline
 * @typedef {import('../handler/constextHandler')} ContextHandler
 * @typedef {import('./phase.js')} Phase
 * @typedef {import('./payload.js')} Payload
 * @typedef {import('./phaseOperator')} PhaseOperator
 */

module.exports = class PipelineController {

    /**@type {Pipeline} */
    #pipeline;

    /**@type {Payload} */
    #payload;

    get pipeline() {

        return this.#pipeline;
    }

    get payload() {

        return this.#payload;
    }

    /**
     * 
     * @param {Pipeline} _pipeline 
     */
    constructor(_pipeline) {

        this.#pipeline = _pipeline;

        this.#init();
    }

    #init() {

        const pipeline = this.#pipeline;

        if (!isPipeline(pipeline)) {

            throw new TypeError('PipelineController just only manages instance of pipeline');
        }
    }

    /**
     * 
     * @param {Context} _payload 
     */
    setPayload(_payload) {

        this.#payload = _payload;
    }

    startHandle() {

        this.#initializeHandleEnv();

        /**@type {Phase}*/
        const firstPhase = this.#pipeline.firstPhase;

        const payload = this.#payload;

        firstPhase.accquire(payload); 
    }

    /**
     * 
     * @param {Payload} _payload 
     * @param {*} param1 
     */
    trace(_payload, {currentPhase, occurError, value, opperator} = {}) {

        const payloadController = _payload.controller;

        if (payloadController !== this) {

            return;
        }

        if (occurError) {

            this.#handleError(_payload, currentPhase, value, opperator);
        }
        else {

            this.#nextPhase(_payload, value);
        }
    }

    /**
     * 
     * @param {Payload} _payload 
     * @param {Phase} _currentPhase 
     * @param {any} _error 
     * @param {PhaseOperator} _operator 
     */
    #handleError(_payload, _currentPhase, _error) {

        
    }

    /**
     * 
     * @param {Payload} _payload 
     * @param {Phase} _currentPhase 
     * @param {any} _error 
     */
    #runPipelineErrorHandler(_payload, _currentPhase, _error) {


    }
    /**
     * 
     * @param {Payload} _payload 
     * @param {any} previousValue 
     */
    #nextPhase(_payload, previousValue) {

        _payload.trace.push(previousValue);

        const nextPhase = _payload.currentPhase.next;

        if (nextPhase === undefined || nextPhase === null) {

            this.#pipeline.approve(this);
        }
        else {

            nextPhase.accquire(_payload);
        }
    }

    #initializeHandleEnv() {

        /**@type {Context} */
        const payload = this.#payload;

        //payload.session.save()
    }
}