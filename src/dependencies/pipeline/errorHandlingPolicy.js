/**
 *  @description
 *  ErrorHandlingMode enum for the ErrorTracer to decide which type of error to 
 *  be sent to the pipeline's error controller when a PipablePhase throws.
 *  
 *  @enum {ErrorHandlingPolicy}
 */
module.exports = class ErrorHandlingPolicy {

    /**
     *  SUMMARIZE indicate the PipablePhase's breakpoint will be skip and just return the last traced
     *  error.
     */
    static get SUMMARIZE() {

        return 1;
    }

    /**
     *  DETAIL stand indicate the error thrown be a PipablePhase will be wrapped into the a 
     *  PipablePhaseAbortionError which detemines the breakpoint error handling trace in detail
     */
    static get DEATAIL() {

        return 2;
    }
}