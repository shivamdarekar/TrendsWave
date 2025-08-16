import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


// Async thunk for uploading an image at time of adding a new product
export const addUploadImage = createAsyncThunk(
  "upload/addImage",
  async ( file, { rejectWithValue }) => {
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

      return {
        url: data.imageUrl,
        publicId: data.publicId,
        altText: "",
      };
      
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Image upload failed"
      );
    }
  }
);


// Async thunk for uploading an image at time of updating product
export const uploadImage = createAsyncThunk(
  "upload/updateImage",
  async ({productId, file}, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload/${productId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return {
        url: data.imageUrl,
        publicId: data.publicId,
        altText: "",
      };

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Image upload failed"
      );
    }
  }
);


// Async thunk for deleting an image
export const deleteImage = createAsyncThunk(
  "upload/deleteImage",
  async ({productId, publicId}, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload/${productId}`,
        {
          data: { publicId },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Image delete failed"
      );
    }
  }
);


const uploadSlice = createSlice({
  name: "upload",
  initialState: {
    uploading: false,
    error: null,
  },
  reducers: {
    resetUpload: (state) => {
      state.uploading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Product image
      .addCase(addUploadImage.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(addUploadImage.fulfilled, (state) => {
        state.uploading = false;
      })
      .addCase(addUploadImage.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })

      // Update product image
      .addCase(uploadImage.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadImage.fulfilled, (state) => {
        state.uploading = false;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })

      // Delete image
      .addCase(deleteImage.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { resetUpload } = uploadSlice.actions;
export default uploadSlice.reducer;
