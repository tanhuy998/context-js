const {T_WeakTypeNode} = require('../../libs/linkedList.js');
const ContextHandler = require('../handler/handler.js');
const ReflectionFunction = require('reflectype/src/metadata/reflectionFunction.js');
const Void = require('reflectype/src/type/void.js');
const {metaOf, property_metadata_t} = require('reflectype/src/reflection/metadata.js');
const Context = require('../context/context.js');

/**
 * @typedef {import('../context/context.js')} Context
 * @typedef {import('reflectype/src/metadata/ReflectionParameter.js')} ReflectionParameter
 */




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
     * 
     * @param {Context} _payload 
     */
    accquire(_payload) {

        const handlerClass = new this.handlerAbstract;

        const contextHandler = new handlerClass(_payload);

        this.#injectComponents(contextHandler, _payload);
    }

    /**
     * 
     * @param {ContextHandler} _handler 
     * @param {Context} _context 
     * @returns 
     */
    #injectComponents(_handler, _context) {

        const handleMethod = _handler.handle;

        const DI_Engine = _context.getComponent(DependenciesInjectionEngine);

        DI_Engine.injectFunction(handleMethod);
    }
} 



