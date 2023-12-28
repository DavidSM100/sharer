import * as general from './general.js';
import queue from './queue.js';
import { _listen, _click } from './util.js';
import db from './components/localforage.js';
import { _set_upd, _import } from './components/xdc.js';
import send from './send.js';
import { receive_updates, import_updates, loadUpdates } from './receive.js';

general.set_values();
queue();
loadUpdates();


const filter = {
  multiple: true
}


// Save part size data
_listen("input", sizeInput, function () {
  db.config.set("size_value", this.value);
});

_listen("change", sizeSelect, function () {
  db.config.set("size_unit", this.value);
});


// Switch between send and receive screens
_click(show_receiveBtn, function () {
  general.toggle_receive_send(this);
});

_click(show_sendBtn, function () {
  general.toggle_receive_send(this);
});


// Show the send files screen
_click(add_filesBtn, function () {
  homeDiv.style.display = "none";
  addFilesDiv.style.display = "block";
});

// Close sending div
_click(cancel_sendBtn, function () {
  addFilesDiv.style.display = "none";
  homeDiv.style.display = "block";
});


// Switch compression
_click(switch_compressBtn, general.switch_compress);


// Select updates to import
_click(select_updatesBtn, async function () {
  const updates = await _import(filter);
  import_updates(updates);
});

// Select the files to be send
_click(select_filesBtn, async function () {
  const files = await _import(filter);
  send(files);
});



// Receive updates
_set_upd(receive_updates);