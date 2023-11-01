const reflectypeConstants = require('reflectype/src/constants.js');

const pipelineConstant = require('./pipeline/constant.js');

module.exports = {
    CONSTRUCTOR: Symbol('constructor'),
    METADATA: reflectypeConstants.METADATA,
    TYPE_JS: reflectypeConstants.TYPE_JS,
    END_OF_PIPELINE: Symbol('Last-Phase'),
    ...pipelineConstant
}