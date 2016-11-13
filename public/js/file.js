'use strict';

const TYPES = [
  // text
  {
    mime: /text\/plain/,
    handler: function(options) {
      const message = document.createElement('div');
      message.classList.add('message')
      message.innerText = options.text;
      messages.appendChild(message);
    }
  },
  // image
  {
    mime: /image\//,
    handler: function(options) {
      const img = document.createElement('img');
      const anchor = document.createElement('a');

      anchor.href = options.data;
      anchor.download = options.filename;
      anchor.appendChild(img);
      img.src = options.data;
      messages.appendChild(anchor);
    }
  },
  // other
  {
    mime: /.*/,
    handler: function(options) {
      const anchor = document.createElement('a');

      anchor.href = options.data;
      anchor.download = options.filename;
      anchor.innerHTML = options.filename;
      messages.appendChild(anchor);
    }
  }
];

// function decodeData(data) {
//   // var blob = new Blob([data], {type: 'application/octet-stream'});
//   // var fileReader = new FileReader();
//   // fileReader.onload = function() {
//   //   const arrayBuffer = fileReader.result;
//   //   debugger;
//   // };
//   // const dataURI = fileReader.readAsArrayBuffer(blob);
//
//   // let type;
//   //
//   // readAs('hex', data, function(text) {
//   // }, 2);
//   //
//   // readAs(, data, function(text) {
//   // }, 2);
//   //
//   // return {
//   //   type: '',
//   //   content: dataURI
//   // }
// }

function readFile(fileContainer, callback) {
  const fileReader = new FileReader();
  var data = fileContainer.data;

  if (data instanceof ArrayBuffer) {
    data = new Blob([data], {type: fileContainer.type || 'application/octet-stream'});
  }

  // if (data instanceof Blob) {
  fileReader.onload = function() {
    fileContainer.data = fileReader.result;
    callback(fileContainer);
  };
  // }

  fileReader.readAsDataURL(data);
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
  }])
}
