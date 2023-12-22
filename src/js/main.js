import * as util from './util.js';
import shareSvg from '../img/share.svg';

const self_id = util.self_id();
const self_name = util.self_name();


// Set saved part size data
var sizeValue = util.ls_get("sizeValue");
if (sizeValue) {
  sizeInput.value = sizeValue;
}

var sizeUnit = util.ls_get("sizeUnit");
if (sizeUnit) {
  sizeSelect.value = sizeUnit;
}


async function createUIElem(id) {
  const fileObj = filesObj[id];
  //console.log(fileObj);

  const user = fileObj.user;
  const sender = fileObj.sender;
  const color = fileObj.color;
  const name = fileObj.name;
  const total_parts = fileObj.total_parts;

  var div_id = "receivedDiv";

  if (sender === self_id) {
    div_id = "sendedDiv";
  }

  const div = util.getElem(div_id);

  var elem = util.getElem(id);
  if (!elem) {
    elem = util.createElem('div');
    elem.id = id;
    elem.classList.add('elem');

    if (sender !== self_id) {
      var sender_name = util.createElem('div');
      sender_name.innerHTML = `<b style="color:${color}">${user}</b>`;
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
    elem.appendChild(infoDiv);
    elem.appendChild(actionsDiv)
    div.appendChild(elem);
  }


  var size = fileObj.size;
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

  var parts = fileObj.parts;
  var length = Object.keys(parts).length;

  if (length > 0) {
    // part
    var progress = util.getElem(`${id}-progress`);
    const percent = util.percent(length, total_parts) + "%";
    progress.style.width = percent;

    if (length === 1) {
      // first part
    }


    if (`${length}` === total_parts) {
      const partsArr = util.arr(parts);
      const base64 = partsArr.join('');
      const blob = await util.unZip(base64);
      const file = new File([blob], name, { type: fileObj.type });

      var actions_div = util.getElem(`${id}_actions`);

      const share_btn = util.createElem('button');
      share_btn.onclick = function () {
        util.send_file(file, name, "blob");
      }
      var share_img = util.createElem('img');
      share_img.src = shareSvg;
      share_btn.appendChild(share_img);
      actions_div.appendChild(share_btn);
      const progressBar = util.getElem(`${id}-progressBar`);
      elem.removeChild(progressBar);
    }

  }

}


var filesObj = {};
export function processUpdate(payload) {
  const sender = payload.sender;
  const color = sender.split("-")[1];
  const user = payload.user;

  if (payload.files) {
    // info
    const files = payload.files;
    var counter = 0;
    files.forEach(function (file) {
      const id = file.id;
      filesObj[id] = filesObj[id] || {};
      var fileObj = filesObj[id];
      fileObj.parts = fileObj.parts || {};

      fileObj.sender = sender;
      fileObj.color = color;
      fileObj.user = user;
      fileObj.note = payload.note;
      fileObj.id = id;
      fileObj.name = file.name;
      fileObj.type = file.type;
      fileObj.size = file.size;
      fileObj.part_size = payload.part_size;
      fileObj.total_parts = file.total_parts;

      counter += 1;
      if (counter === files.length) {
        console.log(filesObj);
        createUIElem(id);
      }
    });

  }

  if (payload.part) {
    // part
    const id = payload.id;
    filesObj[id] = filesObj[id] || {};
    var fileObj = filesObj[id];
    fileObj.parts = fileObj.parts || {};

    const state = payload.state;
    const split_state = state.split("/");

    const splited_id = util.split_id(id);
    const rest = splited_id[1];
    const splited_rest = util.split_id(rest);

    fileObj.sender = sender;
    fileObj.color = color;
    fileObj.user = user;
    fileObj.id = id;
    fileObj.time = splited_id[0];
    fileObj.name = splited_rest[1];
    fileObj.total_parts = split_state[1];

    if (payload.type) {
      // part 1
      fileObj.type = payload.type;
    }

    fileObj.parts[split_state[0] - 1] = payload.part;

    createUIElem(id);
  }

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


function partsUpdates(parts) {
  
}

export function add_files_to_queue() {
  const filesObj = importFiles.files;
  const filesArr = Array.from(filesObj);
  const total_files = filesArr.length;
  if (total_files > 0) {
    const part_size = sizeInput.value * sizeSelect.value;
    const min_size = 40960;

    if (part_size >= min_size) {
      const compress = compress_off.classList.contains('hidden');
      const note = noteInput.value;


      var filesInfo = {
        part_size: part_size,
        note: note,
        sender: self_id,
        user: self_name,
        files: []
      }

      filesArr.forEach(async function (file, file_index) {
        const type = file.type;
        const size = file.size;
        const time = Date.now();
        const file_digits = util.fix_number(`${file_index}`);
        const name = file.name;
        const id = time + "-" + file_digits + "-" + name;

        const options = {
          type: "base64"
        }

        if (compress === true) {
          options.compression = "DEFLATE";
          options.compressionOptions = {
            level: 9
          };
        }

        const zip = await util.zip(file, options);

        const zip_size = zip.length;

        const total_parts = Math.ceil(zip_size / part_size);

        var fileInfo = {
          name: name,
          type: type,
          size: size,
          total_parts: total_parts,
          id: id
        }

        filesInfo.files.push(fileInfo);



        const parts = util.split_base64(zip, part_size, zip_size, total_parts);


        parts.forEach(function (part) {
          const part_index = part[0];
          const part_number = part_index + 1;
          const state = `${part_number}/${total_parts}`;

          var update = {
            payload: {
              sender: self_id,
              user: self_name,
              id: id,
              part: part[1],
              state: state
            }
          }

          if (part_index === 0) {
            update.payload.type = type;
          }

          const descr = `part: ${state}, "${name}"`;

          const updateObj = {
            update: update,
            descr: descr
          }

          const part_digits = util.fix_number(`${part_index}`);

          const key = `${Date.now()}${file_digits}${part_digits}`;

          util.lf_set(key, updateObj, "parts_db");

        });

        if (file_index + 1 === total_files) {
          var infoString = `${total_files} file(s)`;
          if (total_files === 1) {
            infoString = `"${name}"`;
          }

          const update = {
            payload: filesInfo,
            info: `${self_name} is sending ${infoString}`
          }

          console.log(update);

          const descr = `info: ${infoString}`;

          const updateObj = {
            update: update,
            descr: descr
          }


          util.lf_set(`${Date.now()}${file_digits}`, updateObj, "info_db");

          addFilesDiv.style.display = "none";
          homeDiv.style.display = "block";

        }


      });

    } else {
      // part_size smaller than min part size
    }

  } else {
    // no files selected
  }
}


async function send() {
  const key = await util.lf_key(0, "info_db") || await util.lf_key(0, "parts_db") || "none";

  if (key === "none") {
    queue();
  } else {
    const id = key[0];
    const db_name = key[1];

    const updateObj = await util.lf_get(id, db_name);
    util.send_update(updateObj.update, updateObj.descr);

    await util.lf_remove(id, db_name);
    queue();
  }

}

async function queue() {
  setTimeout(send, 15000);
}

queue();