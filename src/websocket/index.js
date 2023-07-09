const WS = require('./ws.js');
const WSRouter = require('./router/wsRouter.js');
const WSController = require('./controller/wsController.js');

module.exports = {
    WS: WS,
    WSController,
    Router: WSRouter
}