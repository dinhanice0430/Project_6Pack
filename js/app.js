/**
 * GYM BROS - Core Application Logic
 * Single Page Architecture (SPA) + State Management via localStorage
 */

// ==========================================
// 1. DATA STORAGE & INITIAL STATE SEEDING
// ==========================================

const STORAGE_KEY_SESSIONS = 'gym_bros_sessions_v1';
const STORAGE_KEY_MEMBERS = 'gym_bros_members_v1';
const STORAGE_KEY_CURRENT_USER = 'gym_bros_current_user_v1';

// Seed Members List
const DEFAULT_MEMBERS = [
  { id: 'm1', name: 'An', workoutCount: 12, attendanceRate: 92 },
  { id: 'm2', name: 'Minh', workoutCount: 10, attendanceRate: 80 },
  { id: 'm3', name: 'Nam', workoutCount: 8, attendanceRate: 70 },
  { id: 'm4', name: 'Huy', workoutCount: 9, attendanceRate: 75 },
  { id: 'm5', name: 'Tuấn', workoutCount: 11, attendanceRate: 85 },
  { id: 'm6', name: 'Khoa', workoutCount: 6, attendanceRate: 60 },
  { id: 'm7', name: 'Long', workoutCount: 7, attendanceRate: 65 },
  { id: 'm8', name: 'Duy', workoutCount: 5, attendanceRate: 50 },
  { id: 'm9', name: 'Phúc', workoutCount: 8, attendanceRate: 72 },
  { id: 'm10', name: 'Tùng', workoutCount: 4, attendanceRate: 45 }
];

// Helper to pick random unique members for schedule seeds
function getRandomSample(arr, min = 2, max = 5) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(m => m.name);
}

// Generate Seed Sessions for 2 Weeks
function generateDefaultSessions() {
  const baseTemplates = [
    { day: 'Thứ 2', time: '18:00 – 19:30', title: 'Chest & Triceps', maxSlots: 8, isRest: false },
    { day: 'Thứ 3', time: '18:00 – 19:30', title: 'Back & Biceps', maxSlots: 8, isRest: false },
    { day: 'Thứ 4', time: '--:--', title: 'Nghỉ ngơi hồi phục', maxSlots: 0, isRest: true },
    { day: 'Thứ 5', time: '18:00 – 19:30', title: 'Shoulders & Abs', maxSlots: 8, isRest: false },
    { day: 'Thứ 6', time: '18:00 – 19:30', title: 'Leg Day Blast', maxSlots: 8, isRest: false },
    { day: 'Thứ 7', time: '09:00 – 10:30', title: 'Full Body Circuit', maxSlots: 8, isRest: false },
    { day: 'Chủ nhật', time: '--:--', title: 'Nghỉ ngơi hồi phục', maxSlots: 0, isRest: true },
  ];

  const sessions = [];
  // Week 0 (Previous), Week 1 (Current), Week 2 (Next)
  for (let week = 0; week <= 2; week++) {
    baseTemplates.forEach((tpl, idx) => {
      sessions.push({
        id: `sess_w${week}_${idx}`,
        weekOffset: week - 1, // -1: Past, 0: Current, 1: Next
        day: tpl.day,
        time: tpl.time,
        title: tpl.title,
        maxSlots: tpl.maxSlots,
        isRest: tpl.isRest,
        participants: tpl.isRest ? [] : getRandomSample(DEFAULT_MEMBERS, 2, 6)
      });
    });
  }
  return sessions;
}

// ==========================================
// 2. DATA SERVICE LAYER
// ==========================================

