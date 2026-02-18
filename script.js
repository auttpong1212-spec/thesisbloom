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
    let favorites = JSON.parse(localStorage.getItem('bloomFavorites')) || [];
    let currentRating = 0;
    let selectedImageData = null; // ตัวแปรเก็บรูปภาพรีวิว

    // --- FULL REVIEW DATA (ข้อมูลรีวิวเดิมทั้งหมดของคุณ) ---
    const reviewsData = {
        "MOCA Museum": [
            { name: "Ploy Ch.", avatar: "https://i.pravatar.cc/150?img=5", rating: 5, text: "มุมถ่ายรูปเยอะมากกก แสงสวยทุกจุด เตรียมชุดไปเปลี่ยนได้เลย คุ้มราคาบัตรนักศึกษาค่ะ", date: "2 days ago", reviewImage: null },
            { name: "Art Ken", avatar: "https://i.pravatar.cc/150?img=11", rating: 4, text: "งานศิลปะดีครับ บรรยากาศเงียบสงบ แอร์เย็นฉ่ำ เดินเพลินๆ ได้ 2-3 ชั่วโมงเลย", date: "1 week ago", reviewImage: null }
        ],
        "วัดพระศรีมหาธาตุ": [
            { name: "Somchai Sai-Mu", avatar: "https://i.pravatar.cc/150?img=13", rating: 5, text: "มาไหว้ขอพรช่วงสอบครับ สงบ ร่มรื่น เดินทางสะดวกติด BTS เลย", date: "Yesterday", reviewImage: null },
            { name: "Auntie Da", avatar: "https://i.pravatar.cc/150?img=45", rating: 5, text: "วัดสะอาดมาก มีที่จอดรถเยอะ วันพระคนจะเยอะหน่อยนะคะ", date: "3 days ago", reviewImage: null }
        ],
        "Co-Working Space & Library": [
            { name: "Dek SPU 66", avatar: "https://i.pravatar.cc/150?img=3", rating: 5, text: "ที่สิงสถิตช่วง Midterm แอร์เย็น เน็ตแรง ปลั๊กเยอะ ดีสุดๆ", date: "10 mins ago", reviewImage: null },
            { name: "BookWorm", avatar: "https://i.pravatar.cc/150?img=9", rating: 4, text: "เงียบดีครับ แต่ช่วงบ่ายๆ โต๊ะเต็มเร็วมาก ต้องรีบมาจอง", date: "2 days ago", reviewImage: null }
        ],
        "เมเจอร์ รัชโยธิน": [
            { name: "Movie Buff", avatar: "https://i.pravatar.cc/150?img=60", rating: 5, text: "โรง IMAX ภาพชัดเสียงกระหึ่ม! ป๊อปคอร์นชีสคือเดอะเบสท์", date: "1 hour ago", reviewImage: null },
            { name: "Jenny", avatar: "https://i.pravatar.cc/150?img=24", rating: 3, text: "ที่จอดรถหายากนิดนึงช่วงวันหยุด แนะนำให้นั่ง BTS มาสะดวกกว่า", date: "Yesterday", reviewImage: null }
        ],
        "เซ็นทรัล รามอินทรา": [
            { name: "Mommy Pink", avatar: "https://i.pravatar.cc/150?img=44", rating: 4, text: "ห้างปรับปรุงใหม่สวยขึ้นเยอะเลย ของกินชั้นล่างเพียบ เดินสบายคนไม่พลุกพล่าน", date: "Yesterday", reviewImage: null },
            { name: "Tee Lek", avatar: "https://i.pravatar.cc/150?img=59", rating: 5, text: "โรงหนังแอร์เย็นมาก เบาะนุ่ม ใหม่สะอาด ชอบครับ", date: "2 days ago", reviewImage: null }
        ],
        "ตลาดนัดจตุจักรกลางคืน": [
            { name: "Vintage Boy", avatar: "https://i.pravatar.cc/150?img=68", rating: 5, text: "เสื้อผ้ามือสองสวยๆ เยอะมาก ตาดีได้ตาร้ายเสีย ต้องมาเดินดูเอง", date: "Last Friday", reviewImage: null },
            { name: "Alice In Wonderland", avatar: "https://i.pravatar.cc/150?img=28", rating: 4, text: "ของกินเยอะ แต่ร้อนหน่อยนะ เตรียมพัดลมมือถือมาด้วย", date: "1 week ago", reviewImage: null }
        ],
        "ตลาดนัดจตุจักรกลางวัน": [
            { name: "Tourist Guy", avatar: "https://i.pravatar.cc/150?img=33", rating: 5, text: "Amazing place! So many things to buy. Coconut ice cream is a must!", date: "Yesterday", reviewImage: null },
            { name: "Ja Ae", avatar: "https://i.pravatar.cc/150?img=41", rating: 4, text: "เดินขาลากเลย ของเยอะจริงๆ แนะนำให้มาเช้าๆ แดดไม่ร้อน", date: "Last Sunday", reviewImage: null }
        ],
        "หม่าล่าเสฉวน": [
            { name: "Spicy Lover", avatar: "https://i.pravatar.cc/150?img=16", rating: 5, text: "เผ็ดชาสะใจ! น้ำจิ้มถั่วปรุงเองอร่อยมาก ราคาไม่แพงเริ่มต้นไม้ละ 5 บาท", date: "30 mins ago", reviewImage: null },
            { name: "No Spicy", avatar: "https://i.pravatar.cc/150?img=29", rating: 3, text: "อร่อยนะ แต่รอนานไปหน่อยช่วงเย็น คนเยอะมาก", date: "Yesterday", reviewImage: null }
        ],
        "Meetup Mingle Cafe": [
            { name: "Boardgame Master", avatar: "https://i.pravatar.cc/150?img=52", rating: 5, text: "เกมเยอะมากก เจ้าของร้านสอนเล่นเป็นกันเอง ขนมอร่อยด้วย", date: "Yesterday", reviewImage: null },
            { name: "Coffee Time", avatar: "https://i.pravatar.cc/150?img=35", rating: 4, text: "กาแฟดี นั่งทำงานได้ยาวๆ มีปลั๊กให้", date: "2 days ago", reviewImage: null }
        ],
        "สุกี้จานบิน": [
            { name: "Buffet Hunter", avatar: "https://i.pravatar.cc/150?img=14", rating: 5, text: "น้ำซุปกระดูกหมูเข้มข้นมากก เนื้อลายสวย คุ้มราคาบุฟเฟต์สุดๆ", date: "2 hours ago", reviewImage: null },
            { name: "Yui", avatar: "https://i.pravatar.cc/150?img=21", rating: 4, text: "ของสดดีค่ะ แต่โต๊ะค่อนข้างแคบไปหน่อยถ้านั่งหลายคน", date: "Yesterday", reviewImage: null }
        ],
        "Little Chicky": [
            { name: "Chicken Run", avatar: "https://i.pravatar.cc/150?img=65", rating: 5, text: "ไก่กรอบนอกนุ่มใน ซอสหัวหอมอร่อยมากกก ให้เยอะด้วย", date: "1 hour ago", reviewImage: null },
            { name: "Student A", avatar: "https://i.pravatar.cc/150?img=8", rating: 5, text: "ราคาดีงามเหมาะกับนักเรียน เซ็ตข้าวไก่ทอดอิ่มจุกๆ", date: "Yesterday", reviewImage: null }
        ],
        "Bad Bad Burger": [
            { name: "Burger King", avatar: "https://i.pravatar.cc/150?img=57", rating: 5, text: "เบอร์เกอร์ชิ้นใหญ่มาก! เนื้อฉ่ำ ซอสทรัฟเฟิลหอมทะลุจมูก", date: "Yesterday", reviewImage: null },
            { name: "Fit Girl", avatar: "https://i.pravatar.cc/150?img=42", rating: 4, text: "อร่อยแบบตะโกน แต่แคลอรี่ก็น่าจะตะโกนเหมือนกัน 555 นานๆ กินทีโอเคค่ะ", date: "3 days ago", reviewImage: null }
        ],
        "โอยั๊วะเกษตร": [
            { name: "Party Man", avatar: "https://i.pravatar.cc/150?img=12", rating: 5, text: "ร้านประจำเวลานัดรวมรุ่น บรรยากาศริมน้ำดีมาก อาหารอร่อยทุกอย่าง", date: "Last Friday", reviewImage: null },
            { name: "Romantic Couple", avatar: "https://i.pravatar.cc/150?img=25", rating: 4, text: "มาเดทตอนเย็นพระอาทิตย์ตกสวยมากครับ ยุงเยอะไปนิดขอยากันยุงได้", date: "Last Sunday", reviewImage: null }
        ],
        "Uptojug Kitchen": [
            { name: "Cafe Hopper", avatar: "https://i.pravatar.cc/150?img=38", rating: 5, text: "ร้านสวยมากกก ตกแต่งดี ถ่ายรูปได้ทุกมุม อาหารฟิวชั่นรสชาติดี", date: "Yesterday", reviewImage: null },
            { name: "Foodie", avatar: "https://i.pravatar.cc/150?img=4", rating: 4, text: "สปาเก็ตตี้คาโบนาร่าเข้มข้น แนะนำเลยครับ ราคาแรงนิดนึงแต่คุ้ม", date: "2 days ago", reviewImage: null }
        ],
        "Wallace": [
            { name: "Luxury Life", avatar: "https://i.pravatar.cc/150?img=31", rating: 5, text: "สเต็กเนื้อนุ่มละลายในปาก บริการระดับ 5 ดาว เหมาะกับโอกาสพิเศษจริงๆ", date: "3 weeks ago", reviewImage: null },
            { name: "Wine Lover", avatar: "https://i.pravatar.cc/150?img=10", rating: 5, text: "ไวน์ลิสต์ดีมาก บรรยากาศโรแมนติก แนะนำให้จองโต๊ะริมหน้าต่าง", date: "1 month ago", reviewImage: null }
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
    function toggleFavorite(title, btn) {
        const index = favorites.indexOf(title);
        const icon = btn.querySelector('i');

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
        localStorage.setItem('bloomFavorites', JSON.stringify(favorites));
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
        reviewPhotoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 1024 * 1024) { // 1MB
                    alert('ไฟล์ภาพใหญ่เกินไป กรุณาเลือกภาพไม่เกิน 1MB');
                    this.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(event) {
                    selectedImageData = event.target.result;
                    photoPreview.src = selectedImageData;
                    photoPreviewContainer.style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', function() {
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
        submitReviewBtn.addEventListener('click', () => {
            const text = document.getElementById('newReviewText').value;
            if (currentRating === 0) { alert('Please select a star rating!'); return; }
            if (!text) { alert('Please write something!'); return; }

            const newReview = { 
                name: "You (Demo)", 
                avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png", 
                rating: currentRating, 
                text: text, 
                date: "Just now",
                reviewImage: selectedImageData // เพิ่มรูปภาพลงในรีวิว
            };

            if (!reviewsData[currentReviewTarget]) reviewsData[currentReviewTarget] = [];
            reviewsData[currentReviewTarget].unshift(newReview);

            openReviews(); // Refresh รายการ
            
            // Clear Form
            document.getElementById('newReviewText').value = '';
            currentRating = 0;
            updateStarVisuals(0);
            selectedImageData = null;
            if(reviewPhotoInput) reviewPhotoInput.value = '';
            if(photoPreviewContainer) photoPreviewContainer.style.display = 'none';
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

    function checkLoginStatus() {
        const user = localStorage.getItem('bloomUser');
        let profileImg = accountToggle.querySelector('.user-profile-img');
        if (!profileImg) {
            profileImg = document.createElement('img');
            profileImg.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';
            profileImg.className = 'user-profile-img';
            accountToggle.appendChild(profileImg);
        }
        if (user) {
            accountToggle.classList.add('logged-in');
            accountToggle.onclick = function (e) { e.preventDefault(); if (confirm('Log out from ' + user + '?')) handleLogout(); };
        } else {
            accountToggle.classList.remove('logged-in');
            accountToggle.onclick = function (e) { e.preventDefault(); loginModal.style.display = 'flex'; };
        }
    }

    function handleLogout() { localStorage.removeItem('bloomUser'); alert('Logged out successfully!'); checkLoginStatus(); window.location.reload(); }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const pass = document.getElementById('signupPassword').value;
            const userObj = { name: name, email: email, pass: pass };
            localStorage.setItem('registeredUser', JSON.stringify(userObj));
            alert('Account created successfully! Please login.');
            closeModal(signupModal);
            loginModal.style.display = 'flex';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const registeredUser = JSON.parse(localStorage.getItem('registeredUser'));

            let isLoginSuccess = false;
            if (registeredUser && email === registeredUser.email && password === registeredUser.pass) { isLoginSuccess = true; }
            else if (email === 'admin@spu.ac.th' && password === '1234') { isLoginSuccess = true; }

            if (isLoginSuccess) { localStorage.setItem('bloomUser', email); alert('Welcome back!'); closeModal(loginModal); checkLoginStatus(); }
            else { alert('Invalid email or password!'); }
        });
    }

    checkLoginStatus();

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

    showHomePage();
});

// --- 9. FULL SHOP DATABASE (ข้อมูลร้านค้าเดิมทั้งหมดสำหรับหน้ารายละเอียด) ---
const shopDatabase = {
    "moca": {
        title: "MOCA Museum",
        subtitle: "Museum of Contemporary Art",
        heroImage: "Im/พิพิธภัณฑ์ศิลปะร่วมสมัย 1.jpg",
        history: "<p>พิพิธภัณฑ์ศิลปะไทยร่วมสมัย (MOCA BANGKOK) ก่อตั้งโดยคุณบุญชัย เบญจรงคกุล เพื่อรวบรวมผลงานศิลปะชิ้นสำคัญของศิลปินไทยระดับปรมาจารย์...</p>",
        menuImages: ["Im/พิพิธภัณฑ์ศิลปะร่วมสมัย 2.jpg", "Im/พิพิ3.jpg", "Im/พิพิ4.jpg", "Im/พิพิ5.webp"],
        info: { hours: "10:00 - 18:00 (ปิดวันจันทร์)", price: "Student 100 THB", phone: "02-016-5666", location: "ถนนวิภาวดีรังสิต" }
    },
    "temple": {
        title: "วัดพระศรีมหาธาตุ",
        subtitle: "Wat Phra Si Mahathat",
        heroImage: "Im/วัดพระ.jpg",
        history: "<p>วัดพระศรีมหาธาตุวรมหาวิหาร หรือที่นิยมเรียกกันว่า 'วัดพระศรี' เป็นวัดคู่บ้านคู่เมืองของย่านบางเขน...</p>",
        menuImages: ["Im/วัด 2.jpg", "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600"],
        info: { hours: "06:00 - 18:00", price: "Free", phone: "02-521-0311", location: "วงเวียนบางเขน" }
    },
    "library": {
        title: "Co-Working Space & Library",
        subtitle: "SPU Library Zone",
        heroImage: "Im/ห้องสมุด1.jpg",
        history: "<p>พื้นที่แห่งการเรียนรู้ที่ออกแบบมาเพื่อนักศึกษาโดยเฉพาะ มีทั้งโซนเงียบสำหรับอ่านหนังสือ และโซนพูดคุยสำหรับทำงานกลุ่ม...</p>",
        menuImages: ["Im/ห้องสมุด2.jpg", "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600"],
        info: { hours: "08:30 - 20:00", price: "Free (Student Only)", phone: "02-579-1111", location: "อาคาร 11 ชั้น 1-2" }
    },
    "major": {
        title: "เมเจอร์ รัชโยธิน",
        subtitle: "Major Cineplex Ratchayothin",
        heroImage: "Im/เมเจอร์ซีนีเพล็กซ์ รัชโยธิน 1.jpg",
        history: "<p>แลนด์มาร์คสำคัญของย่านรัชโยธิน เป็นแหล่งรวมความบันเทิงครบวงจร ทั้งโรงภาพยนตร์ระบบ IMAX, โบว์ลิ่ง, คาราโอเกะ...</p>",
        menuImages: ["Im/เมเจอร์ซีนีเพล็กซ์ รัชโยธิน 2.jpg", "https://images.unsplash.com/photo-1517604931442-71053e6e2306?w=600"],
        info: { hours: "10:00 - 22:00", price: "Varied", phone: "02-515-5555", location: "แยกรัชโยธิน" }
    },
    "central": {
        title: "เซ็นทรัล รามอินทรา",
        subtitle: "New Central Ramindra",
        heroImage: "Im/เซ็นทรัลรามอินทรา 1.jpg",
        history: "<p>โฉมใหม่ไฉไลกว่าเดิม! เซ็นทรัล รามอินทรา ได้รับการรีโนเวทใหม่ทั้งหมด มาในคอนเซปต์ 'Everyday Lifestyle'...</p>",
        menuImages: ["Im/เซ็นทรัลรามอินทรา 2.jpg", "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600"],
        info: { hours: "10:00 - 21:00", price: "Varied", phone: "02-790-3000", location: "ถนนรามอินทรา" }
    },
    "market_night": {
        title: "ตลาดนัดจตุจักรกลางคืน",
        subtitle: "Chatuchak Night Market",
        heroImage: "Im/ตลาดนัดจตุจักรกลางคืน1.jpg",
        history: "<p>สวรรค์ของคนนอนดึก! ตลาดนัดจตุจักรคืนวันศุกร์ เป็นแหล่งรวมเสื้อผ้าแฟชั่นราคาส่ง และของกิน Street Food มากมาย...</p>",
        menuImages: ["Im/ตลาดนัดจตุจักรกลางคืน2.jpg", "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600"],
        info: { hours: "19:00 - 24:00 (Fri-Sat-Sun)", price: "Varied", phone: "02-272-4440", location: "BTS หมอชิต / MRT สวนจตุจักร" }
    },
    "market_day": {
        title: "ตลาดนัดจตุจักรกลางวัน",
        subtitle: "Chatuchak Weekend Market",
        heroImage: "Im/ตลาดกลางวัน1.png",
        history: "<p>ตลาดนัดที่ใหญ่ที่สุดในโลกและเป็นจุดหมายปลายทางของนักท่องเที่ยวทั่วโลก มีสินค้าครบทุกหมวดหมู่...</p>",
        menuImages: ["Im/ตลาดกลางวัน2.png", "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600"],
        info: { hours: "09:00 - 18:00 (Sat-Sun)", price: "Varied", phone: "02-272-4440", location: "BTS หมอชิต / MRT สวนจตุจักร" }
    },
    "mala": {
        title: "หม่าล่าเสฉวน",
        subtitle: "Budget Spicy & Authentic Taste",
        heroImage: "Im/หมาล่า1.webp",
        history: "<p>ร้านหม่าล่าเสฉวนสูตรต้นตำรับที่ครองใจเด็ก ม.ศรีปทุม มายาวนาน ด้วยรสชาติที่เผ็ดร้อน ชาลิ้นสะใจ...</p>",
        menuImages: ["Im/หมาล่า2.webp", "Im/หมาล่า3.jpeg", "Im/หมาล่า4.jpg", "https://images.unsplash.com/photo-1555126634-323283e090fa?w=600"],
        info: { hours: "11:00 - 21:00", price: "50 - 150 THB", phone: "082-645-8483", location: "ตรงข้าม ม.ศรีปทุม" }
    },
    "mingle": {
        title: "Meetup Mingle Cafe",
        subtitle: "Board Games & Workspace",
        heroImage: "Im/ร้านเกม1.webp",
        history: "<p>คาเฟ่สำหรับคนรักบอร์ดเกมและการสังสรรค์! ที่นี่มีบอร์ดเกมให้เลือกเล่นมากกว่า 100 เกม...</p>",
        menuImages: ["Im/ร้านเกม2.webp", "https://images.unsplash.com/photo-1606820854416-43923340d16e?w=600"],
        info: { hours: "10:00 - 22:00", price: "100 - 250 THB", phone: "08x-xxx-xxxx", location: "หน้า ม.ศรีปทุม" }
    },
    "suki": {
        title: "สุกี้จานบิน",
        subtitle: "Hotpot Buffet Lover",
        heroImage: "Im/สุกี้จานบิน1.webp",
        history: "<p>สุกี้สายพานเจ้าดังที่เสิร์ฟความอร่อยแบบบินตรงถึงที่! จุดเด่นคือน้ำซุปสูตรลับที่เคี่ยวนานกว่า 8 ชั่วโมง...</p>",
        menuImages: ["Im/สุกี้จานบิน2.webp", "https://images.unsplash.com/photo-1584844627036-7c39b363673d?w=600"],
        info: { hours: "11:00 - 02:00", price: "250 - 400 THB", phone: "095-956-5668", location: "โครงการบางเขน มาร์เก็ต" }
    },
    "chicky": {
        title: "Little Chicky",
        subtitle: "Korean Fried Chicken",
        heroImage: "Im/ร้านไก่1.webp",
        history: "<p>ไก่ทอดเกาหลีโฮมเมดที่ใส่ใจในทุกขั้นตอนการทอด ใช้ไก่สดใหม่หมักเครื่องเทศจนเข้าเนื้อ...</p>",
        menuImages: ["Im/ร้านไก่2.webp", "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600"],
        info: { hours: "10:00 - 20:00", price: "80 - 200 THB", phone: "096-646-3159", location: "ซอยข้าง ม.ศรีปทุม" }
    },
    "burger": {
        title: "Bad Bad Burger",
        subtitle: "Premium Craft Burger",
        heroImage: "Im/สเต็ก1.webp",
        history: "<p>ร้านเบอร์เกอร์พรีเมียมสำหรับคนรักเนื้อ! ทางร้านใช้เนื้อ Dry-Aged ที่บ่มเอง ทำให้ได้รสชาติที่เข้มข้น...</p>",
        menuImages: ["Im/สเต็ก2.webp", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600"],
        info: { hours: "16:00 - 23:00", price: "250 - 450 THB", phone: "095-956-5668", location: "ลาดพร้าว-วังหิน" }
    },
    "oyuwa": {
        title: "โอยั๊วะเกษตร",
        subtitle: "Riverside Hangout",
        heroImage: "Im/โอยั๊วะเกษตร1.webp",
        history: "<p>ร้านอาหารริมแม่น้ำเจ้าพระยาบรรยากาศดีระดับตำนาน เป็นสถานที่ยอดฮิตสำหรับการจัดเลี้ยงสายรหัส...</p>",
        menuImages: ["Im/โอยั๊วะเกษตร2.webp", "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600"],
        info: { hours: "17:00 - 24:00", price: "300 - 600 THB", phone: "081-808-9885", location: "ริมแม่น้ำ (ท่าน้ำนนท์)" }
    },
    "uptojug": {
        title: "Uptojug Kitchen",
        subtitle: "Fusion Cafe & Restaurant",
        heroImage: "Im/Uptojug1.webp",
        history: "<p>คาเฟ่และร้านอาหารสไตล์ฟิวชั่นที่ตกแต่งร้านได้สวยงามน่านั่ง มีเมนูหลากหลายทั้งไทยและตะวันตก...</p>",
        menuImages: ["Im/Uptojug2.webp", "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600"],
        info: { hours: "10:00 - 19:00", price: "200 - 400 THB", phone: "061-542-6666", location: "ในซอยพหลโยธิน" }
    },
    "wallace": {
        title: "Wallace",
        subtitle: "Fine Dining Experience",
        heroImage: "Im/Wallace1.webp",
        history: "<p>สัมผัสประสบการณ์ Fine Dining ในบรรยากาศสุดหรูหราแบบยุโรป เสิร์ฟอาหารคุณภาพเยี่ยมโดยเชฟระดับประเทศ...</p>",
        menuImages: ["Im/Wallace2.webp", "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600"],
        info: { hours: "11:00 - 22:00", price: "800+ THB", phone: "063-021-0537", location: "ซอยอารีย์" }
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