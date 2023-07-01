const {BaseController} = require('../../controller/baseController.js');
const ClientContext = require('../clientContext.js')


class WSController extends BaseController {

    #handshake;
    #socket;
    #rooms;
    #data;
    #socketId;

    #server;

    #context;

    get context() {

        return this.#context;
    }

    get handshake() {

        return this.#handshake;
    }

    get server() {

        if (!this.#server) {

            //this.#server = 
        }
    }

    constructor() {

        super(...arguments);
    }

    setSocket(_socket) {

        this.#socket = _socket; 

        const handshake = _socket.handshake;

        this.#rooms = _socket.rooms;
        this.#data = _socket.data;
        this.#socketId = _socket.id;

        this.setContext(handshake);
    }

    setHandShake(_httpContext) {

        this.#handshake = _httpContext;
    }

    setContext(_context) {

        if (_context instanceof ClientContext) {

            this.#context = _context;
        }
    }

    emit(_event, ...payload) {

        return this.#socket.emit(_event, ...payload);
    }
}

module.exports = WSController;