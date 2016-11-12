'use strict';

function onFileChangeHandler(event) {
  const fileElement = event.target;
  const file = fileElement.files[0];
  broadcast(file);
}