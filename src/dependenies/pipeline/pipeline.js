const AbortPipelineError = require("../errors/pipeline/abortPipelineError");
const HanlderInitializeError = require("../errors/pipeline/handlerInitializeError");
const PhaseError = require("../errors/pipeline/phaseError");
const PhaseBuilder = require("./phaseBuilder");

/**
 * @typedef {import('../context/context')} Context
 */
module.exports = class Pipeline {

    #firstPhase;

    #global

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
    }

    addPhase() {

        return new PhaseBuilder(this);
    }

    /**
     * 
     * @param {Context} _payload 
     * @returns 
     */
    run(_payload) {

        if (this.#global && this.#global !== _payload.global) {

            return;
        }

        const firstPhase = this.#firstPhase;

        if (!firstPhase) {
            
            return;
        }

        firstPhase.accquire(_payload);
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

        if (error instanceof AbortPipelineError) {

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