const { ABORT_PIPELINE, ROLL_BACK, DISMISS } = require("../../constants");
const isPipeline = require("../isPipeline");
const Payload = require("../payload/pipelinePayload.js");
const { EventEmitter } = require('node:events');
const NoPhaseError = require("../../errors/pipeline/noPhaseError");
const self = require("reflectype/src/utils/self.js");


/**
 * @typedef {import('../../context/context.js')} Context
 * @typedef {import('../pipeline.js')} Pipeline
 * @typedef {import('../../handler/contextHandler.js')} ContextHandler
 * @typedef {import('../phase/phase.js')} Phase
 * @typedef {import('../payload/pipelinePayload.js')} Payload
 * @typedef {import('../phase/phaseOperator')} PhaseOperator
 * @typedef {import('../payload/breakpoint.js')} Breakpoint
 */

const START_INDEX = 0;

module.exports = class PipelineController {

    static count = 0;

    id = ++self(this).count;

    /**@type {Pipeline} */
    #pipeline;

    /**@type {Payload} */
    #payload;

    /**@type {Number} */
    #maxSyncTask;

    #taskIndex = START_INDEX;

    /**@type {Promise} */
    #state;

    /**@type {EventEmitter} */
    #eventController;

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

    get state() {

        return this.#state;
    }

    /** */
    get firstPhase() {
        
        return this.#pipeline.firstPhase;
    }

    get event() {

        return this.#eventController;
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

        this.#isDisposed = false;
    }

    startHandle(_additionalArgs = []) {

        if (this.#isDisposed) {

            throw new Error('the pipeline controller has been disposed');
        }

        
        this.#initializeHandleEnv();

        /**@type {Phase}*/
        const firstPhase = this.firstPhase;
        
        const payload = this.payload;
        const event = this.#eventController = new EventEmitter();
        
        return this.#state = new Promise(function (resolve, reject) {

            event.once('resolve', resolve).once('abort', reject);

            if (firstPhase === undefined || firstPhase === null) {

                reject(new NoPhaseError());

                return;
            }

            firstPhase.accquire(payload, _additionalArgs);
        })
    }

    /**
     * 
     * @param {Payload} _payload 
     * @param {*} param1 
     */
    async trace(_payload, {currentPhase, occurError, value, opperator} = {}) {
        /**
         *  occurError parameter detemines that the phase thrown an exception
         *  base on type of the _payload parameter, controller will decide what to do next
         */
        const payloadController = _payload.controller;
        
        if (payloadController !== this) {

            return;
        }

        if (occurError === true) {
            
            const breakpoint = await this.#pipeline.catchError(_payload, value);

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
            
            this.#abort(_breakPoint);
        }
        else if (signal === DISMISS) {
            
            const payload = _breakPoint.rollbackPayload;

            this.#nextPhase(payload, _breakPoint);
        }
        else {
            
            this.#abort(_breakPoint);
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
            
            this.#resolve(_payload);

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

    #abort(_reason) {
        
        this.#eventController.emit('abort', _reason);

        this._dispose();
    }

    #resolve(_payload) {

        this.#eventController.emit('resolve', _payload);

        this._dispose();
    }

    _dispose() {

        this.#state = undefined;
        this.#payload = undefined;

        this.#isDisposed = true;
    }
    #initializeHandleEnv() {

        /**@type {Context} */
        const payload = this.#payload;

        //payload.session.save()
    }
}