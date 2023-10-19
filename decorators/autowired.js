const {initMetadata} = require('reflectype/src/libs/propertyDecorator.js');
const initFootPrint = require('reflectype/src/libs/initFootPrint.js');

function autowiređ(_prop, _context) {

    //const {kind} = _context;

    const propMeta = initMetadata(_prop, _context);

    if (isApplied(propMeta)) {

        return _prop;
    }

    initFootPrint(propMeta);
    
    propMeta.footPrint.needInject = true;

    return _prop;
}

// function handleMethod(_func, _context) {

//     if (typeof _method !== 'function') {

//         return;
//     }

//     /**@type {property_metadata_t} */
//     const propMeta = propertyDecorator.initMetadata(_method, context);

//     if (!propMeta) {

//         return;
//     }

//     propMeta.footPrint = true;

//     return _func;
// }

// function handleAccessor(_func, _concrete) {


// }

function isApplied(propMeta) {

    return propMeta.footPrint?.needInject === true;
}

module.exports = autowiređ;