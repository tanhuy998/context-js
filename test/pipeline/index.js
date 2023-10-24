require('@babel/register')({
    only: [
        /components/,
        /handler/
    ]
})

const A = require('./handler/A.js');
const B = require('./handler/B.js');

const TransportContext = require('./binding.js');


const pipeline = TransportContext.pipeline;

console.time('test');

for (let i = 0; i < 1000; ++i) {

    pipeline.run(new TransportContext());
}


pipeline.run(new TransportContext());
pipeline.run(new TransportContext());
console.timeEnd('test');