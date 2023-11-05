const {checkType} = require('../../utils/type.js');
const isAbstract = require('reflectype/src/utils/isAbstract.js');

const Interface = require('reflectype/src/interface/interface.js');
const ObjectInjectorEngine = require('../injector/objectInjectorEngine.js');
const IocContainerSetDefaultInstanceError = require('../errors/iocContainerSetDefaultInstanceError.js');

class Empty {

    constructor() {

    };
}


const EMPTY = 0;

module.exports = class IocContainer {

    /**
     * the first offest of the objects pool is an empty object
     */
    #objectsPool = [new Empty()];

    /**
     * mapping table between abstracts and concretes
     */
    #container = new WeakMap();

    #stringKeys = new Map();

    /**
     * singleton objects
     */
    #singleton = new WeakMap();

    /**@type {ObjectInjectorEngine} */
    #objectInjector;

    constructor() {
        
        this.#init();
    }

    #init() {

        this.#objectInjector = new ObjectInjectorEngine(this);
    }

    bindArbitrary(key, value) {

        if (this.#stringKeys.has(key)) {

            this.#stringKeys.delete(key);
        }

        this.#stringKeys.set(key, value);
    }

    /**
     * 
     * @param {Object} abstract 
     * @param {Object} concrete 
     * @param {boolean} override 
     */
    bind(abstract, concrete, override = false) {

        checkType(abstract, concrete);

        if (this.#container.has(abstract) && override) {

            this.#container.delete(abstract);
        }

        this.#container.set(abstract, concrete);
    }

    /**
     * 
     * @param {Object} abstract 
     * @param {Object} concrete 
     * @param {boolean} override 
     */
    bindSingleton(abstract, concrete, override = false) {

        this.bind(abstract, concrete, override);

        if (this.#singleton.has(abstract) && override) {

            this.#singleton.delete(abstract);
        }

        const empty = this.#objectsPool[EMPTY];

        this.#singleton.set(abstract, empty);
    }

    /**
     * 
     * @param {Object} _abstract 
     * @returns {boolean} 
     */
    has(_abstract) {

        return this.#container.has(_abstract);
    }

    /**
     * 
     * @param {string} key 
     * @returns {boolean}
     */
    hasKey(key) {

        return this.#stringKeys.has(key);
    }

    /**
     * 
     * @param {string} key 
     * @returns {Object | undefined}
     */
    getConcreteByKey(key) {

        const abstract = this.getAbstractByKey(key);

        if (abstract) {

            return this.getConcreteOf(abstract);
        }
        else {

            return undefined;
        }
    }

    /**
     * 
     * @param {Object} abstract 
     * @returns {Object | undefined}
     */
    getConcreteOf(abstract) {

        if (!this.#container.has(abstract)) return undefined;

        return this.#container.get(abstract);
    }

    /**
     * 
     * @param {string} key 
     * @returns {Object | undefined}
     */
    getAbstractByKey(key) {

        if (!this.#stringKeys.has(key)) return undefined;

        return this.#stringKeys.get(key);
    }

    /**
     * 
     * @param {Object} _abstract 
     * @returns {boolean}
     */
    hasSingleton(_abstract) {

        return this.#singleton.has(_abstract);
    }

    /**
     * 
     * @param {Object} abstract 
     * @param {Object} _constructorArgs 
     * @returns {Object | undefined}
     */
    get(abstract, _constructorArgs = {}) {
        
        if (!this.#container.has(abstract)) {
            
            return undefined;
        }

        if (this.#singleton.has(abstract)) {

            return this.#resolveSingpleton(abstract);
        }
        else {

            const concrete = this.#container.get(abstract);

            return this.build(concrete);
        }
    }

    #resolveSingpleton(abstract) {

        const obj = this.#singleton.get(abstract);

        if (obj.constructor === Empty) {

            const concrete = this.#container.get(abstract);

            const instance = this.build(concrete);

            this.#singleton.delete(abstract);
            this.#singleton.set(abstract, instance);

            return instance;
        }
        else {

            return obj;
        }
    }

    // will overide the instantiated singleton instance
    setDefaultInstanceFor(_abstract, _instance) {

        if (!this.has(_abstract)) {

            throw new Error('');
        }

        const instancePrototype = _instance.constructor;

        checkType(_abstract, instancePrototype);

        if (this.#singleton.has(_abstract)) {

            this.#singleton.delete(_abstract);

            this.#singleton.set(_abstract, _instance);
        }
        else {

            throw new IocContainerSetDefaultInstanceError();
        }
    }

    /**
     * 
     * @param {string} key 
     * @param {Object} _constructorArgs 
     * @returns {Object | undefined} 
     */
    getByKey(key, _constructorArgs = {}) {

        if (!this.#stringKeys.has(key)) return undefined;

        const abstract = this.#stringKeys.get(key);
        
        const concrete =  this.get(abstract, _constructorArgs);

        if (concrete) {

            return concrete;
        } 
        else {

            return this.build(abstract);
        }
    }

    build(concrete) {

        if (concrete instanceof Interface) {

            throw new TypeError('iocContainer refused to build instance of [Interface]');
        }

        if (!isAbstract(concrete)) {

            throw new Error(`cannot build [${concrete?.name ?? concrete}]`);
        }

        const instance = new concrete();

        this.#objectInjector.inject(instance);

        return instance;
    }
}



