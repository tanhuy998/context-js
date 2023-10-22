const Context = require('../../src/dependenies/context/context.js');
const Bike = require('./components/bike.js');
const Car = require('./components/car.js');
const Warehouse = require('./components/warehouse.js');
const Driver = require('./components/driver.js');
const Product = require('./components/product.js');

const Vehicle = require('./components/vehicle.js')

const A = require('./handler/A.js');
const B = require('./handler/B.js');
 
function first() {
    console.log('----------------------')
    console.log('first phase:', 'loads product');
}

function statistic() {

    console.log('+ phase 4: vehicle launched:');
    console.log(`
        ----- Car: ${Car.count}
        ----- Bike: ${Bike.count}
        ----- Driver: ${Driver.count}

        ----- Gross total products: ${Product.count};
    `)
}
module.exports = class TransportContext extends Context{

    static {

        this.__init();

        const pipeline = this.pipeline;

        super.components.bindSingleton(Warehouse);
        super.components.bind(Car);
        super.components.bind(Bike);
        super.components.bind(Driver);
        super.components.bindScope(Product)
        
        pipeline.addPhase().setHandler(first).build();
        pipeline.addPhase().setHandler(B).build();
        pipeline.addPhase().setHandler(A).build();
        pipeline.addPhase().setHandler(statistic).build();
    }
}
