'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

var S = require('string');

gulp.task('setconfiguration:dev', function () {
  return gulp.src([paths.src + '/app/app.js'])
    .pipe($.print())
    .pipe($.replace('production: true', 'production: false'))
    .pipe($.replace("logo: 'static?file=assets", "//logo: 'static?file=assets"))
    .pipe($.replace("//logo: 'assets", "logo: 'assets"))
    .pipe(gulp.dest(paths.src + '/app'));

});

gulp.task('setconfiguration:prod', function () {
  return gulp.src([paths.src + '/app/app.js'])
    .pipe($.print())
    .pipe($.replace('production: false', 'production: true'))
    .pipe($.replace("//logo: 'static?file=assets", "logo: 'static?file=assets"))
    .pipe($.replace("logo: 'assets", "//logo: 'assets"))
    .pipe(gulp.dest(paths.src + '/app'));

});

gulp.task('partials', function () {
  return gulp.src([
    paths.src + '/{app,components}/**/*.html',
    paths.tmp + '/{app,components}/**/*.html'
  ])
    .pipe($.if(function (file) {
      return $.match(file, ['!**/examples/*.html']);
    },
      $.minifyHtml({
        empty: true,
        spare: true,
        quotes: true
      }))
    )
    .pipe($.angularTemplatecache('templateCacheHtml.js', {
      module: 'triAngular'
    }))
    .pipe(gulp.dest(paths.tmp + '/partials/'));
});

gulp.task('html', ['inject', 'partials'], function () {
  var partialsInjectFile = gulp.src(paths.tmp + '/partials/templateCacheHtml.js', { read: false });
  var partialsInjectOptions = {
    starttag: '<!-- inject:partials -->',
    ignorePath: paths.tmp + '/partials',
    addRootSlash: false
  };

  var htmlFilter = $.filter(['*.html', '!/src/app/elements/examples/*.html']);
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');
  var assets;

  return gulp.src(paths.tmp + '/serve/*.html')
    .pipe($.inject(partialsInjectFile, partialsInjectOptions))
    .pipe(assets = $.useref.assets())
    .pipe($.rev())
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    .pipe($.uglify({ preserveComments: $.uglifySaveLicense }).on('error', function (e) { console.log(e); }))
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.csso())
    .pipe(cssFilter.restore())
    .pipe(assets.restore())
    .pipe($.replace('../bower_components/material-design-iconic-font/fonts', '../fonts'))
    .pipe($.replace('../font/weathericons-regular', '../fonts/weathericons-regular'))
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe(htmlFilter)
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe(htmlFilter.restore())
    .pipe(gulp.dest(paths.dist + '/'))
    .pipe($.size({ title: paths.dist + '/', showFiles: true }));
});

