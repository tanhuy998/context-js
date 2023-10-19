/**
 * @typedef {import('../ioc/iocContainer.js')} IocContainer
 */

module.exports = class Injector {

    /**@type {IocContainer} */
    #iocContainer;

    get iocContainer() {

        return this.#iocContainer;
    }

    constructor(_iocContainer) {

        this.#iocContainer = _iocContainer;
    }
}