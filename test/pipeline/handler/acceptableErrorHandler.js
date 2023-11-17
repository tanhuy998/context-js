const ErrorHandler = require("../../../src/dependencies/handler/errorHandler");

module.exports = class AcceptableErrorHandler extends ErrorHandler {

    // acceptOrigin = [
    //     TypeError, 'test Immediate Error value'
    // ];

    accept = [
        {prop2: String}, // expects the error is an object that has property named "prop" and whose value is type of string
        'test Immediate Error value',
        Error, String
    ]

    handle() {

        console.log('acceptable error handler', this.error);
        
        return this.error.prop2;
    }
}