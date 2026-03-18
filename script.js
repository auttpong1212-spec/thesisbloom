/* ============================================================
   1. GLOBAL FUNCTIONS (ฟังก์ชันที่ต้องเรียกใช้จาก HTML)
   ============================================================ */

// ฟังก์ชันสุ่มร้านอาหาร (Random Meal)
function randomMyMeal() {
    const restaurantCards = document.querySelectorAll('#restaurantList .location-card');
    if (restaurantCards.length > 0) {
        const randomIndex = Math.floor(Math.random() * restaurantCards.length);
        const selectedStore = restaurantCards[randomIndex];

        // เลื่อนหน้าจอไปหาการ์ดที่สุ่มได้
        selectedStore.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Effect กระพริบขอบสีเขียว
        selectedStore.style.transition = "all 0.3s ease";
        selectedStore.style.outline = "5px solid var(--color-cyan)";
        selectedStore.style.transform = "scale(1.05)";
        selectedStore.style.zIndex = "10";

        setTimeout(() => {
            selectedStore.style.outline = "none";
            selectedStore.style.transform = "scale(1)";
            selectedStore.style.zIndex = "1";
            selectedStore.click(); // เปิด Modal ร้านนั้น
        }, 800);
    } else {
        alert("ไม่พบข้อมูลร้านอาหาร กรุณาลองใหม่อีกครั้ง");
    }
}

