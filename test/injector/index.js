const ObjectInjectorEngine = require('../../src/dependenies/injector/objectInjectorEngine');
const {CONSTRUCTOR} = require('../../src/dependenies/constants.js');

const ComponentManager = require('../../src/dependenies/component/componentManager');

const Interface = require('reflectype/src/interface/interface.js');
const {implement} = require('reflectype/src/interface/interface');
const {type, paramsType} = require('reflectype/src/index.js')


class Bike {

    name = 'bike';
}

class Car {

    name = 'car';
}



class A {

    #secret;
    vehicleA;

    @paramsType(Bike)
    [CONSTRUCTOR](bike) {
        
        this.#secret = bike;

        this.vehicleA = bike;

        console.log('A', this.vehicleA);
    }

    showSecret() {

        console.log(this.#secret);
    }
}

class B extends A {

    @type(Car)
    vehicleB;

    // @paramsType(Car)
    // [CONSTRUCTOR](car) {
        
    //     this.vehicleB = car;

    //     console.log('B', this.vehicleB)
    // }
}


const components = new ComponentManager();
components.bind(Bike, Bike);
components.bind(Car, Car);
components.bind(A, A);
components.bind(B, B);

const injector = new ObjectInjectorEngine(components.container);

const obj = new B();

injector.inject(obj);

console.log(obj);

obj.showSecret()

