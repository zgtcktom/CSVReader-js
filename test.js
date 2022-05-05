import {CSVReader} from './src/index.js';

let csvText = `#comment1
aff\nb"s, b,"b\""""d
"""a
#comment2

"{""type"": ""Point"", ""coordinates"": [102.0, 0.5]}","ha ""ha"" ha",5
 33\n22 ,"asb," ,""
1,,2#as
#comment3
`;

console.log(new CSVReader(csvText).read())