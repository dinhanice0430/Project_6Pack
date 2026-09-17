/* =========================================================
   STYLE CHO DANH SÁCH KÈO TẬP (SESSION CARDS)
   ========================================================= */

/* Lưới chứa các card */
.session-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 25px;
    padding-top: 20px;
}

/* Giao diện 1 Thẻ (Card) */
.session-card {
    background: var(--bg-white, #ffffff);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
    border: 1px solid var(--border-color, #E5E7EB);
    display: flex;
    flex-direction: column;
    gap: 15px;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    
    /* Animation xuất hiện mượt mà */
    animation: fadeInUp 0.6s ease forwards;
    opacity: 0;
    transform: translateY(20px);
}

/* Tạo độ trễ animation để các card hiện ra lần lượt (Cascade Effect) */
.session-card:nth-child(1) { animation-delay: 0.1s; }
.session-card:nth-child(2) { animation-delay: 0.2s; }
.session-card:nth-child(3) { animation-delay: 0.3s; }
.session-card:nth-child(4) { animation-delay: 0.4s; }

/* Hiệu ứng di chuột (Hover) */
.session-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
    border-color: var(--primary, #E63946);
}

/* Tiêu đề & Thông tin trong Card */
.date-badge {
    background: var(--bg-light-gray, #EDF2F4);
    color: var(--text-muted, #6B7280);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
}

.session-title {
    font-size: 1.4rem;
    color: var(--secondary, #1D3557);
    margin: 5px 0;
}

.session-info p {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--text-muted, #6B7280);
    font-size: 0.95rem;
    margin-bottom: 8px;
}
.session-info i {
    color: var(--primary, #E63946);
    width: 16px;
}

/* Thiết kế Thanh Tiến Độ (Progress Bar) */
.progress-container {
    margin-top: 10px;
}
.progress-text {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-dark, #1F2937);
    margin-bottom: 6px;
}
.progress-bar-bg {
    width: 100%;
    height: 8px;
    background: #E5E7EB;
    border-radius: 10px;
    overflow: hidden;
}
.progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary, #E63946), #FF758F);
    border-radius: 10px;
    transition: width 1s ease-in-out; /* Chuyển động thanh màu */
}

/* Nút hành động trong Card */
.card-actions {
    display: flex;
    gap: 10px;
    margin-top: auto;
}
.w-100 {
    width: 100%;
    justify-content: center;
}
.icon-btn {
    padding: 10px 15px;
}

/* Keyframe Animation mượt mà */
@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
