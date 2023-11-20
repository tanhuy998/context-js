const {T_WeakTypeNode} = require('../../../libs/linkedList.js');
const PhaseOperator = require('./phaseOperator.js');

/**
 * @typedef {import('../../handler/contextHandler.js')} ContextHandler
 * @typedef {import('../../context/context.js')} Context
 * @typedef {import('reflectype/src/metadata/ReflectionParameter.js')} ReflectionParameter
 * @typedef {import('../payload/pipelinePayload.js')} Payload
 * @typedef {import('../../DI/dependenciesInjectionSystem.js')} DependenciesInjectionSystem
 * @typedef {import('../pipeline.js')} Pipeline
 * @typedef {import('../../errorCollector/errorCollector.js')} ErrorCollector
 * @typedef {import('../errorCollector/phaseErrorCollector.js')} PhaseErrorCollector
 */


/**
 * @class
 * @template T
 */
module.exports = class Phase extends T_WeakTypeNode {

    /**@returns {T} */
    get handlerAbstract() {

        return this.data;
    }

    #kind

    /**@type {Pipeline} */
    #pipeline;

    /**@type {PhaseErrorCollector} */
    #errorCollector;

    /**
     * 
     * @param {T} _handler 
     * @param {*} kind 
     */
    constructor(_handler, _errorCollector) {

        super(...arguments);

        this.#errorCollector = _errorCollector;

        this.#init();
    }

    #init() {
        
        this.#initReport();
        this.#initErrorReport();
    }

    #initReport() {

        const errorCollector = this.#errorCollector;

        const _this = this;

        errorCollector.whenNoError(function(result, [payload]) {

            _this.report(payload, result);
        });
    }

    #initErrorReport() {

        const errorCollector = this.#errorCollector;

        const _this = this;

        errorCollector.whenErrorOccur(function(err, [payload, phaseOperator]) {

            _this.reportError(payload, err, phaseOperator);
        });
    }

    /**
     * 
     * @param {Pipeline} _pipeline 
     */
    join(_pipeline) {

        if (this.#pipeline) {

            throw new Error('the phase has joined a pipeline, could not joins others');
        }

        this.#pipeline = _pipeline;
    }

    /**
     * accquire a payload
     * 
     * @param {Payload} _payload 
     * @param {Array<any>} _additionalArgs
     */
    accquire(_payload, _additionalArgs = []) {

        const errorCollector = this.#errorCollector;

        errorCollector.setContext(_payload.context);

        const executor = new PhaseOperator(_payload, this.handlerAbstract, this.#kind);
        
        _payload.switchPhase(this);
        
        errorCollector.collect(executor, _payload, _additionalArgs);


        // try {

        //     _payload.switchPhase(this);

        //     // executor.operate() invoke the ContextHandler.handle() method that can be an async function 
        //     // or function that return Promise
        //     const result = executor.operate(_additionalArgs);
            
        //     if (result instanceof Promise) {

        //         const _this = this;

        //         result.then(value => {
                    
        //             _this.report(_payload, value)
        //         })
        //             .catch(error => _this.reportError(_payload, error, executor));

        //         return;
        //     }
        //     else {
                
        //         this.report(_payload, result);
        //     }
        // }
        // catch (error) {

        //     this.reportError(_payload, error, executor);
        // }
    }

    /**
     * 
     * @param {Payload} _payload 
     * @param {any} value
     */
    report(_payload, value) {
        
        const controller = _payload.controller;
        
        controller.trace(_payload, {
            currentPhase: this,
            occurError: false,
            value: value
        });
    }

    /**
     * 
     * @param {Payload} _payload 
     * @param {any} error 
     * @param {PhaseOperator} _operator 
     */
    reportError(_payload, error, _operator) {

        const controller = _payload.controller;
        
        controller.trace(_payload, {
            currentPhase: this,
            occurError: true,
            value: error,
            operator: _operator
        });
    }
} 



