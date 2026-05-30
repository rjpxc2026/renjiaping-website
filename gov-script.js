// ===== 轮播 =====
let currentSlide = 0;
const slides = document.querySelectorAll('.banner-slide');
const dotsContainer = document.getElementById('bannerDots');

slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.onclick = () => goSlide(i);
    dotsContainer.appendChild(dot);
});

function goSlide(n) {
    slides[currentSlide].classList.remove('active');
    dotsContainer.children[currentSlide].classList.remove('active');
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dotsContainer.children[currentSlide].classList.add('active');
}

function slideBanner(dir) { goSlide(currentSlide + dir); }
setInterval(() => goSlide(currentSlide + 1), 5000);

// ===== 生成31个组长表格 =====
(function(){
  const tbody = document.getElementById('groupTableBody');
  if(!tbody) return;
  const leaders = [
    '赵秋阳','李瑞民','赵尚秀','邓益南','赵银莲','凌春酉',
    '赵安庆','赵明信','肖国兰','曾仲华','曾跃文','曾桂初',
    '曾连华','曾新华','王新生','曾迪民','曾文琴','曾瑞喜',
    '曾春华','李春看','赵新国','蒋玉德','申伟民','尹双文',
    '尹友良','周君','赵一仪','曾安求','曾新华','尹付民','贺赛群'
  ];
  for(let i=0;i<leaders.length;i+=2){
    const tr = document.createElement('tr');
    for(let j=0;j<2;j++){
      const num = i+j+1;
      if(!leaders[num-1]) { tr.innerHTML += '<td></td><td></td><td></td>'; continue; }
      tr.innerHTML += '<td class="gtd-num">'+num+'</td><td class="gtd-group" data-editable>第'+num+'组</td><td class="gtd-name" data-editable>'+leaders[num-1]+'</td>';
    }
    tbody.appendChild(tr);
  }
})();

// ===== 导航高亮 =====
const navLinks = document.querySelectorAll('.nav-list a');
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        document.querySelector('.nav-list li.active')?.classList.remove('active');
        this.parentElement.classList.add('active');
    });
});

// ===== 编辑模式 =====
let editMode = false;

function toggleEdit() {
    editMode = !editMode;
    const btn = document.getElementById('editBtn');
    const notice = document.getElementById('editNotice');
    const editables = document.querySelectorAll('[data-editable]');

    if (editMode) {
        btn.textContent = '✅ 退出编辑';
        btn.style.color = '#ffeb3b';
        notice.style.display = 'block';
        editables.forEach(el => {
            el.contentEditable = 'true';
            el.classList.add('editing');
            el.addEventListener('blur', saveEditable);
        });
    } else {
        btn.textContent = '✏️ 编辑模式';
        btn.style.color = '';
        notice.style.display = 'none';
        editables.forEach(el => {
            el.contentEditable = 'false';
            el.classList.remove('editing');
            el.removeEventListener('blur', saveEditable);
        });
    }
}

function saveEditable(e) {
    const key = getEditableKey(e.target);
    localStorage.setItem(key, e.target.innerHTML);
}

function getEditableKey(el) {
    const path = [];
    let node = el;
    while (node && node !== document.body) {
        let idx = 0;
        let sib = node.previousSibling;
        while (sib) { if (sib.nodeType === 1) idx++; sib = sib.previousSibling; }
        path.unshift(node.tagName + ':' + idx);
        node = node.parentNode;
    }
    return 'rjp_edit_' + path.join('/');
}

// 页面加载时恢复已编辑内容
function loadSavedEdits() {
    document.querySelectorAll('[data-editable]').forEach(el => {
        const key = getEditableKey(el);
        const saved = localStorage.getItem(key);
        if (saved) el.innerHTML = saved;
    });
}
loadSavedEdits();

// ===== 新增新闻条目 =====
function addNewsItem(listId) {
    if (!editMode) { alert('请先开启编辑模式'); return; }
    const list = document.getElementById(listId);
    if (!list) return;
    const today = new Date();
    const dateStr = String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
    const li = document.createElement('li');
    li.innerHTML = `<a href="javascript:void(0)"><span data-editable>请输入新闻标题</span><em>${dateStr}</em></a>`;
    list.insertBefore(li, list.firstChild);
    // 让新标题可编辑
    const span = li.querySelector('[data-editable]');
    span.contentEditable = 'true';
    span.classList.add('editing');
    span.focus();
    span.addEventListener('blur', saveEditable);
    // 选中文字方便修改
    const range = document.createRange();
    range.selectNodeContents(span);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

// ===== 导出数据 =====
function exportData() {
    const data = {};
    document.querySelectorAll('[data-editable]').forEach(el => {
        const key = getEditableKey(el);
        data[key] = el.innerHTML;
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'renjiaping_data_' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
}

// ===== 搜索功能（简单过滤新闻列表） =====
document.querySelector('.search-btn')?.addEventListener('click', function() {
    const keyword = document.querySelector('.search-input').value.trim();
    if (!keyword) return;
    document.querySelectorAll('.news-list span[data-editable]').forEach(span => {
        const li = span.closest('li');
        if (li) li.style.display = span.textContent.includes(keyword) ? '' : 'none';
    });
});
