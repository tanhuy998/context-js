const WSController = require('./controller/wsController.js');
const ApplicationContext = require('../applicationContext.js');
const {Stage3_handleRequest} = require('../requestDispatcher.js');
const { isConstructorDeclaration } = require('typescript');
const ControlerState = require('../controller/controllerState.js');
const WSContext = require('./wsContext.js');

module.exports = function dispatch(controller, action, appContext = undefined) {


    return function (event, response, next) {

        let controllerObject;

        if (appContext instanceof ApplicationContext && appContext.supportIoc) {

            controllerObject = appContext.buildController(controller);
        }
        else {

            controllerObject = new controller();
        }

        controllerObject.setSocket(event.sender);

        controllerObject.resolveProperty();

        const wsContext = new WSContext({
            handshake: event.sender.handshake,
            args: event.args
        })

        controllerObject.setContext(wsContext);

        Stage3_handleRequest(controllerObject, action, appContext);
    }
}