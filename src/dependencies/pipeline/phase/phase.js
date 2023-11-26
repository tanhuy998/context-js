const {T_WeakTypeNode} = require('../../../libs/linkedList.js');
const PhaseErrorCollector = require('../errorCollector/phaseErrorCollector.js');
const ContextHandlerErrorMapper = require('../mapping/contextHandlerErrorMap.js');
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
 * 
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

    /**@type {ContextHandlerErrorMapper} */
    #contextHandlerErrorMap;

    /**
     * 
     * @param {T} _handler 
     * @param {*} kind 
     */
    constructor(_handler, _errorCollector) {

        super(...arguments);

        this.#init();
    }

    #init() {
        
    }

    /**
     * 
     * @param {ContextHandlerErrorMapper} _mapper 
     */
    setErrorRedirectMap(_map) {

        if (!(_map instanceof ContextHandlerErrorMapper)) {

            return;
        }

        this.#contextHandlerErrorMap = _map;
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

        const executor = new PhaseOperator(_payload, this.handlerAbstract);

        executor.prepare();

        _payload.switchPhase(this);

        const pipelineController = _payload.controller;

        const errorCollector = new PhaseErrorCollector(pipelineController);
        
        errorCollector.setErrorRemapper(this.#contextHandlerErrorMap);
        
        errorCollector.watch(executor, _payload, {
            phaseOperatorArgs: _additionalArgs, 
        });

        errorCollector.start();
    }
} 