const FunctionInjectorEngine = require("./functionInjectorEngine");
const ReflectionPrototypeMethod = require('reflectype/src/metadata/prototypeReflection/reflectionPrototypeMethod.js');
const {initTypeField, getTypeMetadata} = require('../../utils/metadata');
const { metadata_t } = require("reflectype/src/reflection/metadata");

module.exports = class MethodInjectorEngine extends FunctionInjectorEngine {

    constructor(_iocContainer) {

        super(...arguments);
    }

    _resolveReflection({target, methodName}) {

        return new ReflectionPrototypeMethod(target, methodName);
    }

    /**
     * 
     * @param {Object} injectionFactor 
     * @param {Object|Function} injectionFactor.target
     * @param {string|symbol} injectionFactor.methodName
     * @param {*} _scope 
     */
    resolveComponentsFor(injectionFactor, _scope) {

        if (
            typeof injectionFactor !== 'object' ||
            !(target in injectionFactor) ||
            !(methodName in injectionFactor)
        ) {

            throw new Error('invalid MethodInjectorEngine.resolveComponentsFor() arguments');
        }

        super.resolveComponentsFor(injectionFactor, _scope);
    }

    /**
     * inject dependencies directly to a method arguments. When method is invoke without any arguments,
     * injected dependencies would be passed in.
     * 
     * @param {Object} _object 
     * @param {string | Symbol} _methodName 
     * 
     * @return {boolean}
     */
    inject(_object, _methodName, _scope) {

        this.#ensureInput(...arguments);
        initTypeField(_object);

        /**@type {metadata_t} */
        const objectMeta = getTypeMetadata(_object);
        //const actualFunc = _object[_methodName];
        const components = this.resolveComponentsFor({target: _object, methodName: _methodName}, _scope);
        
        if (components.length === 0) {
            // nothing to inject, the process is determined as success
            return true;
        }

        const extraMeta = {
            name: _methodName,
            isMethod: true,
            defaultArguments: components
        };

        let methodReflection = new ReflectionPrototypeMethod(_object, _methodName);
        const payload = [extraMeta, methodReflection.metadata];

        objectMeta.properties[_methodName] = payload;

        methodReflection = undefined;
        return true;
    }

    ableToInject(_object, _methodName) {

        try {

            this.#ensureInput(_object, _methodName);
        }
        catch {

            return false;
        }

        //const reflection = new ReflectionPrototypeMethod(_object.constructor, _methodName);
        const reflection = new ReflectionFunction(_object[_methodName]);

        const objectMeta = getTypeMetadata(_object);

        const isValidObjectMeta = objectMeta.constructor === metadata_t || objectMeta === null || objectMeta === undefined;
        
        return isValidObjectMeta && reflection.isValid;
    }

    #ensureInput(_object, _methodName) {

        if (typeof _object?.constructor !== 'function') {

            throw new Error('cannot inject method of a non class-instance object');
        }

        const nameType = typeof _methodName;
        
        if (nameType !== 'string' && nameType !== 'symbol') {

            throw new Error('type of _methodName must be either string or Symbol');
        }

        if (typeof _object[_methodName] !== 'function') {

            throw new Error(`the object does not include method  ${nameType === 'symbol' ? `[${_methodName}]` : _methodName}()`);
        }
    }
}