const {MethodDecorator} = require('../../decorator/decoratorResult.js');
const WebsocketContext = require('../websocketContext.js');
//const {preprocessDescriptor} = require('../../decorator/utils.js')

module.exports = function channel(event) {

    return function(_value, context) {

        const {kind, name} = context;

        if (kind !== 'method') {

            throw new Error('@ws.channel just affect on method');
        }

        //const decoratorResult = new MethodDecorator(undefined, _value);

        WebsocketContext.initChannel(event, name);

        return _value;
    }
}