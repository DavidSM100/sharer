import db from './components/localforage.js';
import { _zip } from './components/js-zip.js';
import { split_base64, fix_number } from './util.js';
import { self } from './components/components.js';


function get_info(id, file, name) {
  var file_info = {
    id: id,
    name: name,
    size: file.size
  }

  return file_info;
}


function get_parts(parts, id, name, type) {
  const total_parts = parts.length;
  var updates = [];
  for (var i = 0; i < total_parts; i++) {
    const part = parts[i];
    const part_index = part[0];
    const part_data = part[1]

    var update = {
      payload: {
        sender: self,
        file: {
          id: id
        },
        part: {
          data: part_data,
          index: part_index,
          total: total_parts
        }
      }
    }

    if (i === 0) {
      update.payload.file.type = type;
    }

    const part_number = part_index + 1;
    const descr = `part: ${part_number}/${total_parts}, "${name}"`;

    const updateObj = {
      update: update,
      descr: descr
    }


    updates.push(updateObj);

  }

  return updates;
}


async function save_parts(updates, file_digits) {
  const total = updates.length;
  var counter = 0;
  for (var i = 0; i < total; i++) {
    const update = updates[i];

    const part_index = update.update.payload.part.index;
    const part_digits = fix_number(`${part_index}`);
    const key = `${Date.now()}${file_digits}${part_digits}`;
    await db.parts.set(key, update);
    counter += 1;
  }

  if (counter === total) {
    return;
  }
}


async function save_info(infos, total) {

  const update = {
    payload: infos,
    info: `${self.name} is sending ${total} file(s)`
  }

  const descr = `info: ${total} file(s), note: "${infos.note}"`;

  const updateObj = {
    update: update,
    descr: descr
  }


  return await db.infos.set(`${Date.now()}`, updateObj);

}


async function zip(file) {
  const compress = compress_off.classList.contains('hidden');

  const options = {
    type: "base64"
  }

  if (compress === true) {
    options.compression = "DEFLATE";
    options.compressionOptions = {
      level: 9
    };
  }

  return await _zip([{ path: file.name, data: file }], options);
}


async function processFiles(files, part_size) {
  const total = files.length;

  var infos = {
    sender: self,
    part_size: part_size,
    note: noteInput.value,
    files: []
  }

  for (var i = 0; i < total; i++) {
    const file = files[i];
    const time = Date.now();
    const digits = fix_number(`${i}`);
    const name = file.name;

    const id = time + "-" + digits + "-" + name;

    const info = get_info(id, file, name);
    infos.files.push(info);

    const base64 = await zip(file);
    const parts = split_base64(base64, part_size);
    const updates = get_parts(parts, id, name, file.type);
    await save_parts(updates, digits);

    if (i + 1 === total) {
      await save_info(infos, total);

      addFilesDiv.style.display = "none";
      homeDiv.style.display = "block";

    }
  }

}


export default function send_files(filesObj) {
  const filesArr = Array.from(filesObj);

  if (sizeInput.value !== "") {

    const part_size = sizeInput.value * sizeSelect.value;
    const min_size = 40960;

    if (part_size >= min_size) {

      processFiles(filesArr, part_size);

    } else {
      // part_size smaller than min part size
    }

  } else {
    // size value input empty
  }

}