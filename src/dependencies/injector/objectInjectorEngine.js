const Injector = require("./injector");
const FunctionInjectorEngine = require('./functionInjectorEngine.js');
const AutoAccessorInjectorEngine = require('./autoAccessorInjectorEngine');

const {isAbstract} = require('../../utils/type.js');
const CouldNotInjectError = require('../errors/couldNotInjectError.js');
const {CONSTRUCTOR} = require('../constants.js');
const { metaOf, property_metadata_t } = require("reflectype/src/reflection/metadata");

module.exports = class ObjectInjectorEngine extends Injector {

    constructor(_iocContainer) {

        super(...arguments);
    }
    
    /**
     * 
     * @param {Object} _object 
     */
    #traceProtoPseudoConstructorChain(_object, _scope) {

        let proto = _object;

        const protoOrder = [];

        while (proto !== null && proto !== undefined && proto?.constructor !== Object) {

            protoOrder.push(proto);

            proto = proto.__proto__;
        }

        const protoStack = protoOrder.reverse();


        const functionInjector = new FunctionInjectorEngine(this.iocContainer);
        const fieldInjector = new AutoAccessorInjectorEngine(this.iocContainer);
        // the order of psudo constructor injection must be from base class to derived class
        // to insure the consitence and integrity of data
        for (const proto of protoStack || []) {

            const pseudoConstructor = proto[CONSTRUCTOR];

            fieldInjector.inject(proto, _scope);

            if (typeof pseudoConstructor === 'function') {

                const args = functionInjector.resolveComponentsFor(pseudoConstructor, _scope);
                
                /**
                 *  this line is confusing
                 */
                //pseudoConstructor.call(proto);
                pseudoConstructor.call(_object, ...(args ?? [])); // this line is confusing;

            }
        }
    }

    inject(_object, _scope) {

        if (isAbstract(_object)) {

            throw new CouldNotInjectError();
        }

        this.#traceProtoPseudoConstructorChain(_object, _scope);
    }
}