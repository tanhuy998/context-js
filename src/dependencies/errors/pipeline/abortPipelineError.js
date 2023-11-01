const PhaseError = require("./phaseError");

module.exports = class AbortPipelineError extends PhaseError {

    constructor(_phase, _pipeLine, _payload) {

        super(...arguments);

        this.message = 'pipeline handling progress aborted';
    }
}