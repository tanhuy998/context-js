const AutoAccessorInjectorEngine = require('../injector/autoAccessorInjectorEngine.js');
const FunctionInjectorEngine = require('../injector/functionInjectorEngine.js');
const ObjectInjectorEngine = require('../injector/objectInjectorEngine.js');

const {isAbstract} = require('../../utils/type.js');

const {property_metadata_t, metadata_t, metaOf} = require('reflectype/src/reflection/metadata.js');
const ClassInjectorEngine = require('../injector/classInjectorEngine.js');

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

module.exports = class DependenciesInjectionSystem {

    /**@type {FunctionInjectorEngine} */
    #functionInjector;
    /**@type {AutoAccessorInjectorEngine} */
    #fieldInjector;
    /**@type {ObjectInjectorEngine} */
    #objectInjector;
    /**@type {ClassInjectorEngine} */
    #classInjector;

    #iocContainer;
    /**
     * 
     * @param {Context} _context 
     */
    constructor(_iocContainer) {

        this.#iocContainer = _iocContainer;

        this.#init();
    }

    #init() {

        const container = this.#iocContainer;

        this.#functionInjector = new FunctionInjectorEngine(container);
        this.#objectInjector = new ObjectInjectorEngine(container);
        //this.#fieldInjector = new AutoAccessorInjectorEngine(container);
        this.#classInjector = new ClassInjectorEngine(container);
    }

    inject(_unknown) {

        const kind = this.#classify(_unknown);

        switch (kind) {
            case DependencyKind.UNKNOWN: return;
            case DependencyKind.FIELD: return
            case DependencyKind.FUNCTION: this.#resolveFunction(_unknown);
            case DependencyKind.CLASS: this.#resolveClass(_unknown)
            case DependencyKind.OBJECT: this.#resolveObject(_unknown);
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
    }

    #resolveFunction(_func) {

        const injector = this.#functionInjector;

        injector.inject(_func);
    }
}