const ConventionError = require("../conventionError");

module.exports = class ErrorHandlerConventionError extends ConventionError {

    constructor(message, reason) {

        super(...arguments);
    }
}