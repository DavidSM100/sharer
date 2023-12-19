import * as util from './util.js';


var sizeValue = localStorage.getItem("sizeValue");
if (sizeValue) {
  sizeInput.value = sizeValue;
}

var sizeUnit = localStorage.getItem("sizeUnit");
if (sizeUnit) {
  sizeSelect.value = sizeUnit;
}


// Toggle receive/send divs and the button styles too
export function toggle_receive_send(btn) {
  if (btn.classList.contains('no_active')) {
    util.toggle_classes([receiveDiv, sendDiv], ["hidden"]);
    util.toggle_classes([show_receive, show_send], ["no_active", "active"]);
  }
}


// Toggle compress switch imgs
export function switch_compress() {
  util.toggle_classes([compress_off, compress_on], ["hidden"]);
}