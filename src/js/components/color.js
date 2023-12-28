import getRGB from 'consistent-color-generation';

export default function _color(string) {
  return getRGB(string).toString();
}