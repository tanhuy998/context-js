module.exports.BaseController = require('./src/controller/baseController.js');

module.exports.WSController = require('./src/websocket/controller/wsController.js');

module.exports.WSRouter = require('./src/websocket/router/wsRouter.js');

module.exports.WSEvent = require('./src/websocket/router/wsEvent.js');

module.exports.ActionResult = {
    ...require('./src/response/utils/view.js'),
    ...require('./src/response/utils/redirect.js'),
    ...require('./src/response/utils/fileResult.js'),
    ...require('./src/response/utils/download.js'),
};