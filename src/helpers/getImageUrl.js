import { IMG_URL, BASE_URL } from '../configs/app-global';

export default function getImageUrl(url) {
  if (!url) {
    return 'https://via.placeholder.com/150';
  }
  
  // Handle both full URLs and relative paths
  if (url.startsWith('http')) {
    // If it's already a full URL, extract the path and rebuild with current BASE_URL
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      
      // If the path already starts with /storage, use it as is
      if (path.startsWith('/storage/')) {
        return BASE_URL + path;
      }
      
      // If the path contains storage but not at the beginning, extract the storage part
      const storageIndex = path.indexOf('/storage/');
      if (storageIndex !== -1) {
        return BASE_URL + path.substring(storageIndex);
      }
      
      // Otherwise, assume it needs /storage/ prefix
      return BASE_URL + '/storage/' + path.replace(/^\//, '');
    } catch (e) {
      // If URL parsing fails, try to extract path after domain
      const pathMatch = url.match(/^https?:\/\/[^\/]+(.*)$/);
      if (pathMatch) {
        const path = pathMatch[1];
        if (path.startsWith('/storage/')) {
          return BASE_URL + path;
        }
        return IMG_URL + path.replace(/^\//, '');
      }
      // Last resort: treat as relative path
      return IMG_URL + url;
    }
  }
  
  // If it's a relative path, add IMG_URL
  return IMG_URL + url;
}