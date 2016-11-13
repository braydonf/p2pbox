'use strict';

const input = document.querySelector('#input');
const messages = document.querySelector('#messages');

var submitClickHandler;

function formSubmitHandler(event) {
  event.preventDefault();
  input.value = '';
}