const DataService = {
  getSessions() {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!raw) {
      const initData = generateDefaultSessions();
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(initData));
      return initData;
    }
    return JSON.parse(raw);
  },

  saveSessions(sessions) {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  },

  getMembers() {
    const raw = localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(DEFAULT_MEMBERS));
      return DEFAULT_MEMBERS;
    }
    return JSON.parse(raw);
  },

  saveMembers(members) {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  },

  getCurrentUser() {
    return localStorage.getItem(STORAGE_KEY_CURRENT_USER) || '';
  },

  setCurrentUser(name) {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, name);
  },

  registerUserToSession(sessionId, userName) {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.id === sessionId);

    if (!session) return { success: false, message: 'Buổi tập không tồn tại.' };
    if (session.isRest) return { success: false, message: 'Đây là ngày nghỉ ngơi!' };
    if (session.participants.includes(userName)) {
      return { success: false, message: 'Bạn đã đăng ký buổi tập này rồi.' };
    }
    if (session.participants.length >= session.maxSlots) {
      return { success: false, message: `Buổi tập đã đủ ${session.maxSlots} người.` };
    }

    session.participants.push(userName);
    this.saveSessions(sessions);

    // Sync member count
    const members = this.getMembers();
    let member = members.find(m => m.name.toLowerCase() === userName.toLowerCase());
    if (member) {
      member.workoutCount += 1;
    } else {
      members.push({
        id: 'm_' + Date.now(),
        name: userName,
        workoutCount: 1,
        attendanceRate: 100
      });
    }
    this.saveMembers(members);
    this.setCurrentUser(userName);

    return { success: true, message: 'Đăng ký thành công!' };
  },

  cancelRegistration(sessionId, userName) {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.id === sessionId);

    if (!session) return { success: false, message: 'Buổi tập không tồn tại.' };
    if (!session.participants.includes(userName)) {
      return { success: false, message: 'Tên này chưa đăng ký buổi tập.' };
    }

    session.participants = session.participants.filter(p => p !== userName);
    this.saveSessions(sessions);

    // Update member workout count
    const members = this.getMembers();
    const member = members.find(m => m.name.toLowerCase() === userName.toLowerCase());
    if (member && member.workoutCount > 0) {
      member.workoutCount -= 1;
      this.saveMembers(members);
    }

    return { success: true, message: 'Đã hủy đăng ký.' };
  }
};

// ==========================================
// 3. UI CONTROLLER & APP STATE
// ==========================================

