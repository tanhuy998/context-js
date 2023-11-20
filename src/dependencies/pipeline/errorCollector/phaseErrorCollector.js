const ErrorCollector = require("../../errorCollector/errorCollector");
const ConventionError = require("../../errors/conventionError.js");

/**
 * @typedef {import('../phase/phaseOperator.js')} PhaseOperator
 * @typedef {import('../payload/pipelinePayload.js')} pipelinePayload
 */

module.exports = class PhaseErrorCollector extends ErrorCollector {

    constructor() {

        super(...arguments);

        this.#init();
    }

    #init() {

        this.exceptions.add(ConventionError);
    }

    /**
     * 
     * @param {PhaseOperator} _phaseOperator 
     * @param {pipelinePayload} _payload 
     * @param {Array<any>} _args 
     */
    collect(_phaseOperator, _payload, _phaseOperatorArgs = []) {

        const options = {
            args: [_payload, _phaseOperator]
        }

        super.collect(function(operator, payload) {

            return _phaseOperator.operate(_phaseOperatorArgs);

        }, options);
    }
}