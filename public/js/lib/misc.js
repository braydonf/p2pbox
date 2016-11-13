function random(size) {
  if (!window.crypto && !window.msCrypto)
    throw new Error('window.crypto not available');

  if (window.crypto && window.crypto.getRandomValues)
    var crypto = window.crypto;
  else if (window.msCrypto && window.msCrypto.getRandomValues) //internet explorer
    var crypto = window.msCrypto;
  else
    throw new Error('window.crypto.getRandomValues not available');

  var buf = new Uint8Array(size);
  crypto.getRandomValues(buf);

  return String(buf.map(function(int) {
    return int.toString(16);
  }).join(''));
}
