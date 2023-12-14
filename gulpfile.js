const gulp = require('gulp');
const ts = require('gulp-typescript');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const del = require('del');

// Load TypeScript configuration
const tsProject = ts.createProject('tsconfig.json');

// Paths to various files
const paths = {
  scripts: ['app/src/**/*.ts', '!app/src/**/*.spec.ts', 'app/src/components/start-app/start-app.component.ts', 'app/src/boot/boot.ts', 'app/src/users/components/user-details/user-details.component.ts', 'app/src/users/components/users-list/users-list.component.ts', 'app/src/users/services/users-data.service.ts', 'app/src/users/users.ts'],
  styles: ['app/assets/*.css'],
  // Add paths to other assets like images, fonts, etc.
};

// Cleans the dist directory
function clean() {
  return del(['dist']);
}

// Process, compile, and concatenate TypeScript scripts
function scripts() {
  return tsProject.src()
    .pipe(tsProject())
    .js
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
}

// Process, minify and concatenate styles
function styles() {
  return gulp.src(paths.styles)
    .pipe(concat('app.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css'));
}

// Copy additional assets to dist
function copyAssets() {
  // Add tasks to copy other assets like images, fonts, etc.
  // Example: return gulp.src('app/assets/**/*').pipe(gulp.dest('dist/assets'));
}

// Define complex tasks
const build = gulp.series(clean, gulp.parallel(styles, scripts, copyAssets));

// Export tasks
exports.clean = clean;
exports.scripts = scripts;
exports.styles = styles;
exports.build = build;
exports.default = build;
