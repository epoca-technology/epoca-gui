const { src, dest, task } = require('gulp');
const replace = require('gulp-replace');





/* PRE-BUILD */




/*
* Inserts the service worker into the src directory so it is included in the build.
* @param env dev|prod
* */
function insertServiceWorker(env) {
    return src('./service-worker/' + env +'/firebase-messaging-sw.js')
        .pipe(dest('./src'));
}



/* PRE-BUILD TASK */
task('preBuildDev', function(cb) {
    insertServiceWorker('dev');
    cb();
});

task('preBuildProd', function(cb) {
    insertServiceWorker('prod');
    cb();
});







/* POST-BUILD */




/*
* Replaces the begining of the onFetch function in the service worker in order to avoid a bug found in
* Safari/IOS.
*
* The error thrown when attempting to upload is:
* Firebase Storage: An unknown error ocurred, please check the error payload for server response.
* (storage/unknown) Multipart body does not contain 2 or 3 parts.
*
* We only saw this error in Safari/IOS, other OS/Browsers seem to be functioning normally.
* */
function removeFirebaseStorageFromSWOnFetch(env) {
    return src(['./dist/gui-' + env + '/ngsw-worker.js'])
        .pipe(replace(
            'onFetch(event) {',
            `onFetch(event) {
            if (event.request.url.indexOf('firebasestorage.googleapis.com') !== -1) { return; }`
            )
        )
        .pipe(dest('./dist/gui-' + env));
}









/* POST-BUILD TASK */
task('postBuildDev', function(cb) {
    removeFirebaseStorageFromSWOnFetch('development');
    cb();
});
task('postBuildProd', function(cb) {
    removeFirebaseStorageFromSWOnFetch('production');
    cb();
});
