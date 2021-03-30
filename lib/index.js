'use strict';

var util = require('util');
var EventEmitter = require('events');
var _ = require('lodash');
var deepAssign = require('mini-deep-assign');

// Very simplified (one-level of depth) version of _.defaults() for higher performance
//var _defaults = function(o1, o2) {
//var res = {};
//	for (var p1 in o1) {
//		if (typeof o1[p1] === 'object' || typeof o1[p1] === 'function')
//			throw new Error('Invalid options object property: name: "'+p1+'", type: "' + typeof o1[p1] + '"', o1[p1]);
//		res[p1] = o1[p1];
//	}
//	for (var p2 in o2) {
//		if (typeof o2[p2] === 'object' || typeof o2[p2] === 'function')
//			throw new Error('Invalid options object property: name: "'+p1+'", type "' + typeof o2[p2] + '"', o2[p2]);
//		if (typeof res[p2] === 'undefined')
//			res[p2] = o2[p2];
//	}
//
//return res;
//}

var Stringify = function(options) {
  var self = this;
  EventEmitter.call(this);

  options             = options || {};
  options.null        = options.null && 'null';
  options.undefined   = options.undefined && 'undefined';
  options.quote       = typeof options.quote === 'undefined' ? '"' : options.quote;
  options.escapeQuote = typeof options.escapeQuote === 'undefined' ? '\\' : options.escapeQuote;
  options.commaNoLine = typeof options.commaNoLine === 'undefined' ? false : options.commaNoLine;
  options.EOL         = options.EOL || '\n';     // Unix EOL
  //options.EOL        = options.EOL || '\r\n'; // Windows EOL
  //options.startIndex = options.startIndex || 1;
  options.quote       = typeof options.quote  === 'undefined' ? '"' : options.quote;
  options.header      = typeof options.header === 'undefined' ? true : options.header;


  /**
   * convert value to string according to data type
   *
   * @param {*} value
   * @param {Object} opt
   * @returns {string}
   * @private
   */
  self._value = function (value, opt) {
    //var o = opt || {};
    //_defaults(opt, options);
    var o = deepAssign({}, options, opt);
    var res;

    if (value === null) {
      res = o.null;

    } else if (typeof value === 'undefined') {
      res = o.undefined;

    } else if (typeof value === 'string') {

      if (o.escapeQuote) {
        var re = new RegExp('/' + o.quote + '/g');
        value.replace(re, o.escapeQuote + o.quote); // escape double quotes ( " -> \" )
      }
      res = o.quote + value + o.quote;

    } else if (typeof value === 'object') {
      res = JSON.stringify(value);

    } else if (typeof value === 'boolean' || typeof value === 'number') {
      res = ''+value;

    } else {
      self.emit('error', new Error('Invalid data type \''+typeof(value)+'\', value: \''+JSON.stringify(value)+'\''));
    }

    if (res.indexOf( o.comma )>=0) {
      var err = new Error('values in csv format can\'t contain comma characters, value: \''+res+'\'');
      self.emit('error', err);
      if (o.commaNoLine) {
        throw err;
      }
      res = o.null;
    }

    return res;
  };


  /**
   * convert array to string line
   *
   * @param {string[]} array
   * @param opt
   * @returns {string}
   * @private
   */
  self._line = function (array, opt) {
    //o = o || {};
    //_defaults(o, options);
    var o = deepAssign({}, options, opt);

    var string = '';

    for (var len = array.length, i = 0; i < len; ++i) {
      try {
        string += self._value(array[ i ], o);
      } catch(e) {
        return ''; // if exception was thrown, that means, we need to skip line (see commaNoLine option)
      }
      if (i !== len - 1) {
        string += o.comma;
      }
    }

    return string + o.EOL;
  };


  /**
   *
   * @param {string[]} columns
   * @param opt
   * @returns {string}
   */
  self._header = function (columns, opt) {
    //o = o || {};
    //_defaults(o, options);
    var o = deepAssign({}, options, opt);
    var aOrderedNames = [];

    // iterate columns config object
    for (var len = columns.length, i = 0; i < len; ++i) {
      aOrderedNames[ i ] = columns[ i ];
    }

    // convert array to string line
    // override all options
    //var hdrOpt = _defaults({ quote: '', EOL: '\r\n' }, o);
    var hdrOpt = deepAssign({}, o, { quote: '', EOL: '\r\n' });
    return self._line(aOrderedNames, hdrOpt);
  };


  /**
   * Stringify Data Row
   *
   * @param {Object} values
   * @param {string[]} columns
   * @param opt
   * @returns {string}
   */
  self._row = function (values, columns, opt) {
    //o = o || {};
    //_defaults(o, options);
    var o = deepAssign({}, options, opt);
    // prepare data for one row of the list
    var aOrderedValues = [];

    // iterate columns config object
    for (var len = columns.length, i = 0; i < len; ++i) {
      aOrderedValues[ i ] = values[ columns[ i ] ];
    }

    // convert fields array (in text) to string line
    return self._line(aOrderedValues, o);
  };

  /**
   * @param {Object[]} data
   * @param {string[]} columns
   * @param opt
   * @returns {string}
   */
  self.stringify = function (data, columns, opt) {
    //o = o || {};
    //_defaults(o, options);
    var o = deepAssign({}, options, opt);
    var rows = []; // Buffer to store csv-formatted values

    // save header if needed
    if (o.header) {
      rows.push(self._header(columns, o));
    }

    // iterate list data items (rows)
    for (var len = data.length, i = 0; i < len; ++i) {
      var row = data[ i ];

      // append string line to result text variable
      rows.push(self._row(row, columns, o));

    }
    // iterate list data items (rows)
    if (o.hasOwnProperty('extraRows')) {
      _.each(o.extraRows, function(row) {
        rows.splice(row.num, 0, row.value+o.EOL);
      });
    }

    return rows.join('');
  };

};
util.inherits(Stringify, EventEmitter);



