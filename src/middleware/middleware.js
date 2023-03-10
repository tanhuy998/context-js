const {preprocessDescriptor} = require('../decorator/utils');
const {RouteContext, Route} = require('../http/httpRouting');


// draft
const middlewareInstance = {
    before: RouteContext.middlewareAfterController,
    after: RouteContext.middlewareAfterController
};

function manageMiddlewaresForClass(_constructor, routingContext, _order, _middlewares) {
    
    //if (RouteContext.currentContext != routingContext) return;

    const hasGroup = Route._getLocalConstraint(routingContext);
    
    if (!hasGroup) {

        // define default group for the current Controller
        Route.group('/')(_constructor); // the way calling the decorator without applying it to class definition

        //groups = Route._getGroup(routingContext);
    }

    //const priority = (_order == 'before')? 'middlewareBefore' : 'middlewareAfter';

    Route._middleware(routingContext, _middlewares, _order, 'localConstraints');

    return _constructor;
}

function manageMiddlewaresForMethod(_class, _action, descriptor, context, _order, _middlewares) {

    const {currentRoutingContext, temporarySessionSymbol} = context;


    const decoratorResult = preprocessDescriptor(_class, _action, descriptor);

    const decoratorSessionSymbol = decoratorResult.payload['routeSession'];


    let currentSessionSymbol;

    if (!decoratorSessionSymbol) {
        // if there is no session is setted on this controller's action
        // register the temporary session that is created before to the current controller's action


        // RouteContext.currentSession is switched to temporarySessionSymbol by default
        currentSessionSymbol = temporarySessionSymbol;

        decoratorResult.payload['routeSession'] = currentSessionSymbol;

        RouteContext.assignSessionAction(currentSessionSymbol, _action);
        RouteContext.assignSessionContext(currentRoutingContext);
        // decoratorResult.on('afterResolve', function() {

        //     //console.log('end session', routeSessionSymbol)
        //     RouteContext.endSession(routeSessionSymbol);
        // })
    }
    else {

        currentSessionSymbol = decoratorSessionSymbol;
        // if current decoratorResult has already start a session
        // switch back to the existence
        RouteContext.switchSession(decoratorSessionSymbol)
        RouteContext.endSession(temporarySessionSymbol);
    }

    //_target[_order].call(RouteContext, routeSessionSymbol, ..._middlewares);

    switch (_order) {
        case 'before':
            RouteContext.middlewareBeforeController(currentSessionSymbol, _action, ..._middlewares);
            break;
        case 'after':
            RouteContext.middlewareAfterController(currentSessionSymbol, _action, ..._middlewares);
            break;
        default:
            break;
    }


    descriptor.value = decoratorResult;

    return descriptor;
}

const Middleware = new Proxy(middlewareInstance, {
    method: {
        before: 0,
        after: 1
    },
    get: function(_target, _order) {

        if (!this.method.hasOwnProperty(_order)) throw new Error(`Middleware error: calling to invalid method of Middleware`);
        //if (!_target[_order]) throw new Error(`Middleware error: calling to invalid method of Middleware`);

        return function(..._middlewares) {

            const currentRoutingContext = RouteContext.currentContext;
            const temporarySessionSymbol = RouteContext.startSession(currentRoutingContext);
            
            // preemptively switch to the temporary session in case this is the first time 
            // middleware is setted on a controler's action
            RouteContext.switchSession(temporarySessionSymbol);

            return function(_class, _action, descriptor) {
                
                if (!_action && !descriptor) {
                    
                    // routing context in class decorator is different from routing context of method
                    const classRoutingContext = RouteContext.currentContext;

                    return manageMiddlewaresForClass(_class, classRoutingContext, _order, _middlewares);
                    
                }
                else {
                    return manageMiddlewaresForMethod(_class, _action, descriptor, {currentRoutingContext, temporarySessionSymbol}, _order, _middlewares);
                }
            }
        }
    },
    set: () => false
})

module.exports = {Middleware};