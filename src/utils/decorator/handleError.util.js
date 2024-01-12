//const initTypeMetaFootPrint = require("reflectype/src/libs/initFootPrint");
const {initFootPrint, getMetadataFootPrintByKey, setMetadataFootPrint} = require('reflectype/src/libs/footPrint.js');
const {get} = require('reflectype/src/libs/propertyDecorator');
const { property_metadata_t } = require("reflectype/src/reflection/metadata");
const isIterable = require("reflectype/src/utils/isIterable");
const metadata = require("../metadata");

const HANDLE_ERROR = 'handleError';

/**
 * @typedef {import('reflectype/src/reflection/metadata').property_metadata_t} property_metadata_t
 */

/**
 * 
 * @param {property_metadata_t} _propMeta 
 * @param {Iterable<any>} _listOfErrorTypes 
 */
function placeHandleErrorMeta(_propMeta, _listOfErrorTypes = [Error]) {

    if (!(_propMeta instanceof property_metadata_t)) {

        throw new Error('invalid metadata');
    }

    if (!isIterable(_listOfErrorTypes)) {

        _listOfErrorTypes = [Error];
    }

    initFootPrint(_propMeta);

    /**@type {Array} */
    //const propMetaErrorTypeList = _propMeta.footPrint[HANDLE_ERROR] ?? [];
    const propMetaErrorTypeList = getMetadataFootPrintByKey(_propMeta, HANDLE_ERROR) ?? [];

    propMetaErrorTypeList.push(..._listOfErrorTypes);

    //_propMeta.footPrint[HANDLE_ERROR] = propMetaErrorTypeList;
    setMetadataFootPrint(_propMeta, HANDLE_ERROR, propMetaErrorTypeList)
}

/**
 * 
 * @param {property_metadata_t} _propMeta 
 * 
 * @return {Array<any>?}
 */
function getListOfHandleError(_propMeta) {

    if (!(_propMeta instanceof property_metadata_t)) {

        return undefined;
    }

    const footPrint = _propMeta.footPrint;

    // return typeof footPrint === 'object' ?
    //          footPrint[HANDLE_ERROR] ?? undefined : undefined;
    return getMetadataFootPrintByKey(HANDLE_ERROR);
}

/**
 * 
 * @param {Function} _func 
 */
function isErrorHandleMethod(_func) {

    /**@type {property_metadata_t} */
    const propMeta = metadata.getTypeMetadata(_func);

    // return propMeta instanceof property_metadata_t 
    //         && typeof propMeta.footPrint === 'object' 
    //         && isIterable(footPrint[HANDLE_ERROR]);
    return propMeta instanceof property_metadata_t 
        && isIterable(getMetadataFootPrintByKey(HANDLE_ERROR)); 
}

module.exports = {placeHandleErrorMeta, isErrorHandleMethod, getListOfHandleError};