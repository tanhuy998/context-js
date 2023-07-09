//const {DecoratorResult, MethodDecorator} = require('../../decorator/decoratorResult.js');
const AbstractMethodDecorator = require('../../decorator/abstractMethodDecorator.js');
const ResponseError = require('../../error/responseError.js');
const WebsocketContext = require('../websocketContext.js');
//const {preprocessDescriptor} = require('../../decorator/utils.js')


module.exports = function channel(event) {

    return function(_method, context) {

        const {kind, name} = context;

        if (kind !== 'method') {

            throw new Error('@ws.channel just affect on method');
        }

        WebsocketContext.initChannel(event, name);

        // when a legacy decorator is inoked before
        if (_method.name === 'stage3WrapperFunction') {

            _method = _method();

            if (_method instanceof AbstractMethodDecorator) {

                _method.on('afterResolve', detectAndSendMessageBack);

                return function stage3WrapperFunction() {
                    
                    return _method;
                }
            }
        }

        // when there is no legacy invoke before
        return function () {

            const result = _method.call(this, ...arguments)

            detectAndSendMessageBack(result, this);

            return result;
        }
    }
}


/**
 * 
 * @returns void
 */
function detectAndSendMessageBack() {

    const [result, _this, func] = arguments;

    console.log('do response');

    if (result instanceof Error) {

        _this.context.next(result);

        return;
    }

    if (result instanceof Promise) {
        // return back the promise to router for catching error
        return result.then((value) => {

            if (result) {

                _this.context.response(value);
            }

            _this.context.next();

            return value;
        }).catch(error => {

            if (error instanceof ResponseError) {

                return error;
            }

            return new ResponseError(error.data);
        })
    }

    if (result) {

        _this.context.response(result);

        _this.context.next();

        return;
    }
}