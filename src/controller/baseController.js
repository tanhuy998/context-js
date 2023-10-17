const HttpContext = require('../httpContext.js');
const ControllerState = require('./controllerState.js');
const {PropertyDecorator} = require('../decorator/decoratorResult.js');
const ControlerState = require('./controllerState.js');



function dispatchable(_class) {

    _class.action = new Proxy(_class, BaseController.dispatch);

    return _class;
}

class BaseController extends Function{

    static #router

    //static httpContext;

    static dispatch = {

        get: (target, prop) => {

            if (prop == 'proxy') return target.proxy;
    
            const result = [];
    
            result.push(target);
            result.push(prop);

            return result;
        },
        set: () => false,
    };

    // static #config;
    // static #iocContainer;
    // static #supportIoc = false;
    // static #componentManager;

    // static get components() {

    //     return this.#config;
    // }

    // static get supportIoc() {

    //     return this.#supportIoc;
    // }

    // static get configuration() {

    //     return this.#config;
    // }

    // static get iocContainer() {

    //     return this.#componentManager;
    // }

    // static buildController(_concrete) {

    //     if (this.#supportIoc) {

    //         return this.#componentManager.buildController(_concrete);
    //     }

    //     return new _class();
    // }

    // static useIoc() {

    //     if (this.supportIoc) return;        

    //     const {decoratorVersion} = require('../../index.js');

    //     const container = new ControllerComponentManager(decoratorVersion);

    //     this.#config = container.configuration;

    //     this.#componentManager = container;

    //     BindingContext.fixedContext(container);
        
    //     this.#supportIoc = true;
    // };
    //static proxy = new Proxy(BaseController, BaseController.proxyHandler);

    /**
     *  @type {HttpContext}
     */
    #context;
    // #decoratedList;

    /**
     *  @type {ControlerState}
     */
    #state;

    /**
     *  @returns {ControlerState}
     */
    get state() {
        
        return this.#state;
    }

    constructor() {
        //this.#decoratedList = [];
    }

    /**
     * 
     * @param {ControlerState} _controllerState 
     */
    setState(_controllerState) {

        if (this.#state) return;

        if (this.controllerState instanceof ControllerState) return;

        //this.#context.setState(_controllerState);

        this.#state = _controllerState;

        // if (BaseController.supportIoc) {

        //     this.#state = controllerState;
        // }
        
    }

    /**
     * 
     * @param {HttpContext} _httpContext 
     */
    setContext(_httpContext) {

        if (!this.#context && _httpContext instanceof HttpContext) {

            this.#context = _httpContext;
        }
    }

    // pushDecoratedProp(decoratedResult) {
        
    //     this.#decoratedList.push(decoratedResult);
    // }

    resolveProperty() {

        const props = Object.getOwnPropertyNames(this);

        for (const propName of props) {

            if (this[propName] == undefined) continue;

            if (this[propName] instanceof PropertyDecorator) {

                this[propName].bind(this).resolve();
            }
        }
        // for (const prop of this.#decoratedList) {

        //     if (prop instanceof PropertyDecorator) {

        //         await prop.bind(this).resolve();
        //     }
        // }
    }

    /**
     *  @returns {HttpContext}
     */
    get httpContext() {

        return this.#context;
    }
};

module.exports = BaseController;
