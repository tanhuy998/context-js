module.exports = class Warehouse {

    static count = 0;

    id = ++this.constructor.count;

    name = 'garage';
}