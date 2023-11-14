const ContextHandler = require("./contextHandler");

function decoratePipeline(_pipelineObj) {

    return class PipableContextHandler extends ContextHandler {

        handle() {

            const context = this.context;

            return _pipelineObj.run(context);
        }
    }
}

module.exports = {decoratePipeline};