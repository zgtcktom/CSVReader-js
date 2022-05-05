# CSVReader-js
CSV reader for browser with readable stream and csv dialect support, sync and async

## Installation
```
npm i csvreader-js
```
For browser, download index.js and rename it to e.g.: csvreader.js.

## Usage
### CommonJS
```
const {CSVReader} = require('csvreader-js');
```

### ES6 module (adding `type: "module"` to package.json)
```
import {CSVReader} from 'csvreader-js';
```

### Browser
```
<script src="./index.cjs"></script>
```

or check index.html for simple usage

## Syntax
```
new CSVReader(input, options).read()
```
## Parameters

### input : string
.read() returns an array `[[col_0, col_1, ...], [...], ...]`

### input : ReadableStream
.read() returns a promise resolving an array

### options : object
https://specs.frictionlessdata.io//csv-dialect/
```
{
	worker = false,

	// csv dialect support
	delimiter = ',',
	lineTerminator = LF,
	doubleQuote = true,
	quoteChar = '"',
	skipInitialSpace = false,
	commentChar = '#'
}
```

## Examples

Has no assumption on whethter chunks end with newline.

Even works if chunks are all 1 character long.

### ReadableStream

```
let dialect = { skipInitialSpace: true, doubleQuote: true };

let csvreader = new CSVReader(new ReadableStream({
	start(controller) {
		let reader = new FileReader();
		reader.addEventListener('load', () => {
			let result = reader.result;
			let step;
			for (let i = 0; i < result.length; i += step) {
				step = Math.trunc(Math.random() * (1000 - 1) + 1);
				controller.enqueue(result.slice(i, i + step));
			}
			controller.close();
		});
		reader.readAsText(file);
	}
}), dialect);

csvreader.read();
```

### string

```
await new Promise((resolve) => {
	let reader = new FileReader();
	reader.addEventListener('load', () => {
		let csvreader = new CSVReader(reader.result, dialect);
		resolve(csvreader.read());
	});
	reader.readAsText(file);
});
```

### worker support
```
new CSVReader(readableStream, {worker: true, ...dialect}).read();
```