const STORAGE_KEY = "gym_booking_sessions_v1";

const seedSessions = [
  {
    id: crypto.randomUUID(),
    title: "Ngực + Tay sau",
    muscle: "Ngực + Tay sau",
    date: "2026-09-18",
    time: "18:30 - 20:00",
    gym: "Gym Thủ Đức",
    max: 6,
    creator: "An",
    members: ["An", "Minh", "Tuấn"]
  },
  {
    id: crypto.randomUUID(),
    title: "Lưng + Tay trước",
    muscle: "Lưng + Tay trước",
    date: "2026-09-19",
    time: "08:00 - 09:30",
    gym: "Fit Center Q9",
    max: 8,
    creator: "Minh",
    members: ["Minh", "Hùng"]
  },
  {
    id: crypto.randomUUID(),
    title: "Chân",
    muscle: "Chân",
    date: "2026-09-20",
    time: "17:30 - 19:00",
    gym: "Gym Thủ Đức",
    max: 6,
    creator: "Tuấn",
    members: ["Tuấn", "Khoa", "Nam", "Long"]
  },
  {
    id: crypto.randomUUID(),
    title: "Full Body",
    muscle: "Full Body",
    date: "2026-09-21",
    time: "18:00 - 19:30",
    gym: "Fit Center Q9",
    max: 10,
    creator: "An",
    members: ["An"]
  }
];

let sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || seedSessions;

const $ = id => document.getElementById(id);
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("vi-VN", { weekday:"short", day:"2-digit", month:"2-digit" });
}
function isToday(iso) {
  const now = new Date();
  const d = new Date(iso + "T00:00:00");
  return d.toDateString() === now.toDateString();
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function renderFilters() {
  const dates = [...new Set(sessions.map(s => s.date))].sort();
  const muscles = [...new Set(sessions.map(s => s.muscle))].sort();
  $("dateFilter").innerHTML = `<option value="all">Tất cả ngày</option>` +
    dates.map(d => `<option value="${d}">${formatDate(d)}</option>`).join("");
  $("muscleFilter").innerHTML = `<option value="all">Tất cả nhóm cơ</option>` +
    muscles.map(m => `<option value="${escapeHTML(m)}">${escapeHTML(m)}</option>`).join("");
}

function render() {
  renderFilters();
  const q = $("searchInput").value.trim().toLowerCase();
  const date = $("dateFilter").value;
  const muscle = $("muscleFilter").value;

  const filtered = sessions
    .filter(s => date === "all" || s.date === date)
    .filter(s => muscle === "all" || s.muscle === muscle)
    .filter(s => !q || [s.title, s.muscle, s.gym, s.creator, ...s.members].join(" ").toLowerCase().includes(q))
    .sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time));

  $("sessionList").innerHTML = filtered.map(cardHTML).join("");
  $("emptyState").classList.toggle("hidden", filtered.length !== 0);

  $("totalSessions").textContent = sessions.length;
  $("totalMembers").textContent = sessions.reduce((n,s) => n + s.members.length, 0);
  $("todaySessions").textContent = sessions.filter(s => isToday(s.date)).length;
}

function cardHTML(s) {
  const count = s.members.length;
  const pct = Math.min(100, Math.round(count / s.max * 100));
  const full = count >= s.max;
  return `
    <article class="session-card">
      <div class="session-top">
        <span class="tag">${escapeHTML(s.muscle)}</span>
        <small>${formatDate(s.date)}</small>
      </div>
      <h3>${escapeHTML(s.title)}</h3>
      <div class="meta">
        <div>⏰ ${escapeHTML(s.time)}</div>
        <div>📍 ${escapeHTML(s.gym)}</div>
        <div>👤 Tạo bởi ${escapeHTML(s.creator)}</div>
      </div>
      <div class="progress-row"><span>${count}/${s.max} người</span><span>${pct}%</span></div>
      <div class="progress"><div style="width:${pct}%"></div></div>
      <div class="card-actions">
        <button class="btn ${full ? "" : "btn-accent"}" ${full ? "disabled" : ""} onclick="openJoin('${s.id}')">${full ? "Đã đủ người" : "Tham gia"}</button>
        <button class="icon-btn" title="Xem chi tiết" onclick="openDetail('${s.id}')">•••</button>
      </div>
    </article>`;
}

function openModal(html) {
  $("modalContent").innerHTML = html;
  $("modal").classList.remove("hidden");
  $("modal").setAttribute("aria-hidden", "false");
}
function closeModal() {
  $("modal").classList.add("hidden");
  $("modal").setAttribute("aria-hidden", "true");
}
document.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", closeModal));
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

