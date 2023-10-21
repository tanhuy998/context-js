const DependenciesInjectionSystem = require('../DI/dependenciesInjectionSystem.js');
const ComponentContainer = require('../component/componentContainer.js');
const ItemsManager = require('../itemsManager.js');
const Pipeline = require('../pipeline/pipeline.js');
const Scope = require('../component/scope.js');


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
    static #fullyInject = false;

    static #iocContainer = new ComponentContainer();
    static #configurator;

    static #pipeline = new Pipeline(this);

    static #items = new ItemsManager();

    static #DI_System = new DependenciesInjectionSystem(this.iocContainer);

    static get DI() {

        return this.#DI_System;
    }

    static get pipeline() {

        return this.#pipeline;
    }

    static get items() {

        return this.#items;
    }

    static get fullyInject() {

        return typeof this.#fullyInject === 'boolean' ? this.#fullyInject : false;
    }

    static get iocContainer() {
        
        return this.#iocContainer;
    }

    static configure() {

        return this.#configurator;
    }


    /**
     *  scope of components
     * 
     *  @type {Scope}
     */
    #scope;

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

        this.#scope = this.constructor.iocContainer.get(Scope);
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