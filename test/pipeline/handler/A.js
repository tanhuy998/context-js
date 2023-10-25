const {type} = require('reflectype/src/decorators');

const autowired = require('../../../decorators/autowired');
const Bike = require('../components/bike.js');
const paramsType = require('reflectype/src/decorators/paramsType');
const Driver = require('../components/driver');
const Garage = require('../components/warehouse');
const DeliveryRequest = require('../components/DeliveryRequest');
const Context = require('../../../src/dependenies/context/context');



module.exports = class A {

    @autowired
    @type(Bike)
    accessor vehicle


    constructor() {

        
    }

    @autowired
    @paramsType(DeliveryRequest)
    handle(req) {

        console.log('+++++++++++++++++++++++++ phase A: deliver to customer using', this.vehicle.name);
        console.log('deliver to address: ', req);
    }
}