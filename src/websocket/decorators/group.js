const {METADATA} = require('../../constants.js');
const WebsocketContext = require('../websocketContext.js');

module.exports = function group(_prefix) {

    return function(_controllerClass, context) {

        if (context.kind != 'class') {

            throw new Error('@ws.group just affect on class');
        }

        const metadata = _controllerClass[METADATA];

        if (!metadata) {

            _controllerClass[METADATA] = {};
        }

        if (!_controllerClass[METADATA].groups) {

            _controllerClass[METADATA].groups = new Set();
        }

        const namespaces

        WebsocketContext.namespaceManager.add()
        
        _controllerClass[METADATA].groups.add(_prefix);

        return _controllerClass;
    }
}