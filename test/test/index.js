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

const proxy = new Proxy(A, {

    set() {

        return false;
    }
})


const a = new proxy();


class B extends proxy {

    static prop = 5

    static {

        this.init()
    }
}


proxy.prop = 3;

console.log(B.prop);
