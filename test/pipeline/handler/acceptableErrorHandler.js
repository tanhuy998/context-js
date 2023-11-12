const ErrorHandler = require("../../../src/dependencies/handler/errorHandler");

module.exports = class AcceptableErrorHandler extends ErrorHandler {

    accept = [
        TypeError
    ];

    handle() {

        console.log('acceptable error handler');
    }
}