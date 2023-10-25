const { ABORT_PIPELINE } = require("../constants");
const ContextHandler = require("./constextHandler");

module.exports = class ErrorHandler extends ContextHandler {

    //#error;

    get error() {

        return this.devise;
    }

    constructor(_payload, _error) {

        super(_payload.context, _error);
    }

    handle() {

        
    }

    abort() {

        throw ABORT_PIPELINE;
    }

    rollBack() {


    }
}