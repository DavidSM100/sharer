import getRGB from 'consistent-color-generation';
import * as util from './util.js';

// Toggle receive/send divs and the button styles too
export function toggle_receive_send(btn) {
  if (btn.classList.contains('no_active')) {
  util.toggle_classes([receiveDiv, sendDiv], ["hidden"]);
  util.toggle_classes([showReceive, showSend], ["no_active", "active"]);
  }
}