var gulp = require('gulp'),
  streamify = require('gulp-streamify'),
  livereload = require('gulp-livereload');


// ============================================================================
// Scripts

var browserify = require('browserify'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  source = require('vinyl-source-stream'),
  uglify = require('gulp-uglify');

var scripts = {
  paths: {
    file: 'app.js',
    src: './public/src/js/',
    dist: './public/dist/js/',
  },
  lint: function() {
    return gulp.src(['./**/*.js', '!./node_modules/**', '!./public/dist/**'])
      .pipe(jshint())
      .pipe(jshint.reporter(stylish));
  },
  bundle: function() {
    return browserify({
      entries: [this.paths.src + this.paths.file],
      extensions: ['.js']
    })
    .bundle({ debug: true })
    .pipe(source(this.paths.file))
    .pipe(gulp.dest(this.paths.dist));
  },
  minify: function(stream) {
    return stream
    .pipe(streamify(uglify()))
    .pipe(gulp.dest(this.paths.dist));
  },
  watch: function() {
    gulp.watch(this.paths.src + '**', ['lint', 'scripts']);
  }
};

gulp.task('lint', function() {
  return scripts.lint();
});

gulp.task('scripts', function() {
  scripts.bundle();
});

gulp.task('scripts:build', function() {
  var bundle = scripts.bundle.bind(scripts),
    minify = scripts.minify.bind(scripts);

  minify(bundle());
});


// ============================================================================
// Styles

var csso = require('gulp-csso'),
  sass = require('gulp-sass');

var styles = {
  paths: {
    file: 'app.scss',
    src: './public/src/scss/',
    dist: './public/dist/css/',
  },
  bundle: function() {
    return gulp.src(this.paths.src + this.paths.file)
    .pipe(sass())
    .pipe(gulp.dest(this.paths.dist));
  },
  minify: function(stream) {
    return stream
    .pipe(csso())
    .pipe(gulp.dest(this.paths.dist));
  },
  watch: function() {
    gulp.watch(this.paths.src + '**', ['styles']);
  }
};

gulp.task('styles', function() {
  styles.bundle();
});

gulp.task('styles:build', function() {
  var bundle = styles.bundle.bind(styles),
    minify = styles.minify.bind(styles);

  minify(bundle());
});


// ============================================================================
// Server

var nodemon = require('gulp-nodemon');

var server = {
  paths: {
    main: './server.js',
    ext: 'html js',
    ignored: ['./node_modules/**', './public/**', './test/**']
  },
  run: function() {
    var _this = this;

    nodemon({
      script: _this.paths.main,
      ext: _this.paths.ext,
      ignored: _this.paths.ignored
    })
    .on('change', ['lint']);
  },
};

gulp.task('server', function() {
  server.run.call(server);
});

// ============================================================================
// Tasks

gulp.task('watch', function() {
  var server = livereload(),
    reload = function(file) {
      server.changed(file.path);
    };

  scripts.watch.call(scripts);
  styles.watch.call(styles);

  gulp.watch(['./public/dist/**']).on('change', reload);
  gulp.watch(['./app/views/**']).on('change', reload);
});

gulp.task('default', ['lint', 'scripts', 'styles', 'server', 'watch']);
gulp.task('build', ['lint', 'scripts:build', 'styles:build']);
