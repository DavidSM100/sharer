export function toggle_classes(elems, classes) {
  elems.forEach(function(elem) {
    classes.forEach(function(class_name) {
    elem.classList.toggle(class_name);
    });
  });
}