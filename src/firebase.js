import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage"


const firebaseConfig = {
  apiKey: "AIzaSyBJDzHxE5UfJi8WxXu_7bkpFh4s3I7JMx8",
  authDomain: "womanup-3db96.firebaseapp.com",
  databaseURL: "https://womanup-3db96-default-rtdb.firebaseio.com",
  projectId: "womanup-3db96",
  storageBucket: "womanup-3db96.appspot.com",
  messagingSenderId: "87962460136",
  appId: "1:87962460136:web:0595a69d567b031c0c8e5d",
  measurementId: "G-DYPQ194BL0"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app)
