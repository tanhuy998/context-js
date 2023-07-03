const DecoratorResult  = require("./decoratorResult");
const DecoratorType = require('./decoratorType.js');

module.exports = class AbstractMethodDecorator extends DecoratorResult {

    constructor(prop) {

        super(DecoratorType.PROPERTY_DECORATOR, prop);
    }
}