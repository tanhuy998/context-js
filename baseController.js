//const { obj } = require("../model/chatroom/chatRoom.schema");

class BaseController  {

    static proxyHandler = {

        get: (target, prop) => {

            if (prop == 'proxy') return target.proxy;
            
            const object = new target();
    
            const the_object_prop = object[prop];
    
            const result = [];
    
            result.push(object);
    
            if (!the_object_prop) {
    
                result.push((req, res, _next) => { _next()}); 
            } 
            else if (the_object_prop.constructor.name == 'Function') {
    
                result.push(the_object_prop.bind(object))
            }
            else {
    
                result.push(object[prop])
            }
    
            return result;
        },
        
        construct: (target, args) => {
            return new target(...args);
        }
    };
    static proxy = new Proxy(BaseController, BaseController.proxyHandler);

    #context;

    constructor() {

    }

    setContext(req, res, _next) {

        if (!this.#context) {

            this.#context = {
                request: req,
                response: res,
                nextMiddleware: _next
            }
        }
    }

    get httpContext() {

        return this.#context;
    }

    print() {

        console.log(this.#context);
    }
};

module.exports = BaseController;
