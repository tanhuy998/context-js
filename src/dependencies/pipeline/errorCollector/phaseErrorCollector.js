const isIterable = require("reflectype/src/utils/isIterable.js");
const { ERROR_GATEWAY } = require("../../errorCollector/constant.js");
const ErrorCollector = require("../../errorCollector/errorCollector");
const ContextHandlerErrorMapper = require("../mapping/contextHandlerErrorMap.js");
const self = require("reflectype/src/utils/self.js");
const ExecutionFactor = require("./executionFactor.js");

/**
 * @typedef {import('../phase/phaseOperator.js')} PhaseOperator
 * @typedef {import('../payload/pipelinePayload.js')} PipelinePayload
 * @typedef {import('../../handler/contextHandler.js')} ContextHandler
 */

/**
 * @description
 * PhaseOperator is the watchdog of PipelineController.
 * It's watching context is managed the Phase object. After that,
 * PhassErrorCollector objects start the context handler operation, watching
 * for error of the action, then redirect the error (if ContextHandler defines the error handling methods).
 * Finnaly, PhaseErrorCollector report the progress to pipeline controller 
 */
module.exports = class PhaseErrorCollector extends ErrorCollector {

    /**@type {ContextHandlerErrorMapper?} */
    #errorRemapper;

    #phase;

    /**@type {ExecutionFactor} */
    #executionFactor;

    #isRedirectingError = false;

    #pipelineController;

    get hasErrorRedirection() {

        return this.#errorRemapper?.hasRemap === true;
    }

    constructor(_pipelineController) {

        super(...arguments);

        this.#pipelineController = _pipelineController;

        this.#init();
    }

    #init() {

        super.whenNoError((function() {

            this.#report(...arguments);
        }).bind(this));
        
        super.whenErrorOccur((function() {

            this.#reportError(...arguments);
        }).bind(this));
    }

    #reportError(err, pipelinePayload, executor) {

        const phase = this.#phase;

        const controller = this.#pipelineController;

        controller.trace(pipelinePayload, {
            currentPhase: phase,
            occurError: true,
            value: err,
            operator: executor
        });
    }

    #report(value, pipelinePayload, executor) {
        
        const phase = this.#phase;

        const controller = this.#pipelineController;
            
        controller.trace(pipelinePayload, {
            currentPhase: phase,
            occurError: false,
            value: value
        });
    }
    
    watch(_phaseOperator, _payload, {phaseOperatorArgs, contextHandlerMethod} = {
        contextHandlerMethod: null,
        phaseOperatorArgs: []
    }) {

        phaseOperatorArgs = isIterable(phaseOperatorArgs) ? phaseOperatorArgs : [phaseOperatorArgs];
        
        this.#executionFactor = new ExecutionFactor({
            executor: _phaseOperator,
            pipelinePayload: _payload,
            args: phaseOperatorArgs,
            contextHandlerInstance: _phaseOperator.handlerInstance,
            phaseOperator: _phaseOperator
        });

        return this;
    }

    start() {

        const factor = this.#executionFactor;

        const options = {
            args: [factor.pipelinePayload, factor.executor]
        }
        
        const operatorArgs = factor.args;

        super.watch(function(payload, operator) {
            
            return operator.operate(operatorArgs);
        }, options);
    }

    /**
     * 
     * @param {ContextHandlerErrorMapper} _remapper 
     */
    setErrorRemapper(_remapper) {
        
        if (!(_remapper instanceof ContextHandlerErrorMapper)) {

            _remapper = undefined;
        }

        this.#errorRemapper = _remapper;
    }

    /**
     * @description
     * Check the error watching state and decide what to do next when a error occurs.
     * 
     * @override
     * 
     * @param {any} err 
     * @param {*} param1 
     * @returns 
     */
    [ERROR_GATEWAY](err, [pipelinePayload, phaseOperator]) {
        
        if (!this.hasErrorRedirection) {
            
            super[ERROR_GATEWAY](err, [pipelinePayload, phaseOperator]);

            return;
        }

        /**
         * 
         */
        if (this.#isRedirectingError) {

            this.#redirectNext(err, pipelinePayload, phaseOperator);
        }
        else {

            this.#redirectErrorBackToHandler(err, pipelinePayload, phaseOperator);
        }
    }

    /**
     * Isolate error context, override scope dependencies and start error redirect operation.
     * 
     * @param {any} err 
     * @param {PipelinePayload} pipelinePayload 
     * @param {PhaseOperator} phaseOperator 
     */
    #redirectErrorBackToHandler(err, pipelinePayload, phaseOperator) {

        this.#isolate(err);

        /**
         * override scope dependency
         */
        if (err instanceof Error) {

            const errClass = self(err);

            /**@type {ContextHandler} */
            const ctxHadlerObj = phaseOperator.handlerInstance; 

            ctxHadlerObj.context.overrideScope(Error, errClass, {defaultInstance: err});
        }

        this.#redirectNext(err);
    }

    #redirectNext(err) {

        const exeFactor = this.#executionFactor;

        const redirectState = exeFactor.redirect?.next();

        if (redirectState.done) {

            return;
        }

        const ctxHandlerObj = exeFactor.contextHandlerInstance;
        const handleMethod = redirectState.value;
        const watchOptions = exeFactor.ErrorRedirectSession.watchOptions;

        super.watch(function() {

            handleMethod.call(ctxHandlerObj);
        }, watchOptions);
    }

    /**
     * Isolate the error watchinf context for [ERROR_GATEWAY]().
     * Turn on errorRedirection flag and setup an error redirect session
     * 
     * @param {*} err 
     */
    #isolate(err) {

        this.#isRedirectingError = true;

        const methodsIterator = this.#errorRemapper.getErrorHandlingMethods(err);

        this.#executionFactor.startErrorRedirectSession();

        this.#executionFactor.setRedirectIterator(methodsIterator);
    }
}