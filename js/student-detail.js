// Thêm phần import chính xác cho Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";

// Firebase config và khởi tạo Firebase
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

// Lấy ID học viên từ URL
const urlParams = new URLSearchParams(window.location.search);
const studentId = urlParams.get('id');

// Hiển thị thông tin học viên lên trang
async function displayStudentDetails(studentId) {
  const dbRef = ref(database, 'Student/' + studentId);
  try {
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const student = snapshot.val();
      document.getElementById("studentId").textContent = student.MaHocVien;
      document.getElementById("studentName").textContent = student.HoVaTen;
      document.getElementById("studentEmail").textContent = student.Email;
      document.getElementById("studentClass").textContent = student.LopHoc;

      // Hiển thị thông tin đánh giá
      document.getElementById("midterm").textContent = student.Danhgia.Midterm;
      document.getElementById("finalterm").textContent = student.Danhgia.Finalterm;
      document.getElementById("xeploai").textContent = student.Danhgia.Xeploai;
    } else {
      console.log("No data available");
    }
  } catch (error) {
    console.error(error);
  }
}

// Gọi hàm hiển thị thông tin chi tiết học viên
displayStudentDetails(studentId);

// Hàm cập nhật đánh giá
async function updateStudentEvaluation(studentId) {
  const dbRef = ref(database, 'Student/' + studentId + '/Danhgia');

  // Hiển thị hộp thoại nhập đánh giá
  const { value: formValues, isConfirmed } = await Swal.fire({
    title: 'Cập nhật đánh giá',
    html: `
      <label for="newMidterm">Điểm giữa kỳ:</label>
      <input type="number" id="newMidterm" class="swal2-input" placeholder="Nhập điểm giữa kỳ" required/>
      <label for="newFinalterm">Điểm cuối kỳ:</label>
      <input type="number" id="newFinalterm" class="swal2-input" placeholder="Nhập điểm cuối kỳ" required/>
      <label for="newXeploai">Xếp loại:</label>
      <input type="text" id="newXeploai" class="swal2-input" placeholder="Nhập xếp loại" required/>
    `,
    focusConfirm: false,
    showCancelButton: true, // Hiển thị nút hủy
    confirmButtonText: 'Cập nhật',
    cancelButtonText: 'Hủy',preConfirm: () => {
        return {
          midterm: document.getElementById("newMidterm").value,
          finalterm: document.getElementById("newFinalterm").value,
          xeploai: document.getElementById("newXeploai").value,
        };
      }
    });
  
    // Kiểm tra nếu người dùng đã nhấn nút hủy
    if (!isConfirmed) {
      Swal.fire('Cập nhật đã bị hủy.');
      return;
    }
  
    const { midterm, finalterm, xeploai } = formValues;
  
    // Kiểm tra dữ liệu nhập vào
    if (!midterm || !finalterm || !xeploai) {
      Swal.fire('Vui lòng điền đầy đủ thông tin.');
      return;
    }
  
    // Cập nhật dữ liệu vào Firebase
    try {
      await update(dbRef, {
        Midterm: parseFloat(midterm),  // Chuyển đổi thành số
        Finalterm: parseFloat(finalterm),  // Chuyển đổi thành số
        Xeploai: xeploai
      });
  
      // Sau khi cập nhật thành công, hiển thị thông tin mới lên trang
      document.getElementById("midterm").textContent = midterm;
      document.getElementById("finalterm").textContent = finalterm;
      document.getElementById("xeploai").textContent = xeploai;
  
      Swal.fire('Cập nhật đánh giá thành công!');
    } catch (error) {
      console.error("Lỗi khi cập nhật đánh giá:", error);
      Swal.fire('Lỗi khi cập nhật đánh giá: ' + error.message);
    }
  }
  
  // Thêm sự kiện click cho nút cập nhật
  document.getElementById("updateButton").addEventListener("click", function() {
    updateStudentEvaluation(studentId);
  });