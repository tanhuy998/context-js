const {preprocessDescriptor} = require('../decorator/utils');
//const {MethodDecorator, DecoratorResult} = require('../decorator/decoratorResult.js');
const {Route, RouteContext} = require('../http/httpRouting');


const obj = {};

const Middleware = new Proxy(obj, {
    method: {
        before: 0,
        after: 1
    },
    get: function(_target, _order) {

        if (!this.method.hasOwnProperty(_order)) throw new Error(`Middleware error: calling to invalid method of Middleware`);

        return function(..._middlewares) {

            return function(_class, _action, descriptor) {

                const decoratorResult = preprocessDescriptor(_class, _action, descriptor);  

                let routeSessionSymbol = decoratorResult.payload['routeSession'];

                if (!routeSessionSymbol) {
                    
                    routeSessionSymbol = RouteContext.startSession();
                    decoratorResult.payload['routeSession'] = routeSessionSymbol;
                    //console.log('start session', routeSessionSymbol);

                    decoratorResult.on('afterResolve', function() {

                        //console.log('end session', routeSessionSymbol)
                        RouteContext.endSession(routeSessionSymbol);
                    })
                }

                switch(_order) {
                    case 'before':
                        RouteContext.middlewareBeforeController(routeSessionSymbol,..._middlewares);
                    break;
                    case 'after':
                        RouteContext.middlewareAfterController(routeSessionSymbol,..._middlewares);
                    break;
                    default:
                        break;
                }   
                
                descriptor.value = decoratorResult;
    
                return descriptor;
            }
        }
    },
    set: () => false
})

module.exports = {Middleware};