import CSVReader from './CSVreader.js';

export {CSVReader};

// let target;
// async function oninput(event) {
    // let file = target.files[0];
    // console.log(file);
	
    // let chunked, full;
    // let result;

    // let dialect = { skipInitialSpace: true, doubleQuote: true };

    // console.time();

    // let csvreader = new CSVReader(new ReadableStream({
        // start(controller) {
            // let reader = new FileReader();
            // reader.addEventListener('load', () => {
                // let result = reader.result;
                // let step;
                // for (let i = 0; i < result.length; i += step) {
                    // step = Math.trunc(Math.random() * (1000 - 1) + 1);
                    // controller.enqueue(result.slice(i, i + step));
                // }
                // controller.close();
            // });
            // reader.readAsText(file);
        // }
    // }), dialect);
	
    // console.log(csvreader);
    // result = await csvreader.read();
    // chunked = result;
    // console.timeEnd();
    // console.log(result);


    // console.time();
    // result = await new Promise((resolve) => {
        // let reader = new FileReader();
        // reader.addEventListener('load', () => {
            // let csvreader = new CSVReader(reader.result, dialect);
            // resolve(csvreader.read());
        // });
        // reader.readAsText(file);
    // });
    // full = result;
    // console.timeEnd();
    // console.log(result);

    // console.log(chunked != full, JSON.stringify(chunked) == JSON.stringify(full), { chunked: JSON.stringify(chunked), full: JSON.stringify(full) });

    // console.time();
	
    // csvreader = new CSVReader(new ReadableStream({
        // start(controller) {
            // let reader = new FileReader();
            // reader.addEventListener('load', () => {
                // let result = reader.result;
                // let step;
                // for (let i = 0; i < result.length; i += step) {
                    // step = Math.trunc(Math.random() * (1000 - 1) + 1);
                    // controller.enqueue(result.slice(i, i + step));
                // }
                // controller.close();
            // });
            // reader.readAsText(file);
        // }
    // }), { worker: true, ...dialect });
    // console.log(csvreader);
    // result = await csvreader.read();
    // chunked = result;
    // console.timeEnd();
    // console.log(result);

    // console.time();
    // result = await new Promise((resolve) => {
        // let reader = new FileReader();
        // reader.addEventListener('load', () => {
            // let csvreader = new CSVReader(reader.result, { worker: true, ...dialect });
            // resolve(csvreader.read());
        // });
        // reader.readAsText(file);
    // });
    // full = result;
    // console.timeEnd();
    // console.log(result);

    // console.log(chunked != full, JSON.stringify(chunked) == JSON.stringify(full), { chunked: JSON.stringify(chunked), full: JSON.stringify(full) });

    // let string = CSVReader.stringify(chunked, { ...dialect });
	
    // console.log({ string });
    // console.log(JSON.stringify(new CSVReader(string, { ...dialect }).read()) == JSON.stringify(chunked));
// }

// window.addEventListener('load', function() {
    // document.body.innerHTML += `
// <input type="file"><button>read</button>
	// `;
    // target = document.querySelector('input');
    // target.oninput = oninput;
    // document.querySelector('button').onclick = oninput;
// });