const {type} = require('reflectype/src/decorators');

const autowired = require('../../../decorators/autowired');
const Bike = require('../components/bike.js');
const paramsType = require('reflectype/src/decorators/paramsType');
const Driver = require('../components/driver');
const Garage = require('../components/warehouse');

module.exports = class A {

    @autowired
    @type(Bike)
    accessor vehicle

    constructor() {

        
    }

    // @autowired
    // @paramsType(Driver)
    handle(_v) {

        console.log('+ phase A: deliver to customer using', this.vehicle);
    }
}