const FunctionInjectorEngine = require("./functionInjectorEngine");
const ReflectionPrototypeMethod = require('reflectype/src/metadata/reflectionPrototypeMethod');
const {initTypeField, getTypeMetadata, initTypePropertyField} = require('../../utils/metadata');
const { metadata_t } = require("reflectype/src/reflection/metadata");

module.exports = class MethodInjectorEngine extends FunctionInjectorEngine {

    constructor(_iocContainer) {

        super(...arguments);
    }

    /**
     * 
     * @param {Object} _object 
     * @param {string | Symbol} _methodName 
     * 
     * @return {boolean}
     */
    inject(_object, _methodName) {

        this.#ensureInput(...arguments);

        if (!this.ableToInject(_object, _methodName)) {

            return false;
        }

        initTypeField(_object);

        /**@type {metadata_t} */
        const objectMeta = getTypeMetadata(_object);

        const actualFunc = _object[_methodName];

        const components = super.resolveComponentsFor(actualFunc);

        if (components.length === 0) {
            // nothing to inject, the process is determined as success
            return true;
        }

        const extraMeta = {
            name: _methodName,
            isMethod: true,
            defaultArguments: components
        };

        const payload = [extraMeta, getTypeMetadata(actualFunc)];

        objectMeta.properties[_methodName] = payload;

        return true;
    }

    ableToInject(_object, _methodName) {

        try {

            this.#ensureInput(_object, _methodName);
        }
        catch {

            return false;
        }

        const reflection = new ReflectionPrototypeMethod(_object.constructor, _methodName);

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