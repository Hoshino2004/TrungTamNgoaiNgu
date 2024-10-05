// Thêm đoạn mã này trong thẻ <script> trên index.html
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("userName").textContent = localStorage.getItem("userEmail") || "Nguyễn Văn A";

    // Lấy tất cả các liên kết từ sidebar
    const menuLinks = document.querySelectorAll(".sidebar nav ul li a");

    // Lấy tất cả các section quản lý
    const sections = document.querySelectorAll(".management-section");

    // Hàm để ẩn tất cả các section
    function hideAllSections() {
        sections.forEach(section => {
            section.classList.remove("active");
        });
    }

    // Hàm để hiển thị section tương ứng
    function showSection(sectionId) {
        hideAllSections(); // Ẩn tất cả section
        const section = document.querySelector(sectionId);
        if (section) {
            section.classList.add("active"); // Hiển thị section được chọn
        }
    }

    // Thêm sự kiện click vào từng liên kết
    menuLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault(); // Ngăn chuyển hướng trang
            const targetId = link.getAttribute("href"); // Lấy id của section tương ứng
            showSection(targetId); // Hiển thị section tương ứng
        });
    });

    // Mặc định hiển thị phần quản lý học viên khi tải trang
    showSection("#student-management");
});
