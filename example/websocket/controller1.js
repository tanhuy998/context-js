const {WS, WSController} = require('../../index.js');
const {args, autoBind, ApplicationContext} = require('../../index.js');
const ResponseError = require('../../src/error/responseError.js');

@autoBind()
class Component {

    prop = '1';
}

//@WS.channel('prefix')
@WS.context()
class Controller1 extends WSController{

    constructor() {

        super();
    }

    // @WS.channel('test')
    // before() {

    //     const label = this.context.state.args;

    //     this.context.state.sender.label = label;

    //     //console.time(label);
    // }

    @WS.channel('test')
    @args(Component)
    async handle(component) {

        console.log('test event')

        return 1;
    }



    // @WS.channel('test') 
    // after() {


    //     const label = this.context.state.sender.label;

    //     //console.log(args[0] || undefined);
    //     //console.timeEnd(label);
    //     //return 'ok2';
    // }
}

module.exports = Controller1;
