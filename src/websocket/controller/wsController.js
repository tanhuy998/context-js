const {BaseController} = require('../../controller/baseController.js');
const ClientContext = require('../clientContext.js')


class WSController extends BaseController {

    #handshake;
    #socket;
    #rooms;

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

    get rooms() {

        return this.#rooms;
    }


    constructor() {

        super(...arguments);
    }

    setSocket(_socket) {

        this.#socket = _socket; 

        const handshake = _socket.handshake;

        this.#rooms = _socket.rooms;
        
        this.#socketId = _socket.id;

        this.setContext(handshake);
    }

    setHandShake(_httpContext) {

        this.#handshake = _httpContext;
    }

    setContext(_context) {

        if (_context instanceof ClientContext) {

            this.#context = _context;

            this.#initAttribute();   
        }
    }

    #initAttribute() {

        this.#socket = this.#context.state.sender;

        this.#socketId = this.#socket.id;

        this.#rooms = this.#socket.rooms;

        this.#handshake = this.#socket.handshake;
    }

    async emit(_event, ...payload) {

        return this.#socket.emitWithAck(_event, ...payload);
    }

    to(_room) {

        return this.#socket.to(_room);
    }
}

module.exports = WSController;