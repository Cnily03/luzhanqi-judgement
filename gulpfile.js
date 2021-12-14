const gulp = require("gulp");
const uglifyjs = require("uglify-es");
const $ = {},
    postcss = {};
$.util = require("gulp-util");
$.uglify = require("gulp-uglify");
$.htmlmin = require("gulp-htmlmin");
$.clean = require("gulp-clean");
$.postcss = require("gulp-postcss");
postcss.cssnano = require("cssnano");
postcss.autoprefixer = require("autoprefixer");
const env = (process.env.NODE_ENV || "production").trim();
/* ================================================= */
function reserveComment(node, comment) {
    return /^\!/.test(comment.value);
}
const postcssPlugins = env === "development" ? [postcss.autoprefixer({
    cascade: false
})] : [
    postcss.autoprefixer({
        cascade: false
    }),
    postcss.cssnano
];
const options = {
    uglify: env === "development" ? {
        mangle: false,
        warnings: true,
        output: {
            beautify: true,
            ascii_only: false,
            comments: true
        }
    } : { // production
        mangle: true,
        warnings: true,
        output: {
            ascii_only: true,
            comments: reserveComment
        }
    },
    uglify_es: env === "development" ? {
        mangle: false,
        warnings: true,
        output: {
            beautify: true,
            ascii_only: false,
            comments: true
        },
        compress: {
            ecma: 6
        }
    } : { // production
        mangle: true,
        warnings: true,
        output: {
            ascii_only: true,
            comments: reserveComment
        },
        compress: {
            ecma: 6
        }
    },
    htmlmin: {
        removeComments: env != "development", //清除HTML注释
        collapseWhitespace: false, // 折叠有助于文档树中文本节点的空白
        conservativeCollapse: true, // 保留到1个空格
        ReserveLineBreaks: true, // 保留到1个换行符
        collapseBooleanAttributes: true, // 省略布尔属性的值 <input checked[="true"]/>
        removeEmptyAttributes: true, // 删除所有只有空白值的属性 <input[ id=""] />
        minifyJS: env === "development" ? false : function (text, inline) {
            return uglifyjs.minify(text, options.uglify_es).code;
        },
        minifyCSS: env != "development"
    }
};
// clean
function clean(arr) {
    arr = typeof arr === "string" ? [arr] : arr;
    gulp.src(arr, {
        read: false
    }).pipe($.clean());
}
/* ================================================== */
// javascripts
gulp.task("js", async cb => {
    clean(["./public/js/**/*.js"]);
    // Minify Only
    gulp.src(["./src/js/**/*.js"], {
            base: "./src"
        })
        .pipe($.uglify(options.uglify))
        .pipe(gulp.dest("./public/"));
    cb();
});
// stylesheets
gulp.task("css", async cb => {
    clean(["./public/css/**/*.css"]);
    gulp.src(["./src/css/**/*.css"], {
            base: "./src"
        })
        .pipe($.postcss(postcssPlugins))
        .pipe(gulp.dest("./public/"));
    cb();
});
// html/ejs
gulp.task("html", async cb => {
    clean("./views/**/*.{ejs,html}");
    gulp.src(["./src/views/**/*.{ejs,html}"], {
            base: "./src/views"
        })
        .pipe($.htmlmin(options.htmlmin))
        .pipe(gulp.dest("./views/"));
    cb();
});
gulp.task("watch", () => {
    gulp.watch(["./src/js/**/*.js"], gulp.parallel(["js"]));
    gulp.watch(["./src/css/**/*.css"], gulp.parallel(["css"]));
    gulp.watch(["./src/views/**/*.{ejs,html}"], gulp.parallel(["html"]));
});
gulp.task("default", gulp.parallel(["js", "css", "html"]));