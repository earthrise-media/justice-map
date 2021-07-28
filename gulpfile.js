'use strict';

let gulp = require('gulp'),
    plugins = require('gulp-load-plugins')({
        pattern: ['gulp-*', 'gulp.*', 'browserify', 'watchify', 'del', 'ip', 'opn', 'semver', 'tsify', 'yargs', 'beeper', 'babelify'],
        replaceString: /\bgulp[\-.]/
    }),
    browserSync = require("browser-sync").create(),
    connect = require('gulp-connect-php'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    fancy_log = require('fancy-log'),
    argv = plugins.yargs.argv,
    config = require('./gulp-config.json'),
    pkg = require('./package.json'),
    paths = config.paths;

function errorHandler() {
    plugins.util.beep();
    console.log('\x07');
    return true;
}


function stylesDefault() {
    return gulp.src(paths.sass.main)
        .pipe(plugins.if(!argv.release, plugins.sourcemaps.init()))
        .pipe(plugins.sass({ outputStyle: 'compressed' }).on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer({ 'remove': false }))
        .pipe(plugins.if(!argv.release, plugins.sourcemaps.write()))
        .pipe(plugins.rename('styles.css'))
        .pipe(plugins.size())
        .pipe(gulp.dest(paths.sass.dest))
        .pipe(browserSync.stream())
        .pipe(plugins.notify('Main styles ready!'));
}


// // Copy fonts

function fonts() {
    return gulp.src(paths.fonts.source)
        .pipe(plugins.newer(paths.fonts.dest))
        .pipe(gulp.dest(paths.fonts.dest))
        .pipe(plugins.notify({ message: 'Fonts copied!', onLast: true }));
}



// // Favicons

function favicons() {
    return gulp.src(paths.favicons.source)
        .pipe(gulp.dest(paths.favicons.dest))
        .pipe(plugins.notify({ message: 'Favicons copied!', onLast: true }));
}



// // Libs

function modernizr() {
    return gulp.src([paths.scripts.ts, "src/scss/**/*.scss" ])
        .pipe(plugins.modernizr('modernizr-custom.js', {
            options: [
                'setClasses'
            ],
            classPrefix : 'modernizr-'
        }))
        .pipe(gulp.dest(paths.scripts.plugins.replace('*.js', '')));
}

function libs() {
    const libFiles = paths.scripts.libs.concat(paths.scripts.plugins);
    return gulp.src(libFiles)
        .pipe(plugins.expectFile(libFiles))
        .pipe(plugins.concat('libs.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(plugins.notify('Libs ready!'));
}


function connectServer() {
    return connect.server({}, function (){
        browserSync.init({
            open: true,
            ghostMode: false,
            proxy: 'localhost:8000',
        });
      });
}


// Scripts
let bundler = plugins.browserify({
    basedir: '.',
    debug: !argv.release,
    entries: [paths.scripts.mainTs],
    cache: {},
    packageCache: {},
    plugin: [plugins.tsify],
});


function bundle() {
    return bundler
    // .transform(plugins.babelify, {
    //     presets: ['es2015'],
    //     extensions: ['.ts']
    // })
    .bundle()
    .on('error', function (err) {fancy_log.error(err); this.emit('end');})
    .pipe(source('scripts.min.js'))
    .pipe(buffer())
    .pipe(plugins.sourcemaps.init({loadMaps: true}))
    .pipe(plugins.if(argv.release, plugins.uglify()))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(plugins.notify('Bundle scripts ready!'));
}

function watchBundle() {
    const watchBundler = plugins.browserify({
        basedir: '.',
        debug: true,
        entries: [paths.scripts.mainTs],
        cache: {},
        packageCache: {},
        plugin: [plugins.tsify],
    });

    const rebundle = () => {
        fancy_log('start rebundle');
        return watchBundler
        // .transform('babelify', {
        //     presets: ['es2015'],
        //     extensions: ['.ts']
        // })
        .bundle()
        .on('error', fancy_log.error)
        .pipe(source('scripts.min.js'))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(browserSync.stream())
        .pipe(plugins.notify('Bundle scripts ready!'));
    };

    watchBundler.plugin(
        plugins.watchify, {
            delay: 100,
            ignoreWatch: ['**/node_modules/**'],
            poll: false
        }
    );

    watchBundler.on('update', rebundle);
    watchBundler.on('log', fancy_log);


    return rebundle();
}




// Clean

function cleanImages() {
    return plugins.del([paths.images.dest], {
        force: true
    });
}

function clean() {
    return plugins.del([
        paths.sass.dest,
        paths.scripts.dest,
        paths.images.dest,
        paths.fonts.dest,
        paths.videos.dest
    ], {
        force: true
    });
}



// // Images

function imagemin() {
    return gulp.src(paths.images.source)
        .pipe(plugins.newer(paths.images.dest))
        .pipe(plugins.imagemin())
        .pipe(gulp.dest(paths.images.dest))
        .pipe(plugins.notify({ message: 'Images minified successfuly!', onLast: true }));
}


function imagesToWebp() {
    return gulp.src(paths.images.source)
        .pipe(plugins.webp())
        .pipe(gulp.dest(paths.images.dest))
        .pipe(plugins.notify({ message: 'Images converted to webp successfuly!', onLast: true }));
}

// // Video

function videos() {
    return gulp.src(paths.videos.source)
        .pipe(plugins.newer(paths.videos.dest))
        .pipe(gulp.dest(paths.videos.dest))
        .pipe(plugins.notify({ message: 'Videos ready!', onLast: true }));
}


// Test

function test() {
    const url = pkg.homepage;
    plugins.opn('https://developers.google.com/speed/pagespeed/insights/?url='+url);
    plugins.opn('https://validator.w3.org/nu/?doc=http%3A%2F%2F'+url);
    plugins.opn('http://realfavicongenerator.net/favicon_checker?ignore_root_issues=on&site='+url);
    plugins.opn('https://developers.facebook.com/tools/debug/og/object?q=http%3A%2F%2F'+url);
    plugins.opn('https://cards-dev.twitter.com/validator');
    plugins.opn('https://www.w3.org/2003/12/semantic-extractor.html');
    plugins.opn('https://gtmetrix.com/');
    plugins.opn('http://www.webpagetest.org/compare');
    plugins.opn('http://www.webpagetest.org/mobile');
    plugins.opn('http://loads.in/');
    plugins.opn('https://varvy.com/');
    plugins.opn('https://sonarwhal.com/scanner');
    plugins.opn('https://gsnedders.html5.org/outliner/process.py?url=http%3A%2F%2F'+url);
    plugins.opn('http://wave.webaim.org/report#/'+url);
    plugins.opn('https://securityheaders.io/?q='+url+'&followRedirects=on');
    plugins.opn('https://pageweight.imgix.com/');
    plugins.opn('http://www.checkmycolours.com/');
    plugins.opn('http://achecker.ca/checker/');
}



// Bump Version

function bump() {
    let newVer = !!argv.release ? plugins.semver.inc(pkg.version, 'patch') : pkg.version;

    gulp.src(['./index.html'], {allowEmpty:true})
        .pipe(plugins.replace(/\?v=([^\"]+)/g,'?v='+newVer))
        .pipe(gulp.dest('./'));


    gulp.src(['./src/scss/main.scss'])
        .pipe(plugins.replace(/Version: (\d+\.\d+\.\d+)/g,'Version: '+newVer))
        .pipe(gulp.dest('./src/scss/'));

    return gulp.src(['./package.json'])
        .pipe(plugins.if(argv.release, plugins.bump({
            version: newVer
        })))
        .pipe(gulp.dest('./'));
}



// Init clean

function init() {

    gulp.src(['./package.json'])
        .pipe(plugins.bump({
            version: '0.0.0'
        }))
        .pipe(gulp.dest('./'));

    return plugins.del([
        '../src/fonts/**/*',
        '../src/images/favicons/*',
        '../src/scss/includes/components/*.scss',
        '../src/scss/includes/scaffold/*.scss',
        '../src/ts/App.ts',
        '../src/ts/components/*.ts'
    ], {
        force: true
    });
}



// Watch

function watch() {
    connectServer();
    gulp.watch(paths.html.main).on('change', browserSync.reload );
    gulp.watch(paths.styles.main, stylesDefault);
    gulp.watch(paths.images.source, imagemin);
    gulp.watch(paths.images.source);
    watchBundle();
}


exports.styles = gulp.series(stylesDefault);
exports.scripts = bundle;
exports.test = test;
exports.init = init;
exports.videos = videos;
exports.libs = gulp.series(libs);
exports.bump = bump;
exports.images = gulp.series(cleanImages, imagemin);
exports.default = gulp.series(clean, exports.styles, exports.libs, exports.scripts, exports.images, fonts, favicons, bump);
exports.watch = gulp.series(exports.default, watch);
