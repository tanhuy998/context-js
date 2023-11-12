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

        let classProto = _object.constructor;

        let objectProto = _object;

        const protoOrder = [];

        
        while (classProto !== null && classProto !== undefined && classProto?.constructor !== Object) {
            
            protoOrder.push([classProto, objectProto]);

            classProto = classProto.__proto__;
            objectProto = objectProto.__proto__;
        }

        const protoStack = protoOrder.reverse();

        const functionInjector = new FunctionInjectorEngine(this.iocContainer);
        const fieldInjector = new AutoAccessorInjectorEngine(this.iocContainer);

        fieldInjector.inject(_object, _scope);

        // the order of psudo constructor injection must be from base class to derived class
        // to insure the consitence and integrity of data
        const pseudoConstructorStack = new Set();

        for (const pair of protoStack || []) {
            /**
             *  Inject fields
             */
            const [classProto, objectProto] = pair;
            
            const pseudoConstructor = typeof classProto.prototype === 'object'? classProto.prototype[CONSTRUCTOR] : undefined;
            
            if (typeof pseudoConstructor !== 'function') {

                continue;       
            }

            if (!pseudoConstructorStack.has(pseudoConstructor)) {

                const args = functionInjector.resolveComponentsFor(pseudoConstructor, _scope);

                pseudoConstructor.call(_object, ...(args ?? []));

                pseudoConstructorStack.add(pseudoConstructor);
            }
            //fieldInjector.inject(_object, _scope);
        }
    }

    inject(_object, _scope) {

        if (isAbstract(_object)) {

            throw new CouldNotInjectError();
        }

        this.#traceProtoPseudoConstructorChain(_object, _scope);
    }
}