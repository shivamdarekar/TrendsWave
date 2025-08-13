import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for uploading an image
export const uploadImage = createAsyncThunk(
  "upload/image",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return data.imageUrl; // returning only image URL
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Image upload failed"
      );
    }
  }
);

const uploadSlice = createSlice({
  name: "upload",
  initialState: {
    uploading: false,
    imageUrl: null,
    error: null,
  },
  reducers: {
    resetUpload: (state) => {
      state.uploading = false;
      state.imageUrl = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadImage.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.uploading = false;
        state.imageUrl = action.payload;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload.message;
      });
  },
});

export const { resetUpload } = uploadSlice.actions;
export default uploadSlice.reducer;
