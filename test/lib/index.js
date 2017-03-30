'use strict';

/* globals describe, before, beforeEach, after, it */

var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var sinon = require('sinon');


describe('# csv', function() {

  //describe('# _defaults', function() {
  //	var _defaults = require('../../lib/csv')._defaults;
  //
  //	it('# expect( _defaults({}, {}) ).equals({})', function() {
  //		expect( _defaults({}, {}) ).eql({});
  //	});
  //
  //	it('# expect( _defaults({ prop: \'value\' }, {}) ).equals({ prop: \'value\' })', function() {
  //		expect( _defaults({ prop: 'value' }, {}) ).eql({ prop: 'value' });
  //	});
  //
  //	it('# expect( _defaults({}, { prop: \'default_value\' }) ).equals({ prop: \'default_value\' })', function() {
  //		expect( _defaults({}, { prop: 'default_value' }) ).eql({ prop: 'default_value' });
  //	});
  //
  //	it('# expect( _defaults({ prop: \'value\' }, { prop: \'default_value\' }) ).equals({ prop: \'value\' })', function() {
  //		expect( _defaults({ prop: 'value' }, { prop: 'default_value' }) ).eql({ prop: 'value' });
  //	});
  //
  //});

  describe('# parse', function() {
    var parse;
    beforeEach(function() {
      parse = require('../../lib/index').parse();
    });

    describe('# _value', function() {

      it('# boolean', function() {
        expect( parse._value('true') ).eql(true);
      });

      it('# boolean', function() {
        expect( parse._value('false')).eql(false);
      });

      it('# number', function() {
        expect( parse._value('1')).eql(1);
      });

      it('# string quote default', function() {
        expect( parse._value('"aaa"')).eql('aaa');
      });

      it('# string no quote', function() {
        expect( parse._value('"aaa"', { quote: '' })).eql('aaa');
      });

      it('# quoted string single quote', function() {
        expect( parse._value('\'aaa\'', { quote: '\''})).eql('aaa');
      });

      it('# quoted string double quote', function() {
        expect( parse._value('"zzz"', { quote: '"'})).eql('zzz');
      });

      it('# null', function() {
        expect( parse._value('null')).eql(null);
      });

      it('# null empty', function() {
        expect( parse._value('null', { null: '' })).eql(null);
      });

      it('# undefined default', function() {
        expect( parse._value('undefined')).eql(undefined);
      });

      it('# undefined empty', function() {
        expect( parse._value('', { undefined: '' })).eql(undefined);
      });

      it('# not string', function() {
        expect( parse._value(2)).eql(undefined);
      });

    });


    describe('# parse._line', function() {

      it('# simple', function() {
        var s = 'a,b,c';
        var r = [ 'a', 'b', 'c' ];
        expect( parse._line(s)).eql(r);
      });

      it('# simple', function() {
        var s = '"a,b",c';
        var r = [ 'a,b', 'c' ];
        expect( parse._line(s)).eql(r);
      });

    });

    describe('# parse._row', function() {

      it('# simple', function() {

        var s = 'a,b';
        var c = [ 'a', 'b' ];
        var r = { a: 'a', b: 'b' };

        expect( parse._row(s, c, {})).eql(r);

      });

    });
  });



  describe('# stringify', function() {
    var stringify;

    beforeEach(function() {
      stringify = require('../../lib/index').stringify();
    });

    describe('# _value', function() {

      it('# emit error on comma and return opt.null', function(done) {
        stringify.on('error', function(msg) { done(); });
        expect( stringify._value(',', { null: 'null' }) ).eql('null') ;
      });

    });

    describe('# _line', function() {

      it('# emit error on comma and return opt.null', function(done) {
        stringify.on('error', function(msg) { done(); });
        expect( stringify._line([','], { null: 'null', EOL: 'EOL', commaNoLine: true }) ).eql('') ;
      });

    });
  });


});
