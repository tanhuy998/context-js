const {DecoratorResult, MethodDecorator} = require('../../decorator/decoratorResult.js');
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

            if (_method instanceof MethodDecorator) {

                _method.on('afterResolve', sendMessageBack);

                return function stage3WrapperFunction() {
                    
                    return _method;
                }
            }
        }

        // when there is no legacy invoke before
        return function () {

            const result = _method.call(this, ...arguments);

            sendMessageBack(result, this, _method);
        }
    }
}

async function sendMessageBack() {

    [result, _this, func] = arguments;

    try {

        if (result instanceof Promise) {

            result = await result;
        }
    
        _this.context.response(result);
    
        _this.context.next();
    }
    catch (error) {

        _this.context.next(error);
    }
}