const WebsocketContext = require('../websocketContext.js');

module.exports = function handleError(_method, context) {

    const {kind} = context;

    if (kind !== 'method') {

        throw new Error('@WS.handleError just affect on method');
    }

    const currentContext = WebsocketContext.currentNamspaceContext();

    WebsocketContext.addErrorHandlers(currentContext, _method);

    return _method;
}