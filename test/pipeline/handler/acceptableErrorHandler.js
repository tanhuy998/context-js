const ErrorHandler = require("../../../src/dependencies/handler/errorHandler");
const A = require('./A.js');
const B = require('./B.js');

module.exports = class AcceptableErrorHandler extends ErrorHandler {

    //acceptPublisher = [B]

    // acceptOrigin = [
    //     TypeError, 'test Immediate Error value'
    // ];

    // accept = [
    //     {reason: Error},
    //     // {prop2: String}, // expects the error is an object that has property named "prop" and whose value is type of string
    //     // 'test Immediate Error value',
    //     Error, 
    //     String
    // ]

    // except = Error;

    //accept = {reason: Error};

    handle() {

        const breakpoint = this.breakPoint;

        console.log('acceptable error handler');
        console.log(breakpoint);
        
        //return this.error;
    }
}