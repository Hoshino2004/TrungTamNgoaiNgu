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
let teacherToDeleteId = null;
let teacherToEditId = null;

let currentPage = 1; // Trang hiện tại
const teachersPerPage = 8; // Số học viên mỗi trang
let totalTeachers = 0; // Tổng số học viên

let teachers = []; // Khai báo biến students toàn cục

// Hàm tạo mã học viên ngẫu nhiên theo kiểu HV0000
function generateTeacherId() {
  const randomNum = Math.floor(10000 + Math.random() * 90000); // Tạo số ngẫu nhiên từ 10000 đến 99999
  return `GV${randomNum.toString().slice(-4)}`; // Trả về mã học viên
}

// Hàm kiểm tra mã học viên đã tồn tại
async function isTeacherIdExists(teacherId) {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'Teacher'));
  if (snapshot.exists()) {
    const teachers = snapshot.val();
    return Object.values(teachers).some(teacher => teacher.MaGiangVien === teacherId); // Kiểm tra mã học viên
  }
  return false;
}

// Hàm lấy dữ liệu từ Firebase
async function getTeachers() {
  const dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, 'Teacher'));
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
function displayTeachers(teachers, page = 1) {
  const tableBody = document.querySelector("#teacher-management tbody");
  tableBody.innerHTML = ""; // Xóa nội dung cũ

  // Tính toán các chỉ số của học viên cần hiển thị trên trang
  const startIndex = (page - 1) * teachersPerPage;
  const endIndex = Math.min(startIndex + teachersPerPage, teachers.length);

  // Hiển thị học viên theo trang
  for (let i = startIndex; i < endIndex; i++) {
    const teacher = teachers[i];
    const row = document.createElement("tr");
    row.innerHTML = `
    <td>${teacher.MaGiangVien}</td>
    <td>${teacher.HoVaTen}</td>
    <td>${teacher.SoDienThoai}</td>
    <td>${teacher.Email}</td>
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
  document.getElementById("pageInfo").textContent = `Trang ${page} / ${Math.ceil(totalTeachers / teachersPerPage)}`;
  // Gọi hàm này sau khi hiển thị học viên
  updatePagination();
}

document.getElementById("prevPage").addEventListener("click", function () {
  if (currentPage > 1) {
    currentPage--;
    displayTeachers(Object.values(teachers), currentPage);
  }
});

document.getElementById("nextPage").addEventListener("click", function () {
  if (currentPage * teachersPerPage < totalTeachers) {
    currentPage++;
    displayTeachers(Object.values(teachers), currentPage);
  }
});

function updatePagination() {
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage * teachersPerPage >= totalTeachers;
}

// Hàm ghi dữ liệu vào Firebase
async function addTeacher(teacher) {
  const dbRef = ref(database, 'Teacher/' + teacher.MaGiangVien); // Sử dụng mã học viên làm ID
  try {
    await set(dbRef, teacher);
    console.log("Teacher added successfully");
    // Sau khi thêm thành công, gọi lại hàm hiển thị
    displayTeachers(teachers, currentPage); // Cập nhật lại danh sách học viên
  } catch (error) {
    console.error("Error adding teacher: ", error);
  }
}

// Hàm cập nhật học viên
async function updateTeacher(teacherId, updatedData) {
  const dbRef = ref(database, 'Teacher/' + teacherId);
  try {
    await update(dbRef, updatedData);
    console.log("Teacher updated successfully");
  } catch (error) {
    console.error("Error updating teacher: ", error);
  }
}

// Hàm khởi tạo
async function init() {
  const teachersData = await getTeachers();
  if (teachersData) {
    teachers = Object.values(teachersData); // Lưu trữ học viên vào biến toàn cục
    totalTeachers = teachers.length; // Cập nhật tổng số học viên
    displayTeachers(teachers, currentPage); // Hiển thị trang đầu tiên
  } else {
    totalTeachers = 0; // Nếu không có học viên, đặt totalStudents về 0
  }
}



// Hàm để gán sự kiện cho các nút "Xóa"
function addDeleteEventListeners() {
  document.querySelectorAll(".delete-btn").forEach(button => {
    button.addEventListener("click", function () {
      teacherToDeleteId = this.closest('tr').children[0].textContent; // Lấy mã học viên từ hàng
      document.querySelector("#deleteModal p").textContent =
        `Bạn có chắc chắn muốn xóa giảng viên ${teacherToDeleteId} này không?`; // Cập nhật thông điệp
      document.getElementById("deleteModal").style.display = "block"; // Hiện modal xác nhận
    });
  });
}

// Gán sự kiện cho các nút "Sửa"
function addEditEventListeners() {
  document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", async function () {
      teacherToEditId = this.closest('tr').children[0].textContent; // Lấy mã học viên từ hàng
      const dbRef = ref(database, 'Teacher/' + teacherToEditId);
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const teacher = snapshot.val();

        // Điền thông tin vào các input trong modal
        document.getElementById("teacherName").value = teacher.HoVaTen;
        document.getElementById("teacherEmail").value = teacher.Email;
        document.getElementById("teacherPhone").value = teacher.SoDienThoai;

        // Cập nhật tiêu đề và nút trong modal cho chế độ sửa
        document.getElementById("modalTitle").textContent = "Sửa thông tin giảng viên";
        document.getElementById("modalSubmitBtn").textContent = "Cập nhật";

        // Hiển thị modal
        document.getElementById("teacherModal").style.display = "block";
      }
    });
  });

}

// Xử lý xác nhận xóa
document.getElementById("confirmDeleteBtn").addEventListener("click", function () {
  if (teacherToDeleteId) {
    deleteTeacher(teacherToDeleteId); // Xóa học viên
    document.getElementById("deleteModal").style.display = "none"; // Đóng modal xác nhận
    teacherToDeleteId = null; // Đặt lại biến
  }
});

// Hàm xóa học viên khỏi Firebase
async function deleteTeacher(teacherId) {
  const dbRef = ref(database, 'Teacher/' + teacherId); // Đường dẫn đến học viên
  try {
    await remove(dbRef); // Xóa học viên
    console.log("Teacher deleted successfully");
    init(); // Cập nhật lại bảng
  } catch (error) {
    console.error("Error deleting teacher: ", error);
  }
}

// Đóng modal khi bấm nút đóng
document.querySelectorAll(".close").forEach(closeButton => {
  closeButton.addEventListener("click", function () {
    document.getElementById("teacherModal").style.display = "none"; // Đóng modal
    document.getElementById("deleteModal").style.display = "none"; // Đóng modal xác nhận
  });
});

// Nút "Hủy" trong modal
document.querySelector(".cancel-btn").addEventListener("click", function () {
  document.getElementById("teacherModal").style.display = "none"; // Đóng modal
});

// Nút "Hủy" trong modal xóa
document.getElementById("cancelDeleteBtn").addEventListener("click", function () {
  document.getElementById("deleteModal").style.display = "none"; // Đóng modal xác nhận xóa
  teacherToDeleteId = null; // Đặt lại biến để không xóa học viên
});


// Sự kiện khi modal thêm hoặc sửa học viên được gửi
document.querySelector(".modal-form").addEventListener("submit", async function (event) {
  event.preventDefault(); // Ngăn không cho reload trang

  const teacherName = document.getElementById("teacherName").value;
  const teacherEmail = document.getElementById("teacherEmail").value;
  const teacherPhone = document.getElementById("teacherPhone").value;

  if (teacherToEditId) {
    // Nếu đang chỉnh sửa học viên
    const updatedTeacher = {
      HoVaTen: teacherName,
      Email: teacherEmail,
      SoDienThoai: teacherPhone,
    };
    await updateTeacher(teacherToEditId, updatedTeacher); // Cập nhật dữ liệu
  } else {
    // Thêm học viên mới
    let newTeacherId;
    do {
      newTeacherId = generateTeacherId(); // Tạo mã học viên mới
    } while (await isTeacherIdExists(newTeacherId)); // Kiểm tra mã học viên đã tồn tại chưa

    const newTeacher = {
      MaGiangVien: newTeacherId,
      HoVaTen: teacherName,
      Email: teacherEmail,
      SoDienThoai: teacherPhone,
    };

    await addTeacher(newTeacher); // Ghi dữ liệu vào Firebase
  }

  document.getElementById("teacherModal").style.display = "none"; // Đóng modal
  init(); // Cập nhật lại bảng
});

// Khởi chạy khi trang đã tải
document.addEventListener("DOMContentLoaded", function () {
  init();

  // Gán sự kiện cho nút "Thêm học viên"
  document.getElementById("openModalBtn").addEventListener("click", function () {
    document.getElementById("modalTitle").textContent = "Thêm giảng viên mới"; // Cập nhật tiêu đề
    document.getElementById("modalSubmitBtn").textContent = "Thêm giảng viên"; // Cập nhật nút
    document.getElementById("teacherModal").style.display = "block"; // Hiện modal

    // Đặt lại các giá trị input trong modal
    document.getElementById("teacherName").value = "";
    document.getElementById("teacherEmail").value = "";
    document.getElementById("teacherPhone").value = "";
    teacherToEditId = null; // Đảm bảo không ở trạng thái chỉnh sửa
  });
});

// Đóng modal khi click bên ngoài modal
window.addEventListener("click", function (event) {
  const teacherModal = document.getElementById("teacherModal");
  const deleteModal = document.getElementById("deleteModal");

  if (event.target === teacherModal) {
    teacherModal.style.display = "none";
  }

  if (event.target === deleteModal) {
    deleteModal.style.display = "none";
  }
});

// Hàm tìm kiếm học viên theo tên
async function searchTeachers(keyword) {
  const teachers = await getTeachers();
  if (!teachers) return;

  const filteredTeachers = Object.values(teachers).filter(teacher =>
    teacher.HoVaTen.toLowerCase().includes(keyword.toLowerCase()) // Tìm kiếm theo tên
  );

  totalTeachers = filteredTeachers.length; // Cập nhật totalStudents
  currentPage = 1; // Quay lại trang đầu tiên sau khi tìm kiếm
  displayTeachers(filteredTeachers, currentPage); // Hiển thị học viên đã lọc
}

// Lắng nghe sự kiện tìm kiếm
document.getElementById('searchBtn').addEventListener('click', function () {
  const keyword = document.getElementById('searchInput').value;
  if (keyword.trim() === "") {
    init(); // Nếu không nhập gì thì hiển thị lại toàn bộ học viên
  } else {
    searchTeachers(keyword);
  }
});








