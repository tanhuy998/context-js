const {T_WeakTypeNode} = require('../../libs/linkedList.js');
const ContextHandler = require('../handler/constextHandler.js');

const Void = require('reflectype/src/type/void.js');
const {metaOf, property_metadata_t} = require('reflectype/src/reflection/metadata.js');
const HandlerKind = require('./handlerKind.js');
const HanlderInitializeError = require('../errors/pipeline/handlerInitializeError.js');
const AbortPipelineError = require('../errors/pipeline/abortPipelineError.js');
const PhaseError = require('../errors/pipeline/phaseError.js');


//const Context = require('../context/context.js');

/**
 * @typedef {import('../handler/constextHandler.js')} ContextHandler
 * @typedef {import('../context/context.js')} Context
 * @typedef {import('reflectype/src/metadata/ReflectionParameter.js')} ReflectionParameter
 */




function dispatchNext(phase, _payload) {

    return function () {
        
        const next = phase.next;

        if (!next) {

            return;
        }

        next.accquire(_payload);
    }
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

        if (args.length > 0 || typeof DI !== 'object') {

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

        // /**@type {Context} */
        // const context = target.context;
        // const DI = context.global.DI;

        return new Proxy(theProp, functionTraps);
    }
};



module.exports = class Phase extends T_WeakTypeNode {

    get handler() {

        return this.data;
    }

    #kind

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
     * @param {Context} _payload 
     */
    accquire(_payload) {

        try {
            
            const handle = this.#prepare(_payload);
            
            const result = handle();

            if (result instanceof Promise) {
    
                result.then(dispatchNext(this, _payload))
                .catch(catchError(this, _payload));
            }

            dispatchNext(this, _payload)();
        }
        catch (error) {

            this.accquireError(error, _payload);
        }
    }

    accquireError(error, _payload) {

        // ovaride the error
        if (!(error instanceof PhaseError)) {

            error = new PhaseError(this, this._pipeline, _payload, error);
        }

        this.#pipeline.catchError(error, _payload);
    }

    /**
     * 
     * @param {Context} _payload 
     */
    #prepare(_payload) {

        const handler = this.#initiateHandler(_payload);

        if (handler === undefined) {

            throw new HanlderInitializeError(this, this._pipeline, _payload, this.handler)
        }

        this.#injectComponents(handler, _payload);
        
        if (this.#kind === HandlerKind.FUNCTION) {

            return handler;
        }
        else if (this.#kind === HandlerKind.ES6_CLASS) {

            return handler.handle.bind(handler);
        }
        else {

            const wrapper = new Proxy(handler, traps)

            return handler.handle.bind(wrapper);
        }
    }

    /**
     * 
     * @param {Object | Function} _handlerInstance 
     * @param {Context} _payload 
     */
    #injectComponents(_handlerInstance, _payload) {
        
        const globalContext = _payload.global;

        if (typeof globalContext === 'function') {

            const config = {
                context: _payload
            }
            // inject fields first
            globalContext.DI?.inject(_handlerInstance, config);

            config.method = 'handle';
            globalContext.DI?.inject(_handlerInstance, config);
            
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

    #initiateHandler(_payload) {

        const kind = this.#kind;

        const handlerAbstract = this.handler;

        switch (kind) {
            case HandlerKind.ES6_CLASS:
                return new handlerAbstract();
            case HandlerKind.REGULAR:
                return new handlerAbstract(_payload);
            case HandlerKind.FUNCTION:
                return handlerAbstract;
            default:
                return undefined;
        }
    }
} 



