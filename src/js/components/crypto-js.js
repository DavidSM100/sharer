import aes from 'crypto-js/aes.js';
import enc_utf8 from 'crypto-js/enc-utf8';


const CryptoJS = {
  AES: aes,
  enc: {
    Utf8: enc_utf8
  }
}


export function _encrypt(data, key) {
  return CryptoJS.AES.encrypt(data, key).toString();
}

export function _decrypt(ciphertext, key) {
  return CryptoJS.AES.decrypt(ciphertext, key).toString(CryptoJS.enc.Utf8);
}