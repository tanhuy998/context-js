module.exports = class ControllerConfigurator {

    /**
     *  @typedef {import('./controllerComponentManager') ControllerComponentManager}
     */

    /**
     *  @type {ControllerComponentManager}
     */
    #container;
    
    #keys = new Map();

    #scope = new Set();

    constructor(_container = undefined) {

        this.#container = _container;
    }

    getScope() {

        const shallowCopy = Array.from(this.#scope);
        
        return new Set(shallowCopy);
    }

    getByKey(_key) {

        if (!this.#keys.has(_key)) return undefined;

        return this.#keys.get(_key);
    }

    #addScopeComponent(component) {

        this.#scope.add(component);

        //const component = this.#scope.get(component);

        this.#keys.set(component.name, component);
    }

    bindSingleton(key, value) {

        this.#container.bindSingleton(key, value);
    }

    bind(key, value) {

        this.#container.bind(key, value);
    }

    bindScope(key, value) {

        this.#addScopeComponent(key);

        this.#container.bind(key, value);
    }
}  