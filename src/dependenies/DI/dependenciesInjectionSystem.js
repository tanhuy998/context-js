const Contextual = require('./contextual.js');
const FunctionInjectorEngine = require('../injector/functionInjectorEngine.js');

/**
 * @typedef {import('../context/context.js')} Context
 * @typedef {import('reflectype/src/metadata/ReflectionParameter.js')} ReflectionParameter
 */


module.exports = class DependenciesInjectionSystem extends Contextual{

    /**@type {FunctionInjectorEngine} */
    #functionInjector;

    /**
     * 
     * @param {Context} _context 
     */
    constructor(_context) {

        super(...arguments);

        this.#init();
    }

    #init() {

        const context = this.context;

        this.#functionInjector = context.constructor.iocContainer.injector;
    }

    inject(_unknown) {

                
    }
}