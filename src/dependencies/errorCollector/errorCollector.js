const {EventEmitter, captureRejectionSymbol, errorMonitor} = require('node:events');
const { ERROR_GATEWAY, NO_ERROR, EXCEPTION, START_COLLECTING, AFTER_ERROR, OCCUR_ERROR, NO_ERROR_GATEWAY } = require("./constant.js");
const ContextExceptionErrorCategory = require("./contextExceptionErrorCategory.js");
const ConventionError = require('../errors/conventionError.js');
const isIterable = require('reflectype/src/utils/isIterable.js');

/**
 * ErrorCollector watches and collects potential error of a specific action.
 * ErrorCollector is subclass of EventEmitter that manages events for manipulating the error catching operation.
 * This class adapts the behavior of the actions and preserves the synchronicity flow control 
 * when catching sync and async functions's error.
 * 
 * When can use ErrorCollector as event driven when the supervised action resolve,
 * Otherwise, we can overried [ERROR_GATEWAY] and [NO_ERROR_GATEWAY] to avoid the default events.
 */
module.exports = class ErrorCollector extends EventEmitter {

    /**@type {ContextExceptionErrorCategory} */
    #errorCategory = new ContextExceptionErrorCategory();

    get exceptions() {

        return this.#errorCategory.get(EXCEPTION);
    }

    get isSelective() {

        return this.categories.size > 1;
    }

    constructor(_context) {

        super({captureRejections: true});

        this.#init();
    }

    #init() {

        this.#initWhenCollectingError();
    }


    #initWhenCollectingError() {

        const collectError = this.#collect.bind(this);

        super.on(START_COLLECTING, collectError);
    }

    /**
     * This method is registered to "START_COLLECTING" event
     * 
     * @param {Function} _action 
     * @param {any} thisContext 
     * @param {Array<any>} args 
     * @returns 
     */
    #collect(_action, thisContext, args = []) {
        
        try {

            const result = _action.call(thisContext, ...args);
            
            if (result instanceof Promise) {

                return result.then(this.#noError(args));
            }

            // super.emit(NO_ERROR, result, ...args);
            this.#_resolve(result, args);
        }
        catch (error) {
            
            this.#_handleError(error, args);
        }
    }

    [captureRejectionSymbol](err, event, ..._execContext) {

        if (event !== START_COLLECTING) {

            throw err;
        }

        const [theAsyncFunc, thisContext, invokeArgs] = _execContext;
        
        this.#_handleError(err, invokeArgs);
    }

    #_resolve(value, watchArgs = []) {

        this[NO_ERROR_GATEWAY](value, watchArgs);
    }

    #_handleError(err, args = []) {

        try {

            this[ERROR_GATEWAY](err, args);
        }
        catch (e) {

            super.emit(OCCUR_ERROR, e, ...args);
        }
    }

    #noError(args = []) {

        const _this = this;

        return function (_value) {

            _this[NO_ERROR_GATEWAY](_value, args);
        }        
    }

    #_checkExceptions(_err) {

        if (this.#errorCategory?.match(_err, EXCEPTION)) {

            throw _err;
        }
    }

    /**
     * 
     * @param {Function} _action 
     * @param {Object} param1
     * @param {any} param1.thisContext
     * @param {Array<any>} param1.args
     */
    watch(_action, {thisContext, args} = {args: []}) {

        args = isIterable(args) ? args : [args];
        
        super.emit(START_COLLECTING, _action, thisContext, args);
    }


    whenErrorOccur(_cb) {

       super.on(OCCUR_ERROR, _cb);
    }

    whenNoError(_cb) {

        super.on(NO_ERROR, _cb);
    }

    [ERROR_GATEWAY](_err, _watchArgs = []) {

        this.#_checkExceptions(_err);

        super.emit(OCCUR_ERROR, _err, ..._watchArgs);
    }

    [NO_ERROR_GATEWAY](_value, _watchArgs = []) {

        this.emit(NO_ERROR, _value, ..._watchArgs);
    }

    /**

    /*****************************************************************
     * 
     * @param {any} _error 
     * @param {string} _category 
     */
    _check(_error, _category) {

        return this.#errorCategory._check(_error, _category);
    }

    /*****************************************************************
     * override methods
     */

    /**
     * legacy 
     */
    setContext() {

    }

    on() {

        this.#throwLockActionError('on');
    }

    off() {

        this.#throwLockActionError('off');
    }

    once() {

        this.#throwLockActionError('once');
    }

    prependListener() {

        this.#throwLockActionError('prependListener');
    }

    prependOnceListener() {

        this.#throwLockActionError('prependOnceListener');
    }

    removeListener() {

        this.#throwLockActionError('removeListener');
    }

    removeAllListeners() {

        this.#throwLockActionError('removeAllListeners');
    }


    /**
     * 
     * @param {string | Symbol} _methodName 
     */
    #throwLockActionError(_methodName) {

        throw new ConventionError(`${_methodName.descriptions || _methodName} is locked`); 
    }
}