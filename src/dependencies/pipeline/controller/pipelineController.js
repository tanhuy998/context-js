const { ABORT_PIPELINE, ROLL_BACK, DISMISS } = require("../../constants");
const isPipeline = require("../isPipeline");
const Payload = require("../payload/pipelinePayload.js");
const NoPhaseError = require("../../errors/pipeline/noPhaseError");
const self = require("reflectype/src/utils/self.js");
const FututeDeference = require("../../future/futureDeference.js");


/**
 * @typedef {import('../../context/context.js')} Context
 * @typedef {import('../pipeline.js')} Pipeline
 * @typedef {import('../../handler/contextHandler.js')} ContextHandler
 * @typedef {import('../phase/phase.js')} Phase
 * @typedef {import('../payload/pipelinePayload.js')} Payload
 * @typedef {import('../phase/phaseOperator')} PhaseOperator
 * @typedef {import('../payload/breakpoint.js')} Breakpoint
 */

/**
 * @typedef {Object} PipelineControllerHandlingState
 */

const START_INDEX = 0;

module.exports = class PipelineController extends FututeDeference {

    static count = 0;

    id = ++self(this).count;

    /**@type {Pipeline} */
    #pipeline;

    /**@type {Payload} */
    #payload;

    /**@type {Number} */
    #maxSyncTask;

    /**@type {number} */
    #taskIndex = START_INDEX;

    /**@type {boolean} */
    #isDisposed;

    /**@returns {Pipeline} */
    get pipeline() {

        return this.#pipeline;
    }

    /**@returns {Payload} */
    get payload() {

        return this.#payload;
    }

    /**@type {Phase} */
    get firstPhase() {
        
        return this.#pipeline.firstPhase;
    }

    /**
     * 
     * @param {Pipeline} _pipeline 
     */
    constructor(_pipeline) {

        super();

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
        this.#isDisposed = false;
    }

    startHandle(_additionalArgs = []) {

        if (this.#isDisposed) {

            throw new Error('the pipeline controller has been disposed');
        }
        
        this.#initializeHandleEnv();

        /**@type {Phase}*/
        const firstPhase = this.firstPhase;

        if (!firstPhase) {

            throw new NoPhaseError();
        }

        const payload = this.payload;
        
        firstPhase.accquire(payload, _additionalArgs);

        return super.value;
    }

    /**
     * 
     * @param {Payload} _payload 
     * @param {*} param1 
     */
    async trace(_payload, {currentPhase, occurError, value, operator} = {}) {
        /**
         *  occurError parameter detemines that the phase thrown an exception
         *  base on type of the _payload parameter, controller will decide what to do next
         */
        const payloadController = _payload.controller;
        
        if (payloadController !== this) {

            return;
        }

        if (occurError === true) {
            
            const breakpoint = await this.#pipeline.catchError(_payload, value, operator);

            this.#handleControlSignal(breakpoint);
        }
        else {
            
            this.#nextPhase(_payload, value);
        }
    }


    /**
     * 
     * @param {Breakpoint} _breakPoint 
     */
    #handleControlSignal(_breakPoint) {

        const signal = _breakPoint.lastCaughtError;
        
        if (signal === ROLL_BACK) {
            
            const rollbackPhase = _breakPoint.rollbackPoint;
            const rollbackPayload = _breakPoint.rollbackPayload;

            rollbackPhase.accquire(rollbackPayload, _breakPoint);
        }
        else if (signal === ABORT_PIPELINE) {
            
            this._abort(_breakPoint);
        }
        else if (signal === DISMISS) {
            
            const payload = _breakPoint.rollbackPayload;

            this.#nextPhase(payload, _breakPoint);
        }
        else {
            
            this._abort(_breakPoint);
        }
    }    


    /**
     * 
     * @param {Payload} _payload 
     * @param {any} previousValue 
     */
    #nextPhase(_payload, previousValue) {
        
        const maxSyncTask = this.#maxSyncTask
        const taskIndex = this.#taskIndex = (++this.#taskIndex) % maxSyncTask;

        _payload.trace.push(previousValue);

        const nextPhase = _payload.currentPhase.next;

        if (nextPhase === undefined || nextPhase === null) {
            
            this._finish(_payload);

            //this.#pipeline.approve(this);

            return;
        }

        if (taskIndex === START_INDEX) {

            setImmediate((nextPhase, payload) => {
                
                nextPhase.accquire(_payload);
            }, nextPhase, _payload)
        }
        else {
            
            nextPhase.accquire(_payload);    
        }
    }

    _abort(_reason) {

        super.reject(_reason);
        this._dispose();
    }

    _finish(_payload) {

        super.resolve(_payload);
        this._dispose();
    }

    _dispose() {

        this.#payload = undefined;
        this.#isDisposed = true;
    }

    #initializeHandleEnv() {

        /**@type {Context} */
        const payload = this.#payload;

        //payload.session.save()
    }
}