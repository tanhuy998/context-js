const {T_WeakTypeNode} = require('../../libs/linkedList.js');
const ContextHandler = require('../handler/constextHandler.js');

const Void = require('reflectype/src/type/void.js');
const {metaOf, property_metadata_t} = require('reflectype/src/reflection/metadata.js');
const HandlerKind = require('./handlerKind.js');
const HanlderInitializeError = require('../errors/pipeline/handlerInitializeError.js');
const AbortPipelineError = require('../errors/pipeline/abortPipelineError.js');
const PhaseError = require('../errors/pipeline/phaseError.js');
const { END_OF_PIPELINE, ABORT_PIPELINE } = require('../constants.js');


//const Context = require('../context/context.js');

/**
 * @typedef {import('../handler/constextHandler.js')} ContextHandler
 * @typedef {import('../context/context.js')} Context
 * @typedef {import('reflectype/src/metadata/ReflectionParameter.js')} ReflectionParameter
 * @typedef {import('./payload.js')} Payload
 * @typedef {import('../DI/dependenciesInjectionSystem.js')} DependenciesInjectionSystem
 * @typedef {import('./pipeline.js')} Pipeline
 */



/**
 * 
 * @param {Phase} phase 
 * @param {Payload} _payload 
 * @returns 
 */
function dispatchNext(phase, _payload) {

    function next(_result) {
        
        _payload.trace.push(_result);

        const next = phase.next;

        if (!next) {

            _payload.switchPhase(END_OF_PIPELINE);
            return;
        }

        next.accquire(_payload);
    }

    next.rollback = function() {

        phase.accquire(_payload);
    }

    return next;
}

function catchError(phase, _payload) {

    return function(_error) {

        phase.accquireError(_error, _payload);
    }
}

const functionTraps = {
    /**
     * 
     * @param {Function} target 
     * @param {Object} _this 
     * @param {Iterable} args 
     * @returns 
     */
    apply: function(target, _this, args) {

        /**@type {Context} */
        const context = _this.context;
        const DI = context?.global?.DI;
        
        if (args.length > 0 || typeof DI?.invoke !== 'function') {
            
            return target.call(_this, ...args);
        }
        
        return DI.invoke(_this, target, context);
    }
}

const traps = {
    /**
     * @param {ContextHandler} target 
     * @param {string} prop 
     * @returns 
     */
    get: function(target, prop) {

        const theProp = target[prop];

        if (typeof theProp !== 'function') {

            return theProp;
        }

        return new Proxy(theProp, functionTraps);
    }
};



module.exports = class Phase extends T_WeakTypeNode {

    get handler() {

        return this.data;
    }

    #kind

    /**@type {Pipeline} */
    #pipeline;

    constructor(_handler, kind) {

        super(...arguments);

        this.#kind = kind;

        this.#init();
    }

    #init() {

        if (!this.#kind) {

            this.#kind = HandlerKind.classify(this.handler);
        }
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
    accquire(_payload) {

        const context = _payload.context;

        try {
            
            const [handler, handle] = this.#prepare(_payload);
            
            _payload.switchPhase(this, handler);

            const result = handle();

            if (result instanceof Promise) {
    
                result.then(dispatchNext(this, _payload))
                .catch(catchError(this, _payload));
            }
            else {

                dispatchNext(this, _payload)(result);
            }
        }
        catch (error) {

            this.accquireError(error, _payload);
        }
    }

    /**
     * 
     * @param {Error | any} error 
     * @param {Payload} _payload 
     */
    accquireError(error, _payload) {

        const currentPhase = _payload.currentPhase;

        const handlerInstance = _payload.handler;
        // ovaride the error
        if (!(error instanceof PhaseError)) {

            error = new PhaseError(this, this._pipeline, _payload, error);
        }

        this.#pipeline.catchError(error, _payload);
    }

    /**
     * 
     * @param {Payload} _payload 
     */
    #prepare(_payload) {

        const handler = this.#initiateHandler(_payload);

        const context = _payload.context;

        if (handler === undefined) {

            throw new HanlderInitializeError(this, this._pipeline, context, this.handler)
        }

        this.#injectComponents(handler, context);

        /**@type {DependenciesInjectionSystem} */
        const DI = context.global.DI;

        let ret;

        if (this.#kind === HandlerKind.FUNCTION) {

            const args = DI.resolveArguments(handler, context) ?? [];

            ret =  [null, handler.bind(null, ...args)];
        }
        else if (this.#kind === HandlerKind.ES6_CLASS) {

            const args = DI.resolveArguments(handler.handle, context) ?? [];
            console.log(args)
            ret = [handler, handler.handle.bind(handler, ...args)];
            //return handler.handle.bind(handler);
        }
        else {

            const wrapper = new Proxy(handler, traps)
            ret = [wrapper, wrapper.handle.bind(wrapper)];
        }

        return ret;
    }

    /**
     * 
     * @param {Object | Function} _handlerInstance 
     * @param {Context} _context 
     */
    #injectComponents(_handlerInstance, _context) {
        
        const globalContext = _context.global;

        if (typeof globalContext === 'function') {

            const config = {
                context: _context
            }

            if (this.#kind === HandlerKind.FUNCTION || this.#kind === HandlerKind.PIPELINE) {

                return;
            }

            // inject fields first
            globalContext.DI?.inject(_handlerInstance, config);

            // config.method = 'handle';
            // globalContext.DI?.inject(_handlerInstance, config);
            
            // /**
            //  * if inject mode is fullyInjectt
            //  * this means all methods of object is injected
            //  */
            // if (!globalContext.fullyInject) {

            //     config.method = 'handle';

            //     globalContext.DI?.inject(_handlerInstance, config);
            // }
        }
    }

    /**
     * 
     * @param {Payload} _payload 
     * @returns 
     */
    #initiateHandler(_payload) {

        const kind = this.#kind;

        const handlerAbstract = this.handler;

        const devise = _payload.last;

        const context = _payload.context;

        switch (kind) {
            case HandlerKind.ES6_CLASS:
                return new handlerAbstract();
            case HandlerKind.REGULAR:
                return new handlerAbstract(context, devise);
            case HandlerKind.FUNCTION:
                return handlerAbstract;
            default:
                return undefined;
        }
    }
} 



