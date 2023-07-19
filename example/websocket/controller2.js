const {WS, WSController} = require('../../index.js');
const {args, autoBind, ApplicationContext} = require('../../index.js');

@WS.context()
@WS.channel('prefix')
class Controler2 extends WSController {

    constructor() {

        super();
    }


    @WS.channel('channel2')
    test() {

        console.log('channel2');
    }
}

module.exports = Controler2;