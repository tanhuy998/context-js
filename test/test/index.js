class A {

    func() {
        console.log(this);
        console.log(1);
    }

    #private() {

        this.func();
    }

    public() {

        this.#private();
    }
}

class B extends A {

    func() {
        console.log(this);
        console.log(2);
    }

    public() {

        super.public();
    }
}

const obj = new B();

obj.public();