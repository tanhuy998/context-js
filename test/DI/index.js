const ComponentManager = require('../../src/dependenies/component/componentManager.js');
const {CONSTRUCTOR} = require('../../src/dependenies/constants.js');


const Interface = require('reflectype/src/interface/interface.js');
const implement = require('reflectype/src/decorators/implement.js');
const {type, paramsType} = require('reflectype/src/decorators/index.js');
const autowired = require('../../decorators/autowired.js');


class Bike {

    name = 'bike';
}

class Car {

    name = 'car';
}

class Component {

    prop = 'component';
}

class A {

    #secret;

    @autowired
    @type(Bike)
    accessor vehicleA;

    @type(Component)
    accessor drive;

    // @paramsType(Bike)
    // [CONSTRUCTOR](bike) {
        
    //     this.#secret = bike;

    //     this.vehicleA = bike;

    //     console.log('A', this.vehicleA);
    // }

    showSecret() {

        console.log(this.#secret);
    }

    show() {
        // is overrided when the object is instance of class B
        console.log(this.vehicleA);
    }
}

class B extends A {

    @autowired
    @type(Car)
    accessor vehicleA;

    @paramsType(Car)
    [CONSTRUCTOR](car) {
        
        this.vehicleB = car;

        console.log('B', this.vehicleA)
    }
}

const components = new ComponentManager();

components.bind(Bike, Bike);
components.bind(Car, Car);
components.bind(A, A);
components.bind(B, B);
components.bind(Component, Component);

const obj = components.get(B);
const objA = components.get(A);

console.log('A', objA.vehicleA);

console.log(obj.vehicleA);
console.log(obj.vehicleB)
console.log(obj.drive);

obj.showSecret();
obj.show();