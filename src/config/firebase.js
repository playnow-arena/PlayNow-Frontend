import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAA6eJSVwYOyqA4BMBXG6zbbv2qvlFWe2w",
  authDomain: "playnow-53357.firebaseapp.com",
  projectId: "playnow-53357",
  storageBucket: "playnow-53357.firebasestorage.app",
  messagingSenderId: "622303504893",
  appId: "1:622303504893:web:30063ed909e839770b1194",
  measurementId: "G-R2PSF46RBV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth (Required for OTP)
export const auth = getAuth(app);

export default app;
