export function toggle_classes(elems, classes) {
  elems.forEach(function(elem) {
    classes.forEach(function(class_name) {
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