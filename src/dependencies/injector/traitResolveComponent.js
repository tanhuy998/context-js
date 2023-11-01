const Coordinator = require('../coordinator/coodinator.js');


/**
 * @typedef {import('./injector.js')} Injector
 */

/**
 * @this {Injector}
 * 
 */
function resolveComponent(_abstract, _scope) {

    const instance =  this.iocContainer.get(_abstract, _scope);

    if (instance instanceof Coordinator) {

        return instance.value;
    }

    return instance;
}

module.exports = {resolveComponent};