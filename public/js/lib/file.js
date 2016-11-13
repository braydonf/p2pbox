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
    callback(fileContainer);
  };
  // }

  fileReader.readAsArrayBuffer(data);
}

function onFileChangeHandler(event) {
  const fileElement = event.target;
  const file = fileElement.files[0];

  broadcast([{
    file: {
      filename: file.name,
      data: file
    },
    type: file.type
  }]);
}
