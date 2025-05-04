import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import { AuthState, User } from '@/types';

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  rememberMe: false,
};

export const login = createAsyncThunk(
  'auth/login',
  async (
    {
      email,
      password,
      rememberMe,
    }: { email: string; password: string; rememberMe: boolean },
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return {
        user: data.user,
        token: data.session?.access_token,
        rememberMe,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Login failed. Please try again.'
      );
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    {
      email,
      password,
      fullName,
    }: { email: string; password: string; fullName: string },
    { rejectWithValue }
  ) => {
    try {
      const { data: { user, session }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Create user profile in the profiles table
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              full_name: fullName,
              email: email,
            },
          ]);

        if (profileError) throw profileError;
      }

      return {
        user,
        token: session?.access_token,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Registration failed. Please try again.'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return null;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Logout failed. Please try again.'
      );
    }
  }
);

export const checkAuth = createAsyncThunk('auth/check', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    return {
      user: session.user,
      token: session.access_token,
      rememberMe: true,
    };
  }

  return {
    user: null,
    token: null,
    rememberMe: false,
  };
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User>, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      
      if (!auth.user?.id) {
        return rejectWithValue('Not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', auth.user.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Profile update failed. Please try again.'
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Password reset failed. Please try again.'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.rememberMe = action.payload.rememberMe;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.rememberMe = false;
    });

    // Check Auth
    builder.addCase(checkAuth.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.rememberMe = action.payload.rememberMe;
    });
    builder.addCase(checkAuth.rejected, (state) => {
      state.isLoading = false;
    });

    // Update Profile
    builder.addCase(updateProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = {
        ...state.user,
        ...action.payload,
      } as User;
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Reset Password
    builder.addCase(resetPassword.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setRememberMe, clearError } = authSlice.actions;

export default authSlice.reducer;