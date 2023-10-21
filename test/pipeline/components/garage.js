module.exports = class Garage {

    static count = 0;

    id = ++this.constructor.count;

    name = 'garage';
}