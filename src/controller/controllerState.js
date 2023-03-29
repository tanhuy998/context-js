module.exports = class ControlerState {

    #components = new WeakMap();
    #keys = new Map();
    #scope;

    constructor(controllerConfiguration) {

        this.#scope = controllerConfiguration.getScope();
    }

    #Init() {

    }

    isLoaded(key) {

        if (typeof key == 'string') {

            return this.#keys.has(key);
        }

        return this.#components.has(key);
    }

    load(_component, _container) {
        
        const component = _component;

        if (!this.#scope.has(component)) return;

        //if (!this.#components.has(component)) return;

        const instance = _container.build(component, this);

        this.#components.set(component, instance);

        this.#keys.set(component.name, instance);
    }

    getComponentByKey(_key) {

        if (!this.#keys.has(_key)) return undefined;

        return this.#keys.get(_key);
    }

    get(component) {

        return this.#components.get(component);
    }
}