const {T_WeakTypeNode} = require('../../../libs/linkedList.js');
//const ContextHandler = require('../handler/constextHandler.js');

const Void = require('reflectype/src/type/void.js');
const {metaOf, property_metadata_t} = require('reflectype/src/reflection/metadata.js');
const HandlerKind = require('../handlerKind.js');

const AbortPipelineError = require('../../errors/pipeline/abortPipelineError.js');
const PhaseError = require('../../errors/pipeline/phaseError.js');
const { END_OF_PIPELINE, ABORT_PIPELINE } = require('../../constants.js');
const PhaseOperator = require('./phaseOperator.js');


//const Context = require('../context/context.js');

/**
 * @typedef {import('../../handler/constextHandler.js')} ContextHandler
 * @typedef {import('../../context/context.js')} Context
 * @typedef {import('reflectype/src/metadata/ReflectionParameter.js')} ReflectionParameter
 * @typedef {import('../payload/payload.js')} Payload
 * @typedef {import('../../DI/dependenciesInjectionSystem.js')} DependenciesInjectionSystem
 * @typedef {import('../pipeline.js')} Pipeline
 */


module.exports = class Phase extends T_WeakTypeNode {

    get handlerAbstract() {

        return this.data;
    }

    #kind

    /**@type {Pipeline} */
    #pipeline;

    constructor(_handler, kind) {

        super(...arguments);

        this.#kind = kind;
    }

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
     */
    async accquire(_payload) {

        const executor = new PhaseOperator(_payload, this.handlerAbstract, this.#kind);

        try {

            _payload.switchPhase(this);

            // executor.operate() invoke the ContextHandler.handle() method that can be an async function 
            // or function that return Promise
            const result = await executor.operate();

            this.report(_payload, result);
        }
        catch (error) {

            this.reportError(_payload, error, operator);
        }
    }

    /**
     * 
     * @param {Payload} _payload 
     */
    report(_payload, value) {

        const controller = _payload.controller;

        controller.trace(_payload, {
            currentPhase: this,
            occurError: false,
            value: value
        });
    }

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



