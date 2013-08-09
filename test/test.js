var assert = require('assert');
var child_process = require('child_process');
var depict = require('../');

describe('Depict', function() {

  describe('init()', function() {
    var url = 'http://0.0.0.0:7777/'
    var out_file = 'out.png'

    describe('url', function() {
      it('should set `depict.url` to the passed in URL value', function(done) {
        argv = [
            process.argv[0],
            process.argv[1],
            url,
            out_file
        ]
        depict.init(argv);
        assert.equal(depict.url, url);
        done();
      });
    });

    describe('url', function() {
      it('should set `depict.out_file` to the passed in OUT_FILE value', function(done) {
        argv = [
            process.argv[0],
            process.argv[1],
            url,
            out_file
        ]
        depict.init(argv);
        assert.equal(depict.out_file, out_file);
        done();
      });
    });

    describe('url', function() {
      it('should set `depict.selector` to the passed in --selector value', function(done) {
        argv = [
            process.argv[0],
            process.argv[1],
            url,
            out_file,
            '-s',
            '#chart'
        ]
        depict.init(argv);
        assert.equal(depict.selector, '#chart');
        done();
      });
    });

  });
/*
  describe('depict()', function() {
    var http_server = null;

    before(function(done) {
      http_server = child_process.spawn('node',
          [process.cwd() + '/node_modules/http-server/bin/http-server', '-p', '7777']);
      done();
    });

    after(function(done) {
      http_server.kill();
      done();
    });
  });

  it('should return the correct rect dimensions for a given selector', function(done) {
    argv = [
        process.argv[0],
        process.argv[1],
        'http://0.0.0.0:7777/',
        'out.png'
    ]
    depict.init(argv);
    depict.depict(function() {
      // TODO assert equality of rect dimensions
      assert.equal(0, 0);
      done();
    });
  });
 */

});

describe('Utility', function() {

  // TODO Spit these into separate tests
  describe('formatURL()', function() {
    it('should prepend `http://` if no protocol is specified', function() {

      assert.equal('http://www.example.com/',
          depict.formatURL('http://www.example.com/'));

      assert.equal('https://www.example.com/',
          depict.formatURL('https://www.example.com/'));

      assert.equal('http://an.example.com/',
          depict.formatURL('http://an.example.com/'));

      assert.equal('http://www.example.com/',
          depict.formatURL('www.example.com/'));

      // TODO Is this the correct behavior?
      assert.equal('http://example.com/',
          depict.formatURL('example.com/'));
    });
  });

});

