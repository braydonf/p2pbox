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