var Parse = function(options) {
  var self = this;
  EventEmitter.call(this);

  options            = options || {};
  options.header     = typeof options.header === 'undefined' ? true : options.header;
  options.null       = typeof options.null === 'undefined' ? 'null' : options.null;
  options.undefined  = typeof options.undefined === 'undefined' ? 'undefined' : options.undefined;
  options.quote      = options.quote || '"';
  options.comma      = options.comma || ',';


  self._value = function (value, opt) {
    //o = o || {};
    //_.defaults(o, options);
    var o = deepAssign({}, options, opt);
    var res;
    var reQuoteCheck   = new RegExp('^' + o.quote + '.+'     + o.quote + '$');
    var reQuoteReplace = new RegExp('^' + o.quote + '(.+(?=' + o.quote + '$))' + o.quote + '$');

    if (typeof value === 'string') {

      if (value === o.null) {// null
        res = null;
      } else if (value === o.undefined) {// undefined
        res = undefined;
      } else if (o.quote && reQuoteCheck.test(value)) {// string in double quotes
        res = value.replace(reQuoteReplace, '$1');
      } else {// boolean, number, object - try to parse as JSON
        try {
          res = JSON.parse(value);
        } catch (e) {// if unable to parse, leave as it is
          res = value;
        }
      }

    } else {
      res = undefined;
    }

    return res;
  };


  self._line = function (string, opt) {
    //o = o || {};
    //_.defaults(o, options);
    var o = deepAssign({}, options, opt);
    var arr      = [];
    var i0       = 0;
    var inQuotes = false;
    var value;

    if (!string || string.length === 0) {
      return null;
    }

    for (var len = string.length, i = 0; i < len; ++i) {
      var c = string.charAt(i);

      if (c === o.quote) {
        inQuotes = !inQuotes;

      } else if (c === o.comma && !inQuotes) {
        value = string.slice(i0, i);
        arr.push(value);
        i0 = i + 1;
      }

    }
    // cut last part of string up to the end of line
    value = string.slice(i0, string.length);
    arr.push(value);

    var res = arr.map(function (item) {
      return self._value(item);
    });

    self.emit('line', res);
    return res;
  };


  self._header = function (string, opt) {
    //		var o = deepAssign({}, options, opt);
    var headers = self._line(string);
    self.emit('header', headers);
    return headers;
  };


  /**
   *
   * @param string
   * @param {string[]} [headers]      - array of column names
   * @param {object} [opt]            - options object
   *
   * @returns {Object || string[]}
   * @private
   */
  self._row = function (string, headers, opt) {
    //		var o = deepAssign({}, options, opt);
    var res, len, i;

    var values = self._line(string);
    if (!values) {
      return null;
    }

    if (headers) { // if `headers` is set, then return object (instead of array)
      res = {};
      for (len = headers.length, i = 0; i < len; ++i) {
        res[ headers[ i ] ] = values[ i ];
      }

    } else { // if `headers` is not set, then return array (not object) as column names are not known
      res = [];
      for (len = values.length, i = 0; i < len; ++i) {
        res[ i ] = values[ i ];
      }
    }
    self.emit('row', res, headers);
    return res;
  };


  /**
   * Helper to split text into array of lines by end-of-lines (Unix \n or Windows \r\n)
   *
   * @param {string} text
   * @returns {string[]}
   */
  self._splitLines = function(text) {
    return (typeof text==='string' && text.length>0) ? text.split(/\r?\n/g) : [];
    //return text.split(/\r?\n/);
  };


  self.parse = function (text, columns, opt) {
    opt = opt || {};
    //opt = opt || {};
    //_.defaults(opt, options);
    var o = deepAssign({}, options, opt);


    function isExtraRow() {
      // Exclude extra rows
      if (o.hasOwnProperty('extraRows')) {
        for( var len=o.extraRows.length, i=len-1; i>=0; --i) {
          var extraRow = o.extraRows[i];
          if (extraRow.num === linesIdx) {
            // ignore this row
            return true;
          }
        }
      }
      return false;
    }

    var lines = self._splitLines(text);

    // iterate list data items (rows)

    var rows = [];
    var headerIsSet = false;

    var header = null;
    for (var linesLen=lines.length, linesIdx=0; linesIdx<linesLen; ++linesIdx) {
      var line = lines[linesIdx];
      var row;

      if (isExtraRow()) { continue; }
      // Is it header?
      if (rows.length === 0 && o.header && !headerIsSet) {
        header = self._header(lines[ 0 ], o);
        // console.log(linesIdx+' 2 header: '+header);
        headerIsSet = true;
        // lines.splice(0, 1);
        continue;
      }

      if (columns && columns.length > 0) {      // parse this as regular line with column definitions
        row = self._row(line, columns);         // returns array

      } else if (header && header.length > 0) { // parse this as header
        row = self._row(line, header);          // returns array

      } else {                                  // parse this as regular line with column definitions
        row = self._row(line, null);            // returns array
      }

      if (row) {                                // if row is not empty
        rows.push(row);                         // store it to array of parsed rows
      }

    };

    return rows;
  };

};
util.inherits(Parse, EventEmitter);


module.exports = {
  //_defaults: _defaults,
  stringify: function(options) { return new Stringify(options); },
  parse:     function(options) { return new Parse(options); },
};
