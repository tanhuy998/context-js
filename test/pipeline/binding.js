const Context = require('../../src/dependenies/context/context.js');


class A {

    static prop = 1;

    static {

        console.log(1)
    }
}


class CustomContext {


    static {

        console.log(2);
        console.log(this.prop);
    }
}


module.exports = CustomContext;