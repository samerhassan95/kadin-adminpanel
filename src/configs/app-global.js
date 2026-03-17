export const PROJECT_NAME = 'Kadin marketplace';

// Determine if we're in production based on hostname
const isProduction = typeof window !== 'undefined' && 
  (window.location.hostname === 'admin.kadin.app' || 
   window.location.hostname === 'kadin.app' ||
   !window.location.hostname.includes('localhost'));

export const BASE_URL = isProduction 
  ? 'https://back.kadin.app' 
  : (process.env.REACT_APP_BASE_URL || 'http://localhost:8005');

export const WEBSITE_URL = isProduction 
  ? 'https://admin.kadin.app' 
  : (process.env.REACT_APP_WEBSITE_URL || 'http://localhost:3001');

export const api_url = BASE_URL + '/api/v1/';
export const api_url_admin = BASE_URL + '/api/v1/dashboard/admin/';
export const api_url_admin_dashboard = BASE_URL + '/api/v1/dashboard/';
export const IMG_URL = BASE_URL + '/storage/';
export const MAP_API_KEY = 'AIzaSyDZQUsmwnkCmD3HMNFCABo8YSE54FCTFYo';
export const export_url = BASE_URL + '/storage/';
export const example = BASE_URL + '/';
export const defaultCenter = { lat: 40.7127281, lng: -74.0060152 };

export const VAPID_KEY =
  'BLRqbODXTK3Opi8LRT_WuJUctN4McS8-6552Br_x-PSwL8lt_ly7Dutk-O0WbG1QHL8qSEgghOMyYfbZBT1EDvQ';
export const API_KEY = 'AIzaSyAV3BYPU2xncEElk74aKVJtSRTf4oPY7eE';
export const AUTH_DOMAIN = 'gshop-2c9dc.firebaseapp.com';
export const PROJECT_ID = 'gshop-2c9dc';
export const STORAGE_BUCKET = 'gshop-2c9dc.appspot.com';
export const MESSAGING_SENDER_ID = '622325190921';
export const APP_ID = '1:622325190921:web:c7c95ee54a10f36bfa43d8';
export const MEASUREMENT_ID = 'G-1SBLKYBFBY';
export const DYNAMIC_LINK_DOMAIN = 'https://uzmart.page.link';
export const ANDROID_PACKAGE_NAME = 'org.uzmart';
export const IOS_BUNDLE_ID = 'com.gshop';

export const RECAPTCHASITEKEY = '6LeZt4MsAAAAAAvF8PbcsR5QHBc2Im7yXO9MA2Xr';

export const DEMO_SELLER = 107; // seller_id
export const DEMO_SELLER_UUID = '3566bdf6-3a09-4488-8269-70a19f871bd0'; // seller_id
export const DEMO_SHOP = 501; // seller_id
export const DEMO_DELIVERYMAN = 106; // deliveryman_id
export const DEMO_MANEGER = 114; // maneger_id
export const DEMO_MODERATOR = 297; // moderator_id
export const DEMO_ADMIN = 501; // administrator_id
export const DEMO_WAITER = 108; // waiter_id

export const SUPPORTED_FORMATS = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/svg',
];