//const { obj } = require("../model/chatroom/chatRoom.schema");
const {DecoratorResult} = require('./decoratorResult.js');

class BaseController  {

    static proxyHandler = {

        get: (target, prop) => {

            if (prop == 'proxy') return target.proxy;
            
            // const object = new target();
    
            // const the_object_prop = object[prop];
    
            const result = [];
    
            // result.push(object);
    
            // if (!the_object_prop) {
    
            //     result.push((req, res, _next) => { _next()}); 
            // } 
            // else if (the_object_prop.constructor.name == 'Function') {
    
            //     result.push(the_object_prop.bind(object))
            // }
            // else {
    
            //     result.push(object[prop])
            // }
    
            result.push(target);
            result.push(prop);

            return result;
        },
        
        // construct: (target, args) => {
        //     return new target(...args);
        // }
    };
    static proxy = new Proxy(BaseController, BaseController.proxyHandler);

    #context;
    #decoratedList;

    constructor() {
        this.#decoratedList = [];
    }

    setContext(_httpContext) {

        if (!this.#context) {

            // this.#context = {
            //     request: req,
            //     response: res,
            //     nextMiddleware: _next
            // }

            this.#context = _httpContext;
        }
    }

    pushDecoratedProp(decoratedResult) {

        this.#decoratedList.push(decoratedResult);
    }

    resolveProperty() {

        for (const prop of this.#decoratedList) {

            prop.bind(this).resolve();
        }
    }

    get httpContext() {

        return this.#context;
    }
};

module.exports = BaseController;
