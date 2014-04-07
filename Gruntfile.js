/*jslint node: true*/

module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt, {scope: 'devDependencies'});

    grunt.initConfig({

        cssFolder: 'css/',
        srcFolder: 'src/',
        binFolder: 'bin/',

        clean: {
            css: '<%= cssFolder %>',
            bin: '<%= binFolder %>'
        },

        shell: {
            sassCompile: {
                command: 'scss -t compact main.scss main.css'
            }
        },

        compress: {
            main: {
                options: {
                    mode: 'zip',
                    archive: '<%= binFolder %>brackets-code-outline.zip'
                },
                files: [
                    {
                        src: [
                            '*',
                            '!Gruntfile.js',
                            '!**.scss',
                            '!**.md'
                        ],
                        dest: '/'
                    }
                ]
            }
        }
    });

    grunt.registerTask('sass', ['clean:css', 'shell:sassCompile']);
    grunt.registerTask('release', ['sass', 'clean:bin', 'compress:main']);

    grunt.registerTask('default', ['sass']);
};
