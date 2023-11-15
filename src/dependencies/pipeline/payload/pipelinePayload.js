/**
 * @typedef {import('../phase/phase.js')} Phase
 * @typedef {import('../../context/context.js')} Context
 * @typedef {import('../../handler/contextHandler.js')} ContextHandler
 * @typedef {import('../controller/pipelineController.js')} PipelineController
 * @typedef {import('../pipeline.js')} Pipeline
 */

module.exports = class PipelinePayload {

    #id = Date.now();

    /**@type {Context} */
    #context;

    #stackStrace = [];

    /**@type {Phase} */
    #currenPhase;

    #handleInstannce;

    /**@type {PipelineController} */
    #controller;

    /**@type {Pipeline} */
    #pipeline;

    /**@returns {Pipeline} */
    get pipeline() {

        return this.#pipeline;
    }

    /**@returns {PipelineController} */
    get controller() {

        return this.#controller;
    }

    /**@returns {Array<any>} */
    get trace() {

        return this.#stackStrace;
    }

    /**@returns {any} */
    get lastHandledValue() {

        const length = this.#stackStrace.length;

        const last = length > 0 ? length - 1 : 0;

        return this.#stackStrace[last];
    }

    /**@returns {Phase} */
    get currentPhase() {

        return this.#currenPhase;
    }

    /**@returns {Context} */
    get context() {

        return this.#context;
    }

    get handler() {

        return this.#handleInstannce;
    }

    get id() {

        return this.#id;
    }

    /**
     * 
     * @param {Context} _context 
     * @param {PipelineController} _controller 
     * @param {Pipeline} _pipeline 
     */
    constructor(_context, _controller, _pipeline) {

        this.#context = _context;
        this.#controller = _controller;
        this.#pipeline = _pipeline;
    }

    /**
     * 
     * @param {Phase} _phase 
     */
    switchPhase(_phase) {

        this.#currenPhase = _phase;
    }
}