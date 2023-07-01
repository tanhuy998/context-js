const WebsocketContext = require('../websocketContext.js');
const {METADATA} = require('../../constants.js');
const namespace = require('./namespace.js');

module.exports = function InitContext(..._nsp) {

    const context = WebsocketContext.newContext();

    const initNamespace = namespace(..._nsp);

    return function(_controllerClass) {

        _controllerClass = initNamespace(_controllerClass);

        WebsocketContext.assignContext(context, _controllerClass);

        WebsocketContext.manage(context);

        // Object.defineProperty(_controllerClass.prototype, 'server', {
        //     writable: false,
        //     value: 
        // })

        return _controllerClass;
    }
}