[![npm version](https://badge.fury.io/js/mini-csv.svg)](http://badge.fury.io/js/mini-csv)
[![Build Status](https://travis-ci.org/alykoshin/mini-csv.svg)](https://travis-ci.org/alykoshin/mini-csv)
[![Coverage Status](https://coveralls.io/repos/alykoshin/mini-csv/badge.svg?branch=master&service=github)](https://coveralls.io/github/alykoshin/mini-csv?branch=master)
[![Code Climate](https://codeclimate.com/github/alykoshin/mini-csv/badges/gpa.svg)](https://codeclimate.com/github/alykoshin/mini-csv)
[![Inch CI](https://inch-ci.org/github/alykoshin/mini-csv.svg?branch=master)](https://inch-ci.org/github/alykoshin/mini-csv)

[![Dependency Status](https://david-dm.org/alykoshin/mini-csv/status.svg)](https://david-dm.org/alykoshin/mini-csv#info=dependencies)
[![devDependency Status](https://david-dm.org/alykoshin/mini-csv/dev-status.svg)](https://david-dm.org/alykoshin/mini-csv#info=devDependencies)


# mini-csv

Parse/stringify data in CSV format


If you have different needs regarding the functionality, please add a [feature request](https://github.com/alykoshin/mini-csv/issues).


## Installation

```sh
npm install --save mini-csv
```

## Usage

File `in1.csv`:

```csv
boolean-column,number-column,string-column
false,0,string0
false,1,"string1"
true,2,"string2"
,,
null,null,null
undefined,undefined,undefined
```

File `examples/test1.txt`:

```js
'use strict';

const fs = require('fs');
const csv = require('../');

const options = {
  header: true, // [ 'boolean', 'number', 'string' ],
  null: 'null',
  undefined: 'undefined',
  quote: '"',
  //escapeQuote: '\\',
  //commaNoLine: false, // ignore full line if any of the values contains comma
  //EOL: '\n',
  extraRows: [], // row indexes to ignore
};
const parse = csv.parse(options);

const in1 = fs.readFileSync('./in1.csv', 'utf8');
console.log('in1:\n', in1);

parse.on('error',  (error) => console.log(`* error`,   error));
parse.on('line',    (line)    => console.log(`* line`,    line));
parse.on('header', (header) => console.log(`* header`, header));
parse.on('row',    (row, header)    => console.log(`* row`,    row, header));
console.log('out1:\n', parse.parse(in1) );
```

```js
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
```



## Credits
[Alexander](https://github.com/alykoshin/)


# Links to package pages:

[github.com](https://github.com/alykoshin/mini-csv) &nbsp; [npmjs.com](https://www.npmjs.com/package/mini-csv) &nbsp; [travis-ci.org](https://travis-ci.org/alykoshin/mini-csv) &nbsp; [coveralls.io](https://coveralls.io/github/alykoshin/mini-csv) &nbsp; [inch-ci.org](https://inch-ci.org/github/alykoshin/mini-csv)


## License

MIT
