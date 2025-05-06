import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '@/store';
import { Transaction, TransactionState } from '@/types';

// Initial state
const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
  error: null,
  filter: {
    dateRange: {
      start: null,
      end: null,
    },
    status: 'all',
    search: '',
  },
};

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'transaction/fetchTransactions',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth, transaction } = getState() as RootState;
      const { filter } = transaction;
      
      if (!auth.token) {
        return rejectWithValue('Not authenticated');
      }

      // Build query params
      const params = new URLSearchParams();
      if (filter.dateRange.start) params.append('startDate', filter.dateRange.start);
      if (filter.dateRange.end) params.append('endDate', filter.dateRange.end);
      if (filter.status !== 'all') params.append('status', filter.status);
      if (filter.search) params.append('search', filter.search);

      // Replace with actual API call
      const response = await axios.get(`/api/transactions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch transactions'
      );
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transaction/createTransaction',
  async (
    {
      type,
      amount,
      description,
    }: {
      type: Transaction['type'];
      amount: number;
      description?: string;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const { auth } = getState() as RootState;
      
      if (!auth.token) {
        return rejectWithValue('Not authenticated');
      }

      // Replace with actual API call
      const response = await axios.post(
        '/api/transactions',
        {
          type,
          amount,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Transaction failed'
      );
    }
  }
);

// Slice
const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setDateRangeFilter: (
      state,
      action: PayloadAction<{ start: string | null; end: string | null }>
    ) => {
      state.filter.dateRange = action.payload;
    },
    setStatusFilter: (
      state,
      action: PayloadAction<'all' | 'pending' | 'success' | 'failed'>
    ) => {
      state.filter.status = action.payload;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filter.search = action.payload;
    },
    clearFilters: (state) => {
      state.filter = {
        dateRange: {
          start: null,
          end: null,
        },
        status: 'all',
        search: '',
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Transactions
    builder.addCase(fetchTransactions.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTransactions.fulfilled, (state, action) => {
      state.isLoading = false;
      state.transactions = action.payload;
    });
    builder.addCase(fetchTransactions.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create Transaction
    builder.addCase(createTransaction.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createTransaction.fulfilled, (state, action) => {
      state.isLoading = false;
      state.transactions.unshift(action.payload);
    });
    builder.addCase(createTransaction.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setDateRangeFilter,
  setStatusFilter,
  setSearchFilter,
  clearFilters,
  clearError,
} = transactionSlice.actions;

export default transactionSlice.reducer;
