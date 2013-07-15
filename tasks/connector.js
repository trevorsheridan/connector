/*
 * grunt-connector
 * https://github.com/trevorsheridan/connector
 *
 * Copyright (c) 2013 Trevor Sheridan
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  var request = require('request');
  var utility = require('../lib/utility');
  
  grunt.registerTask('connector', 'Prototyping server for the modern man.', function() {
    var express = require('express');
    var engines = require('consolidate');
    var application = express();
    
    var options = this.options({
      assets: '/public',
      port: process.env.PORT || 3000,
      templates: '/source/templates',
      templateEngine: 'hogan',
      proxy: {
        url: undefined,
        endpoints: [],
        auth: undefined
      }
    });
    
    this.async();
    
    // Set the templating engine configuration.
    application.set('views', process.cwd() + '/' + options.templates);
    application.set('view engine', 'html');
    application.engine('html', engines[options.templateEngine]);
    
    // Serve static assets from the public directory (falls back to this if development is on and recompiling less).
    application.use(express.static(process.cwd() + '/' + options.assets));
    
    // Parse the request body.
    application.use(express.bodyParser());

    // Proxy requests matched against a valid endpoint to an arbitrary url and return the response.
    application.use(function(req, res, next) {
      var path = req._parsedUrl.path;
      var url = options.proxy.url && options.proxy.url + path || undefined;
      var endpoints = (Array.isArray(options.proxy.endpoints) && options.proxy.endpoints) || undefined;

      if (!url || !endpoints || !endpoints.some(function(endpoint) { return endpoint === path }))
        return next();

      var requestOptions = { url: url, method: req.method };
      requestOptions.json = req.body; // The body type (json, form, raw) should be inferred.
      requestOptions.auth = options.proxy.auth;

      grunt.log.ok("Proxying request to " + url);
      request(requestOptions, function(error, response, body) {
        res.status(response.statusCode).send(body);
      });
    });

    // Catch all other requests and route to the appropriate template.
    application.use(function(req, res) {
      var path = req._parsedUrl.pathname;
      var template = utility.find(utility.listing(application.get('views')), path.split('/'), 'index') || 404;
      
      grunt.log.ok("Responding to " + path + " with template " + template + "".green);
      res.status(typeof template === 'number' ? template : 200).render(template);
    });
    
    application.listen(options.port);
    grunt.log.ok("Server listening for incoming connections on port " + options.port + "".green);
  });
};
