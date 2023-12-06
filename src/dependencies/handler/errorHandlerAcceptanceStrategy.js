const ErrorHandlerConventionError = require("../errors/pipeline/errorHandlerConventionError");
const { ACCEPT_FIELD, ACCEPT_ORIGIN_FIELD, ACCEPT_PUBLISHER } = require("./constant");

/**
 * ErrorHandlerAcceptanceStrategy defines strategies for ErrorHandlerFilter
 * to lookup on a breakpoint object's field
 */
module.exports = class ErrorHandlerAcceptanceStrategy {

    #type;

    #lookupFieldName;

    get errorFieldName() {

        return this.lookupFieldName
    }

    get lookupFieldName() {

        return this.#lookupFieldName;
    }

    constructor(type = ACCEPT_FIELD) {

        if (typeof type !== 'string') {

            throw new ErrorHandlerConventionError('type must be string');
        }

        this.#type = type;

        this.#init();
    }

    #init() {

        switch(this.#type) {
            case ACCEPT_FIELD: 
                return this.#lookupFieldName = 'lastCaughtError';
            case ACCEPT_ORIGIN_FIELD: 
                return this.#lookupFieldName = 'originError';
            case ACCEPT_PUBLISHER: 
                return this.#lookupFieldName = 'publisher';
            default: 
                throw new ErrorHandlerConventionError(`${this.#type} is not valid error field of [ErrorHandler]`);
        }
    }
}