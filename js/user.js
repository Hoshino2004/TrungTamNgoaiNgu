// Import Firebase app và các module cần thiết
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getDatabase, ref, get, child, set, remove, update } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

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
const auth = getAuth(app); // Khởi tạo Firebase Authentication

// Biến lưu trữ ID học viên sẽ xóa hoặc chỉnh sửa
let userToDeleteId = null;
let userToEditId = null;

let currentPage = 1; // Trang hiện tại
const usersPerPage = 8; // Số học viên mỗi trang
let totalUsers = 0; // Tổng số học viên

let users = []; // Khai báo biến users toàn cục

// Hàm tạo mã học viên ngẫu nhiên theo kiểu HV0000
function generateUserId() {
  const randomNum = Math.floor(10000 + Math.random() * 90000); // Tạo số ngẫu nhiên từ 10000 đến 99999
  return `ND${randomNum.toString().slice(-4)}`; // Trả về mã học viên
}

// Hàm kiểm tra mã học viên đã tồn tại
async function isUserIdExists(userId) {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'User'));
  if (snapshot.exists()) {
    const users = snapshot.val();
    return Object.values(users).some(user => user.MaNguoiDung === userId); // Kiểm tra mã học viên
  }
  return false;
}

// Hàm lấy dữ liệu từ Firebase
async function getUsers() {
  const dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, 'User'));
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
function displayUsers(users, page = 1) {
  const tableBody = document.querySelector("#user-management tbody");
  tableBody.innerHTML = ""; // Xóa nội dung cũ

  // Tính toán các chỉ số của học viên cần hiển thị trên trang
  const startIndex = (page - 1) * usersPerPage;
  const endIndex = Math.min(startIndex + usersPerPage, users.length);

  // Hiển thị học viên theo trang
  for (let i = startIndex; i < endIndex; i++) {
    const user = users[i];

    const row = document.createElement("tr");
    row.innerHTML = `
    <td>${user.MaNguoiDung}</td>
    <td>${user.Email}</td>
    <td>${user.Password}</td>
    <td>${user.Role}</td>
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
  document.getElementById("pageInfo").textContent = `Trang ${page} / ${Math.ceil(totalUsers / usersPerPage)}`;
  // Gọi hàm này sau khi hiển thị học viên
  updatePagination();
}

document.getElementById("prevPage").addEventListener("click", function () {
  if (currentPage > 1) {
    currentPage--;
    displayUsers(Object.values(users), currentPage);
  }
});

document.getElementById("nextPage").addEventListener("click", function () {
  if (currentPage * usersPerPage < totalUsers) {
    currentPage++;
    displayUsers(Object.values(users), currentPage);
  }
});

function updatePagination() {
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage * usersPerPage >= totalUsers;
}

// Hàm ghi dữ liệu vào Firebase
async function addUser(user) {
  const dbRef = ref(database, 'User/' + user.MaNguoiDung); // Sử dụng mã học viên làm ID
  try {
    await set(dbRef, user);
    console.log("User added successfully");
    // Sau khi thêm thành công, gọi lại hàm hiển thị
    displayUsers(users, currentPage); // Cập nhật lại danh sách học viên
  } catch (error) {
    console.error("Error adding user: ", error);
  }
}

// Hàm cập nhật học viên
async function updateUser(userId, updatedData) {
  const dbRef = ref(database, 'User/' + userId);
  try {
    await update(dbRef, updatedData);
    console.log("User updated successfully");
  } catch (error) {
    console.error("Error updating user: ", error);
  }
}

// Hàm khởi tạo
async function init() {
  const usersData = await getUsers();
  if (usersData) {
    users = Object.values(usersData); // Lưu trữ học viên vào biến toàn cục
    totalUsers = users.length; // Cập nhật tổng số học viên
    displayUsers(users, currentPage); // Hiển thị trang đầu tiên
  } else {
    totalUsers = 0; // Nếu không có học viên, đặt totalUsers về 0
  }
}



// Hàm để gán sự kiện cho các nút "Xóa"
function addDeleteEventListeners() {
  document.querySelectorAll(".delete-btn").forEach(button => {
    button.addEventListener("click", function () {
      userToDeleteId = this.closest('tr').children[0].textContent; // Lấy mã học viên từ hàng
      document.querySelector("#deleteModal p").textContent =
        `Bạn có chắc chắn muốn xóa người dùng ${userToDeleteId} này không?`; // Cập nhật thông điệp
      document.getElementById("deleteModal").style.display = "block"; // Hiện modal xác nhận
    });
  });
}

// Gán sự kiện cho các nút "Sửa"
function addEditEventListeners() {
  document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", async function () {
      userToEditId = this.closest('tr').children[0].textContent; // Lấy mã học viên từ hàng
      const dbRef = ref(database, 'User/' + userToEditId);
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const user = snapshot.val();

        // Điền thông tin vào các input trong modal
        document.getElementById("userEmail").value = user.Email;
        document.getElementById("userPassword").value = user.Password;

        // Gọi hàm để điền dữ liệu vào spinner và chọn lớp hiện tại
        await populateRoleSpinner();
        document.getElementById("userRole").value = user.Role;

        // Cập nhật tiêu đề và nút trong modal cho chế độ sửa
        document.getElementById("modalTitle").textContent = "Sửa thông tin người dùng";
        document.getElementById("modalSubmitBtn").textContent = "Cập nhật";

        // Đặt thuộc tính readonly cho email để không cho sửa
        document.getElementById("userEmail").setAttribute('readonly', true);
        document.getElementById("userPassword").setAttribute('readonly', true);

        // Hiển thị modal
        document.getElementById("userModal").style.display = "block";
      }
    });
  });
}


// Xử lý xác nhận xóa
document.getElementById("confirmDeleteBtn").addEventListener("click", function () {
  if (userToDeleteId) {
    deleteUser(userToDeleteId); // Xóa học viên
    document.getElementById("deleteModal").style.display = "none"; // Đóng modal xác nhận
    userToDeleteId = null; // Đặt lại biến
  }
});

// Hàm xóa học viên khỏi Firebase
async function deleteUser(userId) {
  const dbRef = ref(database, 'User/' + userId); // Đường dẫn đến học viên
  try {
    await remove(dbRef); // Xóa học viên
    console.log("User deleted successfully");
    init(); // Cập nhật lại bảng
  } catch (error) {
    console.error("Error deleting user: ", error);
  }
}

// Đóng modal khi bấm nút đóng
document.querySelectorAll(".close").forEach(closeButton => {
  closeButton.addEventListener("click", function () {
    document.getElementById("userModal").style.display = "none"; // Đóng modal
    document.getElementById("deleteModal").style.display = "none"; // Đóng modal xác nhận
  });
});

// Nút "Hủy" trong modal
document.querySelector(".cancel-btn").addEventListener("click", function () {
  document.getElementById("userModal").style.display = "none"; // Đóng modal
});

// Nút "Hủy" trong modal xóa
document.getElementById("cancelDeleteBtn").addEventListener("click", function () {
  document.getElementById("deleteModal").style.display = "none"; // Đóng modal xác nhận xóa
  userToDeleteId = null; // Đặt lại biến để không xóa học viên
});


// Sự kiện khi modal thêm hoặc sửa học viên được gửi
document.querySelector(".modal-form").addEventListener("submit", async function (event) {
  event.preventDefault(); // Ngăn không cho reload trang

  const userEmail = document.getElementById("userEmail").value;
  const userPassword = document.getElementById("userPassword").value;
  const userRole = document.getElementById("userRole").value;

  if (userToEditId) {
    // Nếu đang chỉnh sửa học viên (không chỉnh sửa email)
    const updatedUser = {
      Password: userPassword, // Mật khẩu mới (nếu có)
      Role: userRole, // Cập nhật vai trò
    };

    // Cập nhật mật khẩu cho người dùng theo email
    await updatePassword(userEmail, userPassword); // Cập nhật mật khẩu cho người dùng bằng email

    await updateUser(userToEditId, updatedUser); // Cập nhật thông tin trong Realtime Database
  } else {
    // Thêm học viên mới
    let newUserId;
    do {
      newUserId = generateUserId(); // Tạo mã học viên mới
    } while (await isUserIdExists(newUserId)); // Kiểm tra mã học viên đã tồn tại chưa

    // Đăng ký người dùng mới qua Firebase Authentication
    createUserWithEmailAndPassword(auth, userEmail, userPassword)
      .then(async (userCredential) => {
        const user = userCredential.user;
        // Gửi email xác thực
        sendEmailVerification(user);

        // Tạo đối tượng học viên
        const newUser = {
          MaNguoiDung: newUserId,
          Email: userEmail,
          Password: userPassword,
          Role: userRole,
        };

        await addUser(newUser); // Ghi dữ liệu vào Firebase Realtime Database
        alert("Thêm người dùng thành công");
      })
      .catch((error) => {
        console.error("Lỗi khi tạo người dùng: ", error);
        alert("Lỗi khi tạo người dùng: " + error.message);
      });
  }

  document.getElementById("userModal").style.display = "none"; // Đóng modal
  init(); // Cập nhật lại bảng
});

async function updatePassword(email, newPassword) {
  try {
    // Tìm người dùng theo email
    const user = await getAuth().getUserByEmail(email); // Sử dụng hàm lấy người dùng theo email
    await user.updatePassword(newPassword);
    console.log("Password updated successfully");
  } catch (error) {
    console.error("Error updating password: ", error);
  }
}




// Khởi chạy khi trang đã tải
document.addEventListener("DOMContentLoaded", function () {
  init();

  // Gán sự kiện cho nút "Thêm học viên"
  document.getElementById("openModalBtn").addEventListener("click", function () {
    document.getElementById("modalTitle").textContent = "Thêm người dùng mới"; // Cập nhật tiêu đề
    document.getElementById("modalSubmitBtn").textContent = "Thêm người dùng"; // Cập nhật nút
    document.getElementById("userModal").style.display = "block"; // Hiện modal

    // Đặt lại các giá trị input trong modal
    document.getElementById("userEmail").value = "";
    document.getElementById("userPassword").value = "";
    userToEditId = null; // Đảm bảo không ở trạng thái chỉnh sửa

    if (document.getElementById("userEmail").hasAttribute("readonly")) {
      document.getElementById("userEmail").removeAttribute("readonly");
    }
    if (document.getElementById("userPassword").hasAttribute("readonly")) {
      document.getElementById("userPassword").removeAttribute("readonly");
    }
  });

  // Gọi hàm để điền dữ liệu vào spinner
  populateRoleSpinner();
});

// Đóng modal khi click bên ngoài modal
window.addEventListener("click", function (event) {
  const userModal = document.getElementById("userModal");
  const deleteModal = document.getElementById("deleteModal");

  if (event.target === userModal) {
    userModal.style.display = "none";
  }

  if (event.target === deleteModal) {
    deleteModal.style.display = "none";
  }
});

// Hàm tìm kiếm học viên theo tên
async function searchUsers(keyword) {
  const users = await getUsers();
  if (!users) return;

  const filteredUsers = Object.values(users).filter(user =>
    user.Email.toLowerCase().includes(keyword.toLowerCase()) // Tìm kiếm theo tên
  );

  totalUsers = filteredUsers.length; // Cập nhật totalUsers
  currentPage = 1; // Quay lại trang đầu tiên sau khi tìm kiếm
  displayUsers(filteredUsers, currentPage); // Hiển thị học viên đã lọc
}

// Lắng nghe sự kiện tìm kiếm
document.getElementById('searchBtn').addEventListener('click', function () {
  const keyword = document.getElementById('searchInput').value;
  if (keyword.trim() === "") {
    init(); // Nếu không nhập gì thì hiển thị lại toàn bộ học viên
  } else {
    searchUsers(keyword);
  }
});

// Hàm lấy danh sách lớp học từ Firebase và hiển thị vào spinner
async function populateRoleSpinner() {
  const dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, 'Role'));
    if (snapshot.exists()) {
      const roles = snapshot.val();
      const roleSelect = document.getElementById("userRole");
      roleSelect.innerHTML = ""; // Xóa các tùy chọn hiện có

      // Thêm các lớp học vào spinner
      roles.forEach(role => {
        const option = document.createElement("option");
        option.value = role; // Giá trị là tên lớp học
        option.textContent = role; // Hiển thị tên lớp học
        roleSelect.appendChild(option);
      });
    } else {
      console.log("No class data available");
    }
  } catch (error) {
    console.error("Error fetching roles: ", error);
  }
}








