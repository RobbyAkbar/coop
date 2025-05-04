import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { AppState } from '@/types';
import { RootState } from '@/store';

// Initial state
const initialState: AppState = {
  balance: {
    total: 0,
    available: 0,
    pending: 0,
    lastUpdated: '',
  },
  featuredArticles: [],
  activeProjects: [],
  upcomingEvents: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  'app/fetchDashboardData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      
      if (!auth.token) {
        return rejectWithValue('Not authenticated');
      }

      // Replace with actual API call
      const response = await axios.get('/api/dashboard', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch dashboard data'
      );
    }
  }
);

export const fetchBalance = createAsyncThunk(
  'app/fetchBalance',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      
      if (!auth.token) {
        return rejectWithValue('Not authenticated');
      }

      // Replace with actual API call
      const response = await axios.get('/api/balance', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch balance'
      );
    }
  }
);

// App slice
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Dashboard Data
    builder.addCase(fetchDashboardData.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDashboardData.fulfilled, (state, action) => {
      state.isLoading = false;
      state.balance = action.payload.balance;
      state.featuredArticles = action.payload.featuredArticles;
      state.activeProjects = action.payload.activeProjects;
      state.upcomingEvents = action.payload.upcomingEvents;
    });
    builder.addCase(fetchDashboardData.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Balance
    builder.addCase(fetchBalance.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBalance.fulfilled, (state, action) => {
      state.isLoading = false;
      state.balance = action.payload;
    });
    builder.addCase(fetchBalance.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = appSlice.actions;

export default appSlice.reducer;