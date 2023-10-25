const ContextHandler = require("./constextHandler");

module.exports = class ErrorHandler extends ContextHandler {

    #error;

    get error() {

        return this.#error;
    }

    constructor(_payload, _error) {

        super(_payload.context);

        this.#error = undefined;
    }
}