const reflectypeConstants = require('reflectype/src/constants.js');

module.exports = {
    CONSTRUCTOR: Symbol('constructor'),
    METADATA: reflectypeConstants.METADATA,
    TYPE_JS: reflectypeConstants.TYPE_JS,
    END_OF_PIPELINE: Symbol('Last-Phase'),
    ABORT_PIPELINE: Symbol('ABORT_PIPELINE')
}