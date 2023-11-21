const initFootPrint = require('reflectype/src/libs/initFootPrint.js');
const metadata = require('../metadata.js');
const { property_metadata_t, metadata_t } = require('reflectype/src/reflection/metadata.js');

/**
 * @typedef {import('reflectype/src/reflection/metadata.js')} property_metadata_t
 */

/**
 * 
 * @param {property_metadata_t} _propMeta 
 */
function placeAutoWiredMetadata(_propMeta) {

    initFootPrint(_propMeta);
    
    _propMeta.footPrint.needInject = true;
}

/**
 * 
 * @param {property_metadata_t} _any 
 * @returns {boolean}
 */
function isPropMetaAutowired(_propMeta) {

    return _propMeta?.footPrint?.needInject === true;
}

/**
 * 
 * @param {Object | Function} _any 
 * @param {string} _propName 
 */
function isAutowired(_any, _propName) {

    const type = typeof _any;

    switch(type) {
        case 'object':
            return function_isAutowired(_any);
        case 'function':
            return objectProperty_isAutowired(_any, _propName);
        default:
            return false;
    }
}

function function_isAutowired(_func) {

    const propMeta = metadata.getTypeMetadata(_func);

    return propMeta instanceof property_metadata_t && isPropMetaAutowired(propMeta);
}

function objectProperty_isAutowired(_obj, _propName) {

    /**@type {metadata_t} */
    const typeMeta = metadata.getTypeMetadata(_obj);

    const properties = typeMeta.properties;

    return typeMeta instanceof metadata_t 
            && typeof properties === 'object' 
            && isPropMetaAutowired(properties[_propName]);
}




module.exports = {placeAutoWiredMetadata, isAutowired, isPropMetaAutowired};