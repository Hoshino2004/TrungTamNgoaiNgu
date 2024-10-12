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
let classToDeleteId = null;
let classToEditId = null;

let currentPage = 1; // Trang hiện tại
const classesPerPage = 8; // Số học viên mỗi trang
let totalClasses = 0; // Tổng số học viên

let classes = []; // Khai báo biến students toàn cục

// Hàm tạo mã học viên ngẫu nhiên theo kiểu HV0000
function generateClassId() {
  const randomNum = Math.floor(10000 + Math.random() * 90000); // Tạo số ngẫu nhiên từ 10000 đến 99999
  return `LH${randomNum.toString().slice(-4)}`; // Trả về mã học viên
}

// Hàm kiểm tra mã học viên đã tồn tại
async function isClassIdExists(classId) {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'Class'));
  if (snapshot.exists()) {
    const students = snapshot.val();
    return Object.values(students).some(student => student.MaLopHoc === classId); // Kiểm tra mã học viên
  }
  return false;
}

// Hàm lấy dữ liệu từ Firebase
async function getClasses() {
  const dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, 'Class'));
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

// Hàm đếm số lượng học viên trong từng lớp học
async function countStudentsByClass() {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'Student'));
  if (snapshot.exists()) {
    const students = snapshot.val();
    const classCounts = {};

    // Duyệt qua từng học viên và đếm số lượng theo lớp học
    Object.values(students).forEach(student => {
      const className = student.LopHoc;
      if (!classCounts[className]) {
        classCounts[className] = 0;
      }
      classCounts[className]++;
    });

    return classCounts; // Trả về object chứa số lượng học viên theo lớp
  }
  return {};
}

