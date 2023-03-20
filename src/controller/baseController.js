//const { obj } = require("../model/chatroom/chatRoom.schema");
const {DecoratorResult} = require('../decorator/decoratorResult.js');
const ControlerState = require('./controllerState.js');
const ControllerConfiguration = require('./controllerConfiguration.js');
const IocContainer = require('../ioc/iocContainer.js');
const ControllerComponentManager = require('./controllerComponentManager.js');
//const {httpContext} = require('./requestDispatcher.js');


function dispatchable(_class) {

    _class.action = new Proxy(_class, BaseController.dispatch);

    return _class;
}

class BaseController  {

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

    static #config;
    static #iocContainer;
    static #supportIoc = false;
    static #componentManager;

    static get components() {

        return this.#config;
    }

    static get supportIoc() {

        return this.#supportIoc;
    }

    static get configuration() {

        return this.#config;
    }

    static get iocContainer() {

        return this.#iocContainer;
    }

    static buildController(_concrete) {

        if (this.#supportIoc) {

            return this.#componentManager.buildController(_concrete);
        }

        return new _class();
    }

    static useIoc() {

        if (this.supportIoc) return;        

        const container = new ControllerComponentManager();

        this.#config = container.configuration;

        this.#componentManager = container;
        
        this.#supportIoc = true;
    };
    //static proxy = new Proxy(BaseController, BaseController.proxyHandler);

    //@httpContext
    #context;
    #decoratedList;
    #state;

    get state() {

        return this.#state;
    }

    constructor() {
        this.#decoratedList = [];

        // if (BaseController.supportIoc) {
            
        //     //this.#components = new ControllerComponentManager(BaseController.iocContainer, BaseController.configuration, this);
        //     this.#state = new ControlerState(BaseController.configuration);
        // }
    }

    setState(controllerState) {

        if (this.#state) return;

        if (this.controllerState instanceof ControlerState) return;

        if (BaseController.supportIoc) {

            this.#state = controllerState;
        }
    }

    setContext(_httpContext) {

        if (!this.#context) {

            this.#context = _httpContext;
        }
    }

    pushDecoratedProp(decoratedResult) {
        
        this.#decoratedList.push(decoratedResult);
    }

    async resolveProperty() {

        const props = Object.getOwnPropertyNames(this);

        for (const propName of props) {

            if (this[propName] == undefined) continue;

            if (this[propName].constructor.name == 'PropertyDecorator') {

                await this[propName].bind(this).resolve();
            }
        }
    }

    get httpContext() {

        return this.#context;
    }
};

module.exports = {BaseController, dispatchable};
