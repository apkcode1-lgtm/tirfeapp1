function processImageUpload(file, callback) {
    if(!file) { callback(""); return; }
    let reader = new FileReader();
    reader.onload = function(e) {
        let img = new Image();
        img.onload = function() {
            let canvas = document.createElement('canvas');
            let MAX_WIDTH = 500; let MAX_HEIGHT = 500;
            let width = img.width; let height = img.height;
            if(width > height) { if(width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
            else { if(height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
            canvas.width = width; canvas.height = height;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            callback(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function viewImageFullscreen(src) {
    if(!src) return;
    let modal = document.getElementById('imageLightbox');
    document.getElementById('lightboxImg').src = src;
    modal.classList.remove('hidden');
}

function getTodayFormatted() {
    let todayObj = new Date();
    let yyyy = todayObj.getFullYear();
    let mm = String(todayObj.getMonth() + 1).padStart(2, '0');
    let dd = String(todayObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function generateRandomCode() { 
    return Math.floor(100000 + Math.random() * 900000).toString(); 
}

function switchView(targetId) {
    let views = ['welcomeGateway', 'unifiedLoginBox', 'unifiedRegisterBox', 'buyerPage', 'adminPage', 'appPage', 'revenuePage'];
    views.forEach(v => {
        let el = document.getElementById(v);
        if(el) el.classList.add('hidden');
    });
    let target = document.getElementById(targetId);
    if(target) target.classList.remove('hidden');
    
    if (targetId === 'buyerPage' && typeof renderBuyerCatalog === 'function') renderBuyerCatalog();
}

function goToGateway() { switchView('welcomeGateway'); }

function openModalContainer() { 
    document.getElementById('modalOverlay').classList.remove('hidden'); 
}

function closeActiveModal() { 
    document.getElementById('modalOverlay').classList.add('hidden'); 
    document.querySelectorAll('.modal-card').forEach(m => m.classList.add('hidden')); 
}

function showCustomAlert(title, message, callback) {
    document.getElementById('alertTitle').innerText = title;
    document.getElementById('alertMessage').innerText = message;
    openModalContainer(); 
    document.getElementById('alertModal').classList.remove('hidden');
    document.querySelector('#alertModal .btn-add').onclick = function() { 
        closeActiveModal(); 
        if(callback) callback(); 
    };
}

function showFormModal(title, fields, onSubmit) {
    document.getElementById('formModalTitle').innerText = title;
    let body = document.getElementById('formModalBody'); body.innerHTML = '';
    fields.forEach(f => {
        let label = document.createElement('label'); label.innerText = f.label;
        label.style.fontSize = '0.85rem'; label.style.color = 'var(--accent-color)'; label.style.display = 'block'; label.style.marginTop = '10px';
        
        let input;
        if(f.type === 'select') {
            input = document.createElement('select');
            f.options.forEach(opt => {
                let o = document.createElement('option');
                if (typeof opt === 'object' && opt !== null) { o.value = opt.value; o.innerText = opt.label; }
                input.appendChild(o);
            });
        } else if (f.type === 'file') {
            input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
        } else {
            input = document.createElement('input');
            input.type = f.type || 'text'; input.placeholder = f.placeholder || '';
            if(f.defaultValue !== undefined) input.value = f.defaultValue;
        }
        input.id = 'formField_' + f.id;
        body.appendChild(label); body.appendChild(input);
    });
    
    let footer = document.getElementById('formModalFooter');
    footer.innerHTML = '';
    let cancelBtn = document.createElement('button'); cancelBtn.className = 'btn-config'; cancelBtn.innerText = 'ሰርዝ'; cancelBtn.onclick = closeActiveModal;
    let submitBtn = document.createElement('button');
    submitBtn.className = 'btn-sell'; submitBtn.innerText = 'አስገባ';
    
    submitBtn.onclick = function() {
        let data = {};
        let fileInputObj = null;
        fields.forEach(f => { 
            if (f.type === 'file') { fileInputObj = document.getElementById('formField_' + f.id); }
            else { data[f.id] = document.getElementById('formField_' + f.id).value; }
        });
        closeActiveModal(); onSubmit(data, fileInputObj);
    };
    footer.appendChild(cancelBtn); footer.appendChild(submitBtn);
    openModalContainer(); document.getElementById('formModal').classList.remove('hidden');
}

function showCustomConfirm(title, message, onConfirm) {
    document.getElementById('confirmTitle').innerText = title;
    document.getElementById('confirmMessage').innerText = message;
    openModalContainer(); document.getElementById('confirmModal').classList.remove('hidden');
    document.getElementById('confirmYesBtn').onclick = function() { closeActiveModal(); if(onConfirm) onConfirm(); };
}

function changeTheme(themeClass) { 
    document.body.className = themeClass;
    if(typeof currentTenant !== 'undefined' && currentTenant) { 
        currentTenant.theme = themeClass; 
        if(typeof saveAndRefresh === 'function') saveAndRefresh(); 
    } 
}

function downloadReceiptPDF(filename) {
    const element = document.getElementById('printableReceiptArea');
    const opt = { 
        margin: [5,5,5,5], filename: filename + '.pdf', image: { type: 'jpeg', quality: 1.0 }, 
        html2canvas: { scale: 3, useCORS: true, letterRendering: true, backgroundColor: "#ffffff" }, 
        jsPDF: { unit: 'mm', format: [80, 150], orientation: 'portrait' } 
    };
    html2pdf().set(opt).from(element).save();
}

function shareToSocial(platform, text) {
    let url = "";
    if(platform === 'tg') { url = `tg://msg?text=${encodeURIComponent(text)}`; }
    else if(platform === 'wa') { url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`; }
    window.open(url, '_blank');
}

function moveToNext(current, nextFieldID) {
    if (current.value.length >= 1) {
        if (nextFieldID) { document.getElementById(nextFieldID).focus(); } 
        else { current.blur(); }
    }
}

function moveToPrev(e, current, prevFieldID) {
    if (e.key === "Backspace" && current.value === "") {
        if (prevFieldID) {
            document.getElementById(prevFieldID).focus();
            document.getElementById(prevFieldID).value = '';
        }
    }
}

