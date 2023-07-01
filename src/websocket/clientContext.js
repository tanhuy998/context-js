const HttpContext = require('../httpContext.js');
module.exports = class ClientContext extends HttpContext{

    #eventArgs;
    #handshake;

    get handshake() {

        return this.#handshake;
    }

    get next() {

        return this.nextMiddleware;
    }

    get eventArguments() {

        return this.#eventArgs;
    }

    constructor(_wsEvent, _response, _next) { 

        const sender = _wsEvent.sender;

        super(sender.request, _response, _next);

        this.#eventArgs = _wsEvent.args;
        this.#handshake = sender.handshake;
    }


}