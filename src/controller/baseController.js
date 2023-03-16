//const { obj } = require("../model/chatroom/chatRoom.schema");
const {DecoratorResult} = require('../decorator/decoratorResult.js');
const ControlerState = require('./controllerState.js');
const ControllerConfiguration = require('./controllerConfiguration.js');
const IocContainer = require('../ioc/iocContainer.js');
const ControllerComponentManager = require('./controllerComponentManager.js');
//const {httpContext} = require('./requestDispatcher.js');


function dispatchable(_class) {

    _class.action = new Proxy(_class, BaseController.proxyHandler);

    return _class;
}

class BaseController  {

    //static httpContext;

    static proxyHandler = {

        get: (target, prop) => {

            if (prop == 'proxy') return target.proxy;
    
            const result = [];
    
            result.push(target);
            result.push(prop);

            return result;
        }
    };

    static #config;
    static #iocContainer;
    static #supportIoc = false;
    static #assistant;

    static get assistant() {

        return this.#assistant;
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

    static useIoc(_container) {

        if (_container) {
            
            this.#iocContainer = _container;

            this.#config = new ControllerConfiguration(_container);
        }
        else {

            this.#iocContainer = IocContainer;

            this.#config = new ControllerConfiguration(IocContainer);
        }

        this.#assistant = new ControllerComponentManager(IocContainer, this.#config);
        this.#supportIoc = true;
    };
    //static proxy = new Proxy(BaseController, BaseController.proxyHandler);

    //@httpContext
    #context;
    #decoratedList;
    #controllerComponentAssistant;

    get components() {

        return this.#controllerComponentAssistant;
    }

    constructor() {
        this.#decoratedList = [];

        if (BaseController.supportIoc) {
            
            this.#controllerComponentAssistant = new ControllerComponentManager(BaseController.iocContainer, BaseController.configuration, this);
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
