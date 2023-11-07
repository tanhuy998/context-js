const isPipeline = require("../isPipeline");
const PhaseBuilder = require("./phaseBuilder");

/**
 * @typedef {import('../../handler/errorHandler.js')} ErrorHandler
 */

module.exports = class ErrorPhaseBuilder extends PhaseBuilder {

    /**
     * 
     * @param {Function | ErrorHandler.constructor} _unknown 
     * @returns 
     */
    setHandler(_unknown) {

        if (isPipeline(_unknown)) {

            throw new TypeError('could not set a Pipeline as an Error Handler');
        }

        super.setHandler(_unknown);

        return this;
    }

    build() {

        if (typeof this.phaseObj !== 'object') {

            throw new Error(`could not register [${this.handler?.name ?? this.handler}] to pipeline`);
        }

        const phase = this.phaseObj;
        
        this.pipeline.pipeError(phase);

        this._dispose();
    }
}