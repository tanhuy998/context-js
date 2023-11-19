const ErrorHandlerConventionError = require("../errors/pipeline/errorHandlerConventionError");

module.exports = class ErrorHandlerAcceptanceStrategy {

    #type;

    #errorField;

    get errorFieldName() {

        return this.#errorField;
    }

    constructor(type = 'accept') {

        if (typeof type !== 'string') {

            throw new ErrorHandlerConventionError('type must be string');
        }

        this.#type = type;

        this.#init();
    }

    #init() {

        switch(this.#type) {
            case 'accept': return this.#errorField = 'lastCaughtError';
            case 'acceptOrigin':return this.#errorField = 'originError';
            default: 
                throw new ErrorHandlerConventionError(`${this.#type} is not valid error field of [ErrorHandler]`);
        }
    }
}