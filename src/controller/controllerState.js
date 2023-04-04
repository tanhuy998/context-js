const ControllerConfiguration = require('./controllerConfiguration.js');

module.exports = class ControlerState {

    #components = new WeakMap();
    #keys = new Map();
    #scope;

    constructor(controllerConfiguration = ControllerConfiguration) {
        
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
        //const instance = _container.get(component, this);
        
        this.#components.set(component, instance);

        this.#keys.set(component.name, instance);
    }

    

    loadInstance(_component, _instance, _container) {
        // this method need the third parameter as an instance of IocContainer
        // to get refernce reach type checking for _instance
        // in case there is no fixedContext setted to BindingContext


        if (!this.#scope.has(_component)) {

            throw new Error(`scope does not bind ` + _component.name);
        }

        if (this.isLoaded(_component)) {

            throw new Error('there is instance which was load for scope')
        }

        const instanceConstructor = _instance.constructor;

        if (!_container._isParent(_component, instanceConstructor)) {

            throw new Error('the loaded instance is not inherit ' + _component.name);
        }

        this.#components.set(_component, _instance);
    }

    getComponentByKey(_key) {

        if (!this.#keys.has(_key)) return undefined;

        return this.#keys.get(_key);
    }

    get(component) {

        return this.#components.get(component);
    }
}