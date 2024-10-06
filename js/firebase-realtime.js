// Import Firebase app và các module cần thiết
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getDatabase, ref, get, child, set, remove, update } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";

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

// Biến lưu trữ ID học viên sẽ xóa hoặc chỉnh sửa
let studentToDeleteId = null;
let studentToEditId = null;

let currentPage = 1; // Trang hiện tại
const studentsPerPage = 8; // Số học viên mỗi trang
let totalStudents = 0; // Tổng số học viên

let students = []; // Khai báo biến students toàn cục

// Hàm tạo mã học viên ngẫu nhiên theo kiểu HV0000
function generateStudentId() {
  const randomNum = Math.floor(10000 + Math.random() * 90000); // Tạo số ngẫu nhiên từ 10000 đến 99999
  return `HV${randomNum.toString().slice(-4)}`; // Trả về mã học viên
}

// Hàm kiểm tra mã học viên đã tồn tại
async function isStudentIdExists(studentId) {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'Student'));
  if (snapshot.exists()) {
    const students = snapshot.val();
    return Object.values(students).some(student => student.MaHocVien === studentId); // Kiểm tra mã học viên
  }
  return false;
}

// Hàm lấy dữ liệu từ Firebase
async function getStudents() {
  const dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, 'Student'));
    if (snapshot.exists()) {
      return snapshot.val(); // Trả về dữ liệu học viên
    } else {
      console.log("No data available");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Hàm hiển thị học viên lên table
function displayStudents(students, page = 1) {
  const tableBody = document.querySelector("#student-management tbody");
  tableBody.innerHTML = ""; // Xóa nội dung cũ

  // Tính toán các chỉ số của học viên cần hiển thị trên trang
  const startIndex = (page - 1) * studentsPerPage;
  const endIndex = Math.min(startIndex + studentsPerPage, students.length);

  // Hiển thị học viên theo trang
  for (let i = startIndex; i < endIndex; i++) {
    const student = students[i];
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.MaHocVien}</td>
      <td>${student.HoVaTen}</td>
      <td>${student.Email}</td>
      <td>${student.LopHoc}</td>
      <td>
        <button class="edit-btn">Sửa</button>
        <button class="delete-btn">Xóa</button>
      </td>
    `;
    tableBody.appendChild(row);
  }

  addDeleteEventListeners(); // Gán sự kiện cho nút "Xóa"
  addEditEventListeners();   // Gán sự kiện cho nút "Sửa"

  // Cập nhật thông tin phân trang
  document.getElementById("pageInfo").textContent = `Trang ${page} / ${Math.ceil(totalStudents / studentsPerPage)}`;
  // Gọi hàm này sau khi hiển thị học viên
  updatePagination();
}

document.getElementById("prevPage").addEventListener("click", function () {
  if (currentPage > 1) {
    currentPage--;
    displayStudents(Object.values(students), currentPage);
  }
});

document.getElementById("nextPage").addEventListener("click", function () {
  if (currentPage * studentsPerPage < totalStudents) {
    currentPage++;
    displayStudents(Object.values(students), currentPage);
  }
});

function updatePagination() {
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage * studentsPerPage >= totalStudents;
}

// Hàm ghi dữ liệu vào Firebase
async function addStudent(student) {
  const dbRef = ref(database, 'Student/' + student.MaHocVien); // Sử dụng mã học viên làm ID
  try {
    await set(dbRef, student);
    console.log("Student added successfully");
    // Sau khi thêm thành công, gọi lại hàm hiển thị
    displayStudents(students, currentPage); // Cập nhật lại danh sách học viên
  } catch (error) {
    console.error("Error adding student: ", error);
  }
}

// Hàm cập nhật học viên
async function updateStudent(studentId, updatedData) {
  const dbRef = ref(database, 'Student/' + studentId);
  try {
    await update(dbRef, updatedData);
    console.log("Student updated successfully");
  } catch (error) {
    console.error("Error updating student: ", error);
  }
}

// Hàm khởi tạo
async function init() {
  const studentsData = await getStudents();
  if (studentsData) {
    students = Object.values(studentsData); // Lưu trữ học viên vào biến toàn cục
    totalStudents = students.length; // Cập nhật tổng số học viên
    displayStudents(students, currentPage); // Hiển thị trang đầu tiên
  } else {
    totalStudents = 0; // Nếu không có học viên, đặt totalStudents về 0
  }
}



// Hàm để gán sự kiện cho các nút "Xóa"
function addDeleteEventListeners() {
  document.querySelectorAll(".delete-btn").forEach(button => {
    button.addEventListener("click", function () {
      studentToDeleteId = this.closest('tr').children[0].textContent; // Lấy mã học viên từ hàng
      document.querySelector("#deleteModal p").textContent =
        `Bạn có chắc chắn muốn xóa học viên ${studentToDeleteId} này không?`; // Cập nhật thông điệp
      document.getElementById("deleteModal").style.display = "block"; // Hiện modal xác nhận
    });
  });
}

// Gán sự kiện cho các nút "Sửa"
function addEditEventListeners() {
  document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", async function () {
      studentToEditId = this.closest('tr').children[0].textContent; // Lấy mã học viên từ hàng
      const dbRef = ref(database, 'Student/' + studentToEditId);
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const student = snapshot.val();
        // Điền thông tin vào các input trong modal
        document.getElementById("studentName").value = student.HoVaTen;
        document.getElementById("studentEmail").value = student.Email;
        document.getElementById("studentClass").value = student.LopHoc;

        // Cập nhật tiêu đề và nút trong modal cho chế độ sửa
        document.getElementById("modalTitle").textContent = "Sửa thông tin học viên";
        document.getElementById("modalSubmitBtn").textContent = "Cập nhật";

        // Hiển thị modal
        document.getElementById("studentModal").style.display = "block";
      }
    });
  });
}

// Xử lý xác nhận xóa
document.getElementById("confirmDeleteBtn").addEventListener("click", function () {
  if (studentToDeleteId) {
    deleteStudent(studentToDeleteId); // Xóa học viên
    document.getElementById("deleteModal").style.display = "none"; // Đóng modal xác nhận
    studentToDeleteId = null; // Đặt lại biến
  }
});

// Hàm xóa học viên khỏi Firebase
async function deleteStudent(studentId) {
  const dbRef = ref(database, 'Student/' + studentId); // Đường dẫn đến học viên
  try {
    await remove(dbRef); // Xóa học viên
    console.log("Student deleted successfully");
    init(); // Cập nhật lại bảng
  } catch (error) {
    console.error("Error deleting student: ", error);
  }
}

// Đóng modal khi bấm nút đóng
document.querySelectorAll(".close").forEach(closeButton => {
  closeButton.addEventListener("click", function () {
    document.getElementById("studentModal").style.display = "none"; // Đóng modal
    document.getElementById("deleteModal").style.display = "none"; // Đóng modal xác nhận
  });
});

// Nút "Hủy" trong modal
document.querySelector(".cancel-btn").addEventListener("click", function () {
  document.getElementById("studentModal").style.display = "none"; // Đóng modal
});

// Nút "Hủy" trong modal xóa
document.getElementById("cancelDeleteBtn").addEventListener("click", function () {
  document.getElementById("deleteModal").style.display = "none"; // Đóng modal xác nhận xóa
  studentToDeleteId = null; // Đặt lại biến để không xóa học viên
});


// Sự kiện khi modal thêm hoặc sửa học viên được gửi
document.querySelector(".modal-form").addEventListener("submit", async function (event) {
  event.preventDefault(); // Ngăn không cho reload trang

  const studentName = document.getElementById("studentName").value;
  const studentEmail = document.getElementById("studentEmail").value;
  const studentClass = document.getElementById("studentClass").value;

  if (studentToEditId) {
    // Nếu đang chỉnh sửa học viên
    const updatedStudent = {
      HoVaTen: studentName,
      Email: studentEmail,
      LopHoc: studentClass,
    };
    await updateStudent(studentToEditId, updatedStudent); // Cập nhật dữ liệu
  } else {
    // Thêm học viên mới
    let newStudentId;
    do {
      newStudentId = generateStudentId(); // Tạo mã học viên mới
    } while (await isStudentIdExists(newStudentId)); // Kiểm tra mã học viên đã tồn tại chưa

    const newStudent = {
      MaHocVien: newStudentId,
      HoVaTen: studentName,
      Email: studentEmail,
      LopHoc: studentClass,
    };

    await addStudent(newStudent); // Ghi dữ liệu vào Firebase
  }

  document.getElementById("studentModal").style.display = "none"; // Đóng modal
  init(); // Cập nhật lại bảng
});

// Khởi chạy khi trang đã tải
document.addEventListener("DOMContentLoaded", function () {
  init();

  // Gán sự kiện cho nút "Thêm học viên"
  document.getElementById("openModalBtn").addEventListener("click", function () {
    document.getElementById("modalTitle").textContent = "Thêm học viên mới"; // Cập nhật tiêu đề
    document.getElementById("modalSubmitBtn").textContent = "Thêm học viên"; // Cập nhật nút
    document.getElementById("studentModal").style.display = "block"; // Hiện modal

    // Đặt lại các giá trị input trong modal
    document.getElementById("studentName").value = "";
    document.getElementById("studentEmail").value = "";
    document.getElementById("studentClass").value = "";
    studentToEditId = null; // Đảm bảo không ở trạng thái chỉnh sửa
  });
});

// Đóng modal khi click bên ngoài modal
window.addEventListener("click", function (event) {
  const studentModal = document.getElementById("studentModal");
  const deleteModal = document.getElementById("deleteModal");

  if (event.target === studentModal) {
    studentModal.style.display = "none";
  }

  if (event.target === deleteModal) {
    deleteModal.style.display = "none";
  }
});

// Hàm tìm kiếm học viên theo tên
async function searchStudents(keyword) {
  const students = await getStudents();
  if (!students) return;

  const filteredStudents = Object.values(students).filter(student =>
    student.HoVaTen.toLowerCase().includes(keyword.toLowerCase()) // Tìm kiếm theo tên
  );

  totalStudents = filteredStudents.length; // Cập nhật totalStudents
  currentPage = 1; // Quay lại trang đầu tiên sau khi tìm kiếm
  displayStudents(filteredStudents, currentPage); // Hiển thị học viên đã lọc
}

// Lắng nghe sự kiện tìm kiếm
document.getElementById('searchBtn').addEventListener('click', function () {
  const keyword = document.getElementById('searchInput').value;
  if (keyword.trim() === "") {
    init(); // Nếu không nhập gì thì hiển thị lại toàn bộ học viên
  } else {
    searchStudents(keyword);
  }
});





