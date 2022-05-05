export const divmod = (x, y) => [Math.trunc(x / y), x % y];

export const outOfRange = (n, min, max) => isNaN(n) || n < min || n > max;

export const assert = (name, actual, expected = true, equals = (x, y) => x == y) => {
    let result = equals(actual, expected);
    (result ? console.log : console.error)('assert', name, ':', result, '\n\tactual', actual, '\n\texpected', expected);
};

export function createWorker(src) {
    if (typeof src == 'function') {
        // must be thread-safe
        let code = src.toString();
        let blob = new Blob(['(' + code + ')();'], { type: 'application/javascript' });
        let worker = new Worker(URL.createObjectURL(blob));
        return worker;
    } else {
        let worker = new Worker(src);
        return worker;
    }
}

export async function* streamIterator(stream) {
    let reader = stream.getReader();
    for (;;) {
        let { done, value } = await reader.read();
        if (done) break;
        yield value;
    }
};

export { default as runOnWorker } from './runOnWorker.js';