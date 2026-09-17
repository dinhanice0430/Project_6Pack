/* =========================================================
   PRO FIT GYM - MAIN JAVASCRIPT (BẢN HOÀN CHỈNH)
   ========================================================= */

// 1. DỮ LIỆU MẪU (MOCK DATA)
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

// 3. HÀM HIỂN THỊ DANH SÁCH KÈO (RENDER CARDS)
function renderSessions(data) {
    sessionList.innerHTML = ''; // Xóa nội dung cũ

    if (data.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    data.forEach((session) => {
        const percent = Math.round((session.currentMembers / session.maxMembers) * 100);
        const isFull = percent >= 100;
        
        const card = document.createElement('div');
        card.className = 'session-card';
        
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

    // Cập nhật thống kê & Đồng bộ bảng Admin
    updateStats(data);
    renderAdminTable(data);
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
    const dates = [...new Set(sessions.map(s => s.date))];
    const muscles = [...new Set(sessions.map(s => s.muscle.split(' ')[0]))];

    // Reset lại option mặc định trước khi thêm mới
    dateFilter.innerHTML = '<option value="all">Tất cả các ngày</option>';
    muscleFilter.innerHTML = '<option value="all">Tất cả nhóm cơ</option>';

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

// 7. GÁN SỰ KIỆN TÌM KIẾM & LỌC
searchInput.addEventListener('input', filterData);
dateFilter.addEventListener('change', filterData);
muscleFilter.addEventListener('change', filterData);

resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    dateFilter.value = 'all';
    muscleFilter.value = 'all';
    renderSessions(sessions);
});

// =========================================================
// 8. CHỨC NĂNG THAM GIA KÈO TẬP (USER)
// =========================================================
function joinSession(id) {
    const session = sessions.find(s => s.id === id);
    if (!session) return;

    if (session.currentMembers < session.maxMembers) {
        const confirmJoin = confirm(`💪 Bạn có chắc chắn muốn đăng ký tham gia kèo: ${session.muscle}?`);
        
        if (confirmJoin) {
            session.currentMembers += 1;
            alert("🎉 Đăng ký tham gia thành công!");
            filterData(); // Render lại giao diện
        }
    } else {
        alert("Rất tiếc, kèo này đã kín chỗ!");
    }
}

// =========================================================
// 9. CHỨC NĂNG QUẢN TRỊ VIÊN: HIỂN THỊ BẢNG & XÓA KÈO
// =========================================================
function renderAdminTable(data) {
    const adminTbody = document.querySelector('.admin-table tbody');
    if (!adminTbody) return;
    
    adminTbody.innerHTML = ''; 

    if (data.length === 0) {
        adminTbody.innerHTML = '<tr><td colspan="6" class="text-center">Chưa có lịch tập nào.</td></tr>';
        return;
    }

    data.forEach(session => {
        const isFull = session.currentMembers >= session.maxMembers;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${session.time}</strong><br><small>${session.date}</small></td>
            <td>${session.muscle}</td>
            <td>${session.creator}</td>
            <td>
                <span class="slot-badge ${isFull ? 'full' : 'available'}">
                    ${session.currentMembers}/${session.maxMembers} ${isFull ? 'Full' : 'Trống'}
                </span>
            </td>
            <td><span class="status-badge active">Đang mở</span></td>
            <td class="action-btns">
                <button class="btn-icon delete" title="Hủy lịch" onclick="deleteSession(${session.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        adminTbody.appendChild(tr);
    });
}

function deleteSession(id) {
    const confirmDelete = confirm("⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA kèo tập này không? Hành động này không thể hoàn tác.");
    
    if (confirmDelete) {
        const index = sessions.findIndex(s => s.id === id);
        if (index !== -1) {
            sessions.splice(index, 1);
            alert("🗑️ Đã xóa lịch tập thành công!");
            
            setupFilters();
            filterData();
        }
    }
}

// =========================================================
// 10. XỬ LÝ MODAL & FORM TẠO KÈO MỚI 
// =========================================================
const modal = document.getElementById('modal');
const createBtn = document.getElementById('createBtn');
const closeBtns = document.querySelectorAll('[data-close]');
const modalContent = document.getElementById('modalContent');

// Tự động tạo Form nhập liệu
if (modalContent) {
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

    function toggleModal() {
        modal.classList.toggle('hidden');
    }

    if (createBtn) createBtn.addEventListener('click', toggleModal);

    closeBtns.forEach(btn => {
        btn.addEventListener('click', toggleModal);
    });

    document.getElementById('createSessionForm').addEventListener('submit', function(e) {
        e.preventDefault(); 

        const newSession = {
            id: sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) + 1 : 1, // Tự tạo ID mới nhất
            muscle: document.getElementById('newMuscle').value,
            date: document.getElementById('newDate').value,
            time: document.getElementById('newTime').value,
            location: document.getElementById('newLocation').value,
            creator: document.getElementById('newCreator').value,
            currentMembers: 1, 
            maxMembers: parseInt(document.getElementById('newMaxMembers').value)
        };

        sessions.unshift(newSession); // Thêm lên đầu danh sách

        setupFilters(); 
        renderSessions(sessions);

        this.reset();
        toggleModal();
        alert("🎉 Tạo kèo thành công! Kèo của bạn đã xuất hiện trên cùng.");
    });
}

// =========================================================
// 11. CHỨC NĂNG PHÂN QUYỀN ADMIN (SECRET LOGIN TRICK)
// =========================================================
const logoBtn = document.querySelector('.logo');

if (localStorage.getItem('isProFitAdmin') === 'true') {
    document.body.classList.add('admin-mode');
}

if (logoBtn) {
    logoBtn.addEventListener('dblclick', (e) => {
        e.preventDefault(); 

        if (document.body.classList.contains('admin-mode')) {
            if(confirm("🔒 Bạn có muốn THOÁT quyền Quản trị viên (Admin) không?")) {
                localStorage.removeItem('isProFitAdmin'); 
                document.body.classList.remove('admin-mode'); 
                alert("Đã về chế độ Người dùng thường. Bảng quản trị đã bị ẩn.");
            }
            return;
        }

        const password = prompt("🚨 Khu vực nội bộ. Vui lòng nhập mật khẩu Quản trị viên:");
        
        // Mật khẩu là: admin123
        if (password === 'admin123') {
            localStorage.setItem('isProFitAdmin', 'true'); 
            document.body.classList.add('admin-mode'); 
            
            const adminPanel = document.getElementById('admin-panel');
            if (adminPanel) adminPanel.scrollIntoView({ behavior: 'smooth' });
            
            alert("✅ Đăng nhập Quản trị viên thành công! Bảng điều khiển đã được mở.");
        } else if (password !== null) {
            alert("❌ Sai mật khẩu! Bạn không có quyền truy cập.");
        }
    });
}

// =========================================================
// 12. KHỞI TẠO CHẠY ỨNG DỤNG KHI TẢI TRANG XONG
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    setupFilters();
    renderSessions(sessions);
});
