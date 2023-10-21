/**
 * @typedef {import('../context/context.js')} Context
 */

module.exports = class Contextual {

    /**@@type {Context.constructor} */
    #global;
    
    get global() {

        return this.#global;
    }

    constructor(_globalContext) {

        this.#global = _globalContext;

        this.#init();
    };

    #init() {

        if (typeof this.global?.components?.container.get !== 'function') {

            throw new TypeError('need an ioc container');
        }
    }
}