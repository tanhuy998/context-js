module.exports = class Countable {

    static count = 0;

    id = ++this.constructor.count;
}