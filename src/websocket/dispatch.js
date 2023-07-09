// const WSController = require('./controller/wsController.js');
const ApplicationContext = require('../applicationContext.js');
const {Stage3_handleRequest} = require('../requestDispatcher.js');
const ClientContext = require('./clientContext.js');

module.exports = function dispatch(controller, action, appContext = undefined) {


    return function (event, response, next) {

        let controllerObject;

        if (appContext instanceof ApplicationContext && appContext.supportIoc) {

            controllerObject = appContext.buildController(controller, event, response, next);
        }
        else {

            controllerObject = new controller();
        }

        controllerObject.setSocket(event.sender);

        controllerObject.resolveProperty();

        const wsContext = new ClientContext(event, response, next);

        controllerObject.setContext(wsContext);

        return Stage3_handleRequest(controllerObject, action, appContext);
    }
}