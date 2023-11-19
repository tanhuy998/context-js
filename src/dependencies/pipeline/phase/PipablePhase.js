const { decoratePipeline } = require("../../handler/pipableContextHandler.js");
const Phase = require("./phase");

/**
 * @typedef {import('../payload/pipelinePayload.js')} Payload
 * @typedef {import('../pipeline.js')} Pipeline
 * @typedef {import('../payload/breakpoint.js')} BreakPoint
 */



/**
 * PipablePhase is pipeline's phases whose context handler is a Pipeline Object
 */
module.exports = class PipablePhase extends Phase{

    /**
     * 
     * @param {Pipeline} _executor 
     */
    constructor(_executor, errorCollector) {
        
        const PipableContextHandler = decoratePipeline(_executor);

        super(PipableContextHandler, errorCollector);

        this.#init();
    }

    #init() {


    }

    /**
     * 
     * @param {Payload} _payload 
     * @param {BreakPoint} error 
     * @param {PhaseOperator} _operator 
     */
    reportError(_payload, error, _operator) {

        // temporarily place await solution for pipeline error handling resolution
        super.reportError(...arguments);
    }

    // /**
    //  * 
    //  * @param {Payload} _payload 
    //  * @param {any} value
    // */
    // report(_payload, value) {

        
    // }

    /**
     * 
     * @param {Payload} _payload 
     * @returns {Promise<any>}
     */
    accquire(_payload) {

        const context = _payload.context;

        super.accquire(_payload);
    }
}