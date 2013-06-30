var utility = require('./utility');
var domain = require('domain');

var fs = require('fs');
var less = require('less');

module.exports = Object.create(Object.prototype, {
  
  init: {
    value: function(sourcePath, compiledPath) {
      Object.defineProperty(this, "sourcePath", { value: sourcePath });
      Object.defineProperty(this, "compiledPath", { value: compiledPath });
      
      return this;
    }
  },
  
  // return the corresponding source file, css -> less, less -> css
  // right now it only resolves a less file, it should work the other way.
  source: {
    value: function(url) {
      var path = utility.path(url.split('/'), 'css');
      var less = path.pop().replace(/\.\w+$/, '.less');
      path.push(less);
      
      return utility.find(utility.listing(this.sourcePath), path, 'style');
    }
  },
  
  compile: {
    value: function(file, callback) {
      if (typeof file !== "string")
        return callback.call(this);
      
      var parser = new(less.Parser)({ paths: [ this.sourcePath ] });
      var d = domain.create();
      
      d.run(function() {
        parser.parse(fs.readFileSync(file, 'utf-8'), function(error, tree) {
          if (error)
            console.warn(error);
          
          callback.call(this, error ? null : tree.toCSS({ yuicompress: true }));
        });
      });
      
      d.on('error', function(error) {
        if (error)
          console.warn(error);
          
        callback.call(this);
      });
    }
  }
  
});