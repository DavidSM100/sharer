import JSZip from 'jszip';


function _add(items, zipObj) {
  for (var i = 0; i < items.length; i++) {
    const item = items[i];
    zipObj.file(item.path, item.data);
  }

  return zipObj;
}

export async function _zip(items, options) {
  var zipObj = JSZip();
  zipObj = _add(items, zipObj);
  return await zipObj.generateAsync(options);
}


export async function _unZip(zip, options) {
  var zipObj = JSZip();
  return await zipObj.loadAsync(zip, options)
}

export async function _toType(itemObj, type) {
  return await itemObj.async(type);
}