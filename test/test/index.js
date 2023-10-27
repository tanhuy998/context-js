const arr = [1, Promise.resolve(2), 3];

async function test() {

    const ret = [];

    for await (const a of arr) {

        ret.push(a);
    }

    console.log(ret);
}

test();