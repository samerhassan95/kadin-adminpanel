import getImageUrl from './getImageUrl';

export default function createImage(name) {
  return {
    name,
    url: getImageUrl(name),
  };
}