// ฟังก์ชันแจ้งเตือนแบบ Modern (Toast)
// ฟังก์ชันแจ้งเตือนแบบ Modern (Toast)
window.showToast = function (message, type = 'success') {
    const container = document.getElementById('toastContainer');

    // 🛑 แผนสำรอง: ถ้าเว็บหากล่องไม่เจอ ให้เด้งเป็น Alert ปกติแทน จะได้รู้ว่าเซฟติดไหม
    if (!container) {
        alert(message);
        return;
    }

    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;

    const icon = type === 'success'
        ? '<i class="fa-solid fa-circle-check"></i>'
        : '<i class="fa-solid fa-circle-exclamation"></i>';

    toast.innerHTML = `${icon} <span style="margin-left:8px;">${message}</span>`;
    container.appendChild(toast);

    // สั่งให้สไลด์เข้ามา
    requestAnimationFrame(() => {
        setTimeout(() => toast.classList.add('show'), 10);
    });

    // สั่งให้หายไปเอง
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// ฟังก์ชันช่วยใส่คำค้นหา
function setSearch(text) {
    const input = document.getElementById('searchQuery');
    if (input) {
        input.value = text;
        input.focus();
    }
}

/* ============================================================
   2. DOM CONTENT LOADED (การทำงานหลักเมื่อโหลดหน้าเว็บเสร็จ)
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

    // --- 0. Loading State System ---
    const loaderOverlay = document.createElement('div');
    loaderOverlay.className = 'loader-overlay';
    loaderOverlay.innerHTML = `
        <div class="loader-spinner"></div>
        <style>
            .loader-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(255, 255, 255, 0.95); z-index: 10000;
                display: flex; justify-content: center; align-items: center;
                transition: opacity 0.4s ease; opacity: 0; pointer-events: none;
            }
            .loader-overlay.active { opacity: 1; pointer-events: all; }
            .loader-spinner {
                width: 48px; height: 48px;
                border: 5px solid #DDD; border-bottom-color: #3498db;
                border-radius: 50%; display: inline-block;
                box-sizing: border-box; animation: rotation 1s linear infinite;
            }
            @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    `;
    document.body.appendChild(loaderOverlay);

    function withLoading(callback) {
        loaderOverlay.classList.add('active');
        setTimeout(() => {
            if (callback) callback();
            setTimeout(() => {
                loaderOverlay.classList.remove('active');
            }, 300);
        }, 500);
    }

    // --- 1. Init Data & State ---
    let favorites = [];
    let currentRating = 0;
    let selectedImageData = null; // ตัวแปรเก็บรูปภาพรีวิว

    // 1. เปลี่ยนจาก const เป็น let เพื่อให้แก้ไขค่าได้
    // 2. ดึงข้อมูลจาก localStorage ถ้าไม่มีให้ใช้ค่าเริ่มต้น (Default)
    // เคลียร์ความจำเก่าออกก่อน เพื่อให้โหลดข้อมูลใหม่
    localStorage.removeItem('bloomReviews');

    let reviewsData = JSON.parse(localStorage.getItem('bloomReviews')) || {
        "MOCA Museum": [
            { name: "Ploy Ch.", avatar: "https://i.pravatar.cc/150?img=5", rating: 5, text: "แสงสวยทุกจุด ถ่ายรูปปังมาก คุ้มราคาบัตรนักศึกษาค่ะ", date: "2 days ago", reviewImage: null }
        ],
        "วัดพระศรีมหาธาตุ": [
            { name: "Somchai", avatar: "https://i.pravatar.cc/150?img=13", rating: 5, text: "มาไหว้ขอพรช่วงสอบ สงบ ร่มรื่น เดินทางสะดวกติด BTS", date: "Yesterday", reviewImage: null }
        ],
        "เมเจอร์ รัชโยธิน": [
            { name: "Movie Buff", avatar: "https://i.pravatar.cc/150?img=60", rating: 5, text: "โรง IMAX ภาพชัดเสียงกระหึ่ม! ของกินหน้าห้างเพียบ", date: "1 hour ago", reviewImage: null }
        ],
        "เซ็นทรัล รามอินทรา": [
            { name: "Tee Lek", avatar: "https://i.pravatar.cc/150?img=59", rating: 4, text: "รีโนเวทใหม่สวยมาก คนไม่พลุกพล่าน เดินเล่นชิลๆ", date: "2 days ago", reviewImage: null }
        ],
        "เซ็นทรัล ลาดพร้าว": [
            { name: "Shopaholic", avatar: "https://i.pravatar.cc/150?img=24", rating: 5, text: "ของกินชั้นใต้ดินคือสวรรค์ เดินทางง่ายติด BTS", date: "Yesterday", reviewImage: null }
        ],
        "Union Mall": [
            { name: "Fashionist", avatar: "https://i.pravatar.cc/150?img=44", rating: 5, text: "เสื้อผ้าวัยรุ่นเยอะมาก ราคาถูก เหมาะกับกระเป๋าตังค์นักศึกษา", date: "3 days ago", reviewImage: null }
        ],
        "สวนรถไฟ": [
            { name: "Healthy Girl", avatar: "https://i.pravatar.cc/150?img=33", rating: 5, text: "ปั่นจักรยานรับลมเย็นๆ ถ่ายรูปฟีลเกาหลีดีมาก", date: "Last Sunday", reviewImage: null }
        ],
        "BACC": [
            { name: "Art Ken", avatar: "https://i.pravatar.cc/150?img=11", rating: 4, text: "งานศิลปะดีครับ เดินทางง่าย มีคาเฟ่ข้างในด้วย", date: "1 week ago", reviewImage: null }
        ],
        "GUMP's Ari": [
            { name: "Cafe Hopper", avatar: "https://i.pravatar.cc/150?img=38", rating: 5, text: "สีสันสดใส มุมถ่ายรูปเยอะ มีตู้สติกเกอร์เพียบ", date: "Yesterday", reviewImage: null }
        ],
        "JODD FAIRS แดนเนรมิต": [
            { name: "Night Owl", avatar: "https://i.pravatar.cc/150?img=68", rating: 5, text: "ถ่ายรูปกับปราสาทสวยมาก ของกินเยอะแต่ราคาแอบแรงนิดนึง", date: "Last Friday", reviewImage: null }
        ],
        "สุกี้ตี๋น้อย": [
            { name: "Hungry Boy", avatar: "https://i.pravatar.cc/150?img=14", rating: 5, text: "เดอะแบกของคนนอนดึก อร่อย คุ้ม เนื้อสไลด์ดีงาม", date: "2 hours ago", reviewImage: null }
        ],
        "ย่างเนย": [
            { name: "Cheese Lover", avatar: "https://i.pravatar.cc/150?img=21", rating: 5, text: "กุ้งเน้นๆ ชีสเยิ้มๆ ไม่จำกัดเวลา กินจนกว่าจะร้องขอชีวิต!", date: "Yesterday", reviewImage: null }
        ],
        "Shinkanzen Sushi": [
            { name: "Salmon Fan", avatar: "https://i.pravatar.cc/150?img=8", rating: 5, text: "ซูชิคำละ 11 บาทคือคุ้มมาก แซลมอนสดใช้ได้เลย", date: "3 days ago", reviewImage: null }
        ],
        "สุกี้จินดา": [
            { name: "Mala Lover", avatar: "https://i.pravatar.cc/150?img=16", rating: 5, text: "น้ำซุปกระดูกหมูผสมหม่าล่าคือเด็ดมาก รอคิวนานหน่อยแต่คุ้ม", date: "Yesterday", reviewImage: null }
        ],
        "จ่าอู หมูเกาหลี": [
            { name: "BBQ Master", avatar: "https://i.pravatar.cc/150?img=57", rating: 5, text: "น้ำจิ้มสุกี้รสแซ่บ หมูหมักนุ่มมาก คิวแน่นสุดๆ", date: "2 days ago", reviewImage: null }
        ],
        "ป.ประทีป ก๋วยเตี๋ยวเรือ": [
            { name: "Spicy Tongue", avatar: "https://i.pravatar.cc/150?img=29", rating: 4, text: "พริกเผ็ดมากกก เตือนแล้วนะ! กากหมูเจียวกรอบอร่อย", date: "1 week ago", reviewImage: null }
        ],
        "ถิงถิง บิงซูน้ำขิง": [
            { name: "Sweet Tooth", avatar: "https://i.pravatar.cc/150?img=42", rating: 5, text: "บิงซูชาไทยอร่อยมาก กินคาวเสร็จต้องแวะมาร้านนี้ตลอด", date: "Yesterday", reviewImage: null }
        ],
        "โอ้กะจู๋": [
            { name: "Healthy Boy", avatar: "https://i.pravatar.cc/150?img=12", rating: 5, text: "ผักสดมาก จานใหญ่เบิ้มๆ เหมาะกับมาทานกับครอบครัว", date: "Last Sunday", reviewImage: null }
        ],
        "ข้าวผัดปูเมืองทอง": [
            { name: "Crab Hunter", avatar: "https://i.pravatar.cc/150?img=25", rating: 4, text: "ข้าวผัดร่วนหอมกลิ่นกระทะ สุกี้แห้งก็เด็ด อาหารออกไวมาก", date: "Yesterday", reviewImage: null }
        ],
        "โอยั๊วะเกษตร": [
            { name: "Party Man", avatar: "https://i.pravatar.cc/150?img=31", rating: 5, text: "ร้านประจำเวลานัดเลี้ยงสายรหัส บรรยากาศดี อาหารอร่อย", date: "Last Friday", reviewImage: null }
        ]
    };

    // --- 2. Menu Navigation ---
    const menuIcon = document.querySelector('.menu-icon');
    const nav = document.querySelector('.nav');
    if (menuIcon && nav) {
        menuIcon.addEventListener('click', function () {
            nav.classList.toggle('open');
            document.body.classList.toggle('menu-active');
        });
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                document.body.classList.remove('menu-active');
            });
        });
    }

    // --- 3. Sections Switching & Active State ---
    const sections = {
        home: [document.querySelector('.hero'), document.getElementById('tour-hero'), document.getElementById('restaurant-hero'), document.getElementById('contact-hero'), document.getElementById('about-hero')],
        tour: document.getElementById('location-section-tour'),
        dining: document.getElementById('location-section-restaurant'),
        contact: document.getElementById('contact-section'),
        about: document.getElementById('about-section'),
        community: document.getElementById('community-section') // 🟢 เพิ่มบรรทัดนี้เข้าไปครับ
    };

    function updateNavActiveState(targetHref) {
        document.querySelectorAll('.nav a').forEach(link => {
            if (link.getAttribute('href') === targetHref) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    function hideAll() {
        Object.values(sections).flat().forEach(el => { if (el) el.style.display = 'none'; });
        
        // 🟢 เพิ่มบรรทัดนี้ เพื่อสั่งซ่อนหน้า Community ด้วยเวลากลับหน้าหลัก
        document.querySelectorAll('.sections-container').forEach(sec => sec.style.display = 'none');
    }

    function showHomePage() {
        withLoading(() => {
            hideAll();
            sections.home.forEach(el => { if (el) el.style.display = 'flex'; });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            updateNavActiveState('#');
        });
    }

    function showSection(section, href) {
        if (!section) return;
        withLoading(() => {
            hideAll();
            section.style.display = 'flex';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            updateNavActiveState(href);
        });
    }

    // Navigation Listeners
    document.querySelectorAll('.back-to-home-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showHomePage();

        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (this.classList.contains('back-to-home-btn')) return;

            if (id === '#location-section-tour') { e.preventDefault(); showSection(sections.tour, id); }
            else if (id === '#location-section-restaurant') { e.preventDefault(); showSection(sections.dining, id); }
            else if (id === '#contact-section') { e.preventDefault(); showSection(sections.contact, id); }
            else if (id === '#about-section') { e.preventDefault(); showSection(sections.about, id); }
            else if (id === '#community-section') { 
                // 🟢 ระบบสลับไปหน้า Community แบบเต็มจอ
                e.preventDefault(); 
                showSection(sections.community, id); 
                loadCommunityFeed(); 
            }
            else {
                const target = document.querySelector(id);
                if (target && sections.home[0].style.display !== 'none') {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // --- 4. FAVORITES SYSTEM ---
    async function toggleFavorite(title, btn) {
        const user = firebase.auth().currentUser;

        // ถ้ายังไม่ได้ล็อกอิน บังคับให้ล็อกอินก่อนกดหัวใจ
        if (!user) {
            showToast('กรุณาเข้าสู่ระบบก่อนบันทึกร้านโปรดครับ', 'error');
            document.getElementById('loginModal').style.display = 'flex';
            return;
        }

        const index = favorites.indexOf(title);
        const icon = btn.querySelector('i');

        // สลับสถานะหัวใจ
        if (index === -1) {
            favorites.push(title);
            btn.classList.add('active');
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
        } else {
            favorites.splice(index, 1);
            btn.classList.remove('active');
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
        }

        // บันทึกรายการโปรดลง Firestore เข้าบัญชีของคนนั้นๆ
        try {
            await firebase.firestore().collection('users').doc(user.uid).set({
                favorites: favorites
            }, { merge: true });
        } catch (error) {
            console.error("Error saving favorite:", error);
        }
    }

    function updateFavoriteUI() {
        document.querySelectorAll('.location-card').forEach(card => {
            const title = card.getAttribute('data-title');
            const btn = card.querySelector('.favorite-btn');
            if (btn) {
                const icon = btn.querySelector('i');
                if (favorites.includes(title)) {
                    btn.classList.add('active');
                    icon.classList.remove('fa-regular');
                    icon.classList.add('fa-solid');
                } else {
                    btn.classList.remove('active');
                    icon.classList.remove('fa-solid');
                    icon.classList.add('fa-regular');
                }
            }
        });
    }
    updateFavoriteUI();

    // --- 5. Filters System ---
    function setupFilters(containerId, gridId) {
        const container = document.getElementById(containerId);
        const grid = document.getElementById(gridId);
        if (!container || !grid) return;
        const buttons = container.querySelectorAll('.filter-btn');
        const cards = grid.querySelectorAll('.location-card');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-filter');

                cards.forEach(card => {
                    const tags = card.getAttribute('data-tags');
                    const title = card.getAttribute('data-title');

                    let isMatch = false;
                    if (filter === 'all') {
                        isMatch = true;
                    } else if (filter === 'favorites') {
                        isMatch = favorites.includes(title);
                    } else {
                        isMatch = (tags && tags.includes(filter));
                    }

                    if (isMatch) card.style.display = 'block';
                    else card.style.display = 'none';
                });
            });
        });
    }
    setupFilters('tourFilters', 'locationList');
    setupFilters('diningFilters', 'restaurantList');

    // --- 6. Modal & Review System ---
    const detailModal = document.getElementById('detailModal');
    const detailClose = document.querySelector('.detail-close-btn');

    const reviewModal = document.getElementById('reviewModal');
    const reviewClose = document.querySelector('.review-close-btn');
    const reviewList = document.getElementById('reviewList');
    const submitReviewBtn = document.getElementById('submitReviewBtn');
    let currentReviewTarget = "";

    // --- PHOTO UPLOAD LOGIC & COMPRESSION ---
    // 🟢 ระบบย่อขนาดรูปภาพอัตโนมัติ ไม่ให้เกินขีดจำกัดของ Firebase (1MB)
    window.compressImage = function(file, callback) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // บังคับกว้างสูงสุด
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // บีบอัดเป็น JPEG คุณภาพ 70% (เหลือขนาดประมาณ 100-200KB)
                callback(canvas.toDataURL('image/jpeg', 0.7));
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(file);
    }

    const reviewPhotoInput = document.getElementById('reviewPhotoInput');
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');
    const photoPreview = document.getElementById('photoPreview');
    const removePhotoBtn = document.getElementById('removePhotoBtn');

    // จัดการอัปโหลดรูปร้าน (หน้าธรรมดา)
    if (reviewPhotoInput) {
        reviewPhotoInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                // 🟢 เรียกใช้ฟังก์ชันย่อรูปก่อน
                compressImage(file, function(compressedBase64) {
                    selectedImageData = compressedBase64;
                    photoPreview.src = selectedImageData;
                    photoPreviewContainer.style.display = 'block';
                });
            }
        });
    }

    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', function () {
            selectedImageData = null;
            reviewPhotoInput.value = '';
            photoPreviewContainer.style.display = 'none';
        });
    }

    function updateGallery(imageString) {
        const nav = document.getElementById('thumbnailNav');
        const main = document.getElementById('modalImage');
        if (!main || !nav) return;
        nav.innerHTML = ''; main.src = '';
        if (!imageString) { nav.style.display = 'none'; return; }
        const urls = imageString.split(',');
        urls.forEach((url, i) => {
            const img = document.createElement('img'); img.src = url.trim();
            if (i === 0) { img.classList.add('active'); main.src = url.trim(); }
            img.addEventListener('click', function () {
                main.src = url.trim();
                nav.querySelectorAll('img').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
            nav.appendChild(img);
        });
        nav.style.display = urls.length <= 1 ? 'none' : 'flex';
    }

    function openDetail(data) {
        if (!detailModal) return;
        currentReviewTarget = data.title;
        document.getElementById('modalTitle').textContent = data.title || '';
        document.getElementById('modalDetails').textContent = data.details || '';
        document.getElementById('modalBudget').textContent = data.budget ? `Budget: ${data.budget}` : '';
        document.getElementById('modalHighlight').textContent = data.highlight || '-';
        document.getElementById('modalHours').textContent = data.hours || 'See details';
        document.getElementById('modalPhone').textContent = data.phone || '-';
        document.getElementById('modalParking').textContent = data.parking || '-';
        updateGallery(data.images);
        const tagBox = document.getElementById('modalTags'); tagBox.innerHTML = '';
        if (data.tags) data.tags.split(' ').forEach(t => {
            if (t.startsWith('#')) {
                const s = document.createElement('span');
                s.className = 'modal-tag';
                s.textContent = t;
                tagBox.appendChild(s);
            }
        });
        const mapBtn = document.getElementById('googleMapBtn');
        if (mapBtn) {
            mapBtn.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.title)}`;
        }
        detailModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // --- เปลี่ยนระบบดึงรีวิวให้มาจาก Firebase 100% ---
    async function openReviews() {
        if (!reviewModal) return;
        document.getElementById('reviewTargetName').textContent = currentReviewTarget;
        
        // ขึ้นข้อความโหลดรอไว้ก่อน
        reviewList.innerHTML = '<p style="text-align:center; padding: 20px;">กำลังโหลดรีวิว...</p>';
        reviewModal.style.display = 'flex';

        // หา ID ร้านจากชื่อภาษาไทย
        let actualShopId = "unknown";
        for (const [key, value] of Object.entries(shopDatabase)) {
            if (value.title === currentReviewTarget) {
                actualShopId = key; break;
            }
        }

        try {
            // ดึงข้อมูลรีวิวของร้านนี้จาก Firebase
            const snapshot = await firebase.firestore().collection('reviews')
                .where('shopId', '==', actualShopId)
                .get();

            reviewList.innerHTML = '';
            
            // ถ้าร้านนี้ยังไม่มีใครรีวิว
            if (snapshot.empty) {
                reviewList.innerHTML = '<p style="text-align:center; color:#94a3b8; padding: 20px;">ยังไม่มีรีวิวสำหรับสถานที่นี้ มารีวิวคนแรกกันเถอะ!</p>';
                return;
            }

            // นำข้อมูลมาเรียงตามวันที่ (ใหม่ล่าสุดขึ้นก่อน)
            let reviewsArray = [];
            snapshot.forEach(doc => reviewsArray.push(doc.data()));
            reviewsArray.sort((a, b) => new Date(b.date) - new Date(a.date));

            // สร้างการ์ดรีวิวโชว์บนหน้าจอ
            reviewsArray.forEach(r => {
                const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
                
                // แปลงวันที่ให้อ่านง่ายขึ้น
                const d = new Date(r.date);
                const dateStr = d.toLocaleDateString('th-TH') + ' ' + d.toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'});

                const reviewImgHtml = r.reviewImage
                    ? `<img src="${r.reviewImage}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; margin-top: 10px; border: 1px solid #eee;">`
                    : '';

                const html = `
                    <div class="review-item">
                        <div class="review-avatar" style="background-image: url('${r.avatar || 'https://i.pravatar.cc/150'}');"></div>
                        <div class="review-content">
                            <div class="review-header">
                                <div class="review-user">${r.name}</div>
                                <div class="review-date">${dateStr}</div>
                            </div>
                            <div class="review-stars">${stars}</div>
                            <p class="review-text">${r.text}</p>
                            ${reviewImgHtml}
                        </div>
                    </div>`;
                reviewList.innerHTML += html;
            });

        } catch (error) {
            console.error("Error loading reviews:", error);
            reviewList.innerHTML = '<p style="text-align:center; color:red;">เกิดข้อผิดพลาดในการโหลดรีวิว</p>';
        }
    }

    const viewReviewsBtn = document.getElementById('viewReviewsBtn');
    if (viewReviewsBtn) { viewReviewsBtn.addEventListener('click', openReviews); }

    // =========================================================
    // 🟢 โค้ดที่หายไป: ระบบให้คะแนนดาว และปุ่ม POST REVIEW 
    // =========================================================
    const reviewStars = document.querySelectorAll('.write-review-section .star-rating-input i');
    reviewStars.forEach(star => {
        star.addEventListener('click', function() {
            currentRating = parseInt(this.getAttribute('data-value'));
            reviewStars.forEach(s => {
                const v = parseInt(s.getAttribute('data-value'));
                s.className = v <= currentRating ? 'fa-solid fa-star filled' : 'fa-regular fa-star';
            });
        });
    });

    if (submitReviewBtn) {
        submitReviewBtn.addEventListener('click', async () => {
            const user = firebase.auth().currentUser;
            if (!user) {
                showToast('กรุณาล็อกอินก่อนโพสต์รีวิวนะครับ', 'error');
                document.getElementById('loginModal').style.display = 'flex';
                return;
            }

            const text = document.getElementById('newReviewText').value;
            if (currentRating === 0) return showToast('กรุณาให้คะแนนดาวด้วยครับ', 'error');
            if (!text.trim()) return showToast('กรุณาเขียนข้อความรีวิวด้วยนะครับ', 'error');

            const originalBtnText = submitReviewBtn.innerText;
            submitReviewBtn.innerText = 'POSTING...';
            submitReviewBtn.disabled = true;

            try {
                // หา ID ร้านจากชื่อภาษาไทย
                let actualShopId = "unknown";
                for (const [key, value] of Object.entries(shopDatabase)) {
                    if (value.title === currentReviewTarget) {
                        actualShopId = key; break;
                    }
                }

                const newReview = {
                    shopId: actualShopId,
                    name: user.displayName || 'Student',
                    avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
                    rating: currentRating,
                    text: text,
                    date: new Date().toISOString(),
                    reviewImage: selectedImageData, 
                    userId: user.uid,
                    likedBy: [] 
                };

                // ส่งข้อมูลขึ้น Firebase
                await firebase.firestore().collection('reviews').add(newReview);
                showToast('โพสต์รีวิวสำเร็จ!', 'success');
                
                // เคลียร์ฟอร์มให้ว่าง
                document.getElementById('newReviewText').value = '';
                reviewStars.forEach(s => s.className = 'fa-regular fa-star');
                currentRating = 0;
                if (removePhotoBtn) removePhotoBtn.click();
                
                // โหลดข้อมูลรีวิวมาแสดงใหม่ทันที
                openReviews();

            } catch (error) {
                showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
            } finally {
                submitReviewBtn.innerText = originalBtnText;
                submitReviewBtn.disabled = false;
            }
        });
    }
    // =========================================================

    document.querySelectorAll('.location-card').forEach(card => {
        const favBtn = card.querySelector('.favorite-btn');
        if (favBtn) {
            favBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                const title = card.getAttribute('data-title');
                toggleFavorite(title, this);
            });
        }

        card.addEventListener('click', function (e) {
            if (e.target.closest('.favorite-btn')) return;
            openDetail({
                title: this.getAttribute('data-title'),
                details: this.getAttribute('data-details'),
                budget: this.getAttribute('data-budget'),
                highlight: this.getAttribute('data-highlight'),
                hours: this.getAttribute('data-hours'),
                phone: this.getAttribute('data-phone'),
                parking: this.getAttribute('data-parking'),
                tags: this.getAttribute('data-tags'),
                images: this.getAttribute('data-images')
            });
        });
    });

    

    function closeModal(m) { if (m) m.style.display = 'none'; document.body.style.overflow = 'auto'; }
    if (detailClose) detailClose.addEventListener('click', () => closeModal(detailModal));
    if (reviewClose) reviewClose.addEventListener('click', () => closeModal(reviewModal));

    window.addEventListener('click', (e) => {
        if (e.target === detailModal) closeModal(detailModal);
        if (e.target === reviewModal) closeModal(reviewModal);
        if (e.target === document.getElementById('loginModal')) closeModal(document.getElementById('loginModal'));
        if (e.target === document.getElementById('signupModal')) closeModal(document.getElementById('signupModal'));
        if (e.target === document.getElementById('searchModal')) closeModal(document.getElementById('searchModal'));
    });

    // --- 7. LOGIN & SIGNUP SYSTEM ---
    const accountToggle = document.getElementById('accountToggle');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const loginClose = document.querySelector('.login-close-btn');
    const signupClose = document.querySelector('.signup-close-btn');
    const openSignupBtn = document.getElementById('openSignupBtn');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginClose) loginClose.addEventListener('click', () => closeModal(loginModal));
    if (signupClose) signupClose.addEventListener('click', () => closeModal(signupModal));

    if (openSignupBtn) {
        openSignupBtn.addEventListener('click', (e) => { e.preventDefault(); closeModal(loginModal); signupModal.style.display = 'flex'; });
    }

    async function checkLoginStatus() {
        const accountLi = document.querySelector('.account-icon');
        const user = firebase.auth().currentUser;

        if (user) {
            let photoUrl = null;

            // แอบไปค้นหารูปโปรไฟล์และร้านโปรดจาก Firestore มาแสดง
            try {
                const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    const data = userDoc.data();
                    if (data.profileImage) photoUrl = data.profileImage;

                    // 🟢 โหลดร้านโปรดของผู้ใช้คนนี้มาใส่ตัวแปร
                    if (data.favorites) {
                        favorites = data.favorites;
                    } else {
                        favorites = [];
                    }
                    updateFavoriteUI(); // สั่งให้อัปเดตสีหัวใจบนหน้าเว็บ
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }

            const userIcon = photoUrl
                ? `<img src="${photoUrl}" class="header-avatar" alt="Profile">`
                : `<i class="fa-solid fa-circle-user"></i>`;

            if (accountLi) {
                accountLi.innerHTML = `
                    <div class="user-menu">
                        <span class="user-name" onclick="openProfileModal()" style="cursor:pointer;" title="คลิกเพื่อแก้ไขโปรไฟล์">
                            ${userIcon} ${user.displayName || 'User'}
                        </span>
                        <button onclick="handleLogout()" class="logout-btn">
                            LOGOUT
                        </button>
                    </div>
                `;
            }
        } else {
            // 🟢 เคลียร์หัวใจออกจากหน้าจอเมื่อไม่มีคนล็อกอิน
            favorites = [];
            updateFavoriteUI();

            if (accountLi) {
                accountLi.innerHTML = `<a href="#" id="accountToggle" style="display: flex; align-items: center;"><i class="fa-regular fa-user"></i></a>`;
                document.getElementById('accountToggle').addEventListener('click', (e) => {
                    e.preventDefault();
                    document.getElementById('loginModal').style.display = 'flex';
                });
            }
        }
    }
    window.handleLogout = function () {
        firebase.auth().signOut().then(() => {
            localStorage.removeItem('bloomUser'); // เคลียร์ค่าเดิม

            // เปลี่ยนจาก alert เป็น showToast
            showToast('ออกจากระบบเรียบร้อยแล้ว', 'success');

            // หน่วงเวลา 1.5 วินาที เพื่อให้ผู้ใช้เห็นป๊อปอัปก่อนรีเฟรชหน้า
            setTimeout(() => {
                window.location.reload();
            }, 1500);

        }).catch((error) => {
            showToast("Logout Error: " + error.message, 'error');
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const pass = document.getElementById('signupPassword').value;

            // เรียกใช้ Firebase Auth เพื่อสร้างบัญชีใหม่
            firebase.auth().createUserWithEmailAndPassword(email, pass)
                .then((userCredential) => {
                    // เมื่อสร้างสำเร็จ ให้บันทึกชื่อ (DisplayName) ลงในโปรไฟล์
                    return userCredential.user.updateProfile({
                        displayName: name
                    });
                })
                .then(() => {
                    showToast('สมัครสมาชิกสำเร็จ!', 'success');
                    closeModal(signupModal);
                    loginModal.style.display = 'flex'; // สลับไปหน้า Login
                })
                .catch((error) => {
                    showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
                });
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            // เรียกใช้ Firebase Auth เพื่อตรวจสอบสิทธิ์
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    localStorage.setItem('bloomUser', user.email);

                    showToast('ยินดีต้อนรับคุณ ' + (user.displayName || 'User'), 'success');
                    closeModal(loginModal);
                    checkLoginStatus();
                })
                .catch((error) => {
                    showToast('เข้าสู่ระบบไม่สำเร็จ: ' + error.message, 'error');
                });
        });
    }

    // ==========================================
    // ระบบ SOCIAL LOGIN (Google & Facebook)
    // ==========================================
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const facebookLoginBtn = document.getElementById('facebookLoginBtn');

    // 1. ล็อกอินด้วย Google
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider)
                .then((result) => {
                    const user = result.user;
                    localStorage.setItem('bloomUser', user.email);
                    showToast('เข้าสู่ระบบด้วย Google สำเร็จ!', 'success');
                    closeModal(loginModal);
                    checkLoginStatus();
                }).catch((error) => {
                    showToast('Google Login Error: ' + error.message, 'error');
                });
        });
    }

    // 2. ล็อกอินด้วย Facebook
    if (facebookLoginBtn) {
        facebookLoginBtn.addEventListener('click', () => {
            const provider = new firebase.auth.FacebookAuthProvider();
            firebase.auth().signInWithPopup(provider)
                .then((result) => {
                    const user = result.user;
                    localStorage.setItem('bloomUser', user.email);
                    showToast('เข้าสู่ระบบด้วย Facebook สำเร็จ!', 'success');
                    closeModal(loginModal);
                    checkLoginStatus();
                }).catch((error) => {
                    showToast('Facebook Login Error: ' + error.message, 'error');
                });
        });
    }
    // ตรวจสอบสถานะการล็อกอินทุกครั้งที่โหลดหน้าเว็บหรือเปลี่ยนสถานะ
    firebase.auth().onAuthStateChanged((user) => {
        checkLoginStatus();
        if (user) {
            console.log("Logged in as:", user.displayName);
        } else {
            console.log("No user logged in");
        }
    });

    // --- 8. Search System ---
    const searchModal = document.getElementById('searchModal');
    const searchToggle = document.getElementById('searchToggle');
    const searchClose = document.querySelector('.search-close-btn');
    const searchForm = document.getElementById('searchForm');

    if (searchToggle) searchToggle.addEventListener('click', (e) => { e.preventDefault(); searchModal.style.display = 'flex'; });
    if (searchClose) searchClose.addEventListener('click', () => closeModal(searchModal));

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('searchQuery').value.toLowerCase();
            const allCards = document.querySelectorAll('.location-card');
            closeModal(searchModal);
            if (query) {
                let found = false;
                allCards.forEach(card => {
                    const title = card.getAttribute('data-title').toLowerCase();
                    const tags = card.getAttribute('data-tags').toLowerCase();
                    if (title.includes(query) || tags.includes(query)) {
                        card.style.display = 'block';
                        found = true;
                        const sectionId = card.closest('.sections-container').id;
                        showSection(document.getElementById(sectionId));
                    } else {
                        card.style.display = 'none';
                    }
                });
                if (!found) alert('No results found for "' + query + '"');
            }
        });
    }

    const backToTopBtn = document.getElementById("backToTop");
    window.addEventListener('scroll', () => {
        const reveals = document.querySelectorAll('.reveal');
        for (let i = 0; i < reveals.length; i++) {
            const windowHeight = window.innerHeight;
            if (reveals[i].getBoundingClientRect().top < windowHeight - 150) {
                reveals[i].classList.add('active');
            }
        }
        if (backToTopBtn) {
            if (window.scrollY > 300) { backToTopBtn.classList.add("show"); } else { backToTopBtn.classList.remove("show"); }
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // =========================================================
    // 🟢 ก๊อปปี้โค้ดด้านล่างนี้มาวางตรงช่องว่างตรงนี้ได้เลยครับ 🟢

    // =========================================================
    // ระบบ EDIT PROFILE (ย้ายมาวางที่นี่)
    // =========================================================
    const profileModal = document.getElementById('profileModal');
    const profileClose = document.querySelector('.profile-close-btn');
    let newProfileBase64 = null;

    if (profileClose) {
        profileClose.addEventListener('click', () => {
            profileModal.style.display = 'none';
        });
    }

    // ฟังก์ชันเปิดหน้าต่างแก้โปรไฟล์และโหลดสถิติ
    window.openProfileModal = async function () {
        const user = firebase.auth().currentUser;
        if (!user) return;

        document.getElementById('editProfileName').value = user.displayName || '';
        const preview = document.getElementById('profileImgPreview');

        // 1. รีเซ็ตค่าสถิติระหว่างรอโหลดเพื่อความสวยงาม
        document.getElementById('statReviews').textContent = '...';
        document.getElementById('statFavs').textContent = '...';

        // 2. ดึงจำนวนร้านโปรด (นับจากตัวแปร favorites ที่โหลดจาก Firebase แล้ว)
        document.getElementById('statFavs').textContent = favorites.length;

        // 3. ดึงจำนวนรีวิว (นับจากข้อมูลใน Firestore โดยเช็คจาก userId)
        try {
            const reviewSnapshot = await firebase.firestore().collection('reviews')
                .where('userId', '==', user.uid)
                .get();
            document.getElementById('statReviews').textContent = reviewSnapshot.size; // .size คือจำนวนข้อมูลที่หาเจอ
        } catch (error) {
            console.error("Error loading reviews count:", error);
            document.getElementById('statReviews').textContent = '0';
        }

        // ตัวแปรเก็บข้อมูล Profile อื่นๆ
        let currentPhoto = null;
        let currentFaculty = '';
        let currentBio = '';

        // 4. ค้นหาข้อมูลจาก Firestore
        try {
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const data = userDoc.data();
                if (data.profileImage) currentPhoto = data.profileImage;
                if (data.faculty) currentFaculty = data.faculty;
                if (data.bio) currentBio = data.bio;
            }
        } catch (e) { console.error("Error loading profile data:", e); }

        // นำข้อมูลมาใส่ในช่องกรอก
        document.getElementById('editProfileFaculty').value = currentFaculty;
        document.getElementById('editProfileBio').value = currentBio;

        // แสดงรูปภาพ
        if (currentPhoto) {
            preview.innerHTML = `<img src="${currentPhoto}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            preview.innerHTML = `<i class="fa-solid fa-user-circle" style="font-size: 80px; color: #cbd5e1;"></i>`;
        }

        newProfileBase64 = null;
        profileModal.style.display = 'flex';
    }

    const profilePhotoInput = document.getElementById('profilePhotoInput');
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 200 * 1024) {
                    alert('ไฟล์ภาพใหญ่เกินไป กรุณาเลือกภาพขนาดไม่เกิน 200KB ครับ (แนะนำให้ครอปภาพก่อน)');
                    this.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = function (event) {
                    newProfileBase64 = event.target.result;
                    const preview = document.getElementById('profileImgPreview');
                    preview.innerHTML = `<img src="${newProfileBase64}" style="width: 100%; height: 100%; object-fit: cover;">`;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async () => {
            const user = firebase.auth().currentUser;
            const newName = document.getElementById('editProfileName').value;
            const newFaculty = document.getElementById('editProfileFaculty').value;
            const newBio = document.getElementById('editProfileBio').value;

            if (!newName) { alert('กรุณากรอกชื่อด้วยครับ!'); return; }

            const originalText = saveProfileBtn.innerText;
            saveProfileBtn.innerText = 'SAVING...';
            saveProfileBtn.disabled = true;

            try {
                // 1. กำหนดรูปที่จะใช้
                const finalAvatar = newProfileBase64 || user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`;

                // 2. เช็คว่ารูปเป็นรหัส Base64 ยาวๆ หรือไม่
                const isBase64 = finalAvatar.startsWith('data:image');

                // 3. อัปเดตระบบล็อคอิน (ถ้ารูปรหัสยาว ให้เซฟแค่ชื่อพอ ไม่งั้น Error)
                if (isBase64) {
                    await user.updateProfile({ displayName: newName });
                } else {
                    await user.updateProfile({ displayName: newName, photoURL: finalAvatar });
                }

                // 4. เอารูปรหัสยาวๆ มาเซฟลง Firestore แทน (เพราะเก็บข้อมูลได้เยอะกว่ามาก)
                await firebase.firestore().collection('users').doc(user.uid).set({
                    profileImage: finalAvatar,
                    faculty: newFaculty,
                    bio: newBio
                }, { merge: true });

                showToast('แก้ไขโปรไฟล์สำเร็จ!');

                // 5. สั่งให้อัปเดต UI และรีวิวเก่า
                syncNewProfileWithOldReviews(user.uid, newName, finalAvatar);
                
                document.getElementById('profileModal').style.display = 'none';
                checkLoginStatus(); // อัปเดตมุมขวาบนให้เป็นรูปใหม่ทันที

            } catch (error) {
                showToast('เกิดข้อผิดพลาดในการอัปเดต: ' + error.message, 'error');
            } finally {
                saveProfileBtn.innerText = originalText;
                saveProfileBtn.disabled = false;
            }
        });
    }

    // =========================================================
    // 🟢 เพิ่มฟังก์ชัน: Sync ข้อมูลโปรไฟล์ใหม่ ไปยังรีวิวเก่าทั้งหมด
    // =========================================================
    async function syncNewProfileWithOldReviews(userId, newName, newAvatar) {
        console.log("เริ่มการ Sync ข้อมูลโปรไฟล์ไปยังรีวิวเก่า...");
        try {
            const reviewsRef = firebase.firestore().collection('reviews');
            
            // 1. ค้นหารีวิวทั้งหมดที่โพสต์โดยผู้ใช้คนนี้ (userId)
            const snapshot = await reviewsRef.where('userId', '==', userId).get();
            
            // ถ้ายูสเซอร์นี้ยังไม่เคยรีวิวอะไรเลย ก็ไม่ต้องทำอะไรต่อ
            if (snapshot.empty) {
                console.log("ไม่พบรีวิวเก่าที่ต้อง Sync");
                return;
            }

            // 2. ใช้ WriteBatch ของ Firestore เพื่ออัปเดตหลายๆ ใบพร้อมกัน (ประหยัดค่าใช้จ่าย)
            const batch = firebase.firestore().batch();
            
            snapshot.forEach(doc => {
                // บันทึกคำสั่งอัปเดต Name และ Avatar เข้าไปใน Batch
                batch.update(doc.ref, {
                    name: newName,
                    avatar: newAvatar
                });
            });

            // 3. สั่งให้ Batch ทำงานจริง (Execute)
            await batch.commit();
            console.log(`Sync สำเร็จ! อัปเดตข้อมูลใน ${snapshot.size} รีวิวเรียบร้อยครับ`);

            // 4. ถ้าตอนนี้เปิดหน้า Community Feed อยู่ ให้โหลดฟีดใหม่เพื่อโชว์ข้อมูลล่าสุด
            const communitySection = document.getElementById('community-section');
            if (communitySection && communitySection.style.display !== 'none') {
                loadCommunityFeed();
            }

        } catch (error) {
            console.error("Error syncing profile with reviews:", error);
        }
    }
    // =========================================================
    // =========================================================

    // เรียกให้หน้าเว็บโหลดเป็นหน้าหลักเสมอ
    showHomePage();

    // ตัวดักฟังการคลิกนอกกรอบ Modal ทั้งหมด (รวมไว้ที่เดียวเพื่อไม่ให้โค้ดตีกัน)
    window.addEventListener('click', (e) => {
        if (e.target === detailModal) closeModal(detailModal);
        if (e.target === reviewModal) closeModal(reviewModal);
        if (e.target === document.getElementById('loginModal')) closeModal(document.getElementById('loginModal'));
        if (e.target === document.getElementById('signupModal')) closeModal(document.getElementById('signupModal'));
        if (e.target === document.getElementById('searchModal')) closeModal(document.getElementById('searchModal'));
        if (e.target === profileModal) profileModal.style.display = 'none'; // เพิ่มบรรทัดนี้สำหรับ Profile Modal
    });

});
// --- ปิดวงเล็บของ DOMContentLoaded ---

// --- 9. FULL SHOP DATABASE (ข้อมูลร้านค้าทั้งหมดสำหรับหน้ารายละเอียด) ---
const shopDatabase = {
    // ==========================================
    // หมวด EAT & DRINK
    // ==========================================
    "mala": {
        title: "หม่าล่าเสฉวน", subtitle: "Budget Spicy", heroImage: "Im/หมาล่า1.webp",
        history: "<p>ร้านหม่าล่าขวัญใจเด็ก ม. ราคาเริ่มต้นไม้ละ 5 บาท เผ็ดสะใจ มีทีเด็ดที่น้ำจิ้มถั่วสูตรเด็ด และฟองเต้าหู้ทอดกรอบ เหมาะกับสายกินดุที่อยากประหยัดงบ</p>",
        menuImages: ["Im/หมาล่า2.webp", "Im/หมาล่า3.jpeg", "Im/หมาล่า4.jpg"],
        info: { hours: "11:00 - 21:00", price: "50 - 150 THB", phone: "082-645-8483", location: "ใกล้ ม. (จอดริมถนนตามช่วงเวลา)" }
    },
    "suki": {
        title: "สุกี้จานบิน", subtitle: "Hotpot Buffet", heroImage: "Im/สุกี้จานบิน1.webp",
        history: "<p>สุกี้สายพานยอดฮิตแถวนี้ น้ำซุปเด็ดมาก เหมาะกับวันหิวโซ ทีเด็ดคือน้ำซุปกระดูกหมูเข้มข้น และเนื้อออสเตรเลียสไลด์บางๆ ทานคู่กับน้ำจิ้มสูตรทางร้าน</p>",
        menuImages: ["Im/สุกี้จานบิน2.webp"],
        info: { hours: "11:00 - 02:00", price: "250 - 400 THB", phone: "095-956-5668", location: "ในโครงการ (มีที่จอดรองรับ)" }
    },
    "chicky": {
        title: "Little Chicky", subtitle: "Korean Chicken", heroImage: "Im/ร้านไก่1.webp",
        history: "<p>ไก่ทอดเกาหลีราคาดีงาม เซ็ตนักเรียนคุ้มมาก กรอบนอกนุ่มใน ห้ามพลาดไก่ทอดซอสหัวหอมสุดละมุน และต๊อกบกกีชีสยืดๆ</p>",
        menuImages: ["Im/ร้านไก่2.webp"],
        info: { hours: "10:00 - 20:00", price: "80 - 200 THB", phone: "096-646-3159", location: "หน้า ม. (แนะนำเดินมา)" }
    },
    "mingle": {
        title: "Meetup Mingle Cafe", subtitle: "Board Games & Work", heroImage: "Im/ร้านเกม1.webp",
        history: "<p>คาเฟ่ที่มีบอร์ดเกมให้เล่น นั่งทำงานกลุ่มได้ยาวๆ กาแฟดี ขนมอร่อย มีบอร์ดเกมให้เลือกเยอะมาก และมีห้องส่วนตัวสำหรับแก๊งเพื่อนที่ต้องการความสงบ</p>",
        menuImages: ["Im/ร้านเกม2.webp", "Im/ร้านเกม3.jpg", "Im/ร้านเกม4.jpg"],
        info: { hours: "10:00 - 22:00", price: "100 - 250 THB", phone: "08x-xxx-xxxx", location: "ใกล้ ม. (จอดหน้าร้าน 2-3 คัน)" }
    },
    "burger": {
        title: "Bad Bad Burger", subtitle: "Premium Burger", heroImage: "Im/สเต็ก1.webp",
        history: "<p>เบอร์เกอร์พรีเมียมชิ้นโต เนื้อฉ่ำๆ เหมาะสำหรับวันอยากกินของดีๆ เมนูแนะนำคือ Truffle Burger หอมกลิ่นเห็ดทรัฟเฟิล และแป้งบันโฮมเมดเนื้อนุ่ม</p>",
        menuImages: ["Im/สเต็ก2.webp"],
        info: { hours: "16:00 - 23:00", price: "250 - 450 THB", phone: "095-956-5668", location: "ริมถนนหน้าร้าน (ช่วงค่ำ)" }
    },
    "uptojug": {
        title: "Uptojug Kitchen", subtitle: "Fusion Cafe", heroImage: "Im/Uptojug1.webp",
        history: "<p>ร้านสวยบรรยากาศดี อาหารฟิวชั่น ถ่ายรูปสวย เหมาะกับนัดเดท เมนูฮิตคือสปาเก็ตตี้คาโบนาร่า และมุมถ่ายรูปหน้าร้านสวยมาก แสงเข้ากำลังดี</p>",
        menuImages: ["Im/Uptojug2.webp"],
        info: { hours: "10:00 - 19:00", price: "200 - 400 THB", phone: "061-542-6666", location: "จอดในโครงการ" }
    },
    "wallace": {
        title: "Wallace", subtitle: "Fine Dining", heroImage: "Im/Wallace1.webp",
        history: "<p>อาหารยุโรปหรูหรา บรรยากาศดีที่สุดในย่านนี้ สำหรับโอกาสพิเศษ เสิร์ฟ Steak เนื้อพรีเมียม และมีไวน์ลิสต์ให้เลือกมากมาย บริการระดับห้าดาว</p>",
        menuImages: ["Im/Wallace2.webp"],
        info: { hours: "11:00 - 22:00", price: "800+ THB", phone: "063-021-0537", location: "ย่านบางเขน (มี Valet Parking)" }
    },
    "teenoi": {
        title: "สุกี้ตี๋น้อย", subtitle: "Midnight Buffet", heroImage: "Im/สุกี้ตี๋น้อย1.jpg",
        history: "<p><b>เดอะแบกของคนนอนดึก!</b> ร้านบุฟเฟต์สุกี้ที่เป็นเสมือนสามัญประจำบ้านของนักศึกษา จุดเด่นคือเปิดบริการลากยาวไปจนถึงตี 5 ด้วยเนื้อออสเตรเลียสไลด์ กุ้งสด และชีสยืดๆ แบบไม่อั้น</p>",
        menuImages: ["Im/สุกี้ตี๋น้อย2.webp", "Im/สุกี้ตี๋น้อย3.webp", "Im/สุกี้ตี๋น้อย4.webp"],
        info: { hours: "12:00 - 05:00", price: "219+ THB (ไม่รวมน้ำ)", phone: "080-123-4567", location: "สาขาพหลโยธิน วัชรพล" }
    },
    "yangnoey": {
        title: "ย่างเนย", subtitle: "Unlimited BBQ", heroImage: "Im/ย่างเนย1.jpg",
        history: "<p>ต้นตำรับปิ้งย่างกระทะร้อนกับสโลแกน <b>'เหลือไม่ปรับ ไม่จำกัดเวลา'</b> ที่ได้ใจวัยรุ่นไปเต็มๆ จุดเด่นคือกระทะร้อนที่ใส่เนยลงไปหอมๆ เอาเนื้อสไลด์หรือสามชั้นลงไปย่างให้เกรียม กินคู่กับน้ำจิ้มแจ่วสุดแซ่บ</p>",
        menuImages: ["Im/ย่างเนย2.webp", "Im/ย่างเนย3.jpg", "Im/ย่างเนย4.webp"],
        info: { hours: "16:00 - 23:00", price: "219+ THB", phone: "082-222-3333", location: "สาขารัชโยธิน / เกษตร" }
    },
    "shinkanzen": {
        title: "Shinkanzen Sushi", subtitle: "Budget Sushi", heroImage: "Im/ShinkanzenSushi1.jpg",
        history: "<p>ร้านอาหารญี่ปุ่นที่เข้าใจกระเป๋าตังค์นักศึกษาอย่างแท้จริง! ปฏิวัติวงการซูชิด้วยราคาเริ่มต้น <b>เพียงคำละ 11 บาท</b> เมนูที่ห้ามพลาดคือ 'ซูชิแซลมอน' ที่ชิ้นใหญ่และสดมาก</p>",
        menuImages: ["Im/ShinkanzenSushi2.jpg", "Im/ShinkanzenSushi3.jpg", "Im/ShinkanzenSushi4.jpg"],
        info: { hours: "10:00 - 22:00", price: "100 - 300 THB", phone: "091-111-2222", location: "สาขา ม.เกษตร" }
    },
    "ja_ou": {
        title: "จ่าอู หมูเกาหลี", subtitle: "Legendary BBQ", heroImage: "Im/จ่าอูหมูเกาหลี1.webp",
        history: "<p>ร้านหมูกระทะแบบสั่งเป็นชุดที่คิวแน่นทะลุซอยทุกวัน! ความลับของจ่าอูอยู่ที่ <b>'หมูหมักสูตรลับ'</b> ที่นุ่มละมุนลิ้น และ <b>'น้ำจิ้มสุกี้รสแซ่บ'</b> ที่เผ็ดจัดจ้านถูกปากคนไทย ปิ้งบนเตาถ่านร้อนๆ</p>",
        menuImages: ["Im/จ่าอูหมูเกาหลี2.webp", "Im/จ่าอูหมูเกาหลี3.webp", "Im/จ่าอูหมูเกาหลี4.jpg"],
        info: { hours: "15:00 - 23:00", price: "250 - 400 THB", phone: "09x-xxx-xxxx", location: "สาขารัชโยธิน" }
    },
    "prateep": {
        title: "ป.ประทีป ก๋วยเตี๋ยวเรือ", subtitle: "Spicy Boat Noodle", heroImage: "Im/เรือ1.png",
        history: "<p>ก๋วยเตี๋ยวเรืออยุธยาที่ขึ้นชื่อลือชาเรื่อง <b>'ความเผ็ดจัดจ้านแบบพ่นไฟ'</b> ไอเทมลับที่ต้องสั่งมาประกบคือ กากหมูเจียวกรอบๆ ชิ้นโตที่เจียวใหม่ๆ ทุกวัน คลุกเคล้าเข้ากับน้ำตกรสเข้มข้น</p>",
        menuImages: ["Im/เรือ2.jpg", "Im/เรือ3.jpg", "Im/เรือ4.jpg"],
        info: { hours: "08:00 - 17:00", price: "20 - 60 THB", phone: "089-999-9999", location: "ซอยพหลโยธิน" }
    },
    "ting_ting": {
        title: "ถิงถิง บิงซูน้ำขิง", subtitle: "Sweet Dessert", heroImage: "Im/ถิงถิงบิงซูน้ำขิง1.jpg",
        history: "<p>ร้านขนมหวานที่ผสมผสานความร่วมสมัยและกลิ่นอายแบบจีน-ไต้หวันเข้าด้วยกัน เมนูยอดฮิตที่เด็กมหาลัยชอบสั่งคือ <b>บิงซูชาไทยไข่มุก</b> รสชาติเข้มข้น และ <b>บัวลอยลาวาน้ำขิงอุ่นๆ</b></p>",
        menuImages: ["Im/ถิงถิงบิงซูน้ำขิง2.jpg", "Im/ถิงถิงบิงซูน้ำขิง3.jpg", "Im/ถิงถิงบิงซูน้ำขิง4.jpg"],
        info: { hours: "12:00 - 23:00", price: "50 - 150 THB", phone: "08x-xxx-xxxx", location: "สาขา ม.เกษตร" }
    },
    "oyuwa": {
        title: "โอยั๊วะเกษตร", subtitle: "Riverside Hangout", heroImage: "Im/โอยั๊วะเกษตร1.webp",
        history: "<p>ร้านอาหารกึ่งผับบรรยากาศดีสุดคลาสสิกริมน้ำ เป็นสถานที่ยอดฮิตสำหรับการ <b>จัดเลี้ยงรุ่น เลี้ยงสายรหัส</b> ตัวร้านมีพื้นที่กว้างขวาง มีวงดนตรีสดเล่นเพลงฟังสบายๆ</p>",
        menuImages: ["Im/โอยั๊วะเกษตร2.webp"],
        info: { hours: "17:00 - 24:00", price: "300 - 600 THB", phone: "081-808-9885", location: "ใกล้ ม.เกษตร" }
    },

    // ==========================================
    // หมวด HANGOUT
    // ==========================================
    "moca": {
        title: "MOCA Museum", subtitle: "Contemporary Art", heroImage: "Im/พิพิธภัณฑ์ศิลปะร่วมสมัย 1.jpg",
        history: "<p><b>พิพิธภัณฑ์ศิลปะไทยร่วมสมัย (MOCA BANGKOK)</b> จัดแสดงผลงานศิลปะของศิลปินไทยระดับปรมาจารย์ ตัวสถาปัตยกรรมออกแบบมาให้มีแสงสว่างธรรมชาติส่องถึง ไฮไลท์คือ <b>'อุโมงค์ข้ามจักรวาล'</b> และห้องภาพ Richard Green</p>",
        menuImages: ["Im/พิพิธภัณฑ์ศิลปะร่วมสมัย 2.jpg", "Im/พิพิ3.jpg", "Im/พิพิ4.jpg"],
        info: { hours: "10:00 - 18:00 (ปิด จ.)", price: "Student 100 THB", phone: "02-016-5666", location: "ถ.วิภาวดีรังสิต" }
    },
    "temple": {
        title: "วัดพระศรีมหาธาตุ", subtitle: "Wat Phra Si Mahathat", heroImage: "Im/วัดพระ.jpg",
        history: "<p><b>วัดคู่บ้านคู่เมืองย่านบางเขน</b> โดดเด่นด้วยเจดีย์สีขาวองค์ใหญ่ที่ภายในประดิษฐานพระบรมสารีริกธาตุ ที่นี่ถือเป็น <b>'ศูนย์รวมความมูเตลู'</b> ของนักศึกษาที่มักมาขอพรช่วงสอบ</p>",
        menuImages: ["Im/วัด 2.jpg", "Im/วัด3.jpg", "Im/วัด4.jpg"],
        info: { hours: "06:00 - 18:00", price: "Free", phone: "02-521-0311", location: "ติด BTS วัดพระศรีฯ" }
    },
    "library": {
        title: "Co-Working Space & Library", subtitle: "Study Zone", heroImage: "Im/ห้องสมุด1.jpg",
        history: "<p>พื้นที่ปั่นงานกลุ่มเงียบๆ ในมหาวิทยาลัย มีปลั๊กไฟทุกโต๊ะและ Wi-Fi แรงๆ เหมาะกับช่วง Midterm เป็นที่สุด บรรยากาศเงียบสงบ แอร์เย็นฉ่ำ นั่งได้ทั้งวัน</p>",
        menuImages: ["Im/ห้องสมุด2.jpg"],
        info: { hours: "08:30 - 20:00", price: "Free", phone: "02-579-1111", location: "อาคาร 11" }
    },
    "major": {
        title: "เมเจอร์ รัชโยธิน", subtitle: "Major Cineplex", heroImage: "Im/เมเจอร์ซีนีเพล็กซ์ รัชโยธิน 1.jpg",
        history: "<p><b>ตำนานแห่งแยกรัชโยธิน</b> แหล่งรวมตัวหลังเลิกเรียนของเด็กมหาลัย มีทั้งโรงหนัง <b>IMAX และ 4DX</b> นอกจากนี้ยังมีโยนโบว์ลิ่ง ร้องคาราโอเกะ และตลาดนัดในช่วงเย็น</p>",
        menuImages: ["Im/เมเจอร์ซีนีเพล็กซ์ รัชโยธิน 2.jpg"],
        info: { hours: "10:00 - 22:00", price: "Varied", phone: "02-515-5555", location: "BTS รัชโยธิน" }
    },
    "central": {
        title: "เซ็นทรัล รามอินทรา", subtitle: "New Central", heroImage: "Im/เซ็นทรัลรามอินทรา 1.jpg",
        history: "<p>ห้างสรรพสินค้าที่อยู่ใกล้ ม.ศรีปทุม มากที่สุด! เพิ่งผ่านการรีโนเวทครั้งใหญ่เปลี่ยนโฉมใหม่ทั้งหมดในโทนสีพาสเทล คนไม่พลุกพล่าน เหมาะกับการเดินตากแอร์ชิลๆ หรือหาของกินโซน Food Patio</p>",
        menuImages: ["Im/เซ็นทรัลรามอินทรา 2.jpg"],
        info: { hours: "10:00 - 21:00", price: "Varied", phone: "02-790-3000", location: "ถ.รามอินทรา" }
    },
    "market_night": {
        title: "ตลาดนัดจตุจักรกลางคืน", subtitle: "Vintage Vibes", heroImage: "Im/ตลาดนัดจตุจักรกลางคืน1.jpg",
        history: "<p>บรรยากาศตลาดยามค่ำคืนที่เปิดเฉพาะวันศุกร์ถึงอาทิตย์ อากาศไม่ร้อน เดินช้อปปิ้งของวินเทจ เสื้อผ้ามือสอง และของตกแต่งบ้าน พร้อมมุมถ่ายรูปคลาสสิก</p>",
        menuImages: ["Im/ตลาดนัดจตุจักรกลางคืน2.jpg"],
        info: { hours: "19:00 - 24:00 (Fri-Sun)", price: "100 - 400 THB", phone: "02-272-4440", location: "ตลาดนัดจตุจักร" }
    },
    "market_day": {
        title: "ตลาดนัดจตุจักรกลางวัน", subtitle: "Largest Market in Thailand", heroImage: "Im/ตลาดกลางวัน1.png",
        history: "<p>ตลาดนัดที่ใหญ่ที่สุดในประเทศไทย แหล่งรวมสินค้าทุกชนิดตั้งแต่ สัตว์เลี้ยง ต้นไม้ เสื้อผ้า ไปจนถึงงานศิลปะ แนะนำให้มาเช้าๆ หรือพกพัดลมมือถือมาด้วย!</p>",
        menuImages: ["Im/ตลาดกลางวัน2.png"],
        info: { hours: "09:00 - 18:00 (Sat-Sun)", price: "100 - 500 THB", phone: "02-272-4440", location: "ตลาดนัดจตุจักร" }
    },
    "airforce_museum": {
    title: "พิพิธภัณฑ์กองทัพอากาศ", subtitle: "Vintage Photo Spot", heroImage: "Im/airforce1.jpg",
    history: "<p>แหล่งเช็คอินสุดคลาสสิกใกล้ ม. เดินทางด้วย BTS มาลงหน้าพิพิธภัณฑ์ได้เลย มีเครื่องบินรุ่นเก่าให้ถ่ายรูปฟีลเท่ๆ เพียบ!</p>",
    menuImages: ["Im/airforce2.jpg", "Im/airforce3.jpg"],
    info: { hours: "09:00 - 15:30 (ปิด จ.)", price: "Free", phone: "02-534-1853", location: "BTS พิพิธภัณฑ์กองทัพอากาศ" }
},
    "chatuchak_park": {
        title: "สวนจตุจักร (Chatuchak Park)", subtitle: "Green Space", heroImage: "Im/ChatuchakPark1.jpg",
        history: "<p>พื้นที่สีเขียวขนาดใหญ่ติด BTS เป็นปอดของคนกรุงเทพฯ กิจกรรมยอดฮิตคือการมาเช่าเสื่อปิกนิก ปั่นจักรยาน หรือวิ่งออกกำลังกายรับลมในช่วงเย็น</p>",
        menuImages: ["Im/ChatuchakPark2.jpg", "Im/ChatuchakPark3.jpg", "Im/ChatuchakPark4.jpg"],
        info: { hours: "04:30 - 22:00", price: "Free", phone: "-", location: "BTS หมอชิต" }
    },
    "central_ladprao": {
        title: "เซ็นทรัล ลาดพร้าว", subtitle: "Lifestyle Mall", heroImage: "Im/เซ็นทรัลลาดพร้าว1.jpg",
        history: "<p>ศูนย์การค้าระดับตำนาน เดินทางมาง่ายมากๆ ด้วย BTS โดดเด่นด้วยโซนแฟชั่นที่มีแบรนด์ดังครบถ้วน และที่พลาดไม่ได้คือ <b>โซนอาหารชั้นใต้ดิน (Food Hall)</b> ที่เป็นสวรรค์ของสายกิน</p>",
        menuImages: ["Im/เซ็นทรัลลาดพร้าว2.jpg", "Im/เซ็นทรัลลาดพร้าว3.jpg", "Im/เซ็นทรัลลาดพร้าว4.jpg"],
        info: { hours: "10:00 - 22:00", price: "Varied", phone: "02-793-6000", location: "BTS ห้าแยกลาดพร้าว" }
    },
"yingcharoen": {
    title: "ตลาดยิ่งเจริญ", subtitle: "Street Food Haven", heroImage: "Im/market1.jpg",
    history: "<p>ตลาดยอดฮิตของชาวสะพานใหม่-บางเขน มีโซน Food Court ที่รวมของอร่อยราคาประหยัดไว้เพียบ เปิดตลอด 24 ชั่วโมง!</p>",
    menuImages: ["Im/market2.jpg"],
    info: { hours: "24 Hours", price: "40 - 100 THB", phone: "-", location: "BTS สะพานใหม่" }
},
"jodd_fairs": {
        title: "JODD FAIRS แดนเนรมิต", subtitle: "Night Market & Castle", heroImage: "Im/JODDFAIRS1.avif",
        history: "<p>ตลาดนัดกลางคืนสุดชิค โดยยังคงรักษา 'ปราสาทสไตล์ยุโรป' ไว้เป็นฉากหลัง มีโซนให้นั่งชิลฟีลลิ่งแคมป์ปิ้ง และรวบรวมร้าน Street Food ชื่อดังไว้มากมาย</p>",
        menuImages: ["Im/JODDFAIRS2.jpg", "Im/JODDFAIRS3.jpg", "Im/JODDFAIRS4.jpg"],
        info: { hours: "16:00 - 24:00", price: "200 - 500 THB", phone: "092-713-5599", location: "BTS พหลโยธิน 24" }
    },
    "union_mall": {
        title: "Union Mall (ยูเนี่ยน มอลล์)", subtitle: "Fashion Hub", heroImage: "Im/UnionMall1.webp",
        history: "<p><b>สวรรค์ของนักช้อปวัยรุ่น!</b> ยูเนี่ยนมอลล์คือศูนย์รวมเสื้อผ้าแฟชั่น กระเป๋า รองเท้า นอกจากนี้ยังมีโซนทำเล็บ ทำผม และ <b>ดงตู้ถ่ายรูปสติกเกอร์</b> ที่ฮิตที่สุด</p>",
        menuImages: ["Im/UnionMall2.jpg", "Im/UnionMall3.jpg", "Im/UnionMall4.jpg"],
        info: { hours: "11:00 - 22:00", price: "Varied", phone: "02-512-5000", location: "BTS ห้าแยกลาดพร้าว" }
    },
    "suan_rodfai": {
        title: "สวนรถไฟ (ปั่นจักรยาน)", subtitle: "Wachirabenchathat Park", heroImage: "Im/สวนรถไฟ1.jpg",
        history: "<p>สวนสาธารณะขนาดใหญ่ กิจกรรมยอดฮิตคือการ <b>เช่าจักรยานปั่นรอบสวน</b> สูดอากาศบริสุทธิ์ มีทุ่งดอกไม้หมุนเวียนตามฤดูกาล ถ่ายรูปฟีลลิ่งเหมือนอยู่ต่างประเทศ</p>",
        menuImages: ["Im/สวนรถไฟ2.jpg", "Im/สวนรถไฟ3.jpg", "Im/สวนรถไฟ4.jpg"],
        info: { hours: "05:00 - 21:00", price: "Free (ค่าเช่าจักรยาน 30-50 บาท)", phone: "02-537-9221", location: "หลังสวนจตุจักร" }
    }
};

// ฟังก์ชันโหลดข้อมูลร้านค้า
window.loadShopDetails = function (shopId) {
    const data = shopDatabase[shopId];
    const container = document.getElementById('detailContent');

    if (!data) {
        container.innerHTML = `<div style="text-align:center; padding:50px;">
            <h2>ไม่พบข้อมูลร้านค้า</h2>
            <a href="index.html" class="button-outline">กลับหน้าหลัก</a>
        </div>`;
        return;
    }

    const galleryHTML = data.menuImages.map(img =>
        `<div class="menu-item"><img src="${img}" alt="Menu"></div>`
    ).join('');

    container.innerHTML = `
        <div class="detail-hero" style="background-image: url('${data.heroImage}');"></div>
        <div class="detail-container">
            <div class="detail-header-card">
                <span class="card-desc-short" style="margin-bottom:10px; display:inline-block;">${data.subtitle}</span>
                <h1 class="detail-title">${data.title}</h1>
                <div class="detail-meta">
                    <span><i class="fa-solid fa-star"></i> 4.8/5.0</span>
                    <span><i class="fa-solid fa-location-dot"></i> ${data.info.location}</span>
                </div>
            </div>
            <div class="content-grid">
                <div class="main-content">
                    <div class="story-section">
                        <h3><i class="fa-solid fa-book-open"></i> เรื่องราวของร้าน</h3>
                        <div class="story-text">${data.history}</div>
                    </div>
                    <div class="menu-section" style="margin-top:40px;">
                        <h3><i class="fa-solid fa-images"></i> ภาพบรรยากาศ & เมนู</h3>
                        <div class="menu-grid">
                            ${galleryHTML}
                        </div>
                    </div>
                </div>
                <div class="sidebar">
                    <div class="info-sidebar">
                        <h4 style="margin-top:0; color:var(--color-blue);">ข้อมูลร้าน</h4>
                        <div class="info-row"><i class="fa-solid fa-clock"></i> <span>${data.info.hours}</span></div>
                        <div class="info-row"><i class="fa-solid fa-wallet"></i> <span>${data.info.price}</span></div>
                        <div class="info-row"><i class="fa-solid fa-phone"></i> <span>${data.info.phone}</span></div>
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.title)}" target="_blank" class="modal-button map-btn" style="text-align:center; display:block; margin-top:20px; text-decoration:none;">
                            <i class="fa-solid fa-map-location-dot"></i> นำทาง
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// ============================================================
// COMMUNITY FEED SYSTEM (Lemon8 Style)
// ============================================================

// 1. ฟังก์ชันดึงและแสดงรีวิวทั้งหมด
async function loadCommunityFeed(hashtagFilter = null) {
    const feedGrid = document.getElementById('communityFeedGrid');
    const alertBox = document.getElementById('hashtagFilterAlert');
    const hashtagText = document.getElementById('currentHashtagText');
    
    if(!feedGrid) return;
    feedGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">กำลังโหลดฟีด...</p>';

    // จัดการปุ่ม Filter
    if (hashtagFilter) {
        alertBox.style.display = 'inline-block';
        hashtagText.innerText = hashtagFilter;
    } else {
        alertBox.style.display = 'none';
    }

    try {
        // ดึงรีวิวทั้งหมด เรียงตามวันที่ล่าสุด
        const snapshot = await firebase.firestore().collection('reviews')
            .orderBy('date', 'desc').get();
        
        let feedHTML = '';
        const currentUserId = firebase.auth().currentUser ? firebase.auth().currentUser.uid : null;

        snapshot.forEach(doc => {
            const data = doc.data();
            const reviewId = doc.id;
            
            // ถ้าระบุ Hashtag ให้ข้ามรีวิวที่ไม่มีคำนั้นไป
            if (hashtagFilter && !data.text.includes(hashtagFilter)) return;

            // ตกแต่งข้อความ: เปลี่ยนคำที่มี # ให้กลายเป็นปุ่มกดได้ (รองรับภาษาไทยและอังกฤษ)
            // ใช้ Regex จับคำที่ขึ้นต้นด้วย #
            const formattedText = data.text.replace(/#([A-Za-z0-9_\u0E00-\u0E7F]+)/g, 
                '<span class="hashtag" onclick="loadCommunityFeed(\'#$1\')">#$1</span>');

            const shopName = shopDatabase[data.shopId] ? shopDatabase[data.shopId].title : 'ร้านลับ';
            const likesCount = data.likedBy ? data.likedBy.length : 0;
            const isLiked = data.likedBy && currentUserId && data.likedBy.includes(currentUserId);
            const likeClass = isLiked ? 'liked' : '';
            const heartIcon = isLiked ? 'fa-solid' : 'fa-regular';

            // ถ้าไม่มีรูป ให้โชว์โลโก้สีเทาแทน
            const imageRender = data.reviewImage 
                ? `<img src="${data.reviewImage}" class="feed-img" alt="Review Image">` 
                : `<div class="feed-img" style="height: 150px; background: #e2e8f0; display:flex; align-items:center; justify-content:center;"><i class="fa-solid fa-camera" style="font-size:40px; color:#cbd5e1;"></i></div>`;

            feedHTML += `
                <div class="feed-card">
                    ${imageRender}
                    <div class="feed-content">
                        <div class="feed-shop-name"><i class="fa-solid fa-location-dot"></i> ${shopName}</div>
                        <div class="feed-text">${formattedText}</div>
                        <div class="feed-meta">
                            <div class="feed-user">
                                <img src="${data.avatar}" alt="User">
                                <span>${data.name}</span>
                            </div>
                            <button class="like-btn ${likeClass}" onclick="toggleLike('${reviewId}')">
                                <i class="${heartIcon} fa-heart"></i> <span id="like-count-${reviewId}">${likesCount}</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        if(feedHTML === '') {
            feedGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color:#94a3b8;">ยังไม่มีรีวิว หรือไม่พบ Hashtag ที่ค้นหาครับ มารีวิวคนแรกกันเถอะ!</p>';
        } else {
            feedGrid.innerHTML = feedHTML;
        }

    } catch (error) {
        console.error("Error loading feed:", error);
        feedGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color:red;">เกิดข้อผิดพลาดในการโหลดฟีด</p>';
    }
}

// 2. ฟังก์ชันกด Like / Unlike
async function toggleLike(reviewId) {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('กรุณาเข้าสู่ระบบก่อนกดหัวใจนะครับ!');
        document.getElementById('loginModal').style.display = 'flex';
        return;
    }

    const reviewRef = firebase.firestore().collection('reviews').doc(reviewId);
    
    try {
        // ใช้ Transaction เพื่อความแม่นยำเวลาคนกดพร้อมกันเยอะๆ
        await firebase.firestore().runTransaction(async (transaction) => {
            const doc = await transaction.get(reviewRef);
            if (!doc.exists) throw "ไม่มีรีวิวนี้อยู่!";

            const data = doc.data();
            let currentLikes = data.likedBy || [];

            if (currentLikes.includes(user.uid)) {
                // ถ้าเคยกดแล้ว ให้เอาออก (Unlike)
                currentLikes = currentLikes.filter(uid => uid !== user.uid);
            } else {
                // ถ้ายังไม่เคยกด ให้เพิ่มเข้าไป (Like)
                currentLikes.push(user.uid);
            }

            transaction.update(reviewRef, { likedBy: currentLikes });
        });

        // โหลดฟีดใหม่เพื่ออัปเดตปุ่มหัวใจ
        loadCommunityFeed();
    } catch (error) {
        console.error("Like error:", error);
    }
}

// 3. สั่งให้โหลด Feed อัตโนมัติเมื่อเปิดเว็บ
document.addEventListener('DOMContentLoaded', () => {
    // หน่วงเวลาเล็กน้อยเพื่อให้ Firebase โหลดเสร็จก่อน
    setTimeout(() => {
        loadCommunityFeed();
    }, 1500);
});

// ============================================================
// สคริปต์สำหรับสร้างรีวิวปลอม (รันแค่ครั้งเดียวแล้วลบทิ้งได้เลย)
// ============================================================
window.generateFakeReviews = async function() {
    const fakeReviews = [
        {
            shopId: "mingle",
            name: "Nong Nira (SPU66)",
            avatar: "https://i.pravatar.cc/150?img=5",
            rating: 5,
            text: "ร้านประจำเวลาปั่นงานเลยค่ะ แอร์เย็นฉ่ำ กาแฟอร่อยมาก นั่งยาวๆ ได้ยันดึก มุมถ่ายรูปก็มีนะ ☕️💻 #Cafe #WorkFriendly #เด็กศรีปทุม",
            date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 ชั่วโมงที่แล้ว
            reviewImage: "Im/ร้านเกม2.webp",
            userId: "fake_user_1",
            likedBy: ["uid1", "uid2", "uid3", "uid4", "uid5"] // ยอดไลก์ 5 คน
        },
        {
            shopId: "teenoi",
            name: "Hungry Boy",
            avatar: "https://i.pravatar.cc/150?img=11",
            rating: 5,
            text: "หิวตอนตี 2 ไม่ใช่ปัญหา จัดไปชุดใหญ่ไฟกระพริบ 🥓 สามชั้นสไลด์คือเดอะเบสท์ ทาสรักสุกี้ตี๋น้อยรายงานตัวครับ! #Buffet #LateNight #อร่อยบอกต่อ",
            date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 วันที่แล้ว
            reviewImage: "Im/สุกี้ตี๋น้อย2.webp",
            userId: "fake_user_2",
            likedBy: ["uid1", "uid2", "uid3"] 
        },
        {
            shopId: "moca",
            name: "Art.is.me",
            avatar: "https://i.pravatar.cc/150?img=20",
            rating: 5,
            text: "มาเสพงานศิลป์วันหยุด แสงสวยทุกมุม ได้รูปลงไอจีเพียบเลย แนะนำให้มาช่วงบ่ายๆ แสงจะตกกระทบสวยมาก 🎨✨ #PhotoSpot #Art #MOCA",
            date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 วันที่แล้ว
            reviewImage: "Im/พิพิธภัณฑ์ศิลปะร่วมสมัย 2.jpg",
            userId: "fake_user_3",
            likedBy: ["uid1", "uid2", "uid3", "uid4", "uid5", "uid6", "uid7", "uid8"] 
        },
        {
            shopId: "ting_ting",
            name: "Sweet Tooth Girl",
            avatar: "https://i.pravatar.cc/150?img=32",
            rating: 4,
            text: "กินคาวต้องกินหวาน บิงซูชาไทยคือที่สุดในย่านนี้! ไข่มุกหนึบหนับโดนใจมาก คิวแอบยาวนิดนึงแต่อร่อยคุ้มค่าการรอคอย 🍧 #Dessert #ของหวานเยียวยาจิตใจ",
            date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 วันที่แล้ว
            reviewImage: "Im/ถิงถิงบิงซูน้ำขิง2.jpg",
            userId: "fake_user_4",
            likedBy: ["uid1", "uid2"] 
        },
        {
            shopId: "ja_ou",
            name: "P'Moo BBQ",
            avatar: "https://i.pravatar.cc/150?img=53",
            rating: 5,
            text: "ตำนานหมูกระทะคิวล้นซอย น้ำจิ้มคือทีเด็ด หมูหมักนุ่มละมุนลิ้นสุดๆ กินกี่ครั้งก็ไม่เคยเบื่อ ใครสายหมูกระทะต้องมาโดน! 🥩🔥 #Dinner #Party #หมูกระทะจะเยียวยาทุกสิ่ง",
            date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 วันที่แล้ว
            reviewImage: "Im/จ่าอูหมูเกาหลี2.webp",
            userId: "fake_user_5",
            likedBy: ["uid1", "uid2", "uid3", "uid4"] 
        }
    ];

    try {
        for (const review of fakeReviews) {
            await firebase.firestore().collection('reviews').add(review);
        }
        alert("🎉 สร้างรีวิวปลอมสำเร็จแล้ว! รีเฟรชหน้าเว็บ 1 ครั้งเพื่อดูผลลัพธ์ได้เลยครับ");
    } catch (error) {
        alert("Error: " + error.message);
    }
}

// ============================================================
// QUICK REVIEW SYSTEM (Lemon8 Style Action Button)
// ============================================================
const quickModal = document.getElementById('quickReviewModal');
const quickBtn = document.getElementById('quickReviewBtn');
let quickRating = 0;
let quickImage = null;

// 1. เปิดหน้าต่างเขียนรีวิว
if (quickBtn) {
    quickBtn.addEventListener('click', () => {
        const user = firebase.auth().currentUser;
        if (!user) {
            showToast('กรุณาล็อกอินก่อนแบ่งปันรีวิวนะครับ', 'error');
            document.getElementById('loginModal').style.display = 'flex';
            return;
        }
        
        // โหลดรายชื่อร้านลงใน Select
        const select = document.getElementById('quickShopSelect');
        select.innerHTML = '<option value="">-- เลือกสถานที่ --</option>';
        Object.keys(shopDatabase).forEach(key => {
            select.innerHTML += `<option value="${key}">${shopDatabase[key].title}</option>`;
        });

        quickModal.style.display = 'flex';
    });
}

// 2. จัดการรูปภาพ Preview (พร้อมย่อขนาด)
document.getElementById('quickPhotoInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        compressImage(file, function(compressedBase64) {
            quickImage = compressedBase64;
            document.getElementById('quickPhotoPreview').src = quickImage;
            document.getElementById('quickPhotoPreviewContainer').style.display = 'block';
        });
    }
});

// 3. จัดการดาว (Rating)
document.querySelectorAll('#quickStarRating i').forEach(star => {
    star.addEventListener('click', function() {
        quickRating = parseInt(this.getAttribute('data-value'));
        document.querySelectorAll('#quickStarRating i').forEach(s => {
            const v = parseInt(s.getAttribute('data-value'));
            s.className = v <= quickRating ? 'fa-solid fa-star filled' : 'fa-regular fa-star';
        });
    });
});

// 4. สั่งโพสต์ลง Firebase
document.getElementById('submitQuickReview').addEventListener('click', async () => {
    const shopId = document.getElementById('quickShopSelect').value;
    const text = document.getElementById('quickReviewText').value;
    const user = firebase.auth().currentUser;

    if (!shopId) return alert('กรุณาเลือกสถานที่ด้วยครับ');
    if (quickRating === 0) return alert('กรุณาให้ดาวด้วยครับ');
    if (!text) return alert('เขียนข้อความสักนิดนะครับ');

    try {
        await firebase.firestore().collection('reviews').add({
            shopId,
            name: user.displayName,
            avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
            rating: quickRating,
            text: text,
            date: new Date().toISOString(),
            reviewImage: quickImage,
            userId: user.uid,
            likedBy: []
        });

        showToast('โพสต์รีวิวสำเร็จ! ขอบคุณที่ร่วมแบ่งปันครับ', 'success');
        quickModal.style.display = 'none';
        
        // เคลียร์ค่าเดิม
        document.getElementById('quickReviewText').value = '';
        document.getElementById('quickPhotoPreviewContainer').style.display = 'none';
        quickRating = 0;
        
        // โหลดฟีดใหม่
        loadCommunityFeed();
    } catch (error) {
        showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
    }
});
