import * as main from './main.js';

showReceive.addEventListener("click", function () {
  main.toggle_receive_send(this);
});

showSend.addEventListener("click", function () {
  main.toggle_receive_send(this);
});