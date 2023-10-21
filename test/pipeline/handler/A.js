const {type} = require('reflectype/src/decorators');

const autowired = require('../../../decorators/autowired');
const Bike = require('../components/bike.js');
const paramsType = require('reflectype/src/decorators/paramsType');
const Driver = require('../components/driver');
const Garage = require('../components/garage');

module.exports = class A {

    @autowired
    @type(Bike)
    accessor vehicle

    @autowired
    @type(Garage)
    accessor garage

    constructor() {

        
    }

    @autowired
    @paramsType(Driver)
    handle(_v) {

        console.log('phase A', this.vehicle, _v, this.garage);
    }
}