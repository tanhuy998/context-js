const DependenciesInjectionSystem = require('../DI/dependenciesInjectionSystem.js');
const ComponentContainer = require('../component/componentContainer.js');
const ComponentManager = require('../component/componentManager.js')
const ItemsManager = require('../itemsManager.js');
const Pipeline = require('../pipeline/pipeline.js');
const Scope = require('../component/scope.js');

const self = require('reflectype/src/utils/self.js');

const SessionCoordinator = require('../coordinator/sessionCoordinator.js');
const { decoratePseudoConstructor } = require('../../utils/metadata.js');
const ContextHandler = require('../handler/contextHandler.js');
const ErrorHandlerAcceptanceMatcher = require('../handler/errorHandlerAcceptanceMatcher.js');
const ContextLockable = require('../lockable/contextLockable.js');

/**
 * @typedef {import('../component/scope.js')} Scope
 */



/**
 *  a configuration class
 */
module.exports = class Context {

    /** 
     * flag for fully inject when initiating components 
     * 
     * @type {boolean} 
     */
    static fullyInject = false;

    /**@type {ComponentManager} */
    static componentManager

    static configurator;

    /**@type {Pipeline} */
    static pipeline

    /**@type {ItemsManager} */
    static items

    /**@type {DependenciesInjectionSystem} */
    static DI_System

    static lockableObjects = [];

    static isLocked = false;

    /**@returns {DependenciesInjectionSystem} */
    static get DI() {

        return this.DI_System;
    }

    /**@returns {ComponentManager} */
    static get components() {

        return this.componentManager;
    }

    static __init() {

        if (this === Context) {

            throw new Error('[Context] must be inhertied as new class');
        }

        this._decorateDependencies();

        const iocContainer = new ComponentContainer();

        this.componentManager ??= new ComponentManager(iocContainer);
    
        this.pipeline ??= new Pipeline(this);
    
        this.items ??= new ItemsManager();
    
        this.DI_System ??= new DependenciesInjectionSystem(this);        

        /**
         *  binding components
         */
        this.componentManager.bindScope(this);
        this.componentManager.bindScope(Context, this);
        this.componentManager.bindScope(ContextHandler);
        this.componentManager.bindScope(Error);
        this.componentManager.bind(ErrorHandlerAcceptanceMatcher);

        decoratePseudoConstructor(SessionCoordinator, {paramsType: [Context]});
    }

    static __lock() {
        
        for (/**@type {Lockable} */ const lockable of this.lockableObjects ?? []) {

            lockable.lockOn(this);
        }

        this.isLocked = true;
    }

    static _decorateDependencies() {


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
     *  @type {ItemsManager}
     */
    #session = new ItemsManager();

    /**@returns {ItemsManager} */
    get session() {

        return this.#session;
    }

    /**@returns {typeof Context} */
    get global() {

        return this.constructor;
    }

    /**@returns {Scope} */
    get scope() {

        return this.#scope;
    }

    get isLocked() {

        return self(this).isLocked;
    }

    constructor() {

        this.#init();
    }

    #init() {

        this.#overideSelf();
    }
    #overideSelf() {
        
        const overideOptions = {
            defaultInstance: this
        }

        this.#scope.override(Context, self(this), overideOptions);
        this.#scope.override(self(this), self(this), overideOptions);
    }

    getComponent(_abstract) {

        const iocContainer = this.global.iocContainer;

        return iocContainer.get(_abstract, this.#scope);
    }

    overrideScope(_abstract, _concrete, {defaultInstance, componentKey, iocContainer}) {

        this.#scope.override(_abstract, _concrete, {defaultInstance, componentKey, iocContainer});
    }
}