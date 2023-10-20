/**
 * @typedef {import('../ioc/iocContainer.js')} IocContainer
 */

module.exports = class Injector {

    static #context;

    static setContext(_context) {


    }

    /**@type {IocContainer} */
    #iocContainer;

    get iocContainer() {

        return this.#iocContainer;
    }

    constructor(_iocContainer) {

        this.#iocContainer = _iocContainer;
    }

    /** default behavior */
    inject() {


    }
}