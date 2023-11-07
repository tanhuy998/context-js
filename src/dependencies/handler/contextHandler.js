/**
 * @typedef {import('../context/context.js')} Context
 */

module.exports = class ContextHandler {

    /**@type {Context} */
    #context;

    #devise;

    /**@returns {Context} */
    get context() {

        return this.#context;
    }

    get devise() {

        return this.#devise;
    }

    /**@returns {any} */
    get lastValue() {

        return this.#devise;
    }

    /**
     * 
     * @param {Context} _context 
     * @param {any} _devise 
     */
    constructor(_context, _devise) {

        this.#context = _context;
        this.#devise = _devise;
    }

    handle() {


    }
}