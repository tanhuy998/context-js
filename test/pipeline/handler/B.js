const ContextHandler = require('../../../src/dependenies/handler/constextHandler.js');
const {type} = require('reflectype/src/decorators');
const autowired = require('../../../decorators/autowired.js');

const Car = require('../components/car.js');
const paramsType = require('reflectype/src/decorators/paramsType.js');
const Driver = require('../components/driver.js');
const Bike = require('../components/bike.js');

module.exports = class B extends ContextHandler{

    @autowired
    @type(Car)
    accessor vehicle

    constructor(context) {

        super(...arguments);
    }

    @autowired
    @paramsType(Driver, Bike)
    handle(_v, _b) {

        console.log('phase B', this.vehicle, _v);
    }
}