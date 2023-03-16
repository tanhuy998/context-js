//const { BaseController } = require("./baseController");
//const reflecClass = require('../libs/reflectionClass');
const ControllerState = require('./controllerState.js');



class ControllerComponentManager {

    #iocContainer;
    #config;
    #context;
    #state;

    constructor(_iocContainer, _config, _context = undefined) {
        
        if (!_iocContainer) {

            throw new Error('ControllerComponentManager Error: iocContainer is not defined');
        }

        // if (_context && _context instanceof BaseController) {

        //     this.#context = _context;
        // }
        
        this.#config = _config;
        this.#state = new ControllerState(this.#config);
        this.#iocContainer = _iocContainer;
    }

    get(component) {

        const scope = this.#config.getScope();

        if (scope.has(component)) {

            if (!this.#state.isloaded(component)) {

                this.#state.load(component, this.#iocContainer);
            }

            return this.#state.get(component);
        }
        else {
            
            return this.#iocContainer.get(component);
        }
    }
}

module.exports = ControllerComponentManager;