//const {DecoratorResult, MethodDecorator} = require('../../decorator/decoratorResult.js');
const AbstractMethodDecorator = require('../../decorator/abstractMethodDecorator.js');
const ResponseError = require('../../error/responseError.js');
const WebsocketContext = require('../websocketContext.js');
const {METADATA} = require('../../constants.js');
//const {preprocessDescriptor} = require('../../decorator/utils.js')


module.exports = function channel(_channelName) {

    if (typeof _channelName !== 'string') {

        throw new TypeError('_channelName must be type of string');
    }

    return function(_value, context) {

        const {kind, name} = context;

        if (kind === 'method') {

            return caseMethod(_value, context, _channelName);
        }
        else if (kind === 'class') {

            return caseClass(_value, context, _channelName);
        }
        else {

            throw new Error('@ws.channel just affect on method');
        }
    }
}

/**
 *  A Controller class holds the metadata about namespace it's defining activities 
 * 
 * 
 * @param {*} _class 
 * @param {*} context 
 * @param {*} event 
 */
function caseClass(_class, context, event) {

    if (!_class[METADATA]) {

        _class[METADATA] = {
            channelPrefixes: new Set()
        }
    }
    
    if (!_class[METADATA].channelPrefixes) {

        _class[METADATA].channelPrefixes = new Set();
    }

    const metadata = _class[METADATA];

    if (!metadata.channelPrefixes.has(event)) {

        metadata.channelPrefixes.add(event);
    }
}

function caseMethod(_method, context, event) {

    const {name} = context;

    WebsocketContext.initChannel(event, name);

        // when a legacy decorator is inoked before
        if (_method.name === 'stage3WrapperFunction') {

            _method = _method();

            if (_method instanceof AbstractMethodDecorator) {

                _method.on('afterResolve', detectAndSendMessageBack);

                return function stage3WrapperFunction() {
                    
                    return _method;
                }
            }
        }

        // when there is no legacy invoke before
        return function () {

            const result = _method.call(this, ...arguments)

            detectAndSendMessageBack(result, this);

            return result;
        }
}

/**
 * 
 * @returns void
 */
function detectAndSendMessageBack() {

    const [result, _this, func] = arguments;

    if (result instanceof Error) {

        _this.context.next(result);

        return;
    }

    if (result instanceof Promise) {
        // return back the promise to router for catching error
        return result.then((value) => {

            if (result) {

                _this.context.response(value);
            }

            _this.context.next();

            return value;
        }).catch(error => {

            if (error instanceof ResponseError) {

                return error;
            }

            return new ResponseError(error.data);
        })
    }

    if (result) {

        _this.context.response(result);

        _this.context.next();

        return;
    }
    else {

        _this.context.next();
    }
}