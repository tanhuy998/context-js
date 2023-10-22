const {type} = require('reflectype/src/decorators');
const autowired = require('../../../decorators/autowired');
const Driver = require('./driver.js');
const Product = require('./product');

module.exports = class Vehicle {

    static count = 0;

    id = ++this.constructor.count;

    name = 'vehicle';

    @autowired
    @type(Driver)
    accessor driver;

    @autowired
    @type(Product)
    accessor productPackage;
}