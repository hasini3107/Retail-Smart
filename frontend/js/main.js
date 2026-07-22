// Shared Client Utilities and Auth Guard for RetailSmart Platform
const API_BASE_URL = 'http://localhost:5000/api';

// Image URL Formatter Helper
function formatImageUrl(url) {
  const defaultFallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
  if (!url) return defaultFallback;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  return `http://localhost:5000/${cleanPath}`;
}

const DEFAULT_IMAGE_FALLBACK = "this.onerror=null; this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';";

// Theme Management Utility
function initAppTheme() {
  const savedTheme = localStorage.getItem('rs_theme') || 'executive-light';
  setAppTheme(savedTheme);
}

function setAppTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('rs_theme', themeName);

  // Update active state on any theme switcher buttons
  const buttons = document.querySelectorAll('.theme-opt-btn');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-theme-value') === themeName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Authentication Check Guard
function checkAuthGuard() {
  const token = localStorage.getItem('token');
  const isLoginPage = window.location.pathname.includes('login.html') || window.location.pathname === '/';
  
  if (!token && !isLoginPage) {
    window.location.href = 'login.html';
  }
}

// Render seller profile snippets in sidebar
function renderSidebarSellerProfile() {
  const sellerName = localStorage.getItem('seller_business') || 'Seller Store';
  const sellerEmail = localStorage.getItem('seller_email') || 'seller@retailsmart.com';
  
  const avatarElem = document.getElementById('sidebar-seller-avatar');
  const nameElem = document.getElementById('sidebar-seller-name');
  const emailElem = document.getElementById('sidebar-seller-email');

  if (avatarElem) avatarElem.textContent = sellerName.charAt(0).toUpperCase();
  if (nameElem) nameElem.textContent = sellerName;
  if (emailElem) emailElem.textContent = sellerEmail;
}

// Global Toast Notification System
function showToast(message, type = 'info') {
  const container = document.querySelector('.rs-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `rs-toast toast-${type}`;
  
  let iconClass = 'bi-info-circle-fill text-primary';
  if (type === 'success') iconClass = 'bi-check-circle-fill text-success';
  if (type === 'danger') iconClass = 'bi-exclamation-triangle-fill text-danger';
  if (type === 'warning') iconClass = 'bi-exclamation-circle-fill text-warning';

  toast.innerHTML = `
    <i class="bi ${iconClass} fs-5"></i>
    <div class="flex-grow-1 small font-semibold">${message}</div>
    <button type="button" class="btn-close btn-close-white ms-2" onclick="this.parentElement.remove()"></button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Logout Handler
function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('seller_business');
  localStorage.removeItem('seller_email');
  showToast('Logged out successfully.', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 500);
}

// Toggle Responsive Mobile Sidebar
function toggleSidebar() {
  const sidebar = document.querySelector('.app-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('show');
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initAppTheme();
  checkAuthGuard();
  renderSidebarSellerProfile();
});
