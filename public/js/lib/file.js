'use strict';

function readFile(fileContainer, callback) {
  const fileReader = new FileReader();
  var data = fileContainer.file.data;

  if (data instanceof ArrayBuffer) {
    data = new Blob([data], {type: fileContainer.file.type || 'application/octet-stream'});
  }

  // if (data instanceof Blob) {
  fileReader.onload = function() {
    fileContainer.file.data = fileReader.result;
    console.log('filecontainer type:', fileContainer.type);
    console.log('filecontainer file type:', fileContainer.file.type);
    callback(fileContainer);
  };
  // }

  fileReader.readAsArrayBuffer(data);
}

function onFileChangeHandler(event) {
  const fileElement = event.target;
  const file = fileElement.files[0];

  console.log('onfilechange type:', file.type);
  broadcast([{
    file: {
      filename: file.name,
      data: file,
      type: file.type
    },
    type: file.type
  }]);
}

function fileFromServiceWorker(file) {
  const serviceWorkerPath = '/files/' + file.filename;

  // Send the image data to the service worker with
  // the filename of and the file data
  console.log('sw file type', file.type);
  console.log('about to post message');

  // HAX
  // iframe.contentWindow.navigator.serviceWorker.controller.postMessage(file);

  // OPTION 1
  // navigator.serviceWorker.controller.postMessage(file);

  // OPTION 2
  // navigator.serviceWorker.getRegistration()
  //     .then(function(registration) {
  //       if (!registration.active) {
  //         throw new Error('shit\'s broke son');
  //       }
  //
  //       registration.active.postMessage(file);
  //     })
  // .catch(function() {
  //
  // })
  // ;

  // OPTION 3
  // window.location.reload();

  return serviceWorkerPath;
}
