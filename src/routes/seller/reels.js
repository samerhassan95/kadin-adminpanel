import { lazy } from 'react';

const SellerReelsRoutes = [
  {
    path: 'seller/reels',
    component: lazy(() => import('../../views/seller-views/reels')),
  },
];

export default SellerReelsRoutes;