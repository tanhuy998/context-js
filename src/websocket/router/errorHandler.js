const RouteHandler = require('./routeHandler.js');

module.exports = class ErrorHandler extends RouteHandler {

    constructor() {

        super(...arguments);
    }

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

            if (++_taskCount > maxSyncTask) {

                //setImmediate(nextHandler.handle.bind(nextHandler), 0, _eventPack);

                _handlingPack.error = error;

                handlerArguments[0] = error;

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