const {T_WeakTypeNode} = require('../../libs/linkedList.js');
const ContextHandler = require('../handler/constextHandler.js');

const Void = require('reflectype/src/type/void.js');
const {metaOf, property_metadata_t} = require('reflectype/src/reflection/metadata.js');


//const Context = require('../context/context.js');

/**
 * @typedef {import('../context/context.js')} Context
 * @typedef {import('reflectype/src/metadata/ReflectionParameter.js')} ReflectionParameter
 */


function dispatchNext(handler, _payload) {

    return function () {
        
        const next = handler.next;

        if (!next) {

            return;
        }

        next.accquire(_payload);
    }
}

function catchError(_handler) {

    return function(_error) {

        _handler.accquireError(_error);
    }
}

module.exports = class PipelineNode extends T_WeakTypeNode {

    get handlerAbstract() {

        return this.data;
    }

    constructor(_handlerClass) {

        super(...arguments);

        this.#init();
    }

    #init() {

        if (!(this.handlerAbstract.prototype instanceof ContextHandler)) {

            throw new TypeError('handlerClass must be type of ContextHandler');
        }

        const handleMethod = this.handlerAbstract.prototype.handle;

        if (typeof handleMethod !== 'function') {

            const _class = _handler.constructor;

            throw new Error(`missing of handle() method of [${_class.name}] class`);
        }
    }

    /**
     * accquire a payload
     * 
     * @param {Context} _payload 
     */
    accquire(_payload) {

        const handler = this.#prepare(_payload);

        try {

            const result = handler.handle();

            if (result instanceof Promise) {
    
                result.then(dispatchNext(this, _payload))
                .catch(catchError(this));
            }

            dispatchNext(this, _payload)();
        }
        catch (error) {

            this.accquireError(error);
        }
    }

    accquireError(error) {

        console.log(error);
    }

    /**
     * 
     * @param {Context} _payload 
     */
    #prepare(_payload) {
        
        const globalContext = _payload.global;

        const handlerAbstract = this.handlerAbstract;

        const handler = new handlerAbstract();

        if (typeof globalContext === 'function') {

            const config = {
                context: _payload
            }

            globalContext.DI?.inject(handler, config);  

            if (!globalContext.fullyInject) {

                config.method = 'handle';

                globalContext.DI?.inject(handler, config);
            }
        }
        
        return handler;
    }

    /**
     * 
     * @param {ContextHandler} _handler 
     * @param {Context} _context 
     * @returns 
     */
    #injectComponents(_handler, _context) {

        const handleMethod = _handler.handle;

    }
} 



