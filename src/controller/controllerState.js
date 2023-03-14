module.exports = class controlerState {

    #components = new WeakMap();
    #scope;

    constructor(controllerConfiguration) {

        this.#scope = controllerConfiguration.getScope();
    }

    #Init() {

    }

    loaded(key) {

        return this.#components.has(key);
    }

    load(_key, _container) {

        if (this.#scope.has(_key)) return;

        if (this.#components.has(_key)) return;

        const component = _container.build(_key);

        this.#components.set(_key, component);
    }

    get(key) {

        return this.#components.get(key);
    }
}