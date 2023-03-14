const ReflectionFunction = require('./reflectionFunction.js');

class InvalidClassReflectionError extends Error {

    constructor(_invalidClass) {

        super(`${_invalidClass.name} is not defined as class`);
    }
}

class ReflectionClass extends ReflectionFunction {

    #hasConstructor = false;

    get hasDefinedConstructor() {
        
        return this.#hasConstructor;
    }

    constructor(_class) {

        const definition = _class.toString();

        const isClass = definition.match(/^class/);
    
        if (isClass == null) {

            throw new InvalidClassReflectionError(_class);
        }

        super(_class);

        this.#hasConstructor = (this.params.length > 0);
    }
}

module.exports = ReflectionClass;