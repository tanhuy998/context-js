const AppState = require('../../appState.js');
const IlegalRuntimeConfigError = require('../errors/IlegalRuntimeConfigError.js');
const ComponentContainer = require('./componentContainer.js');
const {CONSTRUCTOR, METADATA, TYPE_JS} = require('../constants.js');

//const Scope = require('./scope.js');
const {initTypePropertyField, getTypeMetadata, initMetadataField, decoratePseudoConstructor} = require('../../utils/metadata.js');
const { property_metadata_t } = require('reflectype/src/reflection/metadata.js');
const {decorateMethod} = require('reflectype/src/libs/methodDecorator.js');
const initFootPrint = require('reflectype/src/libs/initFootPrint.js');
const self = require('reflectype/src/utils/self.js');
class ComponentManager {

    /**
     *  @typedef {import('./componentContainer.js') ComponentContainer}
     */

    /**
     *  @type {ComponentContainer}
     */
    #container;
    
    #keys = new Map();

    #scope = new Set();

    #app;

    get container() {

        return this.#container;
    }

    constructor(_container, {appContext} = {}) {

        //this.#app = appContext;

        this.#container = _container instanceof ComponentContainer ? _container : new ComponentContainer();

        this.#init();
        this.#initPresetComponent();
    }

    get isRuntime() {

        return this.#app?.state === AppState.RUNTIME;
    }

    #init() {

        const container = this.#container;

        const baseClass = this.constructor;

        container.bindSingleton(baseClass, baseClass);
        container.setDefaultInstanceFor(baseClass, this);
    }

    #initPresetComponent() {

        //const componentManagerClass = this.constructor;
        
        const Scope = require('./scope.js');

        decoratePseudoConstructor(Scope, {paramsType: [self(this)]});
        // const pseudoConstructor = Scope.prototype[CONSTRUCTOR];
        // /**@type {property_metadata_t} */
        // const meta = getTypeMetadata(pseudoConstructor);
        
        // meta.defaultParamsType = [componentManagerClass];
        this.bindScope(Scope, Scope);
    }

    #checkState() {

        if (this.isRuntime) {

            throw new IlegalRuntimeConfigError();
        }
    }

    getScope() {

        // const shallowCopy = Array.from(this.#scope);
        
        // return new Set(shallowCopy);

        return this.#scope;
    }

    getByKey(_key) {

        if (!this.#keys.has(_key)) return undefined;

        return this.#keys.get(_key);
    }

    #addScopeComponent(component) {

        this.#scope.add(component);

        //const component = this.#scope.get(component);

        //this.#keys.set(component.name, component);
    }

    bindSingleton(abstract, concrete) {

        concrete ??= abstract;

        this.#checkState();

        this.#container.bindSingleton(abstract, concrete);
    }

    bind(abstract, concrete) {

        concrete ??= abstract;

        this.#checkState();

        this.#container.bind(abstract, concrete);
    }

    bindScope(abstract, concrete) {

        concrete ??= abstract;

        this.#checkState();

        this.#addScopeComponent(abstract);

        this.#container.bind(abstract, concrete);
    }

    get(component, scope) {

        return this.#container.get(component, scope);
    }
}



module.exports = ComponentManager;