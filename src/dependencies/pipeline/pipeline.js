const PhaseError = require("../errors/pipeline/phaseError");
const Payload = require("./payload/payload");
const PhaseBuilder = require("./phase/phaseBuilder");
const PipelineController = require("./controller/pipelineController");
const ErrorController = require('./controller/errorController.js');
const ErrorPhaseBuilder = require("./phase/errorPhaseBuilder");
const self = require("reflectype/src/utils/self");
const Breakpoint = require('./payload/breakpoint.js');


/**
 * @typedef {import('../context/context')} Context
 * @typedef {import('../../libs/linkedList.js').T_WeakTypeNode} T_WeakTypeNode
 * @typedef {import('./phase/phase.js')} Phase
 * @typedef {import('../handler/errorHandler.js')} ErrorHandler
 */

/**
 *  Pipeline Manage phases and errors handler.
 *  when a context arrived, pipeline initiates a PipelineController
 *  and then dispatches the context as payload to it
 */
module.exports = class Pipeline {

    /**@type {number} */
    static #maxSyncTask = 100;

    /**@returns {number} */
    static get maxSyncTask() {

        return this.#maxSyncTask;
    }

    /**@type {Phase} */
    #firstPhase;

    /**@type {Phase} */
    #errorHandler;

    #global

    /**@type {number} */
    #maxSync;

    /**@returns {number} */
    get maxSyncTask() {

        return this.#maxSync;
    }

    set maxSyncTask(_number) {

        if (_number <= 0) {

            throw new Error('max sync task of pipeline must be greater than 0');
        }

        this.#maxSync = _number;
    }

    /**@returns {Phase} */
    get errorHandler() {

        return this.#errorHandler;
    }

    /**@returns {Phase} */
    get firstPhase() {

        return this.#firstPhase;
    }

    get global() {

        return this.#global;
    }

    /**@returns {boolean} */
    get isBlock() {

        return this.#global === undefined || this.#global === null ? false : true;
    }

    constructor(_globolContext) {

        this.#global = _globolContext;

        this.#init();
    }

    #init() {

        this.#maxSync = self(this).maxSyncTask;
    }

    /**
     * 
     * @param {Phase} _phase 
     * @returns {Pipeline}
     */
    pipe(_phase) {

        const firstPhase = this.#firstPhase;

        _phase.join(this);

        if (firstPhase === undefined || firstPhase === null) {
            
            this.#firstPhase = _phase;

            return;
        }

        this.#firstPhase.pushBack(_phase);

        return this;
    }
    
    /**
     * 
     * @param {Phase} _phase 
     * @returns {Pipeline}
     */
    pipeError(_phase) {

        const firstPhase = this.#errorHandler;

        _phase.join(this);
        
        if (firstPhase === undefined || firstPhase === null) {
            
            this.#errorHandler = _phase;

            return;
        }

        this.#errorHandler.pushBack(_phase);

        return this;
    }

    /**
     * 
     * @returns {PhaseBuilder}
     */
    addPhase() {

        return new PhaseBuilder(this);
    }

    /**
     * 
     * @param {Context} _payload 
     * @returns {Promise<any>}
     */
    run(_context) {

        if (this.#global && this.#global !== _context.global) {

            return;
        }

        const controller = new PipelineController(this);

        const payload = new Payload(_context, controller, this);

        //console.time(payload.id);

        controller.setPayload(payload);

        return controller.startHandle();
    }

    /**
     * 
     * @param {Payload} _payload 
     * @param {any} _error 
     */
    catchError(_payload, _error) {
        
        if (_payload.pipeline !== this) {

            return;
        }


        const controller = new ErrorController(this);

        const breakpoint = new Breakpoint(_payload.context, controller, this, _payload);

        //const payload = new ErrorPayload(_payload.context, controller, this, _payload);

        breakpoint.trace.push(_error);

        breakpoint.setOriginError(_error);

        controller.setPayload(breakpoint);
        
        return controller.startHandle();
    }
    
    /**
     * 
     * @param {...(Function | ErrorHandler)} _handler 
     */
    onError(..._handler) {

        _handler = _handler.flat(Infinity);

        for (const handler of _handler) {
            
            new ErrorPhaseBuilder(this).setHandler(handler).build();
        }
    }

    

    /**
     * 
     * @param {PhaseError} error 
     * @param {Context} payload 
     * 
     * @return {boolean}
     */
    #isValidError(error, payload) {

        const {phase, pipeline, context} = error;

        if (pipeline !== this) {

            return false;
        }

        if (context?.global !== payload.global) {

            return false;
        }

        let ownPhase = this.#firstPhase;

        while(ownPhase !== undefined && ownPhase !== null) {

            if (ownPhase === phase) {

                return true;
            }

            ownPhase = ownPhase.next;
        }

        return false;
    }   

    /**
     * 
     * @param {PipelineController} _controller 
     */
    approve() {

        if (_controller.pipeline !== this) {

            return;
        }

        const payload = _controller.payload;

        //console.timeEnd(payload.id);
    }
}