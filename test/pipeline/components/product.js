module.exports = class Product {

    static count = 0;

    id = ++this.constructor.count;

    name = 'package';
}