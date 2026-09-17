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
