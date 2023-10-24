const Phase = require("./phase");


// A Pipeline's Phase that do multiple process
module.exports = class SubPipeline extends Phase{



    constructor(_context, _pipeline) {

        super(...arguments);

        const globalContext = _context.global;

        this.#init();
    }

    #init() {


    }

    accquire(_payload) {

        this.run(_payload);
    }
}