const RouteHandler = require('./routeHandler.js');

/**
 *  @typedef {import('./wsEvent.js')} WSEvent
 */
module.exports = class ErrorHandler extends RouteHandler {

    /**
     * @inheritdoc
     */
    constructor() {

        super(...arguments);
    }

    /**
     * @override
     * 
     * @param {Number} _taskCount 
     * @param {Object} _handlingPack 
     * @param {Function} _handlingPack.lastNextFunction
     * @param {Array<any>} _handlingPack.handlerArguments
     * @param {WSEvent} _handlingPack.event
     * @param {Error} _handlingPack.error
     */
    handle(_taskCount, _handlingPack) {

        const {handlerArguments, event, error, lastNextFunction} = _handlingPack;

        const cb = this.callbackFunction;

        const nextHandler = this.next;

        const maxSyncTask = this.maxSyncTask;

        try {

            const handlerResult = cb(...handlerArguments, next);

            if (handlerResult instanceof Promise) {

                handlerResult.catch((error) => {

                    next(error);
                })
            }
        }
        catch(error) {

            next(error);
        }

        function next(error) {

            if (!error) {

                return;       
            }

            if (!nextHandler) {

                return lastNextFunction(error);
            }

            _handlingPack.error = error;

            handlerArguments[0] = error;

            if (++_taskCount > maxSyncTask) {

                setImmediate((_handlingPack) => {

                    nextHandler.handle(0, _handlingPack);

                }, _eventPack);
            }
            else {

                nextHandler.handle(_taskCount, _handlingPack);
            }
        }
    }
}