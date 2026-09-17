/* =========================================================
   PRO FIT GYM - MAIN JAVASCRIPT
   ========================================================= */

// 1. DỮ LIỆU MẪU (MOCK DATA) - Bạn có thể thay đổi tùy ý
const sessions = [
    {
        id: 1,
        muscle: "Ngực + Tay sau (Bench Press)",
        date: "Hôm nay",
        time: "18:30 - 20:00",
        location: "CityGym Sài Gòn (Q1)",
        creator: "Coach Long",
        currentMembers: 3,
        maxMembers: 6
    },
    {
        id: 2,
        muscle: "Lưng + Tay trước",
        date: "Ngày mai",
        time: "08:00 - 09:30",
        location: "Fit Center Thủ Đức",
        creator: "Gymer Tuấn",
        currentMembers: 8,
        maxMembers: 8 // Kèo này đã full
    },
    {
        id: 3,
        muscle: "Gánh Đùi (Squat Pro)",
        date: "CN, 20/09",
        time: "17:30 - 19:00",
        location: "Cali Sài Gòn (Q4)",
        creator: "Minh",
        currentMembers: 4,
        maxMembers: 6
    },
    {
        id: 4,
        muscle: "Full Body (Cardio)",
        date: "Hôm nay",
        time: "18:00 - 19:30",
        location: "Phòng tập LANH",
        creator: "An",
        currentMembers: 1,
        maxMembers: 10
    }
];

// 2. KHỞI TẠO CÁC BIẾN DOM
const sessionList = document.getElementById('sessionList');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const dateFilter = document.getElementById('dateFilter');
const muscleFilter = document.getElementById('muscleFilter');
const resetBtn = document.getElementById('resetBtn');

// 3. HÀM HIỂN THỊ DANH SÁCH KÈO (RENDER)
function renderSessions(data) {
    // Xóa nội dung cũ
    sessionList.innerHTML = '';

    // Kiểm tra nếu không có dữ liệu
    if (data.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    // Duyệt qua từng kèo và tạo Card
    data.forEach((session, index) => {
        // Tính toán phần trăm thanh tiến độ
        const percent = Math.round((session.currentMembers / session.maxMembers) * 100);
        const isFull = percent >= 100;
        
        // Tạo thẻ div cho Card
        const card = document.createElement('div');
        card.className = 'session-card';
        
        // HTML của 1 Card
        card.innerHTML = `
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                <span class="date-badge"><i class="fa-regular fa-calendar"></i> ${session.date}</span>
                ${isFull ? '<span class="slot-badge full">Kín chỗ</span>' : '<span class="slot-badge available">Đang mở</span>'}
            </div>
            
            <h3 class="session-title">${session.muscle}</h3>
            
            <div class="session-info">
                <p><i class="fa-regular fa-clock"></i> ${session.time}</p>
                <p><i class="fa-solid fa-location-dot"></i> ${session.location}</p>
                <p><i class="fa-solid fa-user-tie"></i> Host: <strong>${session.creator}</strong></p>
            </div>

            <div class="progress-container">
                <div class="progress-text">
                    <span>${session.currentMembers} / ${session.maxMembers} người</span>
                    <span style="color: ${isFull ? '#DC2626' : 'var(--primary)'}">${percent}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${percent}%; background: ${isFull ? '#DC2626' : ''}"></div>
                </div>
            </div>

            <div class="card-actions">
                <button class="btn ${isFull ? 'btn-outline' : 'btn-primary'} w-100" 
                        onclick="joinSession(${session.id})" ${isFull ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                    ${isFull ? '<i class="fa-solid fa-lock"></i> Đã Full' : 'Tham gia ngay'}
                </button>
            </div>
        `;
        
        sessionList.appendChild(card);
    });

    // Cập nhật thống kê
    updateStats(data);
}

// 4. HÀM CẬP NHẬT BẢNG THỐNG KÊ (STATS)
function updateStats(data) {
    const totalSessions = data.length;
    const totalMembers = data.reduce((sum, session) => sum + session.currentMembers, 0);
    const todaySessions = data.filter(session => session.date.toLowerCase() === 'hôm nay').length;

    document.getElementById('totalSessions').innerText = totalSessions;
    document.getElementById('totalMembers').innerText = totalMembers;
    document.getElementById('todaySessions').innerText = todaySessions;
}

// 5. THIẾT LẬP BỘ LỌC TỰ ĐỘNG (Tạo Option cho Dropdown)
function setupFilters() {
    // Lấy các giá trị duy nhất
    const dates = [...new Set(sessions.map(s => s.date))];
    const muscles = [...new Set(sessions.map(s => s.muscle.split(' ')[0]))]; // Chỉ lấy chữ đầu (Ngực, Lưng, Chân...)

    dates.forEach(date => {
        dateFilter.innerHTML += `<option value="${date}">${date}</option>`;
    });

    muscles.forEach(muscle => {
        muscleFilter.innerHTML += `<option value="${muscle}">${muscle}</option>`;
    });
}

// 6. XỬ LÝ LỌC DỮ LIỆU
function filterData() {
    const searchText = searchInput.value.toLowerCase();
    const selectedDate = dateFilter.value;
    const selectedMuscle = muscleFilter.value;

    const filtered = sessions.filter(session => {
        const matchSearch = session.muscle.toLowerCase().includes(searchText) || 
                            session.creator.toLowerCase().includes(searchText) ||
                            session.location.toLowerCase().includes(searchText);
        const matchDate = selectedDate === 'all' || session.date === selectedDate;
        const matchMuscle = selectedMuscle === 'all' || session.muscle.includes(selectedMuscle);

        return matchSearch && matchDate && matchMuscle;
    });

    renderSessions(filtered);
}

// 7. GÁN SỰ KIỆN (EVENT LISTENERS)
searchInput.addEventListener('input', filterData);
dateFilter.addEventListener('change', filterData);
muscleFilter.addEventListener('change', filterData);

resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    dateFilter.value = 'all';
    muscleFilter.value = 'all';
    renderSessions(sessions);
});

