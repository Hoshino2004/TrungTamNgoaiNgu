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
let courseToDeleteId = null;
let courseToEditId = null;

let currentPage = 1; // Trang hiện tại
const coursesPerPage = 8; // Số học viên mỗi trang
let totalCourses = 0; // Tổng số học viên

let courses = []; // Khai báo biến courses toàn cục

// Hàm tạo mã học viên ngẫu nhiên theo kiểu HV0000
function generateCourseId() {
  const randomNum = Math.floor(10000 + Math.random() * 90000); // Tạo số ngẫu nhiên từ 10000 đến 99999
  return `KH${randomNum.toString().slice(-4)}`; // Trả về mã học viên
}

// Hàm kiểm tra mã học viên đã tồn tại
async function isCourseIdExists(courseId) {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'Course'));
  if (snapshot.exists()) {
    const courses = snapshot.val();
    return Object.values(courses).some(course => course.MaKhoaHoc === courseId); // Kiểm tra mã học viên
  }
  return false;
}

// Hàm lấy dữ liệu từ Firebase
async function getCourses() {
  const dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, 'Course'));
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
function displayCourses(courses, page = 1) {
  const tableBody = document.querySelector("#course-management tbody");
  tableBody.innerHTML = ""; // Xóa nội dung cũ

  // Tính toán các chỉ số của học viên cần hiển thị trên trang
  const startIndex = (page - 1) * coursesPerPage;
  const endIndex = Math.min(startIndex + coursesPerPage, courses.length);

  // Hiển thị học viên theo trang
  for (let i = startIndex; i < endIndex; i++) {
    const course = courses[i];
    
    const row = document.createElement("tr");
    row.innerHTML = `
    <td>${course.MaKhoaHoc}</td>
    <td>${course.TenKhoaHoc}</td>
    <td>${course.ThoiLuong} buổi</td>
    <td>${course.GiangVienPhuTrach}</td>
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
  document.getElementById("pageInfo").textContent = `Trang ${page} / ${Math.ceil(totalCourses / coursesPerPage)}`;
  // Gọi hàm này sau khi hiển thị học viên
  updatePagination();
}

document.getElementById("prevPage").addEventListener("click", function () {
  if (currentPage > 1) {
    currentPage--;
    displayCourses(Object.values(courses), currentPage);
  }
});

document.getElementById("nextPage").addEventListener("click", function () {
  if (currentPage * coursesPerPage < totalCourses) {
    currentPage++;
    displayCourses(Object.values(courses), currentPage);
  }
});

function updatePagination() {
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage * coursesPerPage >= totalCourses;
}

// Hàm ghi dữ liệu vào Firebase
async function addCourse(course) {
  const dbRef = ref(database, 'Course/' + course.MaKhoaHoc); // Sử dụng mã học viên làm ID
  try {
    await set(dbRef, course);
    console.log("Course added successfully");
    // Sau khi thêm thành công, gọi lại hàm hiển thị
    displayCourses(courses, currentPage); // Cập nhật lại danh sách học viên
  } catch (error) {
    console.error("Error adding course: ", error);
  }
}

// Hàm cập nhật học viên
async function updateCourse(courseId, updatedData) {
  const dbRef = ref(database, 'Course/' + courseId);
  try {
    await update(dbRef, updatedData);
    console.log("Course updated successfully");
  } catch (error) {
    console.error("Error updating course: ", error);
  }
}

// Hàm khởi tạo
async function init() {
  const coursesData = await getCourses();
  if (coursesData) {
    courses = Object.values(coursesData); // Lưu trữ học viên vào biến toàn cục
    totalCourses = courses.length; // Cập nhật tổng số học viên
    displayCourses(courses, currentPage); // Hiển thị trang đầu tiên
  } else {
    totalCourses = 0; // Nếu không có học viên, đặt totalCourses về 0
  }
}



// Hàm để gán sự kiện cho các nút "Xóa"
function addDeleteEventListeners() {
  document.querySelectorAll(".delete-btn").forEach(button => {
    button.addEventListener("click", function () {
      courseToDeleteId = this.closest('tr').children[0].textContent; // Lấy mã học viên từ hàng
      document.querySelector("#deleteModal p").textContent =
        `Bạn có chắc chắn muốn xóa khóa học ${courseToDeleteId} này không?`; // Cập nhật thông điệp
      document.getElementById("deleteModal").style.display = "block"; // Hiện modal xác nhận
    });
  });
}

// Gán sự kiện cho các nút "Sửa"
function addEditEventListeners() {
  document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", async function () {
      courseToEditId = this.closest('tr').children[0].textContent; // Lấy mã học viên từ hàng
      const dbRef = ref(database, 'Course/' + courseToEditId);
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const course = snapshot.val();

        // Điền thông tin vào các input trong modal
        document.getElementById("courseName").value = course.TenKhoaHoc;
        document.getElementById("courseDuration").value = course.ThoiLuong;

        // Gọi hàm để điền dữ liệu vào spinner và chọn lớp hiện tại
        await populateTeacherSpinner();
        document.getElementById("courseTeacher").value = course.GiangVienPhuTrach;

        // Cập nhật tiêu đề và nút trong modal cho chế độ sửa
        document.getElementById("modalTitle").textContent = "Sửa thông tin khóa học";
        document.getElementById("modalSubmitBtn").textContent = "Cập nhật";

        // Hiển thị modal
        document.getElementById("courseModal").style.display = "block";
      }
    });
  });

}

// Xử lý xác nhận xóa
document.getElementById("confirmDeleteBtn").addEventListener("click", function () {
  if (courseToDeleteId) {
    deleteCourse(courseToDeleteId); // Xóa học viên
    document.getElementById("deleteModal").style.display = "none"; // Đóng modal xác nhận
    courseToDeleteId = null; // Đặt lại biến
  }
});

// Hàm xóa học viên khỏi Firebase
async function deleteCourse(courseId) {
  const dbRef = ref(database, 'Course/' + courseId); // Đường dẫn đến học viên
  try {
    await remove(dbRef); // Xóa học viên
    console.log("Course deleted successfully");
    init(); // Cập nhật lại bảng
  } catch (error) {
    console.error("Error deleting course: ", error);
  }
}

// Đóng modal khi bấm nút đóng
document.querySelectorAll(".close").forEach(closeButton => {
  closeButton.addEventListener("click", function () {
    document.getElementById("courseModal").style.display = "none"; // Đóng modal
    document.getElementById("deleteModal").style.display = "none"; // Đóng modal xác nhận
  });
});

// Nút "Hủy" trong modal
document.querySelector(".cancel-btn").addEventListener("click", function () {
  document.getElementById("courseModal").style.display = "none"; // Đóng modal
});

// Nút "Hủy" trong modal xóa
document.getElementById("cancelDeleteBtn").addEventListener("click", function () {
  document.getElementById("deleteModal").style.display = "none"; // Đóng modal xác nhận xóa
  courseToDeleteId = null; // Đặt lại biến để không xóa học viên
});


// Sự kiện khi modal thêm hoặc sửa học viên được gửi
document.querySelector(".modal-form").addEventListener("submit", async function (event) {
  event.preventDefault(); // Ngăn không cho reload trang

  const courseName = document.getElementById("courseName").value;
  const courseDuration = document.getElementById("courseDuration").value;
  const courseTeacher = document.getElementById("courseTeacher").value;

  if (courseToEditId) {
    // Nếu đang chỉnh sửa học viên
    const updatedCourse = {
      TenKhoaHoc: courseName,
      ThoiLuong: courseDuration,
      GiangVienPhuTrach: courseTeacher,
    };
    await updateCourse(courseToEditId, updatedCourse); // Cập nhật dữ liệu
  } else {
    // Thêm học viên mới
    let newCourseId;
    do {
      newCourseId = generateCourseId(); // Tạo mã học viên mới
    } while (await isCourseIdExists(newCourseId)); // Kiểm tra mã học viên đã tồn tại chưa

    const newCourse = {
      MaKhoaHoc: newCourseId,
      TenKhoaHoc: courseName,
      ThoiLuong: courseDuration,
      GiangVienPhuTrach: courseTeacher,
    };

    await addCourse(newCourse); // Ghi dữ liệu vào Firebase
  }

  document.getElementById("courseModal").style.display = "none"; // Đóng modal
  init(); // Cập nhật lại bảng
});

// Khởi chạy khi trang đã tải
document.addEventListener("DOMContentLoaded", function () {
  init();

  // Gán sự kiện cho nút "Thêm học viên"
  document.getElementById("openModalBtn").addEventListener("click", function () {
    document.getElementById("modalTitle").textContent = "Thêm khóa học mới"; // Cập nhật tiêu đề
    document.getElementById("modalSubmitBtn").textContent = "Thêm khóa học"; // Cập nhật nút
    document.getElementById("courseModal").style.display = "block"; // Hiện modal

    // Đặt lại các giá trị input trong modal
    document.getElementById("courseName").value = "";
    document.getElementById("courseDuration").value = "";
    courseToEditId = null; // Đảm bảo không ở trạng thái chỉnh sửa
  });

  // Gọi hàm để điền dữ liệu vào spinner
  populateTeacherSpinner();
});

// Đóng modal khi click bên ngoài modal
window.addEventListener("click", function (event) {
  const courseModal = document.getElementById("courseModal");
  const deleteModal = document.getElementById("deleteModal");

  if (event.target === courseModal) {
    courseModal.style.display = "none";
  }

  if (event.target === deleteModal) {
    deleteModal.style.display = "none";
  }
});

// Hàm tìm kiếm học viên theo tên
async function searchCourses(keyword) {
  const courses = await getCourses();
  if (!courses) return;

  const filteredCourses = Object.values(courses).filter(course =>
    course.TenKhoaHoc.toLowerCase().includes(keyword.toLowerCase()) // Tìm kiếm theo tên
  );

  totalCourses = filteredCourses.length; // Cập nhật totalCourses
  currentPage = 1; // Quay lại trang đầu tiên sau khi tìm kiếm
  displayCourses(filteredCourses, currentPage); // Hiển thị học viên đã lọc
}

// Lắng nghe sự kiện tìm kiếm
document.getElementById('searchBtn').addEventListener('click', function () {
  const keyword = document.getElementById('searchInput').value;
  if (keyword.trim() === "") {
    init(); // Nếu không nhập gì thì hiển thị lại toàn bộ học viên
  } else {
    searchCourses(keyword);
  }
});

// Hàm lấy danh sách lớp học từ Firebase và hiển thị vào spinner
async function populateTeacherSpinner() {
  const dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, 'Teacher'));
    if (snapshot.exists()) {
      const teachers = snapshot.val();
      const teacherSelect = document.getElementById("courseTeacher");
      teacherSelect.innerHTML = ""; // Xóa các tùy chọn hiện có

      // Thêm các lớp học vào spinner
      Object.values(teachers).forEach(cls => {
        const option = document.createElement("option");
        option.value = cls.HoVaTen; // Giá trị là tên lớp học
        option.textContent = cls.HoVaTen; // Hiển thị tên lớp học
        teacherSelect.appendChild(option);
      });
    } else {
      console.log("No teacher data available");
    }
  } catch (error) {
    console.error("Error fetching teachers: ", error);
  }
}








