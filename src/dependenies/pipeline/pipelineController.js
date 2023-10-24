const isPipeline = require("./isPipeline");

/**
 * @typedef {import('../context/context.js')} Context
 * @typedef {import('./pipeline.js')} Pipeline
 * @typedef {import('../handler/constextHandler')} ContextHandler
 * @typedef {import('./phase.js')} Phase
 */

module.exports = class PipelineController {

    /**@type {Pipeline} */
    #pipeline;

    /**@type {Context} */
    #payload;

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

        // if () {


        // }

        this.#initializeHandleEnv();

        /**@type {Phase}*/
        const firstPhase = this.#pipeline.firstPhase;

        const payload = this.#payload;

        firstPhase.accquire(payload); 
    }

    #initializeHandleEnv() {

        /**@type {Context} */
        const payload = this.#payload;

        //payload.session.save()
    }
}