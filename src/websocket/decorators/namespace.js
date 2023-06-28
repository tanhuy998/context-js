const WebsocketContext = require('../websocketContext.js');
const {METADATA} = require('../../constants.js');

const SOCKET_NAMESPACE = Symbol(Date.now());

module.exports = function namespace(..._nsp) {

    if (_nsp.length == 0) {

        _nsp = ['/'];
    }

    const currentContext = WebsocketContext.currentNamspaceContext();

    return function(_controllerClass) {

        //WebsocketContext.assignContext(currentContext, _controllerClass);

        if (!_controllerClass.metadata) {

            _controllerClass.metadata = {};
        }

        if (!_controllerClass[METADATA].socketNamespaces) {

            _controllerClass[METADATA].socketNamespaces = new Set();
        }

        for (const nsp of _nsp) {

            _controllerClass[METADATA].socketNamespaces.add(nsp);
        }

        return _controllerClass;
    }
}