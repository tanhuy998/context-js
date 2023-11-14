const Context = require("../../src/dependencies/context/context");
const ContextLockable = require("../../src/dependencies/lockable/contextLockable");


class CustomContext extends Context {

    static {

        this.__init();

        this.__lock();
    }
}

class TestClass extends ContextLockable {

    static lockActions = ['func'];

    static {

        this.lockOn(CustomContext);
    }

    func() {

        console.log(1);
    }
}

const obj = new TestClass(new CustomContext());

obj.func();