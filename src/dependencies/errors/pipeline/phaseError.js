/**
 * @typedef {import('../../pipeline/phase/phase')} Phase
 * @typedef {import('../../pipeline/pipeline')} Pipeline
 * @typedef {import('../../pipeline/payload/pipelinePayload')} PipelinePayload
 * @typedef {import('../../context/context.js')} Context
 */

module.exports = class PhaseError extends Error {

    /**@type {Phase} */
    #phase;
    /**@type {Pipeline} */
    #pipeline;
    /**@type {PipelinePayload} */
    #payload;
    /**@type {any} */
    #reason;

    get phase() {

        return this.#phase;
    }

    get pipeLine() {

        return this.#pipeline;
    }

    get payload() {

        return this.#payload;
    }

    get reason() {

        return this.#reason;
    }

    /**
     * 
     * @param {Phase} _phase 
     * @param {PipelinePayload} _payload 
     * @param {any} reason 
     */
    constructor(_phase, _payload, reason) {

        super('thers\'s an error when handle request');

        this.#phase = _phase;
        this.#payload = _payload;
        this.#reason = reason;
    }
}