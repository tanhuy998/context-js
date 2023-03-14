const ReflectionClass = require('./reflectionClass.js');


function reflectClass(_class) {

    return new ReflectionClass(_class);
}


module.exports = reflectClass;