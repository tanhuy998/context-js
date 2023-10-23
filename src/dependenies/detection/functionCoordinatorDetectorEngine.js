/**
 * @typedef {import('../context/context')} Context
 * @typedef {import('reflectype/src/reflection/metadata').property_metadata_t} property_metadata_t
 */

const Context = require('../context/context.js');
const Coordinator = require('../coordinator/coodinator.js');
const sub_coordinator = require('../coordinator/subCoordinator.js');
const ReflectionFunction = require('reflectype/src/metadata/reflectionFunction');
const { metaOf } = require('reflectype/src/reflection/metadata');

module.exports = class FunctionCoordinatorDetectorEngine {

    constructor() {


    }

    /**
     * 
     * @param {any} _unknown 
     * @param {_context} _context 
     */
    detect(_func, _context) {

        if (!(_context instanceof Context)) {

            return;
        }

        if (typeof _func !== 'function') {

            return;
        }

        const reflection = new ReflectionFunction(_func);

        if (!reflection.isValid) {

            return;
        }

        this.#resolve(_func, _context);
    }   

    #resolve(_func, _context) {

        /**@type {property_metadata_t} */
        const meta = metaOf(_func);

        const paramsType = meta.defaultParamsType;

        const defaultArgs = meta.value;

        let i = 0;

        for (const type of paramsType || []) {

            if (type instanceof sub_coordinator || type.prototype instanceof Coordinator) {

                type.evaluate();

                
            }
            

        }
    }
}