gulp.task('gsrpaths:fonts', function () {
  return gulp.src(paths.dist + '/styles/*')
    .pipe($.print())
    .pipe($.replace('../fonts/Material-Design-Iconic-Font.eot?v=1.0.1', 'static?file=fonts|Material-Design-Iconic-Font.eot'))
    .pipe($.replace('../fonts/Material-Design-Iconic-Font.woff?v=1.0.1', 'static?file=fonts|Material-Design-Iconic-Font.woff'))
    .pipe($.replace('../fonts/Material-Design-Iconic-Font.ttf?v=1.0.1', 'static?file=fonts|Material-Design-Iconic-Font.ttf'))
    .pipe($.replace('../fonts/Material-Design-Iconic-Font.svg?v=1.0.1', 'static?file=fonts|Material-Design-Iconic-Font.svg'))
    .pipe($.replace('../fonts/Material-Design-Iconic-Font.eot?#iefix&v=1.0.1', 'static?file=fonts|Material-Design-Iconic-Font.eot'))
    .pipe($.replace('../fonts/fontawesome-webfont.eot?v=4.3.0', 'static?file=fonts|fontawesome-webfont.eot'))
    .pipe($.replace('../fonts/fontawesome-webfont.eot?#iefix&v=4.3.0', 'static?file=fonts|fontawesome-webfont.eot'))
    .pipe($.replace('../fonts/fontawesome-webfont.woff2?v=4.3.0', 'static?file=fonts|fontawesome-webfont.woff2'))
    .pipe($.replace('../fonts/fontawesome-webfont.woff?v=4.3.0', 'static?file=fonts|fontawesome-webfont.woff'))
    .pipe($.replace('../fonts/fontawesome-webfont.ttf?v=4.3.0', 'static?file=fonts|fontawesome-webfont.ttf'))
    .pipe($.replace('../fonts/fontawesome-webfont.svg?v=4.3.0', 'static?file=fonts|fontawesome-webfont.svg'))
    .pipe($.replace('../fonts/weathericons-regular-webfont.eot', 'static?file=fonts|weathericons-regular-webfont.eot'))
    .pipe($.replace('../fonts/weathericons-regular-webfont.eot?#iefix', 'static?file=fonts|weathericons-regular-webfont.eot'))
    .pipe($.replace('../fonts/weathericons-regular-webfont.woff', 'static?file=fonts|weathericons-regular-webfont.woff'))
    .pipe($.replace('../fonts/weathericons-regular-webfont.ttf', 'static?file=fonts|weathericons-regular-webfont.ttf'))
    .pipe($.replace('../fonts/weathericons-regular-webfont.svg#weathericons-regular-webfontRg', 'static?file=fonts|weathericons-regular-webfont.svg'))
    .pipe(gulp.dest('./gsr/gsrpaths/'));
});

gulp.task('images', function () {
  return gulp.src(paths.src + '/assets/images/**/*')
    .pipe(gulp.dest(paths.dist + '/assets/images/'));
});

gulp.task('fonts', function () {
  return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.{eot,otf,svg,ttf,woff,woff2}'))
    .pipe($.flatten())
    .pipe(gulp.dest(paths.dist + '/fonts/'));
});

gulp.task('translations', function () {
  return gulp.src('src/**/il8n/*.json')
    .pipe(gulp.dest(paths.dist + '/'))
    .pipe($.size());
});

gulp.task('data', function () {
  return gulp.src('src/**/data/*.json')
    .pipe(gulp.dest(paths.dist + '/'))
    .pipe($.size());
});

gulp.task('examplejs', function () {
  return gulp.src('src/**/examples/*.{js,scss}')
    .pipe(gulp.dest(paths.dist + '/'))
    .pipe($.size());
});

gulp.task('jshint', function () {
  gulp.src('src/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('default'));
});


gulp.task('misc', function () {
  return gulp.src(paths.src + '/favicon.png')
    .pipe(gulp.dest(paths.dist + '/'));
});

gulp.task('clean', function (done) {
  $.del([paths.dist + '/', paths.tmp + '/', './gsr/gsrpaths/'], done);
});

gulp.task('replace-paths', function () {
  "use strict";
  return gulp.src(['./dist/index.html'])
    .pipe($.assetpaths({
      newDomain: 'static?file=',
      oldDomain: 'old',
      docRoot: 'src',
      filetypes: ['jpg', 'png', 'js', 'css']
    }))
    .pipe($.replace(new RegExp('"static\\?file=(\\S*)"', 'g'), function (match, p1, offset, string) {
      var path = p1;

      var withPipes = S(p1)
        .chompLeft('/')
        .replaceAll('/', '|');
      var newPath = match.replace(p1, withPipes);

      return newPath;
    }))
    .pipe(gulp.dest('./gsr/gsrpaths'));
});

gulp.task('zip', function (done) {
  "use strict";
  return gulp.src(['./dist/**/*', './gsr/**/*'])
    .pipe($.print())
    .pipe($.zip('deployment.zip'))
    .pipe(gulp.dest('gsrdeploy'));
});

gulp.task('buildapp', ['html', 'images', 'fonts', 'translations', 'misc', 'data', 'examplejs']);

gulp.task('package:gsr', ['setconfig:prod', 'build'])