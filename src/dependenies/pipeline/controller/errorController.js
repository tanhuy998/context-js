const { ROLL_BACK, ABORT_PIPELINE, DISMISS } = require("../constant");
const PipelineController = require("./pipelineController");

/**
 * @typedef {import('../payload/errorPayload')} ErrorPayload
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

    constructor(_pipeline) {

        super(...arguments);
    }

    startHandle() {
        
        const firstPhase = this.pipeline.errorHandler;
        
        if (!firstPhase) {
            
            return 
        }

        const payload = this.payload;

        firstPhase.accquire(payload, [generateNext()]);
    }

    /**
     * 
     * @param {ErrorPayload} _payload 
     * @param {*} param1 
     */
    trace(_payload, {currentPhase, occurError, value, opperator} = {}) {

        occurError = undefined;

        this.#analyzeErrorSignal(...arguments);

        //super.trace(...arguments);
    }

    /**
     * 
     * @param {ErrorPayload} _payload 
     * @param {*} param1 
     * @returns 
     */
    #analyzeErrorSignal(_payload, {currentPhase, occurError, value, opperator} = {}) {

        if (value === ABORT_PIPELINE) {

            return this.pipeline.approve(this);
        }

        if (value === DISMISS) {

            const rollbackPayload = _payload.rollbackPayload;

            return _payload.rollbackPoint.report(rollbackPayload, {DISMISS, reason: _payload.last});
        }

        if (value === ROLL_BACK) {

            const rollbackPayload = _payload.rollbackPayload;

            return _payload.rollbackPoint.accquire(rollbackPayload);
        }

        super.trace(...arguments);
    }
}