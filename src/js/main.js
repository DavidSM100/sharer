import * as util from './util.js';


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


var filesObj = {};
export function processUpdate(payload) {
  const sender = payload.sender;
  const color = sender.split("-")[1];

  const user = payload.user;

  if (payload.files) {
    // info
    const note = payload.note;
    const part_size = payload.part_size;
    const files = payload.files;

    files.forEach(function (file) {
      const id = file.id;
      const name = file.name;
      const type = file.type;
      const size = file.size;
      const total_parts = file.total_parts;
    });

  }

  if (payload.part) {
    // part
    const part = payload.part;

    const state = payload.state;
    const split_state = state.split("/");
    const part_number = split_state[0];
    const total_parts = split_state[1];

    const id = payload.id;
    const splited_id = util.split_id(id);
    const time = splited_id[0];
    const rest = splited_id[1];

    const splited_rest = util.split_id(rest);
    const name = splited_rest[1];

    if (payload.type) {
      // part 1
      const type = payload.type;
    }

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


export function add_files_to_queue() {
  const filesObj = importFiles.files;
  const filesArr = Array.from(filesObj);
  const total_files = filesArr.length;
  if (total_files > 0) {
    const part_size = sizeInput.value * sizeSelect.value;
    const min_size = 1024;//40960;

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
        const name = file.name;
        const type = file.type;
        const size = file.size;
        const time = Date.now();
        const id = time + "-" + file_index + "-" + name;

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

        const file_digits = util.fix_number(`${file_index}`);


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
            info: `${self_name} is sending "${infoString}"`
          }

          const descr = `info: ${infoString}`;

          const updateObj = {
            update: update,
            descr: descr
          }


          util.lf_set(`${Date.now()}${file_digits}`, updateObj, "info_db");

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