module.exports = function(grunt) {

    // 1. All configuration goes here 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        ngtemplates: {
            myapp: {
                options: {
                    base: "web",
                    module: "csbux.directives.dts",
                },
                src: "templates/**/*.html",
                dest: "build/dts-tpl.js"
            }
        },

        // 2. Configuration for concatinating files goes here.
        concat: {            
            dist: {
                    src: [
                        "src/dts/csbux-dts.js",                        
                        "build/dts-tpl.js"
                    ],
                    dest: 'build/csbux-dts.min.js',
                }
        },
        uglify : {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> Copyright (c) 2015 Cristian Birladeanu aka csbux */',
                mangle: false
            },
            js: {
                files: {
                    'build/csbux-dts.min.js' : [ 'build/csbux-dts.min.js' ]
                }
            }
        },
        copy: {
          main: {
            files: [
              { src: 'src/dts/docs/index.html', dest:"build/index.html"},                            
              { src: 'src/dts/docs/script.js', dest:"build/script.js"},                            
              { src: 'src/dts/docs/dtsStyle.css', dest:"build/dtsStyle.css"},                            
              { src: 'src/dts/docs/templates/**', dest:"build/templates/", expand: true, flatten: true, filter:'isFile'},                            
            ],
          },
        },
        // Deletes all .js files, but skips min.js files 
        clean: {
          js: ["build/*tpl.js"]
        }

    });

    // 3. Where we tell Grunt we plan to use this plug-in.    
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['ngtemplates', 'concat', 'uglify', 'copy', 'clean']);

};