// Copyright 2014 Globo.com Player authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var glob = require('glob').sync;
var mkdirp = require('mkdirp').sync;
var path = require('path');
var fs = require('fs');
var _ = require('underscore');

var codeTemplate = _.template("//This file is generated by bin/hook.js\n" +
  "var _ = require('underscore');\n" +
  "module.exports = { " +
  "<% _.each(templates, function(template) { %>" +
  "'<%= template.name %>': _.template('<%= template.content %>')," +
  "<% }); %>" +
  "CSS: {" +
    "<% _.each(styles, function(style) { %>" +
      "'<%= style.name %>': '<%= style.content %>'," +
    "<% }); %>" +
  "}" +
"};");

var jstFile = 'src/base/jst.js';

function format(filePath) {
  var expression = path.dirname(filePath) + '/../' + path.basename(filePath);
  var name = path.basename(path.dirname(path.resolve(expression)));
  var content = fs.readFileSync(filePath).toString().replace(/\r?\n|\r/g, '');
  return {name: name, content: content};
}

function copyAssets(asset) {
  fs.createReadStream(asset)
    .pipe(fs.createWriteStream('dist/assets/' + path.basename(asset)));
}

var pluginsTemplates = _(glob('src/{plugins,playbacks}/**/*.html')).map(format);
var templates = pluginsTemplates.concat(_(glob('src/components/**/*.html')).map(format));
var pluginsStyles = _(glob('src/{plugins,playbacks}/**/*.css')).map(format);
var styles = pluginsStyles.concat(_(glob('src/components/**/*.css')).map(format));

fs.writeFileSync(jstFile, codeTemplate({templates: templates, styles: styles}));

mkdirp('dist/assets/');

glob('src/{plugins,playbacks,components}/**/*.{png,jpeg,jpg,gif,swf,eot,ttf,svg,html5player.js,s_code.js}').map(copyAssets);
