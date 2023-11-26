/**
 * @typedef {import('../phase/phaseOperator.js') PhaseOperator
 * @typedef {import('../../handler/contextHandler.js')} ContextHandler
 * @typedef {import('../payload/pipelinePayload.js')} PipelinePayload
 */

/**
 * @typedef {Object} ErrorRedirectSession
 * @property {Iterator} ErrorRedirectSession.redirectIterator
 * @property {Object} watchOptions
 * @property {ContextHandler?} watchOptions.thisContext
 * @property {Iterable<any>} watchOptions.args
 */

module.exports = class ExecutionFactor {

    /**@type {PhaseOperator} */
    #executor;

    /**@type {Iterable<any>} */
    #args;

    /**@type {ContextHandler?} */
    #contextHandlerInstance;

    /**@type {PipelinePayload} */
    #pipelinePayload;

    /**@type {ErrorRedirectSession} */
    #errorRediectSession;

    #phaseOperator;

    get phaseOperator() {

        return this.#phaseOperator;
    }

    get executor() {

        return this.#executor;
    }

    get args() {

        return this.#args;
    }

    get contextHandlerInstance() {

        return this.#contextHandlerInstance;
    }

    get pipelinePayload() {

        return this.#pipelinePayload;
    }
    
    get redirect() {

        return this.#errorRediectSession?.redirectIterator;
    }

    get ErrorRedirectSession() {

        return this.#errorRediectSession;
    }

    /**
     * 
     * @param {Object} factor 
     * @param {PhaseOperator} factor.excecutor
     */
    constructor({executor, args, contextHandlerInstance, pipelinePayload, phaseOperator}) {
        
        this.#executor = executor;
        this.#args = args;
        this.#contextHandlerInstance = contextHandlerInstance;
        this.#pipelinePayload = pipelinePayload;
        this.#phaseOperator = phaseOperator;
    }

    startErrorRedirectSession() {

        const ctxHandlerObj = this.#contextHandlerInstance;
        const watchArgs = [this.#pipelinePayload, this.#phaseOperator];
        
        this.#errorRediectSession = {
            watchOptions: {
                thisContext: ctxHandlerObj,
                args: watchArgs
            }
        }
    }

    /**
     * 
     * @param {Iterator<Function, any>} _iterator 
     */
    setRedirectIterator(_iterator) {

        this.#errorRediectSession.redirectIterator = _iterator;
    }
}