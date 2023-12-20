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

      filesArr.forEach(async function (file, index) {
        const name = file.name;
        const type = file.type;
        const size = file.size;
        const time = Date.now();
        const id = time + "-" + name;

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

        parts.forEach(function (part, index) {
          const part_number = index + 1;
          const state = `${part_number}/${total_parts}`;

          var update = {
            payload: {
              sender: self_id,
              user: self_name,
              id: id,
              part: part,
              state: state
            }
          }

          if (index === 0) {
            update.payload.type = type;
          }

          const descr = `part: ${state}, "${name}"`;

          const updateObj = {
            update: update,
            descr: descr
          }

          const key = `${Date.now()}-${part_number}`;

          util.lf_set(key, updateObj, "parts_db");

        });

        if (index + 1 === total_files) {
          var infoString = `${total_files} file(s)`;
          if (total_files === 1) {
            infoString = name;
          }

          const update = {
            payload: filesInfo,
            info: `${self_name} is sending "${infoString}"`
          }

          const descr = `info: "${infoString}"`;

          const updateObj = {
            update: update,
            descr: descr
          }


          util.lf_set(`${Date.now()}`, updateObj, "info_db");

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
  var db_name = "info_db";
  var keys = await util.lf_keys(db_name);

  if (keys.length === 0) {
    db_name = "parts_db";
    keys = await util.lf_keys(db_name);
  }

  if (keys.length > 0) {
    const id = keys[0];
    const updateObj = await util.lf_get(id, db_name);
    
    util.send_update(updateObj.update, updateObj.descr);
    await util.lf_remove(id, db_name);
    queue();
  } else {
    queue();
  }
}

async function queue() {
  setTimeout(send, 15000);
}

queue();