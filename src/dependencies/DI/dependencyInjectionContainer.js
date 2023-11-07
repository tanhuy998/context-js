const ComponentContainer = require('../component/componentContainer.js'); 
const Scope = require('../component/scope');

module.exports = class DependencyInjectionContainer {

    #iocContainer;

    get iocContainer() {

        return this.#iocContainer;
    }

    constructor(_iocContainer) {

        this.#iocContainer = _iocContainer;

        this.#init();
    }


    #init() {

        if (!(this.#iocContainer instanceof ComponentContainer)) {

            throw new TypeError('DependencyInjectionContainer need a ComponentContainer to function');
        }
    }

    #isAsyncCoordinator(_component) {

        
    }

    get(_component, _scope) {

        const container = this.#iocContainer;

        return container.get(_component, Scope);
    }

    build(_abstract, _scope) {

        const container = this.#iocContainer;

        return container.build(_abstract, Scope);
    }
}