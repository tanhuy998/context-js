require('@babel/register')({
    only: [
        './controller1.js'
    ]
});

const http = require('http');
const {Server} = require('socket.io');
//const Router = require('./router.js');
//const { Socket } = require('socket.io-client');

const httpServer = http.createServer();
const io = new Server(httpServer);

const {WS} = require('../../index.js');

WS.server(io);

WS.resolve();

const Controller1 = require('./controller1.js');

io.on('connection', (socket) => {

    console.log('new');

    console.log(socket.data);

    socket.on('ms', () => {

        console.log('ms event')
    });
})


io.engine.use((req, res, next) => {
    
    console.log('hhtp middleware');

    next();
})

// io.engine.on('headers', (headers, req) => {

//     console.log('headers', headers)
// })

io.use((socket, next) => {

    socket.data = {status: 'passed'};
    console.log('top1', socket.handshake)

    // socket.conn.on("upgrade", () => {
    //     // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
    //     console.log("upgraded transport", socket.conn.transport.name); // prints "websocket"
    // });

    // socket.conn.on("packet", ({ type, data }) => {
    //     // called for each packet received

    //     console.log('package', type);
    // });

    // socket.conn.on("packetCreate", ({ type, data }) => {
    //     // called for each packet sent

    //     console.log('package create', type);
    // });

    // socket.conn.on("drain", () => {
    //     // called when the write buffer is drained

    //     console.log('drain');
    // });

    // socket.conn.on("close", (reason) => {
    //     // called when the underlying connection is closed

    //     console.log('close');
    // });

    next();
})

io.on('connection', (socket) => {

    socket.on('error', (error) => {

        console.log(error);
    })
})

// const router = new Router;

// router.channel('ms', function(_socket, args, next) {

//     console.log('ms event', args);

//     if (Date.now() % 2 == 0) {

//         next('error');
//     }

//     next();
// })

// router.channel('ms', function(_socket, args, next) {

//     console.log('second ms event', args);

//     console.log(args[args.length -1].toString());

//     next();
// })

// router.channel('test', function(socket, args, next) {

//     console.log('test middleware');

//     next();
// })

// router.channel('test', function(socket, args, next) {

//     console.log('another test event');

//     next();
// })


// // io.use((socket, next) => {

// //     router.manage(socket);

// //     next();
// // });

// io.use(router);


httpServer.listen(3000, () => {

    console.log('app listion on port 3000')
});

