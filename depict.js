var child_process = require('child_process');
var fs = require('fs');
var optimist = require('optimist');
var phantom = require('phantom');

var Depict = {
  argv: null,
  url: null,
  selector: null,
  css_file: null,
  css_text: null,
  selector: null,
  out_file: null,
  hide_selector: null,

  page: null,
  ph: null,

  init: function(_argv) {
    this.parseArgs(_argv);
  },

  parseArgs: function(_argv) {
    this.argv = optimist
      .usage('Usage: depict URL OUT_FILE [OPTIONS]')
      .options('h', {
        alias: 'help',
        describe: 'Display help',
        default: false
      })
      .options('s', {
        alias: 'selector',
        describe: 'CSS selector',
        default: 'body'
      })
      .options('c', {
        alias: 'css',
        describe: 'CSS file to include in rendering',
        default: false
      })
      .options('H', {
        alias: 'hide-selector',
        describe: 'Hide attributes of this selector berore rendering.',
        default: false
      })
      .check(function(argv) {
        if (argv._.length !== 2) throw new Error('URL and OUT_FILE must be given.');
      })
      .argv;

    if (this.argv.h || this.argv.help) return optimist.showHelp();

    this.url = this.validateURL(this.argv._[0]);


    this.selector = this.argv.s || this.argv.selector;
    this.out_file = this.argv._[1];

    this.css_file = this.argv.c || this.argv.css;
    this.css_text = '';
    if (this.css_file) {
      this.css_text = fs.readFileSync(this.css_file, 'utf8');
    }

    this.hide_selector = this.argv.H || this.argv["hide-selector"];
    if (this.hide_selector) {
      this.css_text += "\n\n " + this.hide_selector + " { display: none; }\n";
    }

  },

  depict: function() {
    // PhantomJS heavily relies on callback functions.

    var self = this;
    phantom.create(createPage);

    function createPage(_ph) {
      self.ph = _ph;
      self.ph.createPage(openPage);
    }

    function openPage(_page) {
      self.page = _page;
      self.page.set('onError', function() { return; });
      self.page.open(self.url, prepForRender);
    }

    function prepForRender(_status) {
      if (_status === 'success') {
        self.page.evaluate(runInPhantomBrowser, renderImage, self.selector,
          self.css_text);
      } else {
        phExit();
        self.reportError('The requested URL could not be opened.');
      }
    }

    function runInPhantomBrowser(_selector, _css_text) {
      if (_css_text) {
        var style = document.createElement('style');
        style.appendChild(document.createTextNode(_css_text));
        document.head.appendChild(style);
      }

      // Return dimensions to render into image
      var element = document.querySelector(_selector);
      return element.getBoundingClientRect();
    }

    function renderImage(_rect) {
      self.page.set('clipRect', _rect);
      self.page.render(self.out_file, cleanup);
    }

    function cleanup() {
      console.log('Saved imaged to', self.out_file);
      phExit();
    }

    function phExit() {
      self.ph.exit();
    }

  },

  reportError: function(_error) {
    console.error('Error:', _error);
  },

  /* Utility */
  // TODO `validate` is the wrong word
  validateURL: function(_url) {
    if (_url && typeof(_url) === 'string') {
      // Append 'http://' if protocol not specified
      // TODO
      /*
      if (!_url.match(/^w+:\/\//)) {
        _url = 'http://' + _url;
      }
      */
      return _url;
    }
  }

};

module.exports = Depict;