// Hàm hiển thị học viên lên table
async function displayClasses(classes, page = 1) {
  const tableBody = document.querySelector("#class-management tbody");
  tableBody.innerHTML = ""; // Xóa nội dung cũ

  // Lấy số lượng học viên theo từng lớp học
  const classCounts = await countStudentsByClass();

  // Tính toán các chỉ số của học viên cần hiển thị trên trang
  const startIndex = (page - 1) * classesPerPage;
  const endIndex = Math.min(startIndex + classesPerPage, classes.length);

  // Hiển thị học viên theo trang
  for (let i = startIndex; i < endIndex; i++) {
    const classN = classes[i];
    const studentCount = classCounts[classN.TenLopHoc] || 0; // Lấy số lượng học viên từ classCounts
    const row = document.createElement("tr");
    row.innerHTML = `
    <td>${classN.MaLopHoc}</td>
    <td>${classN.TenLopHoc}</td>
    <td>${classN.GiangVien}</td>
    <td>${studentCount}</td>
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
  document.getElementById("pageInfo").textContent = `Trang ${page} / ${Math.ceil(totalClasses / classesPerPage)}`;
  // Gọi hàm này sau khi hiển thị học viên
  updatePagination();
}

document.getElementById("prevPage").addEventListener("click", function () {
  if (currentPage > 1) {
    currentPage--;
    displayClasses(Object.values(classes), currentPage);
  }
});

document.getElementById("nextPage").addEventListener("click", function () {
  if (currentPage * classesPerPage < totalClasses) {
    currentPage++;
    displayClasses(Object.values(classes), currentPage);
  }
});

function updatePagination() {
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage * classesPerPage >= totalClasses;
}

// Hàm ghi dữ liệu vào Firebase
async function addClass(classN) {
  const dbRef = ref(database, 'Class/' + classN.MaLopHoc); // Sử dụng mã học viên làm ID
  try {
    await set(dbRef, classN);
    console.log("Class added successfully");
    // Sau khi thêm thành công, gọi lại hàm hiển thị
    displayClasses(classes, currentPage); // Cập nhật lại danh sách học viên
  } catch (error) {
    console.error("Error adding student: ", error);
  }
}

// Hàm cập nhật học viên
async function updateClass(classId, updatedData) {
  const dbRef = ref(database, 'Class/' + classId);
  try {
    await update(dbRef, updatedData);
    console.log("Class updated successfully");
  } catch (error) {
    console.error("Error updating class: ", error);
  }
}

// Hàm đếm số lượng học viên trong từng lớp học và cập nhật vào Firebase
async function updateStudentCountInFirebase() {
  const classCounts = await countStudentsByClass(); // Đếm số lượng học viên theo lớp

  // Lấy danh sách lớp học từ Firebase
  const dbRef = ref(database);
  const classSnapshot = await get(child(dbRef, 'Class'));

  if (classSnapshot.exists()) {
    const classes = classSnapshot.val();

    // Duyệt qua từng lớp và cập nhật số lượng học viên
    for (const classId in classes) {
      const classData = classes[classId];
      const studentCount = classCounts[classData.TenLopHoc] || 0; // Số lượng học viên của lớp

      // Cập nhật dữ liệu lớp học với số lượng học viên mới
      await updateClass(classId, { ...classData, SoLuongHocVien: studentCount });
    }

    console.log("Updated student counts in Firebase");
  }
}

// Hàm khởi tạo
async function init() {
  const classesData = await getClasses();
  if (classesData) {
    classes = Object.values(classesData); // Lưu trữ học viên vào biến toàn cục
    totalClasses = classes.length; // Cập nhật tổng số học viên
    displayClasses(classes, currentPage); // Hiển thị trang đầu tiên
  } else {
    totalClasses = 0; // Nếu không có học viên, đặt totalStudents về 0
  }
}



// Hàm để gán sự kiện cho các nút "Xóa"
function addDeleteEventListeners() {
  document.querySelectorAll(".delete-btn").forEach(button => {
    button.addEventListener("click", function () {
      classToDeleteId = this.closest('tr').children[0].textContent; // Lấy mã học viên từ hàng
      document.querySelector("#deleteModal p").textContent =
        `Bạn có chắc chắn muốn xóa lớp học ${classToDeleteId} này không?`; // Cập nhật thông điệp
      document.getElementById("deleteModal").style.display = "block"; // Hiện modal xác nhận
    });
  });
}

// Gán sự kiện cho các nút "Sửa"
function addEditEventListeners() {
  document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", async function () {
      classToEditId = this.closest('tr').children[0].textContent; // Lấy mã học viên từ hàng
      const dbRef = ref(database, 'Class/' + classToEditId);
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const classN = snapshot.val();
        // Điền thông tin vào các input trong modal
        document.getElementById("className").value = classN.TenLopHoc;

        await populateTeacherSpinner();
        document.getElementById("classTeacher").value = classN.GiangVien;

        // Cập nhật tiêu đề và nút trong modal cho chế độ sửa
        document.getElementById("modalTitle").textContent = "Sửa thông tin lớp học";
        document.getElementById("modalSubmitBtn").textContent = "Cập nhật";

        // Hiển thị modal
        document.getElementById("classModal").style.display = "block";
      }
    });
  });
}

// Xử lý xác nhận xóa
document.getElementById("confirmDeleteBtn").addEventListener("click", function () {
  if (classToDeleteId) {
    deleteClass(classToDeleteId); // Xóa học viên
    document.getElementById("deleteModal").style.display = "none"; // Đóng modal xác nhận
    classToDeleteId = null; // Đặt lại biến
  }
});

// Hàm xóa học viên khỏi Firebase
async function deleteClass(classId) {
  const dbRef = ref(database, 'Class/' + classId); // Đường dẫn đến học viên
  try {
    await remove(dbRef); // Xóa học viên
    console.log("Class deleted successfully");
    init(); // Cập nhật lại bảng
  } catch (error) {
    console.error("Error deleting class: ", error);
  }
}

// Đóng modal khi bấm nút đóng
document.querySelectorAll(".close").forEach(closeButton => {
  closeButton.addEventListener("click", function () {
    document.getElementById("classModal").style.display = "none"; // Đóng modal
    document.getElementById("deleteModal").style.display = "none"; // Đóng modal xác nhận
  });
});

// Nút "Hủy" trong modal
document.querySelector(".cancel-btn").addEventListener("click", function () {
  document.getElementById("classModal").style.display = "none"; // Đóng modal
});

// Nút "Hủy" trong modal xóa
document.getElementById("cancelDeleteBtn").addEventListener("click", function () {
  document.getElementById("deleteModal").style.display = "none"; // Đóng modal xác nhận xóa
  classToDeleteId = null; // Đặt lại biến để không xóa học viên
});


// Sự kiện khi modal thêm hoặc sửa học viên được gửi
document.querySelector(".modal-form").addEventListener("submit", async function (event) {
  event.preventDefault(); // Ngăn không cho reload trang

  const className = document.getElementById("className").value;
  const classTeacher = document.getElementById("classTeacher").value;

  if (classToEditId) {
    // Nếu đang chỉnh sửa học viên
    const updatedClass = {
      TenLopHoc: className,
      GiangVien: classTeacher,
    };
    await updateClass(classToEditId, updatedClass); // Cập nhật dữ liệu
  } else {
    // Thêm học viên mới
    let newClassId;
    do {
      newClassId = generateClassId(); // Tạo mã học viên mới
    } while (await isClassIdExists(newClassId)); // Kiểm tra mã học viên đã tồn tại chưa

    const newClass = {
      MaLopHoc: newClassId,
      TenLopHoc: className,
      GiangVien: classTeacher,
      SoLuongHocVien: 0,
    };

    await addClass(newClass); // Ghi dữ liệu vào Firebase
  }

  document.getElementById("classModal").style.display = "none"; // Đóng modal
  init(); // Cập nhật lại bảng
});

// Khởi chạy khi trang đã tải
document.addEventListener("DOMContentLoaded", async function () {
  init();
  await updateStudentCountInFirebase(); // Cập nhật số lượng học viên lên Firebase sau khi hiển thị

  // Gán sự kiện cho nút "Thêm học viên"
  document.getElementById("openModalBtn").addEventListener("click", function () {
    document.getElementById("modalTitle").textContent = "Thêm lớp học mới"; // Cập nhật tiêu đề
    document.getElementById("modalSubmitBtn").textContent = "Thêm lớp học"; // Cập nhật nút
    document.getElementById("classModal").style.display = "block"; // Hiện modal

    // Đặt lại các giá trị input trong modal
    document.getElementById("className").value = "";
    document.getElementById("classStudentCount").value = "";
    classToEditId = null; // Đảm bảo không ở trạng thái chỉnh sửa
  });
  populateTeacherSpinner();
});

// Đóng modal khi click bên ngoài modal
window.addEventListener("click", function (event) {
  const classModal = document.getElementById("classModal");
  const deleteModal = document.getElementById("deleteModal");

  if (event.target === classModal) {
    classModal.style.display = "none";
  }

  if (event.target === deleteModal) {
    deleteModal.style.display = "none";
  }
});

// Hàm tìm kiếm học viên theo tên
async function searchClasses(keyword) {
  const classes = await getClasses();
  if (!classes) return;

  const filteredClasses = Object.values(classes).filter(classN =>
    classN.TenLopHoc.toLowerCase().includes(keyword.toLowerCase()) // Tìm kiếm theo tên
  );

  totalClasses = filteredClasses.length; // Cập nhật totalStudents
  currentPage = 1; // Quay lại trang đầu tiên sau khi tìm kiếm
  displayClasses(filteredClasses, currentPage); // Hiển thị học viên đã lọc
}

// Lắng nghe sự kiện tìm kiếm
document.getElementById('searchBtn').addEventListener('click', function () {
  const keyword = document.getElementById('searchInput').value;
  if (keyword.trim() === "") {
    init(); // Nếu không nhập gì thì hiển thị lại toàn bộ học viên
  } else {
    searchClasses(keyword);
  }
});

// Hàm lấy danh sách lớp học từ Firebase và hiển thị vào spinner
async function populateTeacherSpinner() {
  const dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, 'Teacher'));
    if (snapshot.exists()) {
      const teachers = snapshot.val();
      const teacherSelect = document.getElementById("classTeacher");
      teacherSelect.innerHTML = ""; // Xóa các tùy chọn hiện có

      // Thêm các lớp học vào spinner
      Object.values(teachers).forEach(teacher => {
        const option = document.createElement("option");
        option.value = teacher.HoVaTen; // Giá trị là tên lớp học
        option.textContent = teacher.HoVaTen; // Hiển thị tên lớp học
        teacherSelect.appendChild(option);
      });
    } else {
      console.log("No class data available");
    }
  } catch (error) {
    console.error("Error fetching teachers: ", error);
  }
}










