const {type} = require('reflectype/src/decorators');
const autowired = require('../../../decorator/autowired');
const Driver = require('./driver.js');
const Product = require('./product');
const Countable = require('./countable');

module.exports = class Vehicle extends Countable {

    name = 'vehicle';

    @autowired
    @type(Driver)
    accessor driver;

    @autowired
    @type(Product)
    accessor productPackage;
}