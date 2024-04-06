import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "./profile/profile-slice";
import uiReducer from "./ui/ui-slice";
import listingSlice from "./deliveries/listing";
import userReducer from "./users/user-slice";

const store = configureStore({
  reducer: {
    deliveries: listingSlice,
    profile: profileReducer,
    ui: uiReducer,
    users: userReducer,
  },
});

export default store;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
