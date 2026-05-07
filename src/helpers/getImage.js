import placeholder from '../assets/images/placeholder.jpeg';
import getImageUrl from './getImageUrl';

export default function getImage(url) {
  if (!url) {
    return placeholder;
  }
  return getImageUrl(url);
}
