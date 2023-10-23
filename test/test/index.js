class A {

    static prop = 1;

    static init() {

        this.prop = 4;
    }

    name = 'a';

    constructor() {

        this.constructor.prop = 2;
    }
}