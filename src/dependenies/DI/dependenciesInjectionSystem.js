const Contextual = require('./contextual.js');
const FunctionInjectorEngine = require('./functionInjectorEngine.js');

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

        this.#functionInjector = new FunctionInjectorEngine(context);
    }

    inject(_unknown) {


    }
}