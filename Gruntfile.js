module.exports = function(grunt) {

    // 1. All configuration goes here 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        csbuxBanner: '<%= pkg.name %> - v<%= pkg.version %> (<%= pkg.release %>) - <%= grunt.template.today("yyyy-mm-dd") %>  <%= pkg.copyright %>',
        ngtemplates: {
            myapp: {
                options: {
                    base: "web",
                    module: "csbux.directives.dts",
                },
                src: "templates/**/*.html",
                dest: "build/csbux-tpl.js"
            }
        },

        // 2. Configuration for concatinating files goes here.
        concat: {  
           options: {
                banner: '/*! <%= csbuxBanner %> */'
                },    
            dist: {
                    src: [
                        "src/dts/csbux-dts.js",                        
                        "build/csbux-tpl.js"
                    ],
                    dest: 'build/csbux.min.js',
                },
            css: {
                    src: [
                        "src/**/*.css"
                    ],
                    dest: 'build/csbux.concat.css',
                }

        },
        uglify : {
            options: {
                banner: '/*! <%= csbuxBanner %> */',
                mangle: false
            },
            js: {
                files: {
                    'build/csbux.min.js' : [ 'build/csbux.min.js' ]
                }
            }
        },
        cssmin: {           
            css: {
                src: 'build/csbux.concat.css',
                dest: 'build/csbux.min.css'
            }
        },    
        copy: {
          main: {
            files: [
              { src: 'src/dts/docs/index.html', dest:"build/index.html"},                            
              { src: 'src/dts/docs/script.js', dest:"build/script.js"},                                          
              { src: 'src/dts/docs/templates/**', dest:"build/templates/", expand: true, flatten: true, filter:'isFile'},                            
              { src: 'build/csbux.min.js', dest:"dist/csbux.min.js"},                            
              { src: 'build/csbux.min.css', dest:"dist/csbux.min.css"},                            
            ],
          },
        },           
        // Deletes all .js files, but skips min.js files 
        clean: {
          all: ["build", "dist"],
          build: ["build"],
          postBuild: ["build/*tpl.js", "build/*.concat.css"]
        }

    });

    // 3. Where we tell Grunt we plan to use this plug-in.    
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');    
    grunt.loadNpmTasks('grunt-contrib-clean');

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['clean:all', 'ngtemplates', 'concat', 'uglify', 'cssmin', 'copy', 'clean:postBuild']);

};