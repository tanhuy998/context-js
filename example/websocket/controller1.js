const {WS, WSController} = require('../../index.js');

@WSController()
class Controller1 extends WSController{

    constructor() {

        super();
    }


    @WS.channel('message')
    handle() {

        const args = this.

        console.log('')
    }
}

module.exports = Controller1;
