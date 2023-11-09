const {metadata_t, property_metadata_t, metaOf} = require('reflectype/src/reflection/metadata.js');
const isAbstract = require('reflectype/src/utils/isAbstract.js');
const {CONSTRUCTOR, METADATA, TYPE_JS} = require('../dependencies/constants.js');
const {decorateMethod} = require('reflectype/src/libs/methodDecorator.js');
const initFootPrint = require('reflectype/src/libs/initFootPrint.js');
const { compareArgsWithType } = require('reflectype/src/libs/argumentType.js');

function initMetadataField(_object) {

    if (!(_object instanceof Object)) {

        return;
    }

    _object[METADATA] ??= {};
}

function initTypePropertyField(_object) {

    initMetadataField(_object);

    _object[METADATA][TYPE_JS] ??= new property_metadata_t();
}

function initTypeField(_object) {

    initMetadataField(_object);

    _object[METADATA][TYPE_JS] ??= new metadata_t();
}

function setPseudoConstructor(_class, _func) {

    if (!isAbstract(_class)) {

        return false;
    }

    if (typeof _func !== 'function') {

        return false;
    }

    if (_func.toString().match(/=>/)) {

        return false;
    }

    _class.prototype[CONSTRUCTOR] = _func;

    return true;
}

/**
 * 
 * @param {*} _object 
 * @returns {property_metadata_t | metadata_t}
 */
function getTypeMetadata(_object) {

    return metaOf(_object);
}

/**
 * 
 * @param {Function} _func 
 * @param {property_metadata_t} param1 
 * @returns {Function}
 */
function decorateFunction(_func, _ref = new property_metadata_t()) {

    //initTypePropertyField(_func);

    const defaultArgs = _ref?.defaultArgs ?? _ref?.value;
    const paramsType = _ref?.paramsType ?? _ref?.defaultParamsType;

    initMetadataField(_func);

    /**@type {property_metadata_t} */
    const meta = new property_metadata_t(_ref);

    _func[METADATA][TYPE_JS] = meta;

    meta.isMethod = true;
    meta.defaultParamsType = Array.isArray(paramsType) && paramsType.length > 0 ? paramsType : [paramsType];
    meta.value = Array.isArray(defaultArgs) && defaultArgs.length > 0 ? defaultArgs : [defaultArgs];

    initFootPrint(meta);

    decorateMethod(_func);

    return meta.footPrint.decoratedMethod;
}

/**
 * 
 * @param {Function} _class 
 */
function decoratePseudoConstructor(_class, _metadata = new property_metadata_t()) {

    if (typeof _class !== 'function') {

        throw new TypeError(`could not decorate pseudo constructor of type [${_class?.name ?? _class}]`);
    }

    const pseudoConstructor = _class.prototype[CONSTRUCTOR];

    if (typeof pseudoConstructor !== 'function') {

        return;
    }

    const decoratedMethod = decorateFunction(pseudoConstructor, _metadata);

    /**@type {property_metadata_t} */
    const meta = getTypeMetadata(decoratedMethod);

    meta.static = false;
    meta.private = false;
    meta.isMethod = true;

    compareArgsWithType(meta);
    
    _class.prototype[CONSTRUCTOR] = decoratedMethod;
}

module.exports = {
    getTypeMetadata, setPseudoConstructor, initTypeField, initTypePropertyField, initMetadataField, decorateFunction, decoratePseudoConstructor
}