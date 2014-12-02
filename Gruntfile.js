module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        watch: {
            options: {
                livereload: true
            },
            all: {
                files: ["**/*","!Gruntfile.js","!**/node_modules/**"]
            }
        },
        connect: {
            uses_defaults: {
                options: {
                    port: 8080,
                    keepalive: true,
                    base: './'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

};
