const { ABORT_PIPELINE } = require("../constants");
const AbortPipelineError = require("../errors/pipeline/abortPipelineError");
const HanlderInitializeError = require("../errors/pipeline/handlerInitializeError");
const PhaseError = require("../errors/pipeline/phaseError");
const Payload = require("./payload");
const PhaseBuilder = require("./phaseBuilder");
const PipelineController = require("./pipelineController");

/**
 * @typedef {import('../context/context')} Context
 */

/**
 *  Pipeline Manage phases and errors handler.
 *  when a context arrived, pipeline initiates a PipelineController
 *  and then dispatches the context as payload to it
 */
module.exports = class Pipeline {

    #firstPhase;

    #errorHandlers = [];

    #global

    get errorHandlers() {

        return this.#errorHandlers;
    }

    get firstPhase() {

        return this.#firstPhase;
    }

    get global() {

        return this.#global;
    }

    get isBlock() {

        return this.#global === undefined || this.#global === null ? false : true;
    }

    constructor(_globolContext) {

        this.#global = _globolContext;

        this.#init();
    }

    #init() {

        
    }

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

    addPhase() {

        return new PhaseBuilder(this);
    }

    /**
     * 
     * @param {Context} _payload 
     * @returns 
     */
    run(_context) {

        if (this.#global && this.#global !== _context.global) {

            return;
        }

        const payload = new Payload(_context);

        const controller = new PipelineController(this);

        controller.setPayload(payload);

        controller.startHandle();
        // const firstPhase = this.#firstPhase;

        // if (!firstPhase) {
            
        //     return;
        // }

        // firstPhase.accquire(_payload);
    }

    
    /**
     * 
     * @param {Function} _handler 
     */
    onError(_handler) {


    }

    catchError(error, payload) {
        console.log(error.reason);
        /**
         *  error validation
         *  check if the error caught by this's managed phases
         */
        if (!this.#isValidError(error, payload)) {

            return;
        }

        if (error === ABORT_PIPELINE) {

            return;
        }

        if (error instanceof HanlderInitializeError) {

            throw error;
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
}