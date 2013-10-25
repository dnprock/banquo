#!/usr/bin/env node

// var child_process = require('child_process');
var fs            = require('fs');
var _             = require('underscore')
var phantom       = require('node-phantom');
var sleep         = require('sleep');

var settings = {
  mode: 'save',
  viewport_width: 1440,
  delay: 5,
  selector: 'body'
}

function depict(opts) {
  _.extend(settings, opts);

  // Append 'http://' if protocol not specified
  if (!settings.url.match(/^\w+:\/\//)) {
    settings.url = 'http://' + settings.url;
  }

  var css_text;
  if (settings.css_hide){
    css_text = settings.css_file += "\n\n " + settings.css_hide + " { display: none; }\n";
  }

  // phantomjs heavily relies on callback functions
  var page;
  var ph;

  console.log('\nRequesting', settings.url);

  phantom.create(createPage)

  function createPage(err, _ph) {
    ph = _ph;
    ph.createPage(openPage);
  }

  function openPage(err, _page) {
    page = _page;
    page.set('onError', function() { return; });
    page.set('viewportSize', {width: settings.viewport_width, height: 900});
    page.open(settings.url, prepForRender);
  }

  function prepForRender(status) {
    page.evaluate(runInPhantomBrowser, renderImage, settings.selector, css_text);
  }

  function runInPhantomBrowser(selector, css_text) {
    if (css_text) {
      var style = document.createElement('style');
      style.appendChild(document.createTextNode(css_text));
      document.head.appendChild(style);
    }

    var element = document.querySelector(selector);
    return element.getBoundingClientRect();
  }

  function renderImage(rect) {
    sleep.sleep(settings.delay);
    page.set('clipRect', rect);
    if (settings.mode != 'save'){
      console.log('rendering')
      page.renderBase64('PNG', renderImage);
    }else{
      page.render(settings.out_file, cleanup)
    }
    // page.render(out_file, cleanup);
  }

  function renderImage(err, image_data){
    console.log(image_data);
    cleanup();
  }

  function cleanup() {
    console.log('Saved imaged to', settings.out_file);
    ph.exit();
  }
}

module.exports = {
  capture: depict
}

// depict(opts);

