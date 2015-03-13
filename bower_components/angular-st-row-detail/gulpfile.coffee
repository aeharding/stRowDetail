gulp = require 'gulp'

gulp.task 'default', ->
  gulp.src 'src/*.js'
    .pipe gulp.dest 'dist'

gulp.task 'watch', ->
  gulp.watch 'src/*.js', ['default']