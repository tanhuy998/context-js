

/**
 * @typedef {import('../ioc/iocContainer.js')} IocContainer
 */


const Coordinator = require('../coordinator/coodinator.js');
// const { useTrait } = require('../../utils/type.js');
// const traitResolveComponent = require('./traitResolveComponent.js');
module.exports = class Injector {

    static #context;

    static setContext(_context) {


    }

    // static {

    //     useTrait(this, traitResolveComponent);
    // }

    /**@type {IocContainer} */
    #iocContainer;

    get iocContainer() {

        return this.#iocContainer;
    }

    constructor(_iocContainer) {

        this.#iocContainer = _iocContainer;
    }

    resolveComponent(_abstract, _scope) {

        const instance =  this.iocContainer.get(_abstract, _scope);

        if (instance instanceof Coordinator) {
    
            return instance.value;
        }
    
        return instance;
    }

    /** default behavior */
    inject() {


    }
}