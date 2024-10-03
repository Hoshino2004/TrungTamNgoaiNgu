// Import Firebase Authentication và Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

// Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDd-fLNsiaxCSpY61QEedbwyY8Pz5hJ_bs",
    authDomain: "trungtamngoaingu-cd14a.firebaseapp.com",
    projectId: "trungtamngoaingu-cd14a",
    storageBucket: "trungtamngoaingu-cd14a.appspot.com",
    messagingSenderId: "723107120038",
    appId: "1:723107120038:web:e005fe2ae193c56fd60567",
    measurementId: "G-1VFSJP3QGN",
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Xử lý đăng ký
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Ngăn việc submit form truyền thống

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // Kiểm tra xem mật khẩu và xác nhận mật khẩu có khớp hay không
        if (password !== confirmPassword) {
            alert("Mật khẩu không khớp!");
            return;
        }

        // Đăng ký người dùng bằng email và password
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("User registered:", user);

                // Gửi email xác thực
                sendEmailVerification(user)
                    .then(() => {
                        alert("Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác thực.");
                    })
                    .catch((error) => {
                        console.error("Lỗi khi gửi email xác thực:", error);
                        alert("Có lỗi xảy ra khi gửi email xác thực: " + error.message);
                    });
            })
            .catch((error) => {
                console.error("Lỗi trong quá trình đăng ký:", error);
                alert("Đăng ký thất bại: " + error.message);
            });
    });
}

// Xử lý đăng nhập
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Ngăn việc submit form truyền thống

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Đăng nhập người dùng
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("User logged in:", user);
                
                // Kiểm tra xác thực email
                if (!user.emailVerified) {
                    alert("Vui lòng xác thực email trước khi đăng nhập.");
                } else {
                    // Chuyển sang trang chủ
                    window.location.href = "index.html"; // Thay "index.html" bằng trang chủ của bạn
                }
            })
            .catch((error) => {
                console.error("Lỗi trong quá trình đăng nhập:", error);
                alert("Đăng nhập thất bại: " + error.message);
            });
    });
}

// Xử lý quên mật khẩu
const resetPasswordForm = document.getElementById("resetPasswordForm");
if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Ngăn việc submit form truyền thống

        const email = document.getElementById("resetEmail").value;

        // Gửi email đặt lại mật khẩu
        sendPasswordResetEmail(auth, email)
            .then(() => {
                alert("Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.");
            })
            .catch((error) => {
                console.error("Lỗi trong quá trình gửi email đặt lại mật khẩu:", error);
                alert("Có lỗi xảy ra: " + error.message);
            });
    });
}

