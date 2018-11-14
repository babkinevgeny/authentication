const gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    scss = require('gulp-sass');

gulp.task('scss', function() {
  return gulp.src('scss/*.scss')
    .pipe(scss())
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
      cascade: true
    }))
    .pipe(gulp.dest('public/css'))
});

gulp.task('watch', function() {
  gulp.watch('scss/**/*.scss', ['scss']);
});
