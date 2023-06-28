const WebsocketContext = require('../websocketContext.js');
const {METADATA} = require('../../constants.js');
const namespace = require('./namespace.js');

module.exports = function wsController(..._nsp) {

    const initNamespace = namespace(..._nsp);

    const context = WebsocketContext.newContext();

    return function(_controllerClass) {

        _controllerClass = initNamespace(_controllerClass);

        WebsocketContext.assignContext(context, _controllerClass);

        const namespaces = _controllerClass[METADATA].socketNamespaces;

        return _controllerClass;
    }
}