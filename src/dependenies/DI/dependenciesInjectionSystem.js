const AutoAccessorInjectorEngine = require('../injector/autoAccessorInjectorEngine.js');
const FunctionInjectorEngine = require('../injector/functionInjectorEngine.js');
const ObjectInjectorEngine = require('../injector/objectInjectorEngine.js');
const MethodInjectorEngine = require('../injector/methodInjectorEngine.js');

const {isAbstract} = require('../../utils/type.js');

const {property_metadata_t, metadata_t, metaOf} = require('reflectype/src/reflection/metadata.js');
const ClassInjectorEngine = require('../injector/classInjectorEngine.js');
const Contextual = require('./contextual.js');

/**
 * @typedef {import('../context/context.js')} Context
 * @typedef {import('reflectype/src/metadata/ReflectionParameter.js')} ReflectionParameter
 */


class DependencyKind {

    static get FUNCTION() {

        return 1;
    };

    static get CLASS() {

        return 2;
    }

    static get FIELD() {

        return 3;
    }

    static get OBJECT() {

        return 4;
    }

    static get UNKNOWN() {

        return 0;
    }
}

function classifyMethodsOf(_object) {

    return function(_key) {

        if (_key === 'constructor') {

            return false;
        }

        const prop = _object[_key];
        /**@type {property_metadata_t?} */
        const propMeta = metaOf(prop);

        return typeof prop === 'function' && propMeta?.constructor === property_metadata_t && propMeta.isMethod === truw && Array.isArray(propMeta.defaultParamsType) && propMeta.defaultParamsType.length > 0;
    }
}

module.exports = class DependenciesInjectionSystem extends Contextual{

    /**@type {FunctionInjectorEngine} */
    #functionInjector;
    /**@type {AutoAccessorInjectorEngine} */
    #fieldInjector;
    /**@type {ObjectInjectorEngine} */
    #objectInjector;
    /**@type {ClassInjectorEngine} */
    #classInjector;
    /**@type {MethodInjectorEngine} */
    #methodInjector;

    /**@type {boolean} */
    get #fullyInject() {

        return this.context.config?.fullyInject;
    }

    #componentManager;
    /**
     * 
     * @param {Context} _context 
     */
    constructor(_context) {

        super(...arguments)

        this.#init();
    }

    #init() {

        this.#componentManager = this.context.constructor.iocContainer;

        const container = this.#componentManager;

        this.#functionInjector = new FunctionInjectorEngine(container);
        this.#objectInjector = new ObjectInjectorEngine(container);
        //this.#fieldInjector = new AutoAccessorInjectorEngine(container);
        this.#classInjector = new ClassInjectorEngine(container);
        this.#methodInjector = new MethodInjectorEngine(container);
    }

    /**
     * 
     * @param {Object} _unknown 
     * @param {string || Symbol} _method 
     * @returns 
     */
    inject(_unknown, _method) {

        const kind = this.#classify(_unknown);

        switch (kind) {
            case DependencyKind.UNKNOWN: return;
            case DependencyKind.FIELD: return;
            case DependencyKind.FUNCTION: this.#resolveFunction(_unknown);
            case DependencyKind.CLASS: this.#resolveClass(_unknown);
            case DependencyKind.OBJECT: {

                if (_method) {

                    this.#resolveMethod(_unknown, _method)
                }
                else {

                    this.#resolveObject(_unknown);
                }
            };
            default: return;
        }
    }

    #classify(_unknown) {

        if (typeof _unknown === 'function') {

            /**@type {metadata_t | property_metadata_t} */
            const meta = metaOf(_unknown);

            if (meta?.constructor === metadata_t) {

                return DependencyKind.CLASS;
            }
            else if (meta?.constructor === property_metadata_t && meta.isMethod) {

                return DependencyKind.FUNCTION;
            }
            else {

                return DependencyKind.UNKNOWN;
            }
        }
        else if (typeof _unknown === 'object') {

            return DependencyKind.OBJECT;
        }

        return DependencyKind.UNKNOWN;
    }

    /**
     * Inject Static Property
     * 
     * @param {Function} _class 
     */
    #resolveClass(_class) {

        const injector = this.#classInjector;

        injector.inject(_class)
    }

    #resolveObject(_object) {

        const injector = this.#objectInjector;

        injector.inject(_object);

        if (this.#fullyInject) {

            this.#traceMethodsAndInject(_object);
        }
    }

    #resolveFunction(_func) {

        const injector = this.#functionInjector;

        injector.inject(_func);
    }

    #resolveMethod(_object, _methodName) {

        this.#methodInjector.inject(_object, _methodName);
    }

    #traceMethodsAndInject(_object) {

        const methods = Reflect.ownKeys(_object)
                        .filter(classifyMethodsOf(_object));

        for (const methodName of methods || []) {

            this.#resolveMethod(_object, methodName);
        }
    }
}