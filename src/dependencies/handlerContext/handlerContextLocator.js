const Factory = require('../designPattern/factory.js');
const HandlerContextInitializer = require('./base/handlerContextInitializer.js');

class HandlerContextLocator {

    #handlerContexts = new Map();

    constructor() {


    }

    register(_name, _handlerContextClass) {

        const meetRequirements = _handlerContextClass.prototype instanceof HandlerContextInitializer && !this.#handlerContexts.has(_name);

        if (!meetRequirements) {

            return false;
        }

        this.#handlerContexts.set(_name, _handlerContextClass);

        return true;
    }

    getInitializer(_name) {

        return this.#lookup(_name);
    }

    #lookup(_name) {

        return this.#handlerContexts.get(_name);
    }
}

module.exports = HandlerContextLocator;