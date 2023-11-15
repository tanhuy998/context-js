const IlegalRuntimeConfigError = require('../errors/IlegalRuntimeConfigError.js');
const ComponentContainer = require('./componentContainer.js');

const {decoratePseudoConstructor} = require('../../utils/metadata.js');
const self = require('reflectype/src/utils/self.js');
const ContextLockable = require('../lockable/contextLockable.js');

/**
 *  @typedef {import('./componentContainer.js') ComponentContainer}
 */

module.exports = class ComponentManager extends ContextLockable{

    static lockActions = ['bindSingleton', 'bind', 'bindScope']

    /**@type {ComponentContainer}*/
    #container;
    
    #keys = new Map();

    #scope = new Set();

    #global;

    get container() {

        return this.#container;
    }

    constructor(_container, _context) {

        super(_context);

        this.#container = _container instanceof ComponentContainer ? _container : new ComponentContainer();

        this.#checkGlobal();
        this.#init();
        this.#initPresetComponent();
    }

    #init() {

        const container = this.#container;

        const baseClass = this.constructor;

        container.bindSingleton(baseClass, baseClass);
        container.setDefaultInstanceFor(baseClass, this);
    }

    #checkGlobal() {

        
    }

    #initPresetComponent() {

        const Scope = require('./scope.js');

        decoratePseudoConstructor(Scope, {paramsType: [self(this)]});

        this.bindScope(Scope, Scope);
    }

    #checkState() {

        if (this.isLocked) {

            throw new IlegalRuntimeConfigError();
        }
    }

    getScope() {

        return this.#scope;
    }

    getByKey(_key) {

        if (!this.#keys.has(_key)) return undefined;

        return this.#keys.get(_key);
    }

    #addScopeComponent(component) {

        this.#scope.add(component);
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