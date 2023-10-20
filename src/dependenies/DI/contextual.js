
module.exports = class Contextual {

    #container;

    get componentContainer() {

        return this.#container;
    }

    constructor(_iocContainer) {

        this.#container = _iocContainer;

        this.#init();
    };

    #init() {

        const container = this.#container;

        if (typeof container.get !== 'function') {

            throw new TypeError('need an ioc container');
        }
    }
}