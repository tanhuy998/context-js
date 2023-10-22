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

pipeline.run(new TransportContext());
pipeline.run(new TransportContext());
pipeline.run(new TransportContext());