module.exports = class InvalidClassReflectionError extends Error {

    constructor(_invalidClass) {

        super(`${_invalidClass.name} is not defined as class`);
    }
}