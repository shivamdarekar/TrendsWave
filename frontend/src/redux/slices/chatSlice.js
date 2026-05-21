import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialMessages = [
  {
    id: "welcome",
    role: "assistant",
    text: "Hi, I can help you check products, availability, and style matches. Try: 'is red shirt available' or 'which shirt looks good with these jeans?'.",
    products: [],
    timestamp: new Date().toISOString(),
  },
];

export const sendChat = createAsyncThunk(
  "chat/send",
  async ({ message, limit = 4, signal }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat`,
        { message, limit },
        { signal, withCredentials: true }
      );

      return res.data;
    } catch (err) {
      if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
        return rejectWithValue({ canceled: true });
      }
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

const slice = createSlice({
  name: "chat",
  initialState: { messages: initialMessages, status: "idle", error: null },
  reducers: {
    addUserMessage(state, action) {
      const msg = action.payload;
      if (!msg.timestamp) msg.timestamp = new Date().toISOString();
      state.messages.push(msg);
    },
    clearMessages(state) {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChat.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(sendChat.fulfilled, (state, action) => {
        state.status = "idle";
        const payload = action.payload || {};
        state.messages.push({
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: payload.answer || "I found some matching products.",
          products: Array.isArray(payload.products) ? payload.products : [],
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(sendChat.rejected, (state, action) => {
        state.status = "idle";
        const payload = action.payload || {};
        if (payload.canceled) {
          return;
        }
        state.error = payload.message || "Chat failed";
        state.messages.push({
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          text: "Unable to fetch results. Try again.",
          products: [],
          timestamp: new Date().toISOString(),
        });
      });
  },
});

export const { addUserMessage, clearMessages } = slice.actions;
export default slice.reducer;
