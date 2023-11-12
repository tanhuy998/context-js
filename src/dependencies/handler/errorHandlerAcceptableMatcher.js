const { CONSTRUCTOR } = require("../constants")

/**
 * @typedef {import('./errorHandler.js')} ErrorHandler
 */

module.exports = class ErrorHandlerAcceptableMatcher {

    #accept;

    #acceptOrigin;

    /**
     * 
     * @param {ErrorHandler} _errorHanlderObj 
     */
    [CONSTRUCTOR](_errorHanlderObj) {

        this.#accept = _errorHanlderObj?.accept;
        this.#acceptOrigin = _errorHanlderObj?.acceptOrigin;
    }

    match() {

        
    }
}