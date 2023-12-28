import { name, addr } from './xdc.js';
import { _encrypt } from './crypto-js.js';
import _color from './color.js';


function _name() {
  var visible_name = name;

  // if there is no name set then visible name will be "Anonymous"
  if (name === addr) {
    visible_name = "Anonymous";
  }

  return visible_name;
}


export const self = {
  id: _encrypt(addr, addr),
  name: _name(),
  color: _color(addr)
}