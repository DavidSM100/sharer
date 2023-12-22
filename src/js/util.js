import localforage from "localforage";
import JSZip from "jszip";
import getRGB from 'consistent-color-generation';


// LocalStorage
export function ls_set(key, item) {
  localStorage.setItem(key, item);
}

export function ls_get(key) {
  return localStorage.getItem(key);
}


// LocalForage
export function lf_db(db_name) {
  return localforage.createInstance({
    name: db_name
  });
}

export async function lf_set(key, item, db_name) {
  const db = lf_db(db_name);
  return await db.setItem(key, item);
}

export async function lf_get(key, db_name) {
  const db = lf_db(db_name);
  return await db.getItem(key);
}

export async function lf_keys(db_name) {
  const db = lf_db(db_name);
  return await db.keys();
}

export async function lf_remove(key, db_name) {
  const db = lf_db(db_name);
  return await db.removeItem(key);
}

export async function lf_key(index, db_name) {
  const db = lf_db(db_name);
  const key = await db.key(index);
  if (key) return [key, db_name];
}


export function toggle_classes(elems, classes) {
  elems.forEach(function (elem) {
    classes.forEach(function (class_name) {
      elem.classList.toggle(class_name);
    });
  });
}


export function getElem(id) {
  return document.getElementById(id);
}

export function createElem(tag) {
  return document.createElement(tag);
}


const selfAddr = window.webxdc.selfAddr;
const selfName = window.webxdc.selfName;

export function self_id() {
  var id = ls_get("self_id");

  if (!id) {
    const time = Date.now();
    const color = getRGB(selfAddr).toString();

    id = time + "-" + color;
    ls_set("self_id", id);
  }

  return id;
}


export function self_name() {
  var name = selfName;
  if (selfName === selfAddr) {
    name = "Anonymous";
  }

  return name;
}


export async function zip(file, options) {
  const zipObj = JSZip();
  zipObj.file(file.name, file);
  return await zipObj.generateAsync(options);
}


export function split_base64(base64, part_size, base64_size, total_parts) {
  var parts = [];
  for (var i = 0; i < total_parts; i++) {
    var start = i * part_size;
    var end = start + part_size;
    if (i + 1 === total_parts) {
      end = base64_size;
    }

    var part = base64.substring(start, end);
    parts.push([i, part]);
  }

  return parts;
}


export function send_update(update, descr) {
  window.webxdc.sendUpdate(update, descr);
}


export function split_id(id) {
  const regex = /^([0-9]+)-(.+)/;
  const match = id.match(regex);
  return [match[1], match[2]];
}


export function fix_number(number) {
  const length = number.length;
  var zeros = "";
  for (var i = length; i < 5; i++) {
    zeros += "0";
  }

  return zeros + number;
}


export function real_size(bytes) {
  var size = bytes / 1048576;
  var unit = "MB";
  if (bytes < 1048576) {
    size = bytes / 1024;
    unit = "KB";
  }
  
  return size.toFixed(2) + " " + unit;
}


export function percent(part, all) {
  return part / all * 100;
}


export function arr(obj) {
  const length = Object.keys(obj).length;
  var arr = [];
  for (var i = 0; i < length; i++) {
    const val = obj[i];
    arr.push(val);
  }
  if (arr.length === length) return arr;
}


export async function unZip(zip) {
  const zipObj = JSZip();
  var options = { base64: true };
  const obj = await zipObj.loadAsync(zip, options);
  const key = Object.keys(obj.files)[0];
  const fileObj = obj.files[key];
  const blob = await fileObj.async("blob");
  return blob;
}


export function send_file(data, name, type) {
  const message = {};
  const file = {};
  file[type] = data;
  file.name = name;
  message.file = file;
  window.webxdc.sendToChat(message);
}