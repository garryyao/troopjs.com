module.exports.register = function(Handlebars, options) {

  var grunt = require('grunt');
  var _ = grunt.util._;
  var toString = Object.prototype.toString;
  var isUndefined = function(value) {
    return value === 'undefined' || toString.call(value) === '[object Function]' || (value.hash != null);
  };

  // Customize this helper
  Handlebars.registerHelper("news", function(news) {
    if (isUndefined(news)) {
      news = grunt.file.readYAML('./src/news.yml');
    } else {
      news = grunt.file.readYAML(news);
    }
    var source = "{{#each .}}* {{date}}\t\t\t{{{@key}}}\t\t\t{{#each updates}}{{{.}}}  {{/each}}\n{{/each}}";
    var template = Handlebars.compile(source);
    return new Handlebars.SafeString(template(news));
  });


  // Customize this helper
  Handlebars.registerHelper("menu", function(pages, thisSection, thisPage) {

    pages = _.sortBy(pages, function indexPageFirst(page) {
      return _.isNumber(page.data.order) ? page.data.order : /^index$/i.test(page.basename)? 'AAA' : page.data.title;
    });

    var ctx = {
      section: thisSection,
      page: thisPage,
      pages: pages
    };

    var tpl = Handlebars.compile(
            '{{#each pages}}' +
            '{{#is data.section ../section}}' +
                '<li{{#is ../../page.dest this.dest}} class="active"{{/is}}>' +
                  '<a href="{{relative ../../page.dest this.dest}}" {{> click-tracker }}>{{data.title}}</a>' +
                '</li>' +
              '{{/is}}' +
            '{{/each}}'
    );
    return new Handlebars.SafeString(tpl(ctx));
  });

};
