const {type} = require('reflectype/src/decorators');
const autowired = require('../../../decorators/autowired');
const Fuel = require('./driver.js');
const Vehicle = require('./vehicle');

module.exports = class Bike extends Vehicle{

    name = 'bike';

}