// Hàm mô phỏng bấm nút Tham Gia
function joinSession(id) {
    alert("Chức năng đặt lịch đang được xử lý cho Kèo ID: " + id);
}

// 8. CHẠY KHỞI TẠO KHI TẢI TRANG
document.addEventListener('DOMContentLoaded', () => {
    setupFilters();
    renderSessions(sessions);
});
// =========================================================
// 9. XỬ LÝ MODAL & FORM TẠO KÈO MỚI (CHỨC NĂNG THỰC TẾ)
// =========================================================

const modal = document.getElementById('modal');
const createBtn = document.getElementById('createBtn');
const closeBtns = document.querySelectorAll('[data-close]');
const modalContent = document.getElementById('modalContent');

// Tự động tạo giao diện Form nhập liệu
modalContent.innerHTML = `
    <div class="modal-header">
        <h3 class="modal-title">Tạo Kèo Tập Mới 🏋️</h3>
        <p>Điền thông tin để tìm đồng đội tập cùng nhé!</p>
    </div>
    <form id="createSessionForm">
        <div class="form-group">
            <label>Nhóm cơ / Bài tập chính</label>
            <input type="text" id="newMuscle" placeholder="VD: Ngực + Tay sau (Bench Press)" required>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Ngày tập</label>
                <input type="text" id="newDate" placeholder="VD: Hôm nay, Thứ 6..." required>
            </div>
            <div class="form-group">
                <label>Khung giờ</label>
                <input type="text" id="newTime" placeholder="VD: 18:30 - 20:00" required>
            </div>
        </div>
        <div class="form-group">
            <label>Địa điểm</label>
            <input type="text" id="newLocation" placeholder="VD: CityGym Q1" required>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Tên Host (Người tạo)</label>
                <input type="text" id="newCreator" placeholder="Tên của bạn" required>
            </div>
            <div class="form-group">
                <label>Số lượng người tối đa</label>
                <input type="number" id="newMaxMembers" placeholder="VD: 4" min="2" max="20" required>
            </div>
        </div>
        <button type="submit" class="btn btn-primary w-100" style="margin-top: 15px; padding: 14px; font-size: 1.05rem;">
            <i class="fa-solid fa-fire"></i> Mở Kèo Ngay
        </button>
    </form>
`;

