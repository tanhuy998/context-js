const ConventionError = require("./conventionError");

module.exports = class ErrorHandlerConventionError extends ConventionError {

    constructor(message) {

        super(message);
    }
}