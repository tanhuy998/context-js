require('@babel/register')({
    only: [
        './controller1.js',
        './controller2.js'
    ]
});

const http = require('http');
const {Server} = require('socket.io');
//const Router = require('./router.js');
//const { Socket } = require('socket.io-client');

const httpServer = http.createServer();
const io = new Server(httpServer);

const v8 = require('v8');

const {WS, ApplicationContext, Router} = require('../../index.js');

ApplicationContext.useIoc();

const Controller1 = require('./controller1.js');
const Controller2 = require('./controller2.js');
const { count } = require('console');

const router = new Router();
router.maxSyncTask(2)

let counter = 0;

function everyOneSecond() {

    let start = Date.now();

    setTimeout(function cb() {

        const end = Date.now();

        const totalTime = end - start;

        //start = end

        const heapStatistic = v8.getHeapStatistics();

        const requestCount = counter;

        const heap = heapStatistic;

        console.log('-------------------total time', totalTime, 'messages counted', requestCount);

        console.log('statistic', heap);

        counter = 0;

        everyOneSecond();
    }, 1000)
}

router.channel('test', (_event, response, next) => {

    const label = _event.args;

    ++counter;

    //_event.sender.label = label;

    //console.time(label);
    response({test: 'error'});
    next();
})

const routerA = new Router();

const routerB = new Router();

routerB.use((e, res, next) => {

    console.log('B default middleware');

    next();
})

routerB.channel('B', (e, res, next) => {

    console.log('B');

    next();
})

routerB.channel('B1', (e, res, next) => {

    console.log('B1');

    next();
})

routerA.channel('A', (e, res, next) => {

    console.log('A');

    next();
}, routerB);

routerA.channel('A', (e, res, next) => {

    console.log('A 1');
    next();
}, (e, _e, res, next) => {

    console.log(e);
})

router.channel('testmain', (_event, response, next) => {

    const label = _event.args;

    ++counter;

    //_event.sender.label = label;

    //console.time(label);
    response({test: 'error'});
    next(new Error('test error handler'));
}, routerA);
// async (_event, response, next) => {

//     next()
// }, (_e, res, next) => {


//     //console.log(_e.sender.id);

//     res(1);

//     console.timeEnd(_e.label);

//     next()
// })

io.use(router);

WS.server(io);

WS.resolve();



io.on('connection', (socket) => {

    //console.log('new');

    //console.log(socket.data);

    socket.on('ms', () => {

        //console.log('ms event')
    });
})


// io.engine.use((req, res, next) => {
    
//     //console.log('hhtp middleware');

//     next();
// })

// io.engine.on('headers', (headers, req) => {

//     //console.log('headers', headers)
// })

io.use((socket, next) => {

    socket.data = {status: 'passed'};
    console.log('top1', socket.handshake)


    socket.use((event, next) => {

        console.log(event);
    })
    // socket.conn.on("upgrade", () => {
    //     // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
    //     //console.log("upgraded transport", socket.conn.transport.name); // prints "websocket"
    // });

    // socket.conn.on("packet", ({ type, data }) => {
    //     // called for each packet received

    //     //console.log('package', type);
    // });

    // socket.conn.on("packetCreate", ({ type, data }) => {
    //     // called for each packet sent

    //     //console.log('package create', type);
    // });

    // socket.conn.on("drain", () => {
    //     // called when the write buffer is drained

    //     //console.log('drain');
    // });

    // socket.conn.on("close", (reason) => {
    //     // called when the underlying connection is closed

    //     //console.log('close');
    // });

    next();
})




io.on('connection', (socket) => {

    socket.on('error', (error) => {

        //console.log(error);
    })
})

// const router = new Router;

// router.channel('ms', function(_socket, args, next) {

//     //console.log('ms event', args);

//     if (Date.now() % 2 == 0) {

//         next('error');
//     }

//     next();
// })

// router.channel('ms', function(_socket, args, next) {

//     //console.log('second ms event', args);

//     //console.log(args[args.length -1].toString());

//     next();
// })

// router.channel('test', function(socket, args, next) {

//     //console.log('test middleware');

//     next();
// })

// router.channel('test', function(socket, args, next) {

//     //console.log('another test event');

//     next();
// })


// // io.use((socket, next) => {

// //     router.manage(socket);

// //     next();
// // });

// io.use(router);


httpServer.listen(3000, () => {

    //everyOneSecond();
    //console.log('app listion on port 3000')
});

