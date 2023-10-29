const ContextHandler = require('../../../src/dependenies/handler/constextHandler.js');
const {type} = require('reflectype/src/decorators');
const autowired = require('../../../decorators/autowired.js');

const Car = require('../components/car.js');
const paramsType = require('reflectype/src/decorators/paramsType.js');
const Driver = require('../components/driver.js');
const Bike = require('../components/bike.js');
const Warehouse = require('../components/warehouse.js');
const DeliveryRequest = require('../components/DeliveryRequest.js');


function random(min, max) {
    return Math.random() * (max - min) + min;
  }
module.exports = class B extends ContextHandler{

    @autowired
    @type(Car)
    accessor vehicle

    @autowired
    @type(Warehouse)
    accessor warehouse

    constructor(context) {

        super(...arguments);    
    }

    @autowired
    @paramsType(Bike, DeliveryRequest)
    async handle(_v, req) {

        console.log('++++++++++++++++++++ phase B: routing region using', this.vehicle.name);
        console.log('deliver to city', req.city);
        console.log('need one bike', _v)

        throw new Error('missing');

        // return new Promise((resolve, reject) => {

        //     setTimeout(() => {
                
        //         if (Math.random()) {

        //             return resolve();
        //         }
                
        //         return reject(new Error());
        //     }, random(5000, 10000));
        // })
    }

    
}