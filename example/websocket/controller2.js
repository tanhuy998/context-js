const {WS, WSController} = require('../../index.js');
const {args, autoBind, ApplicationContext} = require('../../index.js');


function testFilter(event) {

    console.log('throught filter');

    console.log(event);

    return true;
}
@WS.context()
//@WS.channel('prefix')
@WS.addFilter(testFilter, testFilter)
class Controler2 extends WSController {

    constructor() {

        super();
    }


    @WS.channel('channel2')
    test() {

        console.log('channel2');

        //this.context.
    }

    @WS.channel('test')
    test2() {

        console.log('controller2');
    }
}

module.exports = Controler2;