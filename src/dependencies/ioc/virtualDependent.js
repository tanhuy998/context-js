const { isInstantiable } = require("reflectype/src/libs/type");
const { CONSTRUCTOR } = require("../constants");
const { ioc_seed_t } = require("./iocSeed");
const self = require("reflectype/src/utils/self");

module.exports = {
    hasPseudoConstructor,
    generateVirtualClass,
    isVirtualClass,
};

const IS_VIRTUAL_CLASS = '__virtual_class';

function isVirtualClass(_class) {

    return _class?.[IS_VIRTUAL_CLASS] === true;
}

/**
 * 
 * @param {Function} _class 
 * @returns {boolean}
 */
function hasPseudoConstructor(_class) {

    return typeof _class === 'function' && typeof _class[CONSTRUCTOR] === 'function';
}

function generateVirtualClass(_originClass) {

    if (!isInstantiable(_originClass)) {

        throw new TypeError('_originClass is not instantiable');
    }

    return class extends _originClass {

        [IS_VIRTUAL_CLASS] = true;

        constructor(...args) {

            const last = args.length > 0 ? args.length -1 : 0;
            const hasSeed = args[last] instanceof ioc_seed_t;
            let seed;

            if (hasSeed) {
                seed = args[last];
                args.pop();
            }

            super(...args);
            this.#init(seed);
           
        }

        #init(seed) {

            if (iocSeed?.constructor !== ioc_seed_t) {

                return;
            }

            this.#_initializeAccessorProperties(seed);
            this.#_invokePseudoContructor(seed);
        }

        /**
         * 
         * @param {ioc_seed_t} seed 
         */
        #_initializeAccessorProperties(seed) {

            const {context, scope} = seed;
        }

        /**
         * 
         * @param {ioc_seed_t} iocSeed 
         */
        #_invokePseudoContructor(iocSeed) {

            if (!hasPseudoConstructor(self(this))) {

                return;
            }

            const {context, scope} = iocSeed;
        }
    }
}