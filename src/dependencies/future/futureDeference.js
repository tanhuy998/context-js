require('core-js/proposals/promise-with-resolvers');

module.exports = class FututeDeference {

    /**@type {Promise<any>} */
    #futureValue;

    /**@type {Function} */
    #resolve;

    /**@type {Function} */
    #reject;

    /**@type {Promise<any>} */
    get value() {

        return this.#futureValue;
    }

    constructor() {

        this.#init();
    }

    #init() {

        const {promise, resolve, reject} = Promise.withResolvers();

        this.#futureValue = promise;
        this.#resolve = resolve;
        this.#reject = reject;
    }
    
    /**
     * 
     * @param {any} _value 
     */
    resolve(_value) {

        this.#resolve(_value);
    }

    /**
     * 
     * @param {any} _value 
     */
    reject(_value) {

        this.#reject(_value);
    }
}