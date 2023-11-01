const Injector = require("./injector");
const {metaOf, property_metadata_t, metadata_t} = require('reflectype/src/reflection/metadata');

const {CONSTRUCTOR} = require('../constants.js');
const AutoAccessorInjectorEngine = require("./autoAccessorInjectorEngine");

module.exports = class ClassInjectorEngine extends Injector {

    constructor(_iocContainer) {

        super(...arguments);
    }

    inject(_class) {

        if (typeof _class !== 'function') {

            return;
        }

        const meta = metaOf(_class);

        if (typeof meta !== 'object') {

            return;
        }

        if (meta.constructor === property_metadata_t) {

            return;
        }
        
        if (meta.constructor !== metadata_t) {

            return;
        }

        this.#discover(_class);
    }

    #discover(_class) {

        _class[CONSTRUCTOR] = undefined;

        const injector = new AutoAccessorInjectorEngine(this.iocContainer);

        injector.inject(_class);
    }
}