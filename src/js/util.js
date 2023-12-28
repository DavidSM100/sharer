export function toggle_classes(elems, classes) {
  elems.forEach(function (elem) {
    classes.forEach(function (class_name) {
      elem.classList.toggle(class_name);
    });
  });
}


export function _listen(action, elem, func) {
  return elem.addEventListener(action, func);
}

export function _click(elem, func) {
  return _listen("click", elem, func);
}


export function getElem(id) {
  return document.getElementById(id);
}

export function createElem(tag) {
  return document.createElement(tag);
}



export function split_base64(base64, part_size) {
  const size = base64.length;
  const total = Math.ceil(size / part_size);
  var parts = [];
  for (var i = 0; i < total; i++) {
    var start = i * part_size;
    var end = start + part_size;
    if (i + 1 === total) {
      end = size;
    }

    var part = base64.substring(start, end);
    parts.push([i, part]);
  }

  return parts;

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
  
  if (bytes < 1024) {
    size = bytes;
    unit = "B";
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

  return arr;
}

export function split_id(id) {
  const regex = /^([0-9]+)-[0-9]+-(.+)$/;
  return id.match(regex);
}