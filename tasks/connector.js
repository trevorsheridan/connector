/*
 * grunt-connector
 * https://github.com/trevorsheridan/connector
 *
 * Copyright (c) 2013 Trevor Sheridan
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  var utility = require('../lib/utility');
  var less = require('../lib/less');
  
  var express = require('express');
  var engines = require('consolidate');
  var app = express();
  
  grunt.registerMultiTask('connector', 'Prototyping server for the modern man.', function() {
    app.engine('html', engines.hogan);
    app.set('views', __dirname + '/application/views/');
    app.set('view engine', 'html');
    app.set('static', __dirname + '/application/static');
    
    // recompile assets if the environment is set to development
    if (process.env.NODE_ENV === 'development') {
      app.use(function(request, response, next) {
        var media = request.headers.accept;
        
        if (media.match(/text\/css/)) {
          // initialize a new less object with the source and compiled directories, then compile!
          var css = Object.create(less).init(app.get('static') + '/source/styles', app.get('static') + '/source/public');
          css.compile(css.source(request.url), function(css) {
            !css ? next() : response.end(css);
          });
          
          return false;
        }
        next();
      });
    }
    
    // serve static assets from the public directory (falls back to this if development is on and recompiling less)
    app.use(express.static(__dirname + '/application/static/public'));
    
    // catch all other requests and route to the appropriate template
    app.use(function(request, response) {
      // get the directory listing for views, split the path into an array of components, index is the directory index.
      var template = utility.find(utility.listing(app.get('views')), request._parsedUrl.pathname.split('/'), 'index');
      response.status(template ? 200 : 404).render(template || '404');
    });
    
    // app is setup, start listening!
    app.listen(process.env.PORT || 3000);
  });
};
