const {METADATA} = require('reflectype/src/constants.js');


function getMetadata(_unknown) {

    return _unknown[METADATA];
}

module.exports = getMetadata;