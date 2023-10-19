// const reflectClass = require('../libs/reflectClass.js');
// const reflectFunction = require('../libs/reflectFunction.js');
// const {ReflectionBabelDecoratorClass_Stage_0} = require('../libs/babelDecoratorClassReflection.js');
// const { contentType } = require('../response/decorator.js');
// const { PropertyDecorator } = require('../decorator/decoratorResult.js');
const {EventEmitter} = require('node:events');
const {Type} = require('../../libs/type.js');
const {checkType, isParent} = require('../../utils/type.js');

const FunctionInjectorEngine = require('../injector/functionInjectorEngine.js');
const isAbstract = require('reflectype/src/utils/isAbstract.js');
const {CONSTRUCTOR} = require('../constants.js');

const Interface = require('reflectype/src/interface/interface.js');
const DependenciesInjectionSystem = require('../DI/dependenciesInjectionSystem.js');

class Empty {

    constructor() {

    };
}

class IocContainerSetDefaultInstanceError extends Error {

    constructor() {

        super('can not set default to Transient Component');
    }
}

class IocContainer extends EventEmitter {

    #container = new WeakMap();

    #stringKeys = new Map();

    #singleton = new WeakMap();

    // /**@type {FunctionInjectorEngine} */
    // #functionInjector;

    /**@type {DependenciesInjectionSystem} */
    #injector;

    get injector() {

        return this.#injector;
    }

    constructor() {

        super();

        this.#init();
    }

    #init() {

        this.#injector = new DependenciesInjectionSystem(this);
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

        if (!(abstract instanceof Interface)) {

            this.injector.inject(abstract);
        }
        
        this.injector.inject(concrete);

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

        this.#singleton.set(abstract, new Empty());
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
        
        const concrete = this.#container.get(abstract);
        
        let result;

        if (this.#singleton.has(abstract)) {
            
            const obj = this.#singleton.get(abstract);

            if (obj.constructor.name === "Empty") {

                const instance = this.build(concrete);

                this.#singleton.delete(abstract);
                this.#singleton.set(abstract, instance);

                result = instance;
            }
            else {

                result = obj;
            }
        }
        else {
            //return this.build(concrete);
            result = this.build(concrete);
        }
        
        return result;
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

        // const pseudoConstructor = concrete.prototype[CONSTRUCTOR];
        
        // if (typeof pseudoConstructor === 'function') {
            
        //     this.injector.inject(pseudoConstructor);

        //     const instance = new concrete();

        //     pseudoConstructor.call(instance);

        //     return instance;
        // }

        const instance = new concrete();

        this.#injector.inject(instance);

        return instance;
    }
}

module.exports = IocContainer;



