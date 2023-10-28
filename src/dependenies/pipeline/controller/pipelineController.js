const { ABORT_PIPELINE } = require("../../constants");
const ErrorPayload = require("../payload/errorPayload");
const isPipeline = require("../isPipeline");
const Payload = require("../payload/payload.js");
//const Payload = require("./payload");

/**
 * @typedef {import('../../context/context.js')} Context
 * @typedef {import('../pipeline.js')} Pipeline
 * @typedef {import('../../handler/constextHandler')} ContextHandler
 * @typedef {import('../phase/phase.js')} Phase
 * @typedef {import('../payload/payload.js')} Payload
 * @typedef {import('../phase/phaseOperator')} PhaseOperator
 */

module.exports = class PipelineController {

    /**@type {Pipeline} */
    #pipeline;

    /**@type {Payload} */
    #payload;

    #maxSyncTask;

    #taskIndex = 0;

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

        this.#maxSyncTask = pipeline.maxSyncTask;
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
        /**
         *  occurError parameter detemines that the phase thrown an exception
         *  base on type of the _payload parameter, controller will decide what to do next
         */


        const payloadController = _payload.controller;

        if (payloadController !== this) {

            return;
        }

        if (occurError === true) {
            
            this.#pipeline.catchError(_payload, value);
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
     */
    #runPipelineErrorHandler(_payload, _currentPhase, _error) {


    }
    /**
     * 
     * @param {Payload} _payload 
     * @param {any} previousValue 
     */
    #nextPhase(_payload, previousValue) {
        
        const maxSyncTask = this.#maxSyncTask

        this.#taskIndex = (++this.#taskIndex) % maxSyncTask;

        _payload.trace.push(previousValue);

        const nextPhase = _payload.currentPhase.next;

        if (nextPhase === undefined || nextPhase === null) {

            this.#pipeline.approve(this);

            return;
        }

        const taskIndex = this.#taskIndex;


        if (taskIndex === 1) {

            setImmediate((nextPhase, payload) => {

                nextPhase.accquire(_payload);
            }, nextPhase, _payload)
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