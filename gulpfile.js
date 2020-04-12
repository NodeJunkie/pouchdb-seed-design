const gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  mocha = require('gulp-mocha'),
  browserify = require('browserify'),
  Server = require('karma').Server,
  uglify = require('gulp-uglify'),
  rimraf = require('rimraf'),
  source = require('vinyl-source-stream'),
  rename = require('gulp-rename'),
  streamify = require('gulp-streamify');

gulp.task('lint', gulp.series(function () {
  return gulp.src(['./*.js', './test/*.js'])
    .pipe(jshint({esversion: 6}))
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
}));

gulp.task('test-node', gulp.series(['lint'], function () {
  return gulp.src('test/*.spec.js', {read: false})
    .pipe(mocha({timeout: 5000}));
}));

gulp.task('clean', gulp.series(['test-node'], function (cb) {
  rimraf('./dist', cb);
}));

gulp.task('build-browser', gulp.series(['clean'], function () {
  return browserify('./index.js')
    .bundle()
    .pipe(source('pouchdb-seed-design.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(rename('pouchdb-seed-design.min.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./dist/'));
}));

gulp.task('test-browser', gulp.series(['build-browser'], function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
}));

gulp.task('default', gulp.series(['test-browser', 'build-browser', 'clean', 'test-node']));