import { lazy } from 'react';

const ReelsRoutes = [
  {
    path: 'reels',
    component: lazy(() => import('../../views/reels')),
  },
];

export default ReelsRoutes;