const {WS, WSController} = require('../../index.js');
const {args, autoBind, ApplicationContext} = require('../../index.js');
const ResponseError = require('../../src/error/responseError.js');

@autoBind()
class Component {

    prop = '1';
}

@WS.context()
class Controller1 extends WSController{

    constructor() {

        super();
    }


    @WS.channel('test')
    @args(Component)
    async handle(component) {

        console.log(component);

        const args = this.context.eventArguments;

        //this.context.next(new Error('test throwing error'))

        //throw new Error('throw error')

        throw new ResponseError(1)

        console.log('inside controller')

        //return new Error('response error back');

        return new ResponseError(1);
    }

    //@WS.channel('test') 
    func() {

        console.log('second handler')

        return 'ok2';
    }
}

module.exports = Controller1;
