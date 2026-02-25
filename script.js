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
window.showToast = function(message, type = 'success') {
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
        about: document.getElementById('about-section')
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
        } catch(error) {
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

    // --- PHOTO UPLOAD LOGIC ---
    const reviewPhotoInput = document.getElementById('reviewPhotoInput');
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');
    const photoPreview = document.getElementById('photoPreview');
    const removePhotoBtn = document.getElementById('removePhotoBtn');

    if (reviewPhotoInput) {
        reviewPhotoInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 1024 * 1024) { // 1MB
                    alert('ไฟล์ภาพใหญ่เกินไป กรุณาเลือกภาพไม่เกิน 1MB');
                    this.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = function (event) {
                    selectedImageData = event.target.result;
                    photoPreview.src = selectedImageData;
                    photoPreviewContainer.style.display = 'block';
                }
                reader.readAsDataURL(file);
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

    function openReviews() {
        if (!reviewModal) return;
        document.getElementById('reviewTargetName').textContent = currentReviewTarget;
        reviewList.innerHTML = '';

        let reviews = reviewsData[currentReviewTarget];
        if (!reviews || reviews.length === 0) {
            reviews = [{ name: "Guest User", avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png", rating: 5, text: "สถานที่สวยงาม บรรยากาศดีครับ!", date: "Just now", reviewImage: null }];
        }

        reviews.forEach(r => {
            const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
            // ส่วนแสดงรูปรีวิว
            const reviewImgHtml = r.reviewImage
                ? `<img src="${r.reviewImage}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; margin-top: 10px; border: 1px solid #eee;">`
                : '';

            const html = `
                <div class="review-item">
                    <div class="review-avatar" style="background-image: url('${r.avatar}');"></div>
                    <div class="review-content">
                        <div class="review-header">
                            <div class="review-user">${r.name}</div>
                            <div class="review-date">${r.date}</div>
                        </div>
                        <div class="review-stars">${stars}</div>
                        <p class="review-text">${r.text}</p>
                        ${reviewImgHtml}
                    </div>
                </div>`;
            reviewList.innerHTML += html;
        });
        reviewModal.style.display = 'flex';
    }

    const starInputs = document.querySelectorAll('.star-rating-input i');
    if (starInputs.length > 0) {
        starInputs.forEach(star => {
            star.addEventListener('click', function () {
                const value = parseInt(this.getAttribute('data-value'));
                currentRating = value;
                updateStarVisuals(value);
            });
        });
    }

    function updateStarVisuals(rating) {
        starInputs.forEach(star => {
            const val = parseInt(star.getAttribute('data-value'));
            if (val <= rating) {
                star.classList.remove('fa-regular');
                star.classList.add('fa-solid', 'filled');
            } else {
                star.classList.remove('fa-solid', 'filled');
                star.classList.add('fa-regular');
            }
        });
    }

    if (submitReviewBtn) {
    submitReviewBtn.addEventListener('click', async () => {
        const user = firebase.auth().currentUser;
        
        if (!user) {
            alert('กรุณาเข้าสู่ระบบก่อนเขียนรีวิวนะครับ');
            document.getElementById('loginModal').style.display = 'flex';
            return;
        }

        const text = document.getElementById('newReviewText').value;
        if (currentRating === 0) { alert('กรุณาให้คะแนนดาวด้วยครับ!'); return; }
        if (!text) { alert('กรุณาเขียนข้อความรีวิวด้วยครับ!'); return; }

        const originalText = submitReviewBtn.innerText;
        submitReviewBtn.innerText = 'กำลังบันทึก...';
        submitReviewBtn.disabled = true;

        try {
            // ใช้ตัวแปร selectedImageData (ที่เป็น Base64) ที่มีอยู่ในระบบเดิมของคุณได้เลย
            // ไม่ต้องอัปโหลดขึ้น Storage แล้ว
            const newReview = {
                shopId: currentReviewTarget,
                name: user.displayName || 'Student',
                avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                rating: currentRating,
                text: text,
                date: new Date().toISOString(),
                reviewImage: selectedImageData || null, // เก็บรูปเป็น Data URL ลง Firestore โดยตรง
                userId: user.uid
            };

            // บันทึกลง Firestore
            await firebase.firestore().collection('reviews').add(newReview);

            alert('โพสต์รีวิวสำเร็จ!');
            
            document.getElementById('newReviewText').value = '';
            currentRating = 0;
            updateStarVisuals(0);
            selectedImageData = null;
            if (reviewPhotoInput) reviewPhotoInput.value = '';
            if (photoPreviewContainer) photoPreviewContainer.style.display = 'none';

            openReviews(); 

        } catch (error) {
            alert('เกิดข้อผิดพลาด: ' + error.message);
            console.error(error);
        } finally {
            submitReviewBtn.innerText = originalText;
            submitReviewBtn.disabled = false;
        }
    });
}

    const viewReviewsBtn = document.getElementById('viewReviewsBtn');
    if (viewReviewsBtn) { viewReviewsBtn.addEventListener('click', openReviews); }

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
    window.handleLogout = function() {
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

    if(profileClose) {
        profileClose.addEventListener('click', () => {
            profileModal.style.display = 'none';
        });
    }

    // ฟังก์ชันเปิดหน้าต่างแก้โปรไฟล์และโหลดสถิติ
    window.openProfileModal = async function() {
        const user = firebase.auth().currentUser;
        if(!user) return;

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
        } catch(error) {
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
        } catch(e) { console.error("Error loading profile data:", e); }
        
        // นำข้อมูลมาใส่ในช่องกรอก
        document.getElementById('editProfileFaculty').value = currentFaculty;
        document.getElementById('editProfileBio').value = currentBio;

        // แสดงรูปภาพ
        if(currentPhoto) {
            preview.innerHTML = `<img src="${currentPhoto}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            preview.innerHTML = `<i class="fa-solid fa-user-circle" style="font-size: 80px; color: #cbd5e1;"></i>`;
        }
        
        newProfileBase64 = null; 
        profileModal.style.display = 'flex';
    }

    const profilePhotoInput = document.getElementById('profilePhotoInput');
    if(profilePhotoInput) {
        profilePhotoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if(file) {
                if (file.size > 200 * 1024) { 
                    alert('ไฟล์ภาพใหญ่เกินไป กรุณาเลือกภาพขนาดไม่เกิน 200KB ครับ (แนะนำให้ครอปภาพก่อน)');
                    this.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(event) {
                    newProfileBase64 = event.target.result;
                    const preview = document.getElementById('profileImgPreview');
                    preview.innerHTML = `<img src="${newProfileBase64}" style="width: 100%; height: 100%; object-fit: cover;">`;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if(saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async () => {
            const user = firebase.auth().currentUser;
            const newName = document.getElementById('editProfileName').value;
            const newFaculty = document.getElementById('editProfileFaculty').value;
            const newBio = document.getElementById('editProfileBio').value;

            if(!newName) { alert('กรุณากรอกชื่อด้วยครับ!'); return; }

            const originalText = saveProfileBtn.innerText;
            saveProfileBtn.innerText = 'SAVING...';
            saveProfileBtn.disabled = true;

            try {
                // อัปเดตชื่อใน Auth
                await user.updateProfile({ displayName: newName });
                
                // เตรียมข้อมูลที่จะเซฟลง Database
                const updateData = {
                    faculty: newFaculty,
                    bio: newBio
                };
                if(newProfileBase64) {
                    updateData.profileImage = newProfileBase64;
                }

                // บันทึกข้อมูลลง Firestore (ใช้ merge: true เพื่อไม่ให้ข้อมูลอื่นหาย)
                await firebase.firestore().collection('users').doc(user.uid).set(updateData, { merge: true });
                
                showToast('อัปเดตโปรไฟล์เรียบร้อยแล้ว!', 'success');
                profileModal.style.display = 'none';
                checkLoginStatus(); 

            } catch (error) {
                showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
            } finally {
                saveProfileBtn.innerText = originalText;
                saveProfileBtn.disabled = false;
            }
        });
    }
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
        title: "สุกี้ตี๋น้อย", subtitle: "Midnight Buffet", heroImage: "https://images.unsplash.com/photo-1548943487-a2e4b43b4850?w=600",
        history: "<p><b>เดอะแบกของคนนอนดึก!</b> ร้านบุฟเฟต์สุกี้ที่เป็นเสมือนสามัญประจำบ้านของนักศึกษา จุดเด่นคือเปิดบริการลากยาวไปจนถึงตี 5 ด้วยเนื้อออสเตรเลียสไลด์ กุ้งสด และชีสยืดๆ แบบไม่อั้น</p>",
        menuImages: ["https://images.unsplash.com/photo-1584844627036-7c39b363673d?w=600"],
        info: { hours: "12:00 - 05:00", price: "219+ THB (ไม่รวมน้ำ)", phone: "080-123-4567", location: "สาขาพหลโยธิน วัชรพล" }
    },
    "yangnoey": {
        title: "ย่างเนย", subtitle: "Unlimited BBQ", heroImage: "https://images.unsplash.com/photo-1544025162-83b382d5e683?w=600",
        history: "<p>ต้นตำรับปิ้งย่างกระทะร้อนกับสโลแกน <b>'เหลือไม่ปรับ ไม่จำกัดเวลา'</b> ที่ได้ใจวัยรุ่นไปเต็มๆ จุดเด่นคือกระทะร้อนที่ใส่เนยลงไปหอมๆ เอาเนื้อสไลด์หรือสามชั้นลงไปย่างให้เกรียม กินคู่กับน้ำจิ้มแจ่วสุดแซ่บ</p>",
        menuImages: ["https://images.unsplash.com/photo-1605807646983-377bc5a76493?w=600"],
        info: { hours: "16:00 - 23:00", price: "219+ THB", phone: "082-222-3333", location: "สาขารัชโยธิน / เกษตร" }
    },
    "shinkanzen": {
        title: "Shinkanzen Sushi", subtitle: "Budget Sushi", heroImage: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600",
        history: "<p>ร้านอาหารญี่ปุ่นที่เข้าใจกระเป๋าตังค์นักศึกษาอย่างแท้จริง! ปฏิวัติวงการซูชิด้วยราคาเริ่มต้น <b>เพียงคำละ 11 บาท</b> เมนูที่ห้ามพลาดคือ 'ซูชิแซลมอน' ที่ชิ้นใหญ่และสดมาก</p>",
        menuImages: ["https://images.unsplash.com/photo-1553621042-f6e147245754?w=600"],
        info: { hours: "10:00 - 22:00", price: "100 - 300 THB", phone: "091-111-2222", location: "สาขา ม.เกษตร" }
    },
    "ja_ou": {
        title: "จ่าอู หมูเกาหลี", subtitle: "Legendary BBQ", heroImage: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600",
        history: "<p>ร้านหมูกระทะแบบสั่งเป็นชุดที่คิวแน่นทะลุซอยทุกวัน! ความลับของจ่าอูอยู่ที่ <b>'หมูหมักสูตรลับ'</b> ที่นุ่มละมุนลิ้น และ <b>'น้ำจิ้มสุกี้รสแซ่บ'</b> ที่เผ็ดจัดจ้านถูกปากคนไทย ปิ้งบนเตาถ่านร้อนๆ</p>",
        menuImages: ["https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600"],
        info: { hours: "15:00 - 23:00", price: "250 - 400 THB", phone: "09x-xxx-xxxx", location: "สาขารัชโยธิน" }
    },
    "prateep": {
        title: "ป.ประทีป ก๋วยเตี๋ยวเรือ", subtitle: "Spicy Boat Noodle", heroImage: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=600",
        history: "<p>ก๋วยเตี๋ยวเรืออยุธยาที่ขึ้นชื่อลือชาเรื่อง <b>'ความเผ็ดจัดจ้านแบบพ่นไฟ'</b> ไอเทมลับที่ต้องสั่งมาประกบคือ กากหมูเจียวกรอบๆ ชิ้นโตที่เจียวใหม่ๆ ทุกวัน คลุกเคล้าเข้ากับน้ำตกรสเข้มข้น</p>",
        menuImages: ["https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600"],
        info: { hours: "08:00 - 17:00", price: "20 - 60 THB", phone: "089-999-9999", location: "ซอยพหลโยธิน" }
    },
    "ting_ting": {
        title: "ถิงถิง บิงซูน้ำขิง", subtitle: "Sweet Dessert", heroImage: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600",
        history: "<p>ร้านขนมหวานที่ผสมผสานความร่วมสมัยและกลิ่นอายแบบจีน-ไต้หวันเข้าด้วยกัน เมนูยอดฮิตที่เด็กมหาลัยชอบสั่งคือ <b>บิงซูชาไทยไข่มุก</b> รสชาติเข้มข้น และ <b>บัวลอยลาวาน้ำขิงอุ่นๆ</b></p>",
        menuImages: ["https://images.unsplash.com/photo-1563805042-7684c8e9e5cb?w=600"],
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
        menuImages: ["Im/พิพิธภัณฑ์ศิลปะร่วมสมัย 2.jpg", "Im/พิพิ3.jpg"],
        info: { hours: "10:00 - 18:00 (ปิด จ.)", price: "Student 100 THB", phone: "02-016-5666", location: "ถ.วิภาวดีรังสิต" }
    },
    "temple": {
        title: "วัดพระศรีมหาธาตุ", subtitle: "Wat Phra Si Mahathat", heroImage: "Im/วัดพระ.jpg",
        history: "<p><b>วัดคู่บ้านคู่เมืองย่านบางเขน</b> โดดเด่นด้วยเจดีย์สีขาวองค์ใหญ่ที่ภายในประดิษฐานพระบรมสารีริกธาตุ ที่นี่ถือเป็น <b>'ศูนย์รวมความมูเตลู'</b> ของนักศึกษาที่มักมาขอพรช่วงสอบ</p>",
        menuImages: ["Im/วัด 2.jpg", "Im/วัด3.jpg"],
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
    "bacc": {
        title: "BACC (หอศิลป์กรุงเทพฯ)", subtitle: "Bangkok Art Gallery", heroImage: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=600",
        history: "<p><b>หอศิลปวัฒนธรรมแห่งกรุงเทพมหานคร</b> เป็นพื้นที่จัดแสดงนิทรรศการศิลปะหมุนเวียนที่เปิดให้เข้าชมฟรี จุดเด่นที่พลาดไม่ได้คือ <b>ทางเดินทรงกระบอกวนสโลป</b> ที่เป็น Signature Photo Spot</p>",
        menuImages: ["https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600"],
        info: { hours: "10:00 - 20:00 (ปิด จ.)", price: "Free", phone: "02-214-6630", location: "BTS สนามกีฬาแห่งชาติ" }
    },
    "chatuchak_park": {
        title: "สวนจตุจักร (Chatuchak Park)", subtitle: "Green Space", heroImage: "https://images.unsplash.com/photo-1596423735880-5f2a689b903e?w=600",
        history: "<p>พื้นที่สีเขียวขนาดใหญ่ติด BTS เป็นปอดของคนกรุงเทพฯ กิจกรรมยอดฮิตคือการมาเช่าเสื่อปิกนิก ปั่นจักรยาน หรือวิ่งออกกำลังกายรับลมในช่วงเย็น</p>",
        menuImages: ["https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600"],
        info: { hours: "04:30 - 22:00", price: "Free", phone: "-", location: "BTS หมอชิต" }
    },
    "central_ladprao": {
        title: "เซ็นทรัล ลาดพร้าว", subtitle: "Lifestyle Mall", heroImage: "https://images.unsplash.com/photo-1620800720516-e5b15b672cd5?w=600",
        history: "<p>ศูนย์การค้าระดับตำนาน เดินทางมาง่ายมากๆ ด้วย BTS โดดเด่นด้วยโซนแฟชั่นที่มีแบรนด์ดังครบถ้วน และที่พลาดไม่ได้คือ <b>โซนอาหารชั้นใต้ดิน (Food Hall)</b> ที่เป็นสวรรค์ของสายกิน</p>",
        menuImages: ["https://images.unsplash.com/photo-1519567281794-272449bf7a22?w=600"],
        info: { hours: "10:00 - 22:00", price: "Varied", phone: "02-793-6000", location: "BTS ห้าแยกลาดพร้าว" }
    },
    "gumps_ari": {
        title: "GUMP's Ari", subtitle: "Community Space", heroImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600",
        history: "<p>คอมมูนิตี้สุดป๊อปย่านอารีย์ที่ตกแต่งด้วย <b>สีสันสดใสสไตล์ Retro</b> ให้ฟีลลิ่งเกาหลีสุดๆ ที่นี่เป็นแหล่งรวมตัวของวัยรุ่นสายคอนเทนต์ เพราะมีตู้สติกเกอร์และคาเฟ่เยอะมาก</p>",
        menuImages: ["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600"],
        info: { hours: "10:00 - 20:00", price: "100 - 300 THB", phone: "-", location: "ซอยอารีย์ 4" }
    },
    "jodd_fairs": {
        title: "JODD FAIRS แดนเนรมิต", subtitle: "Night Market & Castle", heroImage: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600",
        history: "<p>ตลาดนัดกลางคืนสุดชิค โดยยังคงรักษา 'ปราสาทสไตล์ยุโรป' ไว้เป็นฉากหลัง มีโซนให้นั่งชิลฟีลลิ่งแคมป์ปิ้ง และรวบรวมร้าน Street Food ชื่อดังไว้มากมาย</p>",
        menuImages: ["https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600"],
        info: { hours: "16:00 - 24:00", price: "200 - 500 THB", phone: "092-713-5599", location: "BTS พหลโยธิน 24" }
    },
    "union_mall": {
        title: "Union Mall (ยูเนี่ยน มอลล์)", subtitle: "Fashion Hub", heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600",
        history: "<p><b>สวรรค์ของนักช้อปวัยรุ่น!</b> ยูเนี่ยนมอลล์คือศูนย์รวมเสื้อผ้าแฟชั่น กระเป๋า รองเท้า นอกจากนี้ยังมีโซนทำเล็บ ทำผม และ <b>ดงตู้ถ่ายรูปสติกเกอร์</b> ที่ฮิตที่สุด</p>",
        menuImages: ["https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600"],
        info: { hours: "11:00 - 22:00", price: "Varied", phone: "02-512-5000", location: "BTS ห้าแยกลาดพร้าว" }
    },
    "suan_rodfai": {
        title: "สวนรถไฟ (ปั่นจักรยาน)", subtitle: "Wachirabenchathat Park", heroImage: "https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?w=600",
        history: "<p>สวนสาธารณะขนาดใหญ่ กิจกรรมยอดฮิตคือการ <b>เช่าจักรยานปั่นรอบสวน</b> สูดอากาศบริสุทธิ์ มีทุ่งดอกไม้หมุนเวียนตามฤดูกาล ถ่ายรูปฟีลลิ่งเหมือนอยู่ต่างประเทศ</p>",
        menuImages: ["https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600"],
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
