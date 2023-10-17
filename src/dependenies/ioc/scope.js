const ControllerConfiguration = require('./controllerConfiguration.js');

/**
 *  @typedef {import('./controllerComponentManager.js')} ControllerComponentManager
 */

module.exports = class Scope {

    #components = new WeakMap();
    #keys = new Map();

    /**
     *  @type {Set?}
     */
    #scope;

    /**
     *  @type {WeakMap?}
     */
    #overriddenScope;

    constructor(controllerConfiguration = ControllerConfiguration) {
    // default argument is for dependencies injection, not for passing argument
        
        this.#scope = controllerConfiguration.getScope();
    }

    #Init() {

    }

    isLoaded(key) {

        if (typeof key === 'string') {

            return this.#keys.has(key);
        }

        return this.#components.has(key);
    }

    /**
     * 
     * @param {Object} _component 
     * @param {ControllerComponentManager} _container 
     * 
     * @returns {undefined}
     */
    load(_component, _container) {
        
        const component = _component;

        if (!this.#scope.has(component)) return;

        //if (!this.#components.has(component)) return;

        const instance = _container.build(component, this);
        //const instance = _container.get(component, this);
        
        this.#components.set(component, instance);

        this.#keys.set(component.name, instance);
    }

    /**
     *  @typedef {Object} OverrideMeta
     *  @property {Object} defaultInstance
     *  @property {string} componentKey
     *  @property {ControllerComponentManager} iocContainer 
     */

    /**
     *   
     * @param {Object} _abstract 
     * @param {Object} _concrete 
     * @param {OverrideMeta} param2 
     */
    override(_abstract, _concrete, {defaultInstance, componentKey, iocContainer}) {

        const isValidBinding = iocContainer ? iocContainer._isParent(_abstract, _concrete) : ControlerState._isParent(_abstract, _concrete);

        if (!isValidBinding) {

            throw new Error('binding error, _concrete not inherited _abstract');
        }

        if (!this.#overriddenScope) {

            this.#overriddenScope = new WeakMap();
        }

        this.#overriddenScope.set(_abstract, _concrete);

        let key;
        
        if (componentKey && typeof componentKey === 'string') {

            key = componentKey;
        }
        else {

            key = _abstract.realName || _abstract.name;
        }
       
        if (defaultInstance && defaultInstance instanceof _concrete) {

            if (this.#components.has(_abstract)) {

                this.#components.delete(_abstract);
            }

            this.#components.set(_abstract, defaultInstance);

            if (this.#keys.has(key)) {

                this.#keys.delete(key);
            }

            this.#keys.set(key, defaultInstance);
        }

    }

    /**
     * 
     * @param {Object} _abstract 
     * @returns {boolean}
     */
    has(_abstract) {

        return this.#overriddenScope?.has(_abstract) || this.#scope.has(_abstract);
    }

    /**
     * 
     * @param {Object} base 
     * @param {Object} derived 
     * @returns {boolean}
     */
    static _isParent(base, derived) {

        if (derived === base) return true;

        let prototype = derived.__proto__;

        while(prototype !== null) {
            
            if (prototype === base) {

                return true;
            }

            prototype = prototype.__proto__;
        } 
    }

    /**
     * 
     * @param {Object} _component 
     * @param {Object} _instance 
     * @param {ControllerComponentManager} _container 
     */
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