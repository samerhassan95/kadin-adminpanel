import request from './request';

const reelsService = {
  // Admin endpoints
  getAll: (params) => request.get('dashboard/admin/reels', { params }),
  getById: (id, params) => request.get(`dashboard/admin/reels/${id}`, { params }),
  create: (data) => request.post('dashboard/admin/reels', data),
  update: (id, data) => request.put(`dashboard/admin/reels/${id}`, data),
  delete: (data) => request.delete('dashboard/admin/reels/delete', { data }),
  dropAll: () => request.get('dashboard/admin/reels/drop/all'),
  toggleActive: (id) => request.post(`dashboard/admin/reels/${id}/toggle-active`),

  // Seller endpoints
  getSellerReels: (params) => request.get('dashboard/seller/reels', { params }),
  getSellerById: (id, params) => request.get(`dashboard/seller/reels/${id}`, { params }),
  createSellerReel: (data) => request.post('dashboard/seller/reels', data),
  updateSellerReel: (id, data) => request.put(`dashboard/seller/reels/${id}`, data),
  deleteSellerReel: (id) => request.delete(`dashboard/seller/reels/${id}`),
  deleteReel: (id) => request.delete(`dashboard/seller/reels/${id}`),
  uploadVideo: (data) => request.post('dashboard/seller/reels/upload-video', data),
  toggleSellerActive: (id) => request.post(`dashboard/seller/reels/${id}/toggle-active`),

  // Public endpoints
  getPublicReels: (params) => request.get('rest/reels/paginate', { params }),
  likeReel: (id) => request.post(`rest/reels/${id}/like`),
};

export default reelsService;