// ===== 邵东官网风格 - 仁家坪新村 脚本 =====

// ---- 轮播 ----
let slideIdx = 0;
let slideTimer;
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('sliderDots');

// 生成小圆点
slides.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goSlide(i));
    dotsContainer.appendChild(dot);
});

function goSlide(idx) {
    slides[slideIdx].classList.remove('active');
    dotsContainer.children[slideIdx].classList.remove('active');
    slideIdx = idx;
    slides[slideIdx].classList.add('active');
    dotsContainer.children[slideIdx].classList.add('active');
}

function nextSlide() {
    goSlide((slideIdx + 1) % slides.length);
}

function startSlider() {
    slideTimer = setInterval(nextSlide, 4000);
}
function stopSlider() {
    clearInterval(slideTimer);
}
startSlider();

// hover 暂停
document.querySelector('.slider-box').addEventListener('mouseenter', stopSlider);
document.querySelector('.slider-box').addEventListener('mouseleave', startSlider);

// ---- Tab 切换 ----
function switchTab(name) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('pane-' + name).classList.add('active');
}

// ---- 编辑模式 ----
let editMode = false;

function toggleEdit() {
    editMode = !editMode;
    document.body.classList.toggle('edit-mode', editMode);
    document.getElementById('editToast').style.display = editMode ? 'block' : 'none';
    document.getElementById('editBtn').textContent = editMode ? '✅ 保存' : '✏️ 编辑';

    if (!editMode) {
        // 保存所有编辑内容到 localStorage
        saveEdits();
    }
}

// 点击可编辑元素
document.addEventListener('click', function(e) {
    if (!editMode) return;
    const el = e.target.closest('[data-editable]');
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();

    // 如果已经在编辑则跳过
    if (el.contentEditable === 'true') return;

    el.contentEditable = 'true';
    el.style.background = '#fffde7';
    el.focus();

    // 选中所有文字
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    // blur 时退出编辑
    el._blurHandler = function() {
        el.contentEditable = 'false';
        el.style.background = '';
        el.removeEventListener('blur', el._blurHandler);
    };
    el.addEventListener('blur', el._blurHandler);
});

// ---- 保存/加载编辑内容 ----
function saveEdits() {
    const edits = {};
    document.querySelectorAll('[data-editable]').forEach((el, i) => {
        edits['el_' + i] = el.innerHTML;
    });
    localStorage.setItem('renjiaping_edits', JSON.stringify(edits));
    showToast('✅ 内容已保存');
}

function loadEdits() {
    try {
        const data = JSON.parse(localStorage.getItem('renjiaping_edits'));
        if (!data) return;
        const els = document.querySelectorAll('[data-editable]');
        Object.keys(data).forEach((key, i) => {
            if (els[i]) els[i].innerHTML = data[key];
        });
    } catch(e) {}
}

function exportEdits() {
    const data = JSON.parse(localStorage.getItem('renjiaping_edits') || '{}');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'renjiaping-edits-' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
}

// 页面加载时恢复
loadEdits();

// ---- Toast 提示 ----
function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 24px;border-radius:20px;font-size:14px;z-index:99999;animation:fadeInDown 0.3s;';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// ---- 导航平滑滚动 ----
document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            document.querySelectorAll('.nav-list li').forEach(li => li.classList.remove('active'));
            this.parentElement.classList.add('active');
        }
    });
});

// ---- 滚动时导航高亮 ----
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 120;
    const sections = document.querySelectorAll('section[id]');
    let currentId = 'home';
    sections.forEach(sec => {
        if (sec.offsetTop <= scrollY) {
            currentId = sec.id;
        }
    });
    document.querySelectorAll('.nav-list li').forEach(li => {
        li.classList.toggle('active', li.querySelector('a').getAttribute('href') === '#' + currentId);
    });
});
