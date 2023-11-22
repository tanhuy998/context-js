const { initMetadata } = require("reflectype/src/libs/propertyDecorator");
const { placeHandleErrorMeta } = require("../src/utils/decorator/handleError.util");

function handleError(..._errors) {

    return function (_func, context) {

        const {kind} = context;
        
        if (kind !== 'method') {
    
            throw new Error('invalid use of @handleError');
        }
        
        const propMeta = initMetadata(_func, context);
    
        placeHandleErrorMeta(propMeta, _errors);

        return _func;
    } 
}



module.exports = handleError;