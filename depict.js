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
  // PhantomJS heavily relies on callback functions. Functions beginning
  // with `_` are called via this process.

    phantom.create(this._createPage);
  },

  _createPage: function(_ph) {
    this.ph = _ph;
    console.log(this._openPage);
    // TODO `this._openPage` is undefined
    this.ph.createPage(this._openPage);
  },

  _openPage: function(_page) {
    this.page = _page;
    page.set('onError', function() { return; });
    page.open(this.url, this._prepForRender);
  },

  _prepForRender: function(_status) {
    page.evaluate(this._runInPhantomBrowser,
        this._renderImage, this.selector, this.css_text);
  },

  _runInPhantomBrowser: function(_selector, _css_text) {
    if (_css_text) {
      var style = document.createElement('style');
      style.appendChild(document.createTextNode(_css_text));
      document.head.appendChild(style);
    }

    // Return dimensions to render into image
    var element = document.querySelector(_selector);
    return element.getBoundingClientRect();
  },

  _renderImage: function(_rect) {
    page.set('clipRect', _rect);
    page.render(this.out_file, this._cleanup);
  },

  _cleanup: function() {
    console.log('Saved imaged to', this.out_file);
    this.ph.exit();
  },

  /* Utility */
  // TODO `validate` is the wrong word
  validateURL: function(_url) {
    if (_url && typeof(_url) === 'string') {
      // Append 'http://' if protocol not specified
      if (!_url.match(/^w+:\/\//)) {
        _url = 'http://' + _url;
      }
      return _url;
    }
  }
};

module.exports = Depict;