// Hàm Mở / Đóng Modal
function toggleModal() {
    modal.classList.toggle('hidden');
}

// Bắt sự kiện click nút Tạo kèo
createBtn.addEventListener('click', toggleModal);

// Bắt sự kiện click nút X (đóng) hoặc click ra ngoài viền
closeBtns.forEach(btn => {
    btn.addEventListener('click', toggleModal);
});

// XỬ LÝ LƯU DỮ LIỆU KHI SUBMIT FORM
document.getElementById('createSessionForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Ngăn trình duyệt load lại trang

    // Thu thập dữ liệu bạn vừa nhập
    const newSession = {
        id: sessions.length + 1,
        muscle: document.getElementById('newMuscle').value,
        date: document.getElementById('newDate').value,
        time: document.getElementById('newTime').value,
        location: document.getElementById('newLocation').value,
        creator: document.getElementById('newCreator').value,
        currentMembers: 1, // Host tạo kèo mặc định tính là 1 người
        maxMembers: parseInt(document.getElementById('newMaxMembers').value)
    };

    // Thêm kèo mới lên đầu danh sách
    sessions.unshift(newSession);

    // Render lại giao diện và bộ lọc dropdown
    setupFilters(); 
    renderSessions(sessions);

    // Đóng Modal & Xóa trắng form để lần sau nhập tiếp
    this.reset();
    toggleModal();
    
    // Báo thành công
    alert("🎉 Tạo kèo thành công! Kèo của bạn đã xuất hiện trên cùng.");
});
// =========================================================
// 10. CHỨC NĂNG PHÂN QUYỀN ADMIN (SECRET LOGIN TRICK)
// =========================================================

const logoBtn = document.querySelector('.logo');

// 1. Khi vừa vào web, kiểm tra xem trình duyệt đã lưu quyền Admin chưa
if (localStorage.getItem('isProFitAdmin') === 'true') {
    document.body.classList.add('admin-mode');
}

// 2. Lắng nghe sự kiện NHẤP ĐÚP CHUỘT (Double Click) vào Logo
logoBtn.addEventListener('dblclick', (e) => {
    e.preventDefault(); 

    // Nếu đang là Admin rồi -> Hỏi xem có muốn thoát không
    if (document.body.classList.contains('admin-mode')) {
        if(confirm("🔒 Bạn có muốn THOÁT quyền Quản trị viên (Admin) không?")) {
            localStorage.removeItem('isProFitAdmin'); // Xóa bộ nhớ
            document.body.classList.remove('admin-mode'); // Thu hồi quyền
            alert("Đã về chế độ Người dùng thường. Bảng quản trị đã bị ẩn.");
        }
        return;
    }

    // Nếu là người dùng thường -> Yêu cầu nhập Mật khẩu
    const password = prompt("🚨 Khu vực nội bộ. Vui lòng nhập mật khẩu Quản trị viên:");
    
    // Mật khẩu bí mật là: admin123 (Bạn có thể đổi tùy ý)
    if (password === 'admin123') {
        localStorage.setItem('isProFitAdmin', 'true'); // Lưu vào bộ nhớ trình duyệt
        document.body.classList.add('admin-mode'); // Cấp quyền hiển thị
        
        // Tự động cuộn xuống khu vực Admin cho ngầu
        document.getElementById('admin-panel').scrollIntoView({ behavior: 'smooth' });
        
        alert("✅ Đăng nhập Quản trị viên thành công! Bảng điều khiển đã được mở.");
    } else if (password !== null) {
        alert("❌ Sai mật khẩu! Bạn không có quyền truy cập.");
    }
});