function openJoin(id) {
  const s = sessions.find(x => x.id === id);
  if (!s || s.members.length >= s.max) return;
  openModal(`
    <h2>Tham gia kèo 🏋️</h2>
    <div class="notice">Bạn sẽ được thêm vào danh sách người tham gia của kèo này.</div>
    <form class="form" onsubmit="joinSession(event, '${id}')">
      <label>Tên của bạn
        <input name="name" required maxlength="30" placeholder="Ví dụ: An">
      </label>
      <button class="btn btn-accent" type="submit">Xác nhận tham gia</button>
    </form>
  `);
}

function joinSession(e, id) {
  e.preventDefault();
  const name = e.target.name.value.trim();
  const s = sessions.find(x => x.id === id);
  if (!name || !s) return;
  if (s.members.length >= s.max) return alert("Kèo đã đủ người.");
  if (s.members.some(m => m.toLowerCase() === name.toLowerCase())) {
    return alert("Tên này đã có trong kèo.");
  }
  s.members.push(name);
  save(); closeModal(); render();
}

function openDetail(id) {
  const s = sessions.find(x => x.id === id);
  if (!s) return;
  openModal(`
    <h2>${escapeHTML(s.title)}</h2>
    <div class="detail-meta">
      <div>📅 ${formatDate(s.date)}</div>
      <div>⏰ ${escapeHTML(s.time)}</div>
      <div>📍 ${escapeHTML(s.gym)}</div>
      <div>💪 ${escapeHTML(s.muscle)}</div>
      <div>👥 ${s.members.length}/${s.max} người</div>
    </div>
    <strong>Danh sách thành viên</strong>
    <div class="member-list">${s.members.map(m => `<span class="member">👤 ${escapeHTML(m)}</span>`).join("")}</div>
    <div class="card-actions">
      <button class="btn btn-accent" onclick="openJoin('${s.id}')">Tham gia</button>
      <button class="btn btn-danger" onclick="leaveSession('${s.id}')">Rời kèo</button>
    </div>
  `);
}

function leaveSession(id) {
  const s = sessions.find(x => x.id === id);
  if (!s || !s.members.length) return;
  const name = prompt("Nhập đúng tên đã đăng ký để rời kèo:");
  if (!name) return;
  const idx = s.members.findIndex(m => m.toLowerCase() === name.trim().toLowerCase());
  if (idx === -1) return alert("Không tìm thấy tên trong danh sách.");
  s.members.splice(idx, 1);
  save(); closeModal(); render();
}

function openCreate() {
  const tomorrow = new Date(Date.now() + 86400000);
  const dateValue = tomorrow.toISOString().slice(0,10);
  openModal(`
    <h2>Tạo kèo tập mới ✨</h2>
    <form class="form" onsubmit="createSession(event)">
      <label>Nhóm cơ / tên kèo
        <input name="title" required maxlength="50" placeholder="Ví dụ: Vai + Bắp tay">
      </label>
      <label>Nhóm cơ
        <select name="muscle">
          <option>Ngực + Tay sau</option><option>Lưng + Tay trước</option>
          <option>Vai + Bắp tay</option><option>Chân</option>
          <option>Full Body</option><option>Cardio</option>
        </select>
      </label>
      <label>Ngày tập
        <input type="date" name="date" required value="${dateValue}">
      </label>
      <label>Giờ tập
        <input name="time" required value="18:00 - 19:30" placeholder="18:00 - 19:30">
      </label>
      <label>Địa điểm
        <input name="gym" required maxlength="60" placeholder="Tên phòng gym">
      </label>
      <label>Số người tối đa
        <input name="max" type="number" min="2" max="50" value="6" required>
      </label>
      <label>Tên người tạo
        <input name="creator" required maxlength="30" placeholder="Tên của bạn">
      </label>
      <button class="btn btn-accent" type="submit">Tạo kèo</button>
    </form>
  `);
}

function createSession(e) {
  e.preventDefault();
  const f = e.target;
  const s = {
    id: crypto.randomUUID(),
    title: f.title.value.trim(),
    muscle: f.muscle.value,
    date: f.date.value,
    time: f.time.value.trim(),
    gym: f.gym.value.trim(),
    max: Number(f.max.value),
    creator: f.creator.value.trim(),
    members: [f.creator.value.trim()]
  };
  sessions.push(s);
  save(); closeModal(); render();
}

$("createBtn").addEventListener("click", openCreate);
$("searchInput").addEventListener("input", render);
$("dateFilter").addEventListener("change", render);
$("muscleFilter").addEventListener("change", render);
$("resetBtn").addEventListener("click", () => {
  $("searchInput").value = "";
  $("dateFilter").value = "all";
  $("muscleFilter").value = "all";
  render();
});

render();
