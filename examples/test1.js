'use strict';

const fs = require('fs');
const csv = require('../');

const parseOptions = {
  header: true, // [ 'boolean', 'number', 'string' ],
  null: 'null',
  undefined: 'undefined',
  quote: '"',
  //escapeQuote: '\\',
  //commaNoLine: false, // ignore full line if any of the values contains comma
  //EOL: '\n',
  extraRows: [ // row indexes to ignore
    //{ num: 1 }
  ],
};
const parse = csv.parse(parseOptions);

const in1 = fs.readFileSync('./in1.csv', 'utf8');
console.log('in1:\n', in1);

parse.on('error',  (error) => console.log(`* error`,   error));
parse.on('line',    (line)    => console.log(`* line`,    line));
parse.on('header', (header) => console.log(`* header`, header));
parse.on('row',    (row, header)    => console.log(`* row`,    row, header));

const out1 = parse.parse(in1);
console.log('out1:\n', out1 );


const stringifyOptions = {
  header: true, // [ 'boolean', 'number', 'string' ],
  null: 'null',
  undefined: 'undefined',
  quote: '"',
  escapeQuote: '\\',
  commaNoLine: false, // ignore full line if any of the values contains comma
  EOL: '\n',
  extraRows: [ // row indexes to add
    //{ num: 1, value: '; this is extra row at line with index 1' }
  ],
};
const columns = [ 'boolean-column', 'number-column', 'string-column' ];

const stringify = csv.stringify(stringifyOptions);

const out2 = stringify.stringify(out1, columns);
console.log('\nout2:', out2);

