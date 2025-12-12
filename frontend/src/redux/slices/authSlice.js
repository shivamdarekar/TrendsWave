import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

//Retrieve user info and token from local storage if available
// const userFromStorage = localStorage.getItem("userInfo")
//   ? JSON.parse(localStorage.getItem("userInfo"))
//   : null;

//check for existing guest in local storage or generate a new one
const initialGuestId =
  localStorage.getItem("guestId") || `guest_${new Date().getTime()}`;
localStorage.setItem("guestId", initialGuestId);

//initial state
const initialState = {
  user: null,
  guestId: initialGuestId,
  loading: false,
  authLoading: true,
  error: null,
};

//axios config to include cookies
//const axiosConfig = { withCredentials: true }; ..always add manually in each
axios.defaults.withCredentials = true; // global send cookies automatically

// This is used to sync state after a Google OAuth redirect or on page refresh.
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/me` // Your backend endpoint to get user profile
      );
      //localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      return response.data.user;
    } catch (error) {
      // If it fails (e.g., no valid token), it means the user is not logged in.
      localStorage.removeItem("userInfo");
      return rejectWithValue(error.response.data);
    }
  }
);

//async thunk for User login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
        userData
        //axiosConfig
      );
      //localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      //localStorage.setItem("userToken", response.data.token);

      return response.data.user; //Return the user object from the response
    } catch (error) {
      localStorage.removeItem("userInfo");
      return rejectWithValue(error.response.data);
    }
  }
);

//async thunk for User registration
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({userData,endpoint}, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users${endpoint}`,
        userData
      );
      //localStorage.setItem("userInfo", JSON.stringify(response.data.user));

      return response.data.user; //Return the user object from the response
    } catch (error) {
      localStorage.removeItem("userInfo");
      return rejectWithValue(error.response.data);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/logout`,
        {},
        { withCredentials: true } // ensures cookies are sent so backend can clear them
      );
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Logout failed" }
      );
    }
  }
);

//create slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    generateNewGuestId: (state) => {
      state.guestId = `guest_${new Date().getTime()}`;
      localStorage.setItem("guestId", state.guestId);
    },
    clearGuestId: (state) => {
      state.guestId = null;
      localStorage.removeItem("guestId");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.guestId = `guest_${new Date().getTime()}`;
        localStorage.setItem("guestId", state.guestId);
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload.message;
      })

      //fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.authLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.authLoading = false;
        state.user = null; // Ensure user is null if fetch fails
      });
  },
});

export const { generateNewGuestId, clearGuestId } = authSlice.actions;
export default authSlice.reducer;
