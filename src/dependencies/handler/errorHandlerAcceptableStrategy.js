const ErrorHandlerConventionError = require("../errors/pipeline/ErrorHandlerConventionError");

module.exports = class ErrorHandlerAcceptableStrategy {

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
            case 'accept': return this.#errorField = 'error';
            case 'acceptOrigin':return this.#errorField = 'originError';
            default: 
                throw new ErrorHandlerConventionError(`${this.#type} is not valid error field of [ErrorHandler]`);
        }
    }
}