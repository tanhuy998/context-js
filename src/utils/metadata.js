const {metadata_t, property_metadata_t, metaOf} = require('reflectype/src/reflection/metadata.js');
const isAbstract = require('reflectype/src/utils/isAbstract.js');
const {CONSTRUCTOR, METADATA, TYPE_JS} = require('../dependenies/constants.js');


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

    initTypeMetadataField(_object);

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

function getTypeMetadata(_object) {

    return metaOf(_object);
}

module.exports = {
    getTypeMetadata, setPseudoConstructor, initTypeField, initTypePropertyField, initMetadataField
}