var files = new Map();

this.addEventListener('message', function(event) {
  console.log('message filename:', event.data.filename);
  const filename = event.data.filename;
  delete event.data.filename;
  files.set(filename, event.data);
});


this.addEventListener('install', function(e) {
  const getCaches = caches.open('shell-v1').then(function(cache) {
    return cache.addAll([]);
  });

  e.waitUntil(getCaches);
});

this.addEventListener('fetch', function(e) {
  var response;

  var urlParser = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;

  var matches = urlParser.exec(e.request.url);
  // match[13] is path
  var path = matches[13];
  var filename = path.replace('/files/', '');

  console.log('url', e.request.url);
  console.log('filename:', filename);
  console.log('has?', files.has(filename));
  console.log('dhas?', files.has(decodeURIComponent(filename)));
  if (files.has(decodeURIComponent(filename))) {
    const file = files.get(decodeURIComponent(filename));
    const headers = new Headers();
    console.log('content type - file type:', file.type);
    headers.append('Content-Type', file.type);
    var blob = new Blob([file.data]);
    response = new Response(blob, {
      status: 200,
      statusText: 'OK',
      headers: headers
    });
  } else {
    response = caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    }).catch(function() {
      return caches.match('/fallback.html');
    });
  }

  e.respondWith(response);

});
