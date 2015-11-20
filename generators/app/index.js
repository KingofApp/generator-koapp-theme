'use strict';

var yeoman = require('yeoman-generator');
var fs = require('fs');

module.exports = yeoman.generators.NamedBase.extend({
  init: function() {
    this.themeName = this.name;
    this.themeKoaName = 'koa-' + this.themeName + '-theme';
    this.destinationRoot(this.destinationPath() + '/' + this.themeKoaName);
    this.elements = [];
  },

  getElementsTree: function() {
    var elementsPath = __dirname + '/templates/elements/';
    var elementsFolders = fs.readdirSync(elementsPath).filter(function(file) {
      return fs.statSync(elementsPath + '/' + file).isDirectory();
    });

    elementsFolders.forEach(function(elementFolder) {
      var elementsFiles = fs.readdirSync(elementsPath + '/' + elementFolder);

      this.elements.push({
        name: elementFolder,
        files: elementsFiles
      });
    }.bind(this));
  },

  writing: function() {
    this.fs.copyTpl(
      this.templatePath('bower.json'),
      this.destinationPath('bower.json'),
      {
        themeName: this.themeName,
        themeKoaName: this.themeKoaName,
        authorName: this.user.git.name(),
        authorEmail: this.user.git.email()
      }
    );

    this.fs.copy(
      this.templatePath('_gitignore'),
      this.destinationPath('.gitignore')
    );

    this.directory(
      this.templatePath('styles'),
      this.destinationPath('styles')
    );

    this.fs.copyTpl(
      this.templatePath('koa-theme.html'),
      this.destinationPath(this.themeKoaName + '.html'),
      {themeName: this.themeName}
    );

    this.fs.copyTpl(
      this.templatePath('dist/koa-theme.html'),
      this.destinationPath('dist/' + this.themeKoaName + '.html'),
      {themeName: this.themeName}
    );
  },

  writingElements: function() {
    var themeName = this.themeName;
    function replaceKoa(text) {
      return text.replace(new RegExp('koa-', 'g'), themeName + '-');
    }

    this.elements.forEach(function(element) {
      var tagName = replaceKoa(element.name);

      this.fs.copyTpl(
        this.templatePath('elements/demo.html'),
        this.destinationPath('elements/' + tagName + '/demo/index.html'),
        {tagName: tagName}
      );

      element.files.forEach(function(file) {
        var templatePath = 'elements/' + element.name + '/' + file;
        var destinationPath = replaceKoa(templatePath);
        var tagName = replaceKoa(file.replace('.html', ''));

        this.fs.copyTpl(
          this.templatePath(templatePath),
          this.destinationPath(destinationPath),
          {tagName: tagName, themeName: this.themeName}
        );
      }.bind(this));

    }.bind(this));
  },

  install: function() {
    this.installDependencies({npm: false, bower: true});
  }
});
