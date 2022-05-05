import { streamIterator, runOnWorker } from './common.js';
// import runOnWorker from './runOnWorker.js';

export default (function scope(options, messages) {

    const LF = '\n';
    const CRLF = '\r\n';

    const QUOTED = 0;
    const ESCAPED = 1;
    const VALUE = 2;
    const COMMENT = 3;

    let isWorker = typeof WorkerGlobalScope != 'undefined' && this instanceof WorkerGlobalScope;

    if (isWorker) {
        return run();
    }

    async function run() {
        let lastState, table, row, field;
        let count = 0;

        for await (let chunk of messages) {
            [lastState, table, row, field] = parseChunk(chunk, options, lastState, table, row, field);
            count++;
        }

        if (field.length) row.push(field);
        if (row.length) table.push(row);

        console.log('postMessage count:', count);
        return table;
    }

    function readSync(text, options) {
        if (options.worker) {
            console.log('readSync: use worker');

            return runOnWorker(scope, [options], [text]);
        }

        let [lastState, table, row, field] = parseChunk(text, options);

        if (field.length) row.push(field);
        if (row.length) table.push(row);

        return table;
    }

    async function readAsync(stream, options) {
        if (options.worker) {
            console.log('readAsync: use worker');

            return runOnWorker(scope, [options], streamIterator(stream));
        }

        let lastState, table, row, field;

        let count = 0;

        for await (let chunk of streamIterator(stream)) {
            count++;
            [lastState, table, row, field] = parseChunk(chunk, options, lastState, table, row, field);
        }

        if (field.length) row.push(field);
        if (row.length) table.push(row);

        console.log('loaded', count, 'chunks');
        return table;
    }

    function parseChunk(chunk, options, lastState = null, table = [], row = [], field = '') {
        // console.log('chunk', chunk.length, chunk, lastState, field);

        let { delimiter, lineTerminator, doubleQuote, quoteChar, skipInitialSpace, commentChar } = options;

        let position = 0;

        // indices for delimiter and lineTerminator
        // once -1, stop looking for the next
        let i = -2;
        let j = -2;

        let escapedQuote = doubleQuote ? quoteChar : quoteChar + quoteChar;

        if (lastState == COMMENT) {
            if (j != -1 && j < position)
                j = chunk.indexOf(lineTerminator, position);
            if (j == -1) return [COMMENT, table, row, ''];
            position = j + lineTerminator.length;
            lastState = null;
        }

        if (lastState == ESCAPED) {
            if (chunk[position] == quoteChar) {
                field += escapedQuote
                position = position + 1;
                lastState = QUOTED;
            } else {
                lastState = VALUE;
            }
        }

        if (lastState == QUOTED) {
            for (;;) {
                let i = chunk.indexOf(quoteChar, position);
                if (i == -1) return [QUOTED, table, row, field + chunk.slice(position)];
                field += chunk.slice(position, i);
                position = i + 1;
                if (position >= chunk.length) return [ESCAPED, table, row, field];
                if (chunk[position] != quoteChar) break;
                field += escapedQuote;
                position = position + 1;
            }
            lastState = VALUE;
        }

        if (lastState == VALUE) {

            i = chunk.indexOf(delimiter, position);
            j = chunk.indexOf(lineTerminator, position);

            if (i == -1 && j == -1) return [VALUE, table, row, field + chunk.slice(position)];

            if (j == -1 || i != -1 && i < j) {
                field += chunk.slice(position, i);
                position = i + delimiter.length;

                row.push(field);
                field = '';
            } else {
                field += chunk.slice(position, j);
                position = j + lineTerminator.length;

                row.push(field);
                field = '';
                table.push(row);
                row = [];
            }
        }

        // lastState either VALUE or null

        for (; position < chunk.length;) {

            if (skipInitialSpace) {
                for (; chunk[position] == ' '; position++);
            }

            let chr = chunk[position];

            if (commentChar && chr == commentChar) {
                if (j != -1 && j < position)
                    j = chunk.indexOf(lineTerminator, position);
                if (j == -1) return [COMMENT, table, row, ''];
                position = j + lineTerminator.length;
                chr = chunk[position];
            }

            if (chr == quoteChar) {
                position = position + 1;
                for (;;) {
                    let i = chunk.indexOf(quoteChar, position);
                    if (i == -1) return [QUOTED, table, row, field + chunk.slice(position)];
                    field += chunk.slice(position, i);
                    position = i + 1;

                    if (position >= chunk.length) return [ESCAPED, table, row, field];
                    if (chunk[position] != quoteChar) break;
                    field += escapedQuote;
                    position = position + 1;
                }
            }

            if (i != -1 && i < position)
                i = chunk.indexOf(delimiter, position);

            if (j != -1 && j < position)
                j = chunk.indexOf(lineTerminator, position);

            if (i == -1 && j == -1) return [VALUE, table, row, field + chunk.slice(position)];

            if (j == -1 || i != -1 && i < j) {
                field += chunk.slice(position, i);
                position = i + delimiter.length;

                row.push(field);
                field = '';
            } else {
                field += chunk.slice(position, j);
                position = j + lineTerminator.length;

                row.push(field);
                field = '';
                table.push(row);
                row = [];
            }
        }
        return [null, table, row, field];
    }

    function stringify(data, {
        delimiter = ',',
        lineTerminator = LF,
        doubleQuote = true,
        quoteChar = '"'
    } = {}) {

        return data.map((row) => {
            return row.map((field) => {
                field = field.toString();
                if (field.includes(quoteChar) || field.includes(delimiter) || field.includes(lineTerminator)) {
                    field = '"' + (doubleQuote ? field.replaceAll(quoteChar, quoteChar + quoteChar) : field) + '"';
                }
                return field;
            }).join(delimiter);
        }).join(lineTerminator) + lineTerminator;
    }


    class CSVReader {
        static stringify = stringify;

        constructor(input, {
            worker = false,

            // csv dialect support
            delimiter = ',',
            lineTerminator = LF,
            doubleQuote = true,
            quoteChar = '"',
            skipInitialSpace = false,
            commentChar = '#'
        } = {}) {

            // https://specs.frictionlessdata.io//csv-dialect/
            if (quoteChar.length != 1)
                throw new Error('quoteChar must be one-character');

            if (commentChar.length != 1)
                throw new Error('commentChar must be one-character');

            let options = { worker, delimiter, lineTerminator, doubleQuote, quoteChar, skipInitialSpace, commentChar };

            if (typeof input == 'string') {
                this.read = readSync.bind(this, input, options);
            } else if (input instanceof ReadableStream) {
                // text readable stream
                // works on variable length chunks
                // has no assumption on whethter chunks end with newline
                this.read = readAsync.bind(this, input, options);
            } else {
                throw new Error('unexpected input type');
            }
        }
    }

    return CSVReader;
})();