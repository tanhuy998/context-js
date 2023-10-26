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


function random(min, max) {
    return Math.random() * (max - min) + min;
  }

for (let i = 0; i < 10; ++i) {



    setTimeout(() => {

        pipeline.run(new TransportContext());
    }, random(0, 20000));
}


pipeline.run(new TransportContext());
// pipeline.run(new TransportContext());
