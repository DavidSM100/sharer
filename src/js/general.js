import { toggle_classes } from './util.js';
import db from './components/localforage.js';

// Toggle receive/send divs and the button styles too
export function toggle_receive_send(btn) {
  if (btn.classList.contains('no_active')) {
    toggle_classes([receiveDiv, sendDiv], ["hidden"]);
    toggle_classes([show_receiveBtn, show_sendBtn], ["no_active", "active"]);
  }
}


// Toggle compress switch imgs
export function switch_compress() {
  toggle_classes([compress_off, compress_on], ["hidden"]);
  const compress = compress_off.classList.contains('hidden');
  db.config.set("compress", compress);
}


export async function set_values() {
  const size_value = await db.config.get("size_value");
  const size_unit = await db.config.get("size_unit");
  const compress = await db.config.get("compress");

  if (size_value) {
    sizeInput.value = size_value;
  }

  if (size_unit) {
    sizeSelect.value = size_unit;
  }

  if (compress === false) {
    switch_compress();
  }

}