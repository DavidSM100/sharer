import { _decrypt } from './components/crypto-js.js';
import * as util from './util.js';
import { _unZip, _toType } from './components/js-zip.js';
import assets from './assets.js';
import { addr, _msg } from './components/xdc.js';
import db from './components/localforage.js';

async function createUIElem(id) {
  const obj = filesObj[id];
  const sender = obj.sender;
  const name = obj.name;
  const total = obj.total;

  const senderAddr = _decrypt(sender.id, addr);

  var div_id = "receivedDiv";


  if (senderAddr) {
    div_id = "sendedDiv";
  }

  const div = util.getElem(div_id);

  var elem = util.getElem(id);
  if (!elem) {
    elem = util.createElem('div');
    elem.id = id;
    elem.classList.add('elem');

    if (!senderAddr) {
      var sender_name = util.createElem('div');
      sender_name.innerHTML = `<b style="color:${sender.color}">${sender.name}</b>`;
      sender_name.classList.add('elem-sender');
      sender_name.classList.add('hide_rest');
      elem.appendChild(sender_name);
    }


    var progressBar = util.createElem('div');
    progressBar.id = `${id}-progressBar`;
    progressBar.classList.add('elem-progressBar');

    var progress = util.createElem('div');
    progress.id = `${id}-progress`;
    progress.classList.add('elem-progress');
    progressBar.appendChild(progress);
    elem.appendChild(progressBar);


    var file_name = util.createElem('div');
    file_name.classList.add('elem-name');
    file_name.classList.add('hide_rest');
    file_name.innerHTML = name;
    elem.appendChild(file_name);

    var infoDiv = util.createElem('div');
    infoDiv.id = `${id}_info`;

    var actionsDiv = util.createElem('div');
    actionsDiv.id = `${id}_actions`;
    actionsDiv.classList.add('elem-actions');
    var noteDiv = util.createElem('div');
    noteDiv.classList.add('elem-note');
    noteDiv.id = `${id}-note`;
    elem.appendChild(infoDiv);
    elem.appendChild(actionsDiv);
    elem.appendChild(noteDiv);
    div.appendChild(elem);
  }


  var size = obj.size;
  if (size) {
    // info
    var size_elem = util.getElem(`${id}-size`);
    if (!size_elem) {
      var infoDiv = util.getElem(`${id}_info`);
      size_elem = util.createElem('div');
      size_elem.id = `${id}-size`;
      var real_size = util.real_size(size);
      size_elem.innerHTML = real_size;
      size_elem.classList.add('elem-size');
      infoDiv.appendChild(size_elem);
    }
  }

  if (obj.note) {
    var noteDiv = util.getElem(`${id}-note`);
    noteDiv.innerHTML = obj.note;
  }

  var parts = obj.parts;
  var length = Object.keys(parts).length;

  if (length > 0) {
    // part
    var progress = util.getElem(`${id}-progress`);
    const percent = util.percent(length, total) + "%";
    progress.style.width = percent;


    if (length === total) {
      var progressBar = util.getElem(`${id}-progressBar`);
      const partsArr = util.arr(parts);
      const base64 = partsArr.join('');

      const zipObj = await _unZip(base64, { base64: true });
      const fileObj = zipObj.files[name];
      const blob = await _toType(fileObj, "blob");
      const file = new File([blob], name, { type: obj.type });

      var actions_div = util.getElem(`${id}_actions`);

      var share_btn = util.createElem('button');
      share_btn.id = `${id}-share`;

      const msg = {
        file: {
          blob: file,
          name: file.name
        }
      }

      share_btn.onclick = function () {
        _msg(msg);
      }

      var share_img = util.createElem('img');
      share_img.src = assets.imgs.share;
      share_btn.appendChild(share_img);
      actions_div.appendChild(share_btn);

      elem.removeChild(progressBar);

    }

  }

}

function add_info(payload, sender) {
  const files = payload.files;
  const part_size = payload.part_size;
  const note = payload.note;
  const total = files.length;

  var ids = [];
  for (var i = 0; i < total; i++) {
    const file = files[i];
    const id = file.id;
    filesObj[id] = filesObj[id] || {};
    var obj = filesObj[id];
    obj.parts = obj.parts || {};

    obj.id = id;
    obj.sender = sender;
    obj.note = note;
    obj.part_size = part_size;
    obj.name = file.name;
    obj.size = file.size;
    ids.push(id);
  }

  if (ids.length === total) {
    return ids;
  }
}

function add_part(payload, sender) {
  const id = payload.file.id;

  filesObj[id] = filesObj[id] || {};
  var obj = filesObj[id];
  obj.parts = obj.parts || {};

  const split_id = util.split_id(id);

  obj.id = id;
  obj.sender = sender;
  obj.time = split_id[1];
  obj.name = split_id[2];
  obj.parts[payload.part.index] = payload.part.data;
  obj.total = payload.part.total;
  obj.type = payload.file.type;

  return id;
}


function createUIElems(ids) {
  ids.forEach(function (id) {
    createUIElem(id);
  });
}


var filesObj = {};
function processUpdate(update) {
  const payload = update.payload;
  const sender = payload.sender;

  if (payload.files) {
    // info
    const ids = add_info(payload, sender)
    createUIElems(ids);
  }

  if (payload.part) {
    // part
    const id = add_part(payload, sender);
    createUIElem(id);
  }

}


export function receive_updates(update) {
  processUpdate(update);
}

async function get_updates(file) {
  const jsonString = await file.text();
  return JSON.parse(jsonString).updates;
}

export function import_updates(updates) {
  updates.forEach(async function (updateFile) {
    if (updateFile.name.endsWith('.json')) {
      const updates = await get_updates(updateFile);
      updates.forEach(async function (update) {

        await db.updates.set(`${Date.now()}`, update);
        processUpdate(update);
      });
    }
  });
}

export function loadUpdates() {
  const _db = db.updates.db();
  _db.iterate(function (value, key) {
    processUpdate(value);
  });
}
