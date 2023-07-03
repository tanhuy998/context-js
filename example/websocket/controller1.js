const {WS, WSController} = require('../../index.js');
const {args, autoBind, ApplicationContext} = require('../../index.js');

@autoBind()
class Component {

    prop = '1';
}

@WS.context()
class Controller1 extends WSController{

    constructor() {

        super();
    }


    
    @args(Component)
    @WS.channel('test')
    async handle(component) {

        console.log(component);

        const args = this.context.eventArguments;

        return ['ok'];
    }

    //@WS.channel('test') 
    func() {

        console.log('second handler')

        return 'ok2';
    }
}

module.exports = Controller1;
