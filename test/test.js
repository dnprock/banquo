var assert = require('assert');
var child_process = require('child_process');
var depict = require('../');

describe('Depict', function() {
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

  describe('', function() {
    it('', function(done) {
      argv = [
          process.argv[0],
          process.argv[1],
          'http://0.0.0.0:7777/',
          'out.png'
      ]
      depict.init(argv);
      depict.depict(function() {
        // TODO assert equality of png files?
        assert.equal(0, 0);
        done();
      });
    });
  });

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

