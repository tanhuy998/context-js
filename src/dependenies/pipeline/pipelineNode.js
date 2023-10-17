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

class DependenciesInjectionSystem {

    #context;


    constructor(_context) {

        this.#context;

        this.#init();
    };

    #init() {

        if (!(this.#context instanceof Context)) {

            throw new TypeError('[DependenciesInjecttionEngine] must be initialized with an instance of [Context]');
        }
    }

    injectFunction(_function) {

        const reflection = new ReflectionFunction(handleMethod);

        if (!reflection.isValid) {

            return;
        }

        /**@type {property_metadata_t}*/
        const funcMeta = metaOf(handleMethod);

        //------- preprocess the defaultvalue meta to initialize it as a valid array
        const funcDefaultParams = funcMeta.value;

        funcMeta.value ??= new Array(reflection.parameters.length);

        funcMeta.value = Array.isArray(funcDefaultParams) ? funcMeta.value : [funcDefaultParams];
        //--------------------------------------

        const parameters = reflection.parameters;

        const processedArgs = funcMeta.value = [...funcMeta.value, ...Array((parameters.length - funcMeta.value.length) || 0)];
        let i = 0;

        const iterator = parameters.values();
        let param = iterator.next();

        while (!param.done) {

            if (i >= processedArgs.length) {

                processedArgs.push();
            }

            /**@type {ReflectionParameter} */
            const paramReflection = param.value;

            const paramType = paramReflection.type;

            if (paramType !== undefined && paramType !== null && paramType !== Void) {

                const component = _context.getComponent(paramType);

                processedArgs[]

                ++i;
                continue;
            }


            ++i;
            param = iterator.next();
        }


        for (const param of reflection.parameters) {



            const paramType = param.type;

            if (paramType === undefined || paramType === null || paramType === Void) {

                continue;
            }

            const 

        }
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



