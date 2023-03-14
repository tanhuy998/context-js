module.exports = class ControllerConfiguration {

    #container;

    #scope = new Set();

    constructor(_container) {

        this.#container = _container;
    }

    getScope() {

        return this.#scope;
    }

    bindSingleton(key, value) {

        this.#container.bindSingleton(key, value);
    }

    bind(key, value) {

        this.#container.bind(key, value);
    }

    bindScope(key, value) {

        const scope = this.#scope;

        scope.add(key);

        this.#container.bind(key, value);
    }
}  