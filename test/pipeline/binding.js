const Context = require('../../src/dependenies/context/context.js');
const Bike = require('./components/bike.js');
const Car = require('./components/car.js');
const Garage = require('./components/garage.js');
const Driver = require('./components/driver.js');


Context.test = 1;
 
module.exports = class CustomContext extends Context{

    static {

        this.__init();

        const pipeline = this.pipeline;

        console.log(pipeline.global);

        super.components.bind(Car);
        super.components.bind(Bike);
        super.components.bindSingleton(Garage);
        super.components.bindScope(Driver);
    }
}
