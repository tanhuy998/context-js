const { ROLL_BACK, ABORT_PIPELINE, DISMISS } = require("../constant");
const PipelineController = require("./pipelineController");

/**
 * @typedef {import('../payload/breakpoint')} ErrorPayload
 */


function generateNext() {

    function next(error) {

        if (error === undefined) {


        }

        throw error;
    }

    next.abort = function() {

        throw ABORT_PIPELINE;
    }

    next.rollback = function() {

        throw ROLL_BACK;
    }
    
    next.dismiss = function() {

        throw DISMISS;
    }

    return next;
}

module.exports = class ErrorController extends PipelineController {

    /**
     * @return {ErrorPayload}
     */
    get payload() {

        return super.payload;
    }

    get firstPhase() {

        return this.pipeline.errorHandler;
    }

    constructor(_pipeline) {

        super(...arguments);
    }

    // startHandle() {
        
    //     const firstPhase = this.pipeline.errorHandler;
        
    //     if (!firstPhase) {
            
    //         return 
    //     }

    //     const payload = this.payload;

    //     firstPhase.accquire(payload, [generateNext()]);

    //     return this.state;
    // }

    /**
     * 
     * @param {ErrorPayload} _breakPoint 
     * @param {*} param1 
     */
    trace(_breakPoint, {currentPhase, occurError, value, opperator} = {}) {

        
        if (occurError === false || this.#isSignal(value)) {

            _breakPoint.trace.push(value);

            this.event.emit('resolve', _breakPoint);

            return;
        }
        else {

            occurError = false;
        
            super.trace(...arguments);
        }
    }

    #isSignal(value) {

        return [ABORT_PIPELINE, DISMISS, ROLL_BACK].includes(value);
    }

    // /**
    //  * 
    //  * @param {ErrorPayload} _breakPoint 
    //  * @param {*} param1 
    //  * @returns 
    //  */
    // #analyzeErrorSignal(_breakPoint, {currentPhase, occurError, value, opperator} = {}) {

        

    //     // if (value === DISMISS) {

    //     //     const rollbackPayload = _breakPoint.rollbackPayload;

    //     //     //return _breakPoint.rollbackPoint.report(rollbackPayload, {DISMISS, reason: _breakPoint.last});

    //     //     this.event.emit('dismiss', DISMISS);
    //     // }

    //     // if (value === ROLL_BACK) {

    //     //     const rollbackPayload = _breakPoint.rollbackPayload;

    //     //     // return _breakPoint.rollbackPoint.accquire(rollbackPayload);

    //     //     this.event.emit('rollback', ROLL_BACK);
    //     // }

    //     super.trace(...arguments);
    // }
}