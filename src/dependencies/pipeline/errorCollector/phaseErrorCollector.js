const ErrorCollector = require("../../errorCollector/errorCollector");
const ConventionError = require("../../errors/conventionError.js");
const ContextHandlerErrorMapper = require("../mapping/contextHandlerErrorMapper.js");

/**
 * @typedef {import('../phase/phaseOperator.js')} PhaseOperator
 * @typedef {import('../payload/pipelinePayload.js')} pipelinePayload
 */

module.exports = class PhaseErrorCollector extends ErrorCollector {

    /**@type {ContextHandlerErrorMapper?} */
    #errorRemapper;

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
    collect(_phaseOperator, _payload, {phaseOperatorArgs, contextHandlerMethod} = {
        contextHandlerMethod: null,
        phaseOperatorArgs: []
    }) {

        const options = {
            args: [_payload, _phaseOperator]
        }

        const errorRemapper = this.#errorRemapper;

        super.collect(function(operator, payload) {

            _phaseOperator.prepare();

            if (errorRemapper instanceof ContextHandlerErrorMapper && _phaseOperator.isContextHandler) {
                
                const handler = _phaseOperator.handlerInstance;
                
                errorRemapper.redirectError(handler);
            }

            return _phaseOperator.operate(phaseOperatorArgs);

        }, options);
    }

    /**
     * 
     * @param {ContextHandlerErrorMapper} _remapper 
     */
    setErrorRemapper(_remapper) {
        
        if (!(_remapper instanceof ContextHandlerErrorMapper)) {

            throw new TypeError('_remapper is not isntance of [ContextHandlerErrorMapper]')
        }

        this.#errorRemapper = _remapper;
    }
}