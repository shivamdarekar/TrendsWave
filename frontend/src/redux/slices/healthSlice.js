import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

export const checkBackendHealth = createAsyncThunk(
    "health/checkStatus",
    async(_,{rejectWithValue}) => {
        try{
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/health`,
                { timeout: 3000 }
            ); 
            return response.data;
        }catch (error){
            return rejectWithValue({
                message: "Backend unavailable",
                status: error.response?.status || 0
            });
        }
    }
);

const healthSlice = createSlice({
    name: "health",
   initialState: {
    status: "unknown", // unknown, online, offline
    lastChecked: null,
    checking: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkBackendHealth.pending, (state) => {
        state.checking = true;
      })
      .addCase(checkBackendHealth.fulfilled, (state) => {
        state.status = "online";
        state.lastChecked = Date.now();
        state.checking = false;
      })
      .addCase(checkBackendHealth.rejected, (state) => {
        state.status = "offline";
        state.lastChecked = Date.now();
        state.checking = false;
      });
  }
});

export default healthSlice.reducer;