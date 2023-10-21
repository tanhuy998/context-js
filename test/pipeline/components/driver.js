module.exports = class Driver {

    static count = 0;

    id = ++this.constructor.count;

    name = 'driver';
}