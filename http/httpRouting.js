const {dispatchRequest} = require('../requestDispatcher');
const {preprocessDescriptor} = require('../utils.js');
const {decoratorContext} = require('../baseController.js');
const PreInvokeFuncion = require('../preInvokeFunction.js');

class Route {

    static #routerObject;
    //static #controllers;

    static #callbackQueue = [];
    
    static get router() {

        return Route.#routerObject;
    }

    static init(_express) {

        if (!Route.router) {

            Route.#routerObject = _express.Router();

            //Route.dequeue();
            return;
        }
    }

    static dequeue() {

        const callbackQueue = Route.#callbackQueue;

        const the_router = Route.router;

        for (const callback of callbackQueue) {
            console.log('dequeue');
            callback.bind(the_router).invoke();
        }

        Route.#callbackQueue = [];
    }

    // this method will be called when there is no express's router object is initialized
    static #dispatchRouter() {

        return function(method, path, controllerClass, action) {
            console.log(controllerClass)
            Route.router[method](path, dispatchRequest(controllerClass, action));
        }
    }

    static define(httpMethod, _path, _controllerClass, _action) {
        console.log('define route', httpMethod, _path, _controllerClass, _action)
        console.log(decoratorContext.currentContext);
        //if (!Route.router) throw new Error('Controller route decorator: router is not set, we must init the "Express" instance to the Route class');
        if (!Route.router) {
            
            const callback = new PreInvokeFuncion(Route.#dispatchRouter())

            callback.passArgs(httpMethod, _path, _controllerClass, _action);
            
            Route.#queue(callback);
            
            return;
        }

        
        Route.router[httpMethod](_path, dispatchRequest(..._controllerClass.proxy[_action]));
    }

    static #queue(callback) {

        Route.#callbackQueue.push(callback);
    }

    static resolve() {

        Route.dequeue();

        return Route.router;
    }
}

const Router = new Proxy(Route, {

    get: (RouteClass, httpMethod) => {

        return function(path) {

            return function(_controllerClass, _actionName, descriptor) {

                const decoratedResult = preprocessDescriptor(_controllerClass, _actionName, descriptor);

                if (decoratedResult.constructor.name == 'MethodDecorator') {

                    RouteClass.define(httpMethod, path, _controllerClass, _actionName);

                    return descriptor;
                }

                return descriptor;
            }
        }
    },
    set: () => {

        return false;
    }
})



module.exports = {Route, Router}