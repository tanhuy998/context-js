const arr = [1, Promise.resolve(2), 3];

const old = arr[Symbol.iterator]; 

arr[Symbol.iterator] = async function*() {
    console.log(1, this)
    for await (const element of old.call(this)) {
        console.log(2)
        yield element;
    }
    
}

const newArr = [...arr];

// async function test(arr) {

//     for await(const a of old.call(arr)) {

//         console.log(a);
//     }
// }

// test(arr)