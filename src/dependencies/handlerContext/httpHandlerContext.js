const RoutingMethod = require('./routing/routingMethod.js');
const HandlerContextRouteBindingConfigError = require('./exception/handlerContextRouteBindingConfigError.js');
const HttpController = require('../controller/httpController.js');

class HttpHandlerContext {
    
    #routingMethod; 
    #router;



    constructor(_appContext) {

        super(...arguments);
    }

    useController(...ControllerClasses) {

        for (const Controller of ControllerClasses) {

            if (Controller.prototype instanceof HttpController) {

                continue;
            }
            else {

                throw new TypeError(`invalid controller [${Controller.name}]`);
            }
        }

        for (const Class of controllerClasses) {

            const isController = Class.prototype instanceof BaseController;
            const isRegistered = isController  && this.#controllers.has(Class);

            if (isController && !isRegistered) {

                this.#controllers.add(Class);
            }
            else if (isRegistered) {

                continue;
            }
            else {

                throw new TypeError('could not register ${c.name} not type of BaseController');
            }
        }

        return this;

        return this;
    }

    useRouting(_routeInit) {

        if (!_routeInit) {

            this.#routingMethod = RoutingMethod.CONTROLLER;

            return this;
        }

        if (typeof _routeInit !== 'object') {

            throw new HandlerContextRouteBindingConfigError();
        }

        this.#routingMethod = RoutingMethod.CUSTOM;

        this.#bindRoutes();
        return this;
    }

    serve() {



        super.serve();
    }

    #bindRoutes() {


    }

    #mountConfig() {


    }

    #generateHandler() {


        return function(req, res, next) {


        }
    }
}

module.exports = HttpHandlerContext;