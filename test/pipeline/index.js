require('@babel/register')({
    only: [
        /components/,
        /handler/
    ]
})

console.time('init time');

const TransportContext = require('./binding.js');
console.timeEnd('init time');

const pipeline = TransportContext.pipeline;



// for (let i = 0; i < 1000; ++i) {

//     pipeline.run(new TransportContext());
// }


pipeline.run(new TransportContext());
// pipeline.run(new TransportContext());
