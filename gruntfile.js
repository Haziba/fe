module.exports = function(grunt) {
	require('jit-grunt')(grunt);

	grunt.initConfig({
		less: {
			development: {
				options: {
					compress: false,
					yuicompress: false,
					optimization: 2
				},
				files: {
					"public/css/main.css": "less/main.less" // destination file and source file
				}
			}
		},
		watch: {
			styles: {
				files: ['less/*.less'], // which files to watch
				tasks: ['less'],
				options: {
					nospawn: false
				}
			}
		}
	});

	grunt.registerTask('default', ['less', 'watch']);
};