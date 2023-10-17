const ItemsManager = require('../itemsManager.js');
const Pipeline = require('../pipeline/pipeline.js');

/**
 *  a configuration class
 */
class Context {

    static #iocContainer;
    static #configurator;

    static #pipeline = new Pipeline();

    static #items = new ItemsManager();

    static get pipeline() {

        return this.#pipeline;
    }

    static get items() {

        return this.#items;
    }

    static get iocContainer() {

        return this.#iocContainer;
    }

    static configure() {

        return this.#configurator;
    }

    #DI_Scope;
    #session = new ItemsManager();

    get session() {

        return this.#session;
    }

    get items() {

        return this.constructor.items;
    }

    constructor() {

        this.#DI_Scope = this.constructor.iocContainer.generateScope();
    }

    getComponent(_abstract) {

        const iocContainer = this.constructor.iocContainer;

        return iocContainer.get(_abstract, this.#DI_Scope);
    }

    overrideScope(_abstract, _concrete, {defaultInstance, componentKey, iocContainer}) {

        this.#DI_Scope.overide(_abstract, _concrete, {defaultInstance, componentKey, iocContainer});
    }
} 

module.exports = Context;