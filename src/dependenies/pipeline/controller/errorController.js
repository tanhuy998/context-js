const { ROLL_BACK, ABORT_PIPELINE } = require("../constant");
const PipelineController = require("./pipelineController");

/**
 * @typedef {import('../payload/errorPayload')} ErrorPayload
 */

module.exports = class ErrorController extends PipelineController {

    constructor(_pipeline) {

        super(...arguments);
    }

    startHandle() {

        const firstPhase = this.pipeline.errorHandler;

        if (!firstPhase) {

            return console.log(this.payload.last);
        }

        const payload = this.payload;

        firstPhase.accquire(payload);
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

        if (value === ROLL_BACK) {

            const context = _payload.context;

            return _payload.rollbackPoint.accquire();
        }

        super.trace(...arguments);
    }
}