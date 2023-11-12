const ErrorHandler = require("../../../src/dependencies/handler/errorHandler");

module.exports = class AcceptableErrorHandler extends ErrorHandler {

    // acceptOrigin = [
    //     TypeError, 'test Immediate Error value'
    // ];

    accept = [
        'test Immediate Error value'
    ]

    handle() {

        console.log('acceptable error handler');

        return 'test'
    }
}