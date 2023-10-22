const Pipeline = require("./pipeline");


// A Pipeline's Phase that do multiple process
module.exports = class SubPipeline extends Pipeline{

    constructor(_globalContext) {

        super(...arguments);

        this.#init();
    }

    #init() {


    }

    accquire(_payload) {

        this.run(_payload);
    }
}