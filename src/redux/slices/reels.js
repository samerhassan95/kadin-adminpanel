import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reelsService from '../../services/reels';

const initialState = {
  loading: false,
  reels: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
  },
  meta: {},
};

export const fetchAdminReels = createAsyncThunk(
  'reels/fetchAdminReels',
  (params = {}) => {
    return reelsService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);

export const fetchSellerReels = createAsyncThunk(
  'reels/fetchSellerReels',
  (params = {}) => {
    return reelsService
      .getSellerReels({ ...initialState.params, ...params })
      .then((res) => res);
  }
);

export const addAdminReel = createAsyncThunk(
  'reels/addAdminReel',
  (data) => {
    return reelsService.create(data).then((res) => res);
  }
);

export const updateAdminReel = createAsyncThunk(
  'reels/updateAdminReel',
  ({ id, data }) => {
    return reelsService.update(id, data).then((res) => res);
  }
);

export const deleteAdminReel = createAsyncThunk(
  'reels/deleteAdminReel',
  (id) => {
    return reelsService.delete({ ids: [id] }).then((res) => res);
  }
);

export const addSellerReel = createAsyncThunk(
  'reels/addSellerReel',
  (data) => {
    return reelsService.createSellerReel(data).then((res) => res);
  }
);

export const updateSellerReel = createAsyncThunk(
  'reels/updateSellerReel',
  ({ id, data }) => {
    return reelsService.updateSellerReel(id, data).then((res) => res);
  }
);

export const deleteSellerReel = createAsyncThunk(
  'reels/deleteSellerReel',
  (id) => {
    return reelsService.deleteSellerReel(id).then((res) => res);
  }
);

const reelsSlice = createSlice({
  name: 'reels',
  initialState,
  extraReducers: (builder) => {
    // Fetch Admin Reels
    builder.addCase(fetchAdminReels.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchAdminReels.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      // Handle nested response structure from backend
      if (payload.data && Array.isArray(payload.data.data)) {
        state.reels = payload.data.data;
        state.meta = payload.data.meta || {};
      } else if (Array.isArray(payload.data)) {
        state.reels = payload.data;
        state.meta = payload.meta || {};
      } else {
        state.reels = [];
        state.meta = {};
      }
      state.params.page = state.meta?.current_page || 1;
      state.params.perPage = state.meta?.per_page || 10;
      state.error = '';
    });
    builder.addCase(fetchAdminReels.rejected, (state, action) => {
      state.loading = false;
      state.reels = [];
      state.error = action.error.message;
    });

    // Fetch Seller Reels
    builder.addCase(fetchSellerReels.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchSellerReels.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      // Handle nested response structure from backend
      if (payload.data && Array.isArray(payload.data.data)) {
        state.reels = payload.data.data;
        state.meta = payload.data.meta || {};
      } else if (Array.isArray(payload.data)) {
        state.reels = payload.data;
        state.meta = payload.meta || {};
      } else {
        state.reels = [];
        state.meta = {};
      }
      state.params.page = state.meta?.current_page || 1;
      state.params.perPage = state.meta?.per_page || 10;
      state.error = '';
    });
    builder.addCase(fetchSellerReels.rejected, (state, action) => {
      state.loading = false;
      state.reels = [];
      state.error = action.error.message;
    });

    // Add Seller Reel
    builder.addCase(addSellerReel.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addSellerReel.fulfilled, (state) => {
      state.loading = false;
      state.error = '';
    });
    builder.addCase(addSellerReel.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // Update Seller Reel
    builder.addCase(updateSellerReel.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateSellerReel.fulfilled, (state) => {
      state.loading = false;
      state.error = '';
    });
    builder.addCase(updateSellerReel.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // Delete Seller Reel
    builder.addCase(deleteSellerReel.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteSellerReel.fulfilled, (state) => {
      state.loading = false;
      state.error = '';
    });
    builder.addCase(deleteSellerReel.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  },
});

export default reelsSlice.reducer;