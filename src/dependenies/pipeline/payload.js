/**
 * @typedef {import('./phase.js')} Phase
 * @typedef {import('../context/context.js')} Context
 * @typedef {import('../handler/constextHandler.js')} ContextHandler
 */

module.exports = class Payload {

    /**@type {Context} */
    #context;

    #stackStrace = [];

    /**@type {Phase} */
    #currenPhase;

    #handleInstannce;

    get trace() {

        return this.#stackStrace;
    }

    get last() {

        const length = this.#stackStrace.length;

        const last = length > 0 ? length - 1 : 0;

        return this.#stackStrace[last];
    }

    get currentPhase() {

        return this.#currenPhase;
    }

    get context() {

        return this.#context;
    }

    get handler() {

        return this.#handleInstannce;
    }
    /**
     * 
     * @param {Context} _context 
     */
    constructor(_context) {

        this.#context = _context;
    }

    /**
     * 
     * @param {Phase} _phase 
     * @param {ContextHandler?} _handler 
     */
    switchPhase(_phase, _handler) {

        this.#currenPhase = _phase;
        this.#handleInstannce = _handler;
    }
}