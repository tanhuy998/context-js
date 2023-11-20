const ErrorHandler = require("../../../src/dependencies/handler/errorHandler");

module.exports = class AcceptableErrorHandler extends ErrorHandler {

    // acceptOrigin = [
    //     TypeError, 'test Immediate Error value'
    // ];

    // accept = [
    //     //{reason: Error},
    //     // {prop2: String}, // expects the error is an object that has property named "prop" and whose value is type of string
    //     // 'test Immediate Error value',
    //     // Error, 
    //     String
    // ]

    accept = {reason: Error};

    handle() {

        console.log('acceptable error handler', );
        
        //return this.error;
    }
}