const App = {
  currentWeekOffset: 0, // -1: Past, 0: Current, 1: Next
  activeSessionForBooking: null,
  activeSessionForCancel: null,
  isAdminLoggedIn: false,

  init() {
    this.bindNavigation();
    this.bindModals();
    this.bindAdmin();
    this.bindSearch();
    this.renderAll();

    // Default to active route hash
    window.addEventListener('hashchange', () => this.handleRouting());
    this.handleRouting();
  },

  // SPA Routing
  handleRouting() {
    const hash = window.location.hash || '#home';
    const cleanHash = hash.replace('#', '');
    const views = ['home', 'schedule', 'members', 'stats', 'admin'];

    views.forEach(view => {
      const section = document.getElementById(`view-${view}`);
      if (section) section.classList.remove('active');
    });

    const activeSection = document.getElementById(`view-${cleanHash}`);
    if (activeSection) {
      activeSection.classList.add('active');
    } else {
      document.getElementById('view-home').classList.add('active');
    }

    // Update active navbar item
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('href') === `#${cleanHash}`);
    });

    // Close mobile nav drawer if open
    document.getElementById('navLinks').classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  bindNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    // Week Switcher
    document.getElementById('btnPrevWeek').addEventListener('click', () => {
      if (this.currentWeekOffset > -1) {
        this.currentWeekOffset--;
        this.renderSchedule();
      }
    });
    document.getElementById('btnNextWeek').addEventListener('click', () => {
      if (this.currentWeekOffset < 1) {
        this.currentWeekOffset++;
        this.renderSchedule();
      }
    });
  },

  // Modal Handlers
  bindModals() {
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('bookingModal').classList.remove('open');
        document.getElementById('cancelModal').classList.remove('open');
      });
    });

    // Confirm Booking
    document.getElementById('btnConfirmBooking').addEventListener('click', () => {
      const nameInput = document.getElementById('bookingMemberName');
      const name = nameInput.value.trim();
      if (!name) {
        this.showToast('Vui lòng nhập tên của bạn.', 'warning');
        return;
      }

      const res = DataService.registerUserToSession(this.activeSessionForBooking.id, name);
      if (res.success) {
        this.showToast(res.message, 'success');
        document.getElementById('bookingModal').classList.remove('open');
        this.renderAll();
      } else {
        this.showToast(res.message, 'warning');
      }
    });

    // Confirm Cancellation
    document.getElementById('btnConfirmCancel').addEventListener('click', () => {
      const nameInput = document.getElementById('cancelMemberName');
      const name = nameInput.value.trim();
      if (!name) {
        this.showToast('Vui lòng nhập tên của bạn.', 'warning');
        return;
      }

      const res = DataService.cancelRegistration(this.activeSessionForCancel.id, name);
      if (res.success) {
        this.showToast(res.message, 'success');
        document.getElementById('cancelModal').classList.remove('open');
        this.renderAll();
      } else {
        this.showToast(res.message, 'error');
      }
    });
  },

  // Admin Section Handlers
  bindAdmin() {
    const loginForm = document.getElementById('adminLoginForm');
    const authSec = document.getElementById('adminAuthSection');
    const panelSec = document.getElementById('adminPanelSection');
    const btnLogout = document.getElementById('btnAdminLogout');
    const sessionForm = document.getElementById('sessionForm');
    const btnCancelEdit = document.getElementById('btnCancelEdit');

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pin = document.getElementById('adminPinInput').value;
      if (pin === 'admin123') {
        this.isAdminLoggedIn = true;
        authSec.classList.add('hidden');
        panelSec.classList.remove('hidden');
        this.renderAdminSessionList();
        this.showToast('Đăng nhập Admin thành công!', 'success');
      } else {
        this.showToast('Mã PIN không đúng!', 'error');
      }
    });

    btnLogout.addEventListener('click', () => {
      this.isAdminLoggedIn = false;
      authSec.classList.remove('hidden');
      panelSec.classList.add('hidden');
      document.getElementById('adminPinInput').value = '';
      this.showToast('Đã đăng xuất quản trị.', 'info');
    });

    sessionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('formSessionId').value;
      const day = document.getElementById('formDaySelect').value;
      const title = document.getElementById('formTitle').value;
      const time = document.getElementById('formTime').value;
      const maxSlots = parseInt(document.getElementById('formMaxSlots').value, 10);
      const isRest = document.getElementById('formIsRest').checked;

      const sessions = DataService.getSessions();

      if (id) {
        // Edit
        const target = sessions.find(s => s.id === id);
        if (target) {
          target.day = day;
          target.title = title;
          target.time = isRest ? '--:--' : time;
          target.maxSlots = isRest ? 0 : maxSlots;
          target.isRest = isRest;
        }
      } else {
        // Create new
        const newSession = {
          id: 'sess_' + Date.now(),
          weekOffset: this.currentWeekOffset,
          day,
          title,
          time: isRest ? '--:--' : time,
          maxSlots: isRest ? 0 : maxSlots,
          isRest,
          participants: []
        };
        sessions.push(newSession);
      }

      DataService.saveSessions(sessions);
      this.showToast('Đã lưu thông tin buổi tập!', 'success');
      sessionForm.reset();
      document.getElementById('formSessionId').value = '';
      btnCancelEdit.style.display = 'none';
      document.getElementById('adminFormTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> Thêm buổi tập';
      this.renderAll();
    });

    btnCancelEdit.addEventListener('click', () => {
      sessionForm.reset();
      document.getElementById('formSessionId').value = '';
      btnCancelEdit.style.display = 'none';
      document.getElementById('adminFormTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> Thêm buổi tập';
    });
  },

  bindSearch() {
    const searchInput = document.getElementById('memberSearchInput');
    searchInput.addEventListener('input', (e) => {
      this.renderMembers(e.target.value.toLowerCase());
    });
  },

  // Render Everything
  renderAll() {
    this.renderHomeStats();
    this.renderSchedule();
    this.renderMembers();
    this.renderStats();
    this.renderMemberDatalist();
    if (this.isAdminLoggedIn) {
      this.renderAdminSessionList();
    }
  },

  renderMemberDatalist() {
    const list = document.getElementById('presetMembers');
    const members = DataService.getMembers();
    list.innerHTML = members.map(m => `<option value="${m.name}"></option>`).join('');
  },

  renderHomeStats() {
    const members = DataService.getMembers();
    const sessions = DataService.getSessions();
    const currentWeekSessions = sessions.filter(s => s.weekOffset === 0 && !s.isRest);

    const totalWorkoutsWeek = currentWeekSessions.length;
    const totalRegistrations = sessions.reduce((acc, s) => acc + s.participants.length, 0);

    // Find nearest upcoming session in week 0
    const upcoming = currentWeekSessions[0] ? `${currentWeekSessions[0].day} (${currentWeekSessions[0].title})` : 'Chưa có';

    const container = document.getElementById('homeStatsContainer');
    container.innerHTML = `
      <div class="stat-item-card">
        <div class="stat-icon" style="background:#e0f2fe; color:#0284c7;"><i class="fa-solid fa-users"></i></div>
        <div class="stat-info">
          <h4>Thành viên</h4>
          <p>${members.length}</p>
        </div>
      </div>
      <div class="stat-item-card">
        <div class="stat-icon" style="background:#dcfce7; color:#16a34a;"><i class="fa-solid fa-dumbbell"></i></div>
        <div class="stat-info">
          <h4>Buổi tập tuần này</h4>
          <p>${totalWorkoutsWeek}</p>
        </div>
      </div>
      <div class="stat-item-card">
        <div class="stat-icon" style="background:#fef3c7; color:#d97706;"><i class="fa-solid fa-fire"></i></div>
        <div class="stat-info">
          <h4>Tổng lượt tập</h4>
          <p>${totalRegistrations}</p>
        </div>
      </div>
      <div class="stat-item-card">
        <div class="stat-icon" style="background:#f3e8ff; color:#9333ea;"><i class="fa-solid fa-calendar-day"></i></div>
        <div class="stat-info">
          <h4>Buổi gần nhất</h4>
          <p style="font-size: 1.1rem; margin-top: 4px;">${upcoming}</p>
        </div>
      </div>
    `;
  },

  renderSchedule() {
    const weekLabels = { [-1]: 'Tuần trước', [0]: 'Tuần này', [1]: 'Tuần sau' };
    document.getElementById('weekLabel').textContent = weekLabels[this.currentWeekOffset] || 'Lịch tập';

    const sessions = DataService.getSessions().filter(s => s.weekOffset === this.currentWeekOffset);
    const grid = document.getElementById('scheduleGrid');
    const currentUser = DataService.getCurrentUser();

    if (sessions.length === 0) {
      grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color: var(--color-text-muted);">Không có lịch tập nào cho tuần này.</p>`;
      return;
    }

    grid.innerHTML = sessions.map(session => {
      const isRegistered = currentUser && session.participants.includes(currentUser);
      const isFull = session.participants.length >= session.maxSlots;

      if (session.isRest) {
        return `
          <div class="card session-card is-rest">
            <div class="session-header-badge">
              <span class="day-badge">${session.day}</span>
              <span class="time-badge"><i class="fa-solid fa-bed"></i> Rest Day</span>
            </div>
            <h3 class="session-title">${session.title}</h3>
            <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-top: auto;">Nghỉ ngơi để cơ bắp phục hồi sẵn sàng cho buổi tiếp theo.</p>
          </div>
        `;
      }

      return `
        <div class="card session-card">
          <div class="session-header-badge">
            <span class="day-badge">${session.day}</span>
            <span class="time-badge"><i class="fa-regular fa-clock"></i> ${session.time}</span>
          </div>
          <h3 class="session-title">${session.title}</h3>
          <div class="session-capacity ${isFull ? 'is-full' : ''}">
            <i class="fa-solid fa-users"></i> ${session.participants.length}/${session.maxSlots} người ${isFull ? '(ĐÃ ĐỦ)' : ''}
          </div>
          <div class="participant-list">
            <div class="participant-list-title">Danh sách (${session.participants.length})</div>
            <ul class="participant-items">
              ${session.participants.length > 0
                ? session.participants.map(p => `<li class="participant-item"><i class="fa-solid fa-check"></i> ${p}</li>`).join('')
                : '<li style="font-size: 0.85rem; color: #9ca3af;">Chưa có ai đăng ký</li>'
              }
            </ul>
          </div>
          <div class="session-actions">
            ${isRegistered
              ? `
                <button class="btn btn-primary" style="background-color: #059669; cursor: default;">
                  <i class="fa-solid fa-check"></i> ĐÃ ĐĂNG KÝ
                </button>
                <button class="btn btn-outline btn-sm text-danger" onclick="App.openCancelModal('${session.id}')">
                  Hủy đăng ký
                </button>
              `
              : `
                <button class="btn ${isFull ? 'btn-secondary' : 'btn-accent'}" 
                  ${isFull ? 'disabled style="cursor:not-allowed;"' : ''} 
                  onclick="App.openBookingModal('${session.id}')">
                  ${isFull ? 'ĐÃ ĐỦ' : '<i class="fa-solid fa-plus"></i> ĐĂNG KÝ'}
                </button>
                ${session.participants.length > 0 ? `
                  <button class="btn btn-secondary btn-sm" onclick="App.openCancelModal('${session.id}')">
                    Hủy đăng ký của tôi
                  </button>
                ` : ''}
              `
            }
          </div>
        </div>
      `;
    }).join('');
  },

  openBookingModal(sessionId) {
    const session = DataService.getSessions().find(s => s.id === sessionId);
    if (!session) return;

    this.activeSessionForBooking = session;
    document.getElementById('modalSessionTitle').textContent = `${session.day} - ${session.title}`;
    document.getElementById('modalSessionTime').textContent = session.time;
    document.getElementById('bookingMemberName').value = DataService.getCurrentUser();

    document.getElementById('bookingModal').classList.add('open');
  },

  openCancelModal(sessionId) {
    const session = DataService.getSessions().find(s => s.id === sessionId);
    if (!session) return;

    this.activeSessionForCancel = session;
    document.getElementById('cancelMemberName').value = DataService.getCurrentUser();
    document.getElementById('cancelModalText').textContent = `Bạn có chắc chắn muốn hủy tham gia buổi ${session.day} (${session.title})?`;
    document.getElementById('cancelModal').classList.add('open');
  },

  renderMembers(query = '') {
    const members = DataService.getMembers().filter(m => m.name.toLowerCase().includes(query));
    const grid = document.getElementById('membersGrid');

    if (members.length === 0) {
      grid.innerHTML = '<p style="grid-column: 1/-1; color: var(--color-text-muted);">Không tìm thấy thành viên phù hợp.</p>';
      return;
    }

    grid.innerHTML = members.map(m => `
      <div class="card member-card">
        <div class="member-avatar">${m.name.charAt(0).toUpperCase()}</div>
        <div class="member-info">
          <h4>${m.name}</h4>
          <p><i class="fa-solid fa-dumbbell"></i> ${m.workoutCount} buổi</p>
          <p><i class="fa-solid fa-fire"></i> Tỷ lệ: ${m.attendanceRate || 75}%</p>
        </div>
      </div>
    `).join('');
  },

  renderStats() {
    const members = DataService.getMembers();
    // Sort descending by workout count
    const sorted = [...members].sort((a, b) => b.workoutCount - a.workoutCount);
    const top = sorted[0] || { name: 'N/A', workoutCount: 0 };

    // Top Performer
    document.getElementById('topPerformer').innerHTML = `
      <div class="leaderboard-performer">
        <div class="avatar-large">${top.name.charAt(0)}</div>
        <h4 style="font-size: 1.25rem; font-weight: 800;">${top.name}</h4>
        <p style="color: var(--color-text-muted); font-size: 0.9rem;">Dẫn đầu với <strong>${top.workoutCount} buổi</strong> tập</p>
      </div>
    `;

    // Table
    const tableBody = document.getElementById('statsTableBody');
    tableBody.innerHTML = sorted.map(m => `
      <tr>
        <td><strong>${m.name}</strong></td>
        <td>🏋️ ${m.workoutCount} buổi</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span>${m.attendanceRate || 70}%</span>
            <div style="background: #e5e7eb; height: 6px; width: 60px; border-radius: 3px; overflow: hidden;">
              <div style="background: var(--color-accent); height: 100%; width: ${m.attendanceRate || 70}%;"></div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge-accent" style="${(m.attendanceRate || 70) < 60 ? 'background: #fee2e2; color: #dc2626;' : ''}">
            ${(m.attendanceRate || 70) >= 80 ? 'Rất chăm chỉ' : (m.attendanceRate || 70) >= 60 ? 'Ổn định' : 'Cần cố gắng'}
          </span>
        </td>
      </tr>
    `).join('');

    // Weekly Chart Simulation
    const chartBars = document.getElementById('chartBars');
    const weeklyData = [
      { label: 'Tuần 1', count: 18 },
      { label: 'Tuần 2', count: 22 },
      { label: 'Tuần 3', count: 25 },
      { label: 'Tuần 4', count: 20 }
    ];
    const maxVal = Math.max(...weeklyData.map(d => d.count));

    chartBars.innerHTML = weeklyData.map(d => {
      const heightPercent = Math.round((d.count / maxVal) * 100);
      return `
        <div class="chart-bar-group">
          <div class="chart-bar-fill" style="height: ${heightPercent}%;">
            <span class="chart-bar-value">${d.count}</span>
          </div>
          <span class="chart-bar-label">${d.label}</span>
        </div>
      `;
    }).join('');
  },

  renderAdminSessionList() {
    const sessions = DataService.getSessions().filter(s => s.weekOffset === this.currentWeekOffset);
    const container = document.getElementById('adminSessionList');

    if (sessions.length === 0) {
      container.innerHTML = '<p style="color:var(--color-text-muted);">Không có buổi tập nào trong tuần này.</p>';
      return;
    }

    container.innerHTML = sessions.map(s => `
      <div class="admin-session-item">
        <div class="admin-item-header">
          <div>
            <strong>${s.day}: ${s.title}</strong>
            <span style="font-size: 0.8rem; color: var(--color-text-muted); margin-left: 0.5rem;">(${s.time})</span>
          </div>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-secondary btn-sm" onclick="App.editSession('${s.id}')"><i class="fa-solid fa-pen"></i> Sửa</button>
            <button class="btn btn-outline btn-sm text-danger" onclick="App.deleteSession('${s.id}')"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
        <div style="font-size: 0.85rem; color: var(--color-text-muted);">
          Giới hạn: ${s.maxSlots} người | Đã đăng ký: ${s.participants.length}
        </div>
        <div class="admin-item-participants">
          ${s.participants.map(p => `
            <span class="participant-chip">
              ${p}
              <button onclick="App.adminKickParticipant('${s.id}', '${p}')" title="Xóa khỏi buổi tập">&times;</button>
            </span>
          `).join('')}
        </div>
      </div>
    `).join('');
  },

  editSession(id) {
    const s = DataService.getSessions().find(item => item.id === id);
    if (!s) return;

    document.getElementById('formSessionId').value = s.id;
    document.getElementById('formDaySelect').value = s.day;
    document.getElementById('formTitle').value = s.title;
    document.getElementById('formTime').value = s.time;
    document.getElementById('formMaxSlots').value = s.maxSlots;
    document.getElementById('formIsRest').checked = s.isRest;

    document.getElementById('btnCancelEdit').style.display = 'inline-flex';
    document.getElementById('adminFormTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Chỉnh sửa buổi tập';
    window.scrollTo({ top: document.getElementById('sessionForm').offsetTop - 80, behavior: 'smooth' });
  },

  deleteSession(id) {
    if (confirm('Bạn có chắc chắn muốn xóa buổi tập này?')) {
      const sessions = DataService.getSessions().filter(s => s.id !== id);
      DataService.saveSessions(sessions);
      this.showToast('Đã xóa buổi tập.', 'info');
      this.renderAll();
    }
  },

  adminKickParticipant(sessionId, participantName) {
    if (confirm(`Xóa ${participantName} khỏi buổi tập này?`)) {
      DataService.cancelRegistration(sessionId, participantName);
      this.showToast(`Đã xóa ${participantName}`, 'info');
      this.renderAll();
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'warning') icon = 'fa-triangle-exclamation';
    if (type === 'error') icon = 'fa-circle-xmark';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
};

// Start App on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
