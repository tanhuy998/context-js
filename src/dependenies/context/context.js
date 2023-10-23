const DependenciesInjectionSystem = require('../DI/dependenciesInjectionSystem.js');
const ComponentContainer = require('../component/componentContainer.js');
const ComponentManager = require('../component/componentManager.js')
const ItemsManager = require('../itemsManager.js');
const Pipeline = require('../pipeline/pipeline.js');
const Scope = require('../component/scope.js');

const self = require('reflectype/src/utils/self.js');

/**
 * @typedef {import('../component/scope.js')} Scope
 */

/**
 *  a configuration class
 */
class Context {

    /** 
     * flag for fully inject when initiating components 
     * 
     * @type {boolean} 
     */
    static fullyInject = false;

    //static #iocContainer //= new ComponentContainer();

    static componentManager //= new ComponentManager(this.#iocContainer);

    static configurator;

    static pipeline //= new Pipeline(this);

    static items //= new ItemsManager();

    static DI_System //= new DependenciesInjectionSystem(this.#iocContainer);

    static get DI() {

        return this.DI_System;
    }

    static get components() {

        return this.componentManager;
    }

    static __init() {

        if (this === Context) {

            throw new Error('[Context] must be inhertied as new class');
        }

        const iocContainer = new ComponentContainer();

        this.componentManager ??= new ComponentManager(iocContainer);
    
        this.pipeline ??= new Pipeline(this);
    
        this.items ??= new ItemsManager();
    
        this.DI_System ??= new DependenciesInjectionSystem(this);        
    }

    static configure() {

        return this.configurator;
    }


    /**
     * ------------------- END OF STATIC DECLARATION -----------------------------
     */

    /**
     *  scope of components
     * 
     *  @type {Scope}
     */
    #scope = self(this).components.get(Scope);;

    /**
     *  store annything
     */
    #session = new ItemsManager();

    get session() {

        return this.#session;
    }



    get global() {

        return this.constructor;
    }

    get scope() {

        return this.#scope;
    }

    constructor() {

        
    }

    getComponent(_abstract) {

        const iocContainer = this.global.iocContainer;

        return iocContainer.get(_abstract, this.#scope);
    }

    /**
     * 
     * @param {Object} _component 
     * _component is the instance not the abstract
     */
    #injectComponentMethods(_component) {

        
    }

    overrideScope(_abstract, _concrete, {defaultInstance, componentKey, iocContainer}) {

        this.#scope.overide(_abstract, _concrete, {defaultInstance, componentKey, iocContainer});
    }


} 

module.exports = Context;