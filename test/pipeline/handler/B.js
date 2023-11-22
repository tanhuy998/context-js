const ContextHandler = require('../../../src/dependencies/handler/contextHandler.js');
const {type} = require('reflectype/src/decorators');
const autowired = require('../../../decorator/autowired.js');

const Car = require('../components/car.js');
const paramsType = require('reflectype/src/decorators/paramsType.js');
const Driver = require('../components/driver.js');
const Bike = require('../components/bike.js');
const Warehouse = require('../components/warehouse.js');
const DeliveryRequest = require('../components/coordinator.js/DeliveryRequest.js');
const handleError = require('../../../decorator/handlerError.js');


function random(min, max) {
    return Math.random() * (max - min) + min;
  }

class TestContextLock {


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
    @paramsType(Bike, DeliveryRequest, ContextHandler)
    async handle(_v, req, handler) {

        console.log('++++++++++++++++++++ phase B: routing region using', this.vehicle.name);
        console.log('deliver to city', req.city);
        console.log('need one bike', _v)

        //console.log('scope overiding success', this === handler)

        throw new Error('missing');
        // return await new Promise((resolve, reject) => {

        //     setTimeout(() => {
                
        //         if (Math.random()) {

        //             return resolve();
        //         }
                
        //         return reject(new Error());
        //     }, random(0, 3000));
        // })
    }

    @handleError(Error)
    someFunc() {

        console.log('internal error catching');
    }
}