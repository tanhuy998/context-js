const PhaseError = require("./phaseError");

/**
 * @typedef {import('../../pipeline/phase/PipablePhase.js')} PipablePhase
 * @typedef {import('../../pipeline/pipeline')} Pipeline
 * @typedef {import('../../pipeline/payload/breakpoint.js')} Breakpoint
 */

module.exports = class PipablePhaseAbortionError extends PhaseError {

    get causedPhase() {

        return this.breakPoint.rollbackPoint;
    }

    /**@returns {Breakpoint} */
    get breakPoint() {

        return this.payload;
    }

    get isErrorHandled() {

        const breakPoint = this.breakPoint;

        return breakPoint.originError !== breakPoint.lastHandledValue && breakPoint.trace.length > 1;
    }

    get reason() {

        return this.isErrorHandled ? this.breakPoint.lastCaughtError : this.breakPoint.originError;
    }

    /**
     * 
     * @param {PipablePhase} phase 
     * @param {Breakpoint} breakPoint 
     */
    constructor(phase, breakPoint) {

        const reason = breakPoint.originError;

        super(phase, breakPoint, reason);

        this.message = 'Pipable phase occur an error'
    }
}