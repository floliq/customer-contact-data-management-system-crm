const {
  src,
  dest,
  series,
  watch,
} = require('gulp');
const concat = require('gulp-concat');
const htmlMin = require('gulp-htmlmin');
const autoprefixes = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const svgSprite = require('gulp-svg-sprite');
const image = require('gulp-image');
const babel = require('gulp-babel');
const notify = require('gulp-notify');
const uglify = require('gulp-uglify-es').default;
const soursemaps = require('gulp-sourcemaps');
const del = require('del');
const browserSync = require('browser-sync').create();
const pug = require('gulp-pug');
const sass = require('gulp-sass')(require('sass'));

const clean = () => del(['dist']);
const favicon = () => src('src/**/*.ico').pipe(dest('dist'));

const pugToHTML = () => src('src/**/*.pug')
  .pipe(
    pug({
      doctype: 'html',
      pretty: true,
    }),
  )
  .pipe(dest('src'));

const SASSToCSS = () => src('src/css/**/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(dest('src/css'));

const fonts = () => src('src/fonts/**').pipe(dest('dist/fonts'));

const resourses = () => src('src/libs/**').pipe(dest('dist/libs'));

const styles = () => src('src/css/**/*.css')
  .pipe(soursemaps.init())
  .pipe(
    autoprefixes({
      cascade: false,
    }),
  )
  .pipe(
    cleanCSS({
      level: 2,
    }),
  )
  .pipe(soursemaps.write())
  .pipe(dest('dist/css'))
  .pipe(browserSync.stream());

const htmlMinify = () => src('src/**/*.html')
  .pipe(
    htmlMin({
      collapseWhitespace: true,
    }),
  )
  .pipe(dest('dist'), dest('dev'))
  .pipe(browserSync.stream());

const svgSprites = () => src('src/img/**/*.svg')
  .pipe(
    svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg',
        },
      },
    }),
  )
  .pipe(dest('dist/img'), dest('src/img'));

const scripts = () => src('src/js/**/*.js')
  .pipe(soursemaps.init())
  .pipe(
    babel({
      presets: ['@babel/env'],
    }),
  )
  .pipe(concat('script.js'))
  .pipe(uglify().on('error', notify.onError()))
  .pipe(soursemaps.write())
  .pipe(dest('dist/js'), dest('dev/js'))
  .pipe(browserSync.stream());

const images = () => src([
  'src/img/**/*.jpg',
  'src/img/**/*.svg',
  'src/img/**/*.png',
  'src/img/**/*.jpeg',
  'src/img/**/*.webp',
])
  .pipe(image())
  .pipe(dest('dist/img'));

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: 'dist',
    },
  });
};

watch('src/**/*.html', htmlMinify);
watch('src/**/*.pug', pugToHTML);
watch('src/css/**/*.scss', SASSToCSS);
watch('src/css/**/*.css', styles);
watch('src/img/**/*.svg', svgSprites);
watch('src/js/**/*.js', scripts);
watch('src/fonts/**', fonts);
watch('src/libs/**', resourses);
watch('src/img/**', images);

exports.styles = styles;
exports.scripts = scripts;
exports.htmlMinify = htmlMinify;
exports.clean = clean;
exports.dev = series(
  clean,
  pugToHTML,
  favicon,
  fonts,
  resourses,
  svgSprites,
  htmlMinify,
  scripts,
  SASSToCSS,
  styles,
  images,
  watchFiles,
);
exports.default = series(
  clean,
  fonts,
  resourses,
  htmlMinify,
  scripts,
  styles,
  images,
  svgSprites,
  watchFiles,
);
