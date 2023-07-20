const {METADATA} = require('../../constants.js');
const WebsocketContext = require('../websocketContext.js');
const WSEvent = require('../router/wsEvent.js');


module.exports = function filter(...callback) {

    if (callback.length == 0) {

        throw new Error('@ws.filter needs at least 1 argument');
    }

    return function(_value, context) {

        const {kind} = context;

        switch(kind) {

            case 'class':
                return caseClass(_value, context, callback);
                break;
            // case 'method':
            //     //return caseMethod();
            //     break;
            default:
                throw new Error('@WS.filter decorator is now support on class');
                break;
        }
    }
}

function caseClass(_class, context, _filters = []) {

    if (!_class[METADATA]) {

        _class[METADATA] = {
            filters: []
        };
    }

    if (!_class[METADATA].filters) {

        _class[METADATA].filters = [];
    }

    const metadata = _class[METADATA];

    const filters = _filters.map(generateFilterFunciton);

    metadata.filters.push(filters);

    return _class;
}

function caseMethod(_value, context, filter = []) {

    const currentContext = WebsocketContext.currentNamspaceContext();



    _value;
}

function generateFilterFunciton(_cb) {


    return async function WSFilterFunction(_event, _response, next) {

        try {

            const result = await _cb(_event);

            const passed = (result === true);

            if (passed) {

                return next();
            }
            else {
                
                return next(false);
            }
        }
        catch(error) {

            next(error)
        }
    }
}