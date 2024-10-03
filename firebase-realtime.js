// Import Firebase app và các module cần thiết
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDd-fLNsiaxCSpY61QEedbwyY8Pz5hJ_bs",
  authDomain: "trungtamngoaingu-cd14a.firebaseapp.com",
  projectId: "trungtamngoaingu-cd14a",
  storageBucket: "trungtamngoaingu-cd14a.appspot.com",
  messagingSenderId: "723107120038",
  appId: "1:723107120038:web:e005fe2ae193c56fd60567",
  measurementId: "G-1VFSJP3QGN"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Export các hàm ghi và đọc dữ liệu
export function writeUserData(userId, name, email) {
  set(ref(database, 'users/' + userId), {
    username: name,
    email: email
  });
}

export function readUserData(userId) {
  const dbRef = ref(database);
  get(child(dbRef, `users/${userId}`)).then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val());
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });
}



