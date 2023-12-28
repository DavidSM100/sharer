const xdc = window.webxdc;

export const addr = xdc.selfAddr;
export const name = xdc.selfName;

export function _msg(message) {
  xdc.sendToChat(message);
}

export function _upd(update, descr) {
  xdc.sendUpdate(update, descr);
}

export function _set_upd(func) {
  xdc.setUpdateListener(function (update) {
    func(update);
  });
}


export async function _import(filter) {
  return await xdc.importFiles(filter);
}