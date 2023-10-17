const HttpContext = require('../httpContext.js');
const ControllerState = require('./controllerState.js');
const {PropertyDecorator} = require('../decorator/decoratorResult.js');
const ControlerState = require('./controllerState.js');


class BaseController extends Function{

    static serve() {

        return function() {

            return new this().handle();
        }
    }

    constructor() {


    }

    handle() {


    }
};

module.exports = BaseController;
