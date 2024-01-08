const ReflectionFunction = require('reflectype/src/metadata/function/reflectionFunction.js');
const Void = require('reflectype/src/type/void.js');
const {metaOf, property_metadata_t} = require('reflectype/src/reflection/metadata.js');

const Injector = require('./injector.js');

/**
 * @typedef {import('../context/context.js')} Context
 * @typedef {import('reflectype/src/metadata/abstract/reflectionParameterAbstract.js')} ReflectionParameter
 */

module.exports = class FunctionInjectorEngine extends Injector {

    constructor(_context) {

        super(...arguments);
    }

    _resolveReflection(_func) {

        return new ReflectionFunction(_func);
    }

    /**
     * 
     */
    #preprocessFunction(reflection) {

        /**@type {property_metadata_t}*/
        const funcMeta = reflection.metadata;
        const funcDefaultParams = funcMeta.value;

        funcMeta.value ??= new Array(reflection.parameters.length);
        funcMeta.value = Array.isArray(funcDefaultParams) ? funcMeta.value : [funcDefaultParams];
    }
    
    /**
     * 
     * @returns {Array}
     */
    #prepareDummyArguments(reflection) {

        /**@type {property_metadata_t} */
        const funcMeta = reflection.metadata;
        //const funcMeta = metaOf(_func);

        if (!funcMeta) {

            return [];
        }

        const defaultArgs = funcMeta.value;
        const parameters = funcMeta.defaultParamsType;
        const difference = parameters.length - defaultArgs.length;
        const missingCount = (difference >= 0) ? difference : 0;
        // this line would cause error
        return [...funcMeta.value, ...Array(missingCount)];
    }

    #ensureFunction(_unknown) {

        if (typeof _unknown !== 'function') {

            throw new TypeError(`cannot inject to ${typeof _unknown}`);
        }
    }

    /**
     * 
     * @param {Function} _func 
     * @param {Array} args 
     * @returns 
     */
    #setDefaultArguments(_func, args = []) {

        const typeMeta = metaOf(_func);

        if (!typeMeta || !Array.isArray(args)) {

            return false;
        }        

        typeMeta.value = args;
    }

    resolveComponentsFor(_func, _scope) { 

        const reflection = new this._resolveReflection(_func);
        
        if (!reflection.isValid) {

            return undefined;
        }

        this.#preprocessFunction(reflection);

        const parameters = reflection.parameters;
        const ret = this.#prepareDummyArguments(reflection);
        let i = 0;
        const iterator = parameters.values();
        let iteration = iterator.next();

        while (!iteration.done) {

            /**@type {ReflectionParameter} */
            const paramReflection = iteration.value;
            const paramType = paramReflection.type;

            if (paramType !== undefined && paramType !== null && paramType !== Void) {

                const component = this.resolveComponent(paramType, _scope);

                ret[i] = component ?? ret[i];
            }

            ++i;
            iteration = iterator.next();
        }

        return ret;
    }

    inject(_function, _scope) {

        this.#ensureFunction(_function);

        // /**@type {property_metadata_t}*/
        // const funcMeta = metaOf(_function);
        
        const args = this.resolveComponentsFor(_function, _scope);

        if (args === undefined || args === null) {

            return;
        }

        this.#setDefaultArguments(_function, args);
    }
}