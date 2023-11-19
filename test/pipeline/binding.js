const Context = require('../../src/dependencies/context/context.js');
const Bike = require('./components/bike.js');
const Car = require('./components/car.js');
const Warehouse = require('./components/warehouse.js');
const Driver = require('./components/driver.js');
const Product = require('./components/product.js');

const Vehicle = require('./components/vehicle.js')

const A = require('./handler/A.js');
const B = require('./handler/B.js');
const DeliveryRequest = require('./components/coordinator.js/DeliveryRequest.js');
const { ABORT_PIPELINE, DISMISS, ROLL_BACK } = require('../../src/dependencies/constants.js');
const AcceptableErrorHandler = require('./handler/acceptableErrorHandler.js');
const AnotherErrorHandler = require('./handler/anotherErrorHandler.js');
const Pipeline = require('../../src/dependencies/pipeline/pipeline.js');
 
/**
 * @typedef {import('../../src/dependencies/pipeline/pipeline.js')} Pipeline
 */

function first() {
    console.log('----------------------')
    console.log('++++++++++++++++++++++++first phase:', 'loads product');
}

function statistic(lastValue) {

    console.log('++++++++++++++++++++++++ phase 4: vehicle launched:');
    console.log(`
        ----- Car: ${Car.count}
        ----- Bike: ${Bike.count}
        ----- Driver: ${Driver.count}

        ----- Gross total products: ${Product.count}

        ----- Warehouse: ${Warehouse.count}
    `)

    console.log(lastValue)
}

module.exports = class TransportContext extends Context{

    static {

        this.__init();

        /**@type {Pipeline} */
        const pipeline = this.pipeline;

        super.components.bindSingleton(Warehouse);
        super.components.bind(Car);
        super.components.bind(Bike);
        super.components.bind(Driver);
        super.components.bindScope(Product)

        const contextHandlerPipeline = new Pipeline();
        contextHandlerPipeline.addPhase().setHandler(B).build();
        contextHandlerPipeline.addPhase().setHandler(A).build();

        pipeline.addPhase().setHandler(first).build();
        // pipeline.addPhase().setHandler(B).build();
        // pipeline.addPhase().setHandler(A).build();
        pipeline.addPhase().use(contextHandlerPipeline).build();
        pipeline.addPhase().setHandler(statistic).build();

        pipeline.onError(AcceptableErrorHandler, function hadnlerError(error, context, breakpoint, next) {

            console.log('########## transportation failed')
            
            console.log(error);

            return {
                prop1: 1,
                prop2: 'test option'
            }
            //return 'test Immediate Error value';
        },  AnotherErrorHandler);

        this.__lock();
    }

    constructor() {

        super();

        const deliveryInfo = {
            customerName: 'John',
            city: 'NY',
            address: '22 jump street'
        }

        /**
         *  Register session fragment for DeliveryRequest
         */
        this.session.save(DeliveryRequest.key , deliveryInfo);
    }
}
