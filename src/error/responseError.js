module.exports = class ResponseError extends Error {

    constructor(_data) {

        super();

        this.data = _data;
    }
}