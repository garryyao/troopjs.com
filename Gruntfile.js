/*
 * Grunt tasks building TroopJS website from markdown, handlebar, yaml, and less files.
 * https://github.com/assemble/assemble-docs/
 */

'use strict';

module.exports = function (grunt) {

  // Mix local utilities into grunt instance.
  grunt.util._.mixin(require('./src/extensions/mixins'));

  // Report elapsed execution time of grunt tasks.
  require('time-grunt')(grunt);

  var prettify = function(src) {
    return require('js-prettify').html(src, {
      indent_size: 2,
      indent_inner_html: true
    }).replace(/(\r\n|\n\r|\n|\r){2,}/g, '\n');
  };

  // Project configuration.
  grunt.initConfig({

    /**
     * Metadata for templates
     */
    pkg      : grunt.file.readJSON('package.json'),
    bootstrap: grunt.file.readYAML('src/less/bootstrap.yml'),
    ghpages  : grunt.file.readYAML('src/less/ghpages.yml'),
    site     : grunt.file.readYAML('src/data/site.yml'),

    /**
     * Process LESS files
     */
    less: {
      options: {
        imports: {reference: '<%= ghpages.globals %>'}
      },
      main: {
        src: ['<%= bootstrap.bundle.docs %>', '<%= ghpages.bundle.docs %>'],
        dest: '<%= site.destination %>/assets/css/assemble.css'
      },
      gist: {
        src: ['src/less/docs/gist-overrides.less'],
        dest: '<%= site.destination %>/assets/css/gist.css'
      },
      markdown: {
        src: ['src/less/components/markdown.less'],
        dest: '<%= site.destination %>/assets/css/markdown.css'
      }
    },

    /**
     * Generate up-to-date list of troopjs-contrib-* repos
     */
    github: {
      repos: {
        options: {filters: {type: 'public'}},
        src: '/orgs/troopjs/repos?page=1&per_page=100',
        dest: 'src/data/repos.json'
      }
    },

    /**
     * Generate the site.
     */
    assemble: {
      options: {
        today: '<%= grunt.template.today() %>',
        production: true,
        flatten: true,
        // plugins: ['assemble-contrib-contextual'],
        contextual: {
          dest: './temp'
        },
        data: ['src/data/*.{json,yml}', 'package.json'],
        assets: '<%= site.destination %>/assets',
        helpers: ['src/extensions/*.js', 'helper-prettify'],
        partials: ['templates/includes/**/*.{hbs,md}'],
        layoutdir: 'templates/layouts',
        layout: 'default.hbs',
        marked: {sanitize: false },
        // postprocess: prettify,
        prettify: {
          indent: 2,
          condense: true,
          padcomments: true
        }
      },

      /**
       * Generate markdown navigation links 
       */
      links: {
        options: {
          postprocess: false,
          flatten: true,
          ext: '.hbs'
        },
        src: 'templates/includes/snippets/links-template.md.hbs',
        dest: 'templates/includes/snippets/generated-links.md.hbs'
      },

      /**
       * Build the main docs.
       */
      docs: {
        files: [
          {
            expand: true,
            cwd: 'templates/pages',
            src: ['*.hbs'],
            dest: '<%= site.destination %>/',
            ext: '.html'
          },
          {
            expand: true,
            cwd: 'templates/pages/docs',
            src: ['*.hbs'],
            dest: '<%= site.destination %>/docs/',
            ext: '.html'
          },
          {
            expand: true,
            cwd: 'templates/pages/modules/core',
            src: ['*.hbs'],
            dest: '<%= site.destination %>/docs/',
            ext: '.html'
          }
        ]
      },
      contrib: {
        files: [
          {
            expand: true,
            cwd: 'templates/pages/contrib',
            src: ['*.hbs'],
            dest: '<%= site.destination %>/contrib/',
            ext: '.html'
          },
          {
            expand: true,
            cwd: 'templates/pages/modules/contrib',
            src: ['*.hbs'],
            dest: '<%= site.destination %>/contrib/',
            ext: '.html'
          }
        ]
      }
    },

    'gh-pages': {
      options: {
        base: 'master',
        message: 'update with latest generated website pages'
      },
      src: ['**']
    },

    copy: {
      docs: {
        files: [
          {expand: true, cwd: 'assets', src: ['**/*'], dest: '<%= site.destination %>/assets'}
        ]
      }
    },

    favicons: {
      options: {
        precomposed: true
        /*
         html: 'head.hbs',
         HTMLPrefix: "/assets/img/"
         */
      },
      icons: {
        src: 'assets/img/favicon.png',
        dest: '<%= site.destination %>/assets/img'
      }
    },

    // Before generating new files, clean out files from previous build.
    clean: {
      ghpages: ['<%= site.destination %>/**/*.html']
    }
  });

  // Set the base path for Bootstrap LESS library.
  grunt.config.set('vendor.base', 'vendor');

  // Load npm and local plugins.
  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('assemble-less');
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Default task to be run.
  grunt.registerTask('default', [
    'clean:ghpages',
    'assemble',
    'copy',
    'less',
    'sync'
  ]);

  // Release to master branch.
  grunt.registerTask('release', [
    'default',
    'gh-pages'
  ]);
};
