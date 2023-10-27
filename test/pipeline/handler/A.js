const {type} = require('reflectype/src/decorators');

const autowired = require('../../../decorators/autowired');
const Bike = require('../components/bike.js');
const paramsType = require('reflectype/src/decorators/paramsType');
const Driver = require('../components/driver');
const Garage = require('../components/warehouse');
const DeliveryRequest = require('../components/DeliveryRequest');
const Context = require('../../../src/dependenies/context/context');
const RedisKey = require('../components/redisKey');



module.exports = class A {

    @autowired
    @type(Bike)
    accessor vehicle


    constructor() {

        
    }

    @autowired
    @paramsType(DeliveryRequest, RedisKey('customers'))
    handle(req, customers) {

        console.log('+++++++++++++++++++++++++ phase A: deliver to customer using', this.vehicle.name);
        console.log('deliver to address: ', req);

        console.log('cached customers', customers);
    }
}