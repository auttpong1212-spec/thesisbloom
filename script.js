document.addEventListener('DOMContentLoaded', function() {
    // โค้ดส่วน Mobile Menu Toggle เดิม...
    const menuIcon = document.querySelector('.menu-icon');
    const nav = document.querySelector('.nav');
    
    if (menuIcon && nav) {
        menuIcon.addEventListener('click', function() {
            nav.classList.toggle('open');
            document.body.classList.toggle('menu-active'); 
        });

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (nav.classList.contains('open')) {
                    nav.classList.remove('open');
                    document.body.classList.remove('menu-active');
                }
            });
        });
    }

    // --- Smooth Scroll & Page Switcher for ALL internal links ---
    const tourSection = document.getElementById('location-section-tour'); 
    const restaurantSection = document.getElementById('location-section-restaurant'); 
    const contactSection = document.getElementById('contact-section'); 
    const aboutSection = document.getElementById('about-section'); 
    
    const heroSection = document.querySelector('.hero');
    const tourHero = document.getElementById('tour-hero');
    const restaurantHero = document.getElementById('restaurant-hero');
    const contactHero = document.getElementById('contact-hero'); 
    const aboutHero = document.getElementById('about-hero'); 
    const ctaSection = document.querySelector('.call-to-action-section');
    
    // กำหนด CSS Variable สำหรับ Parallax Background ของส่วนรายการและติดต่อ
    if (tourSection && tourSection.getAttribute('data-bg-image')) {
        tourSection.style.setProperty('--bg-url', `url(${tourSection.getAttribute('data-bg-image')})`);
    }
    if (restaurantSection && restaurantSection.getAttribute('data-bg-image')) {
        restaurantSection.style.setProperty('--bg-url', `url(${restaurantSection.getAttribute('data-bg-image')})`);
    }
    if (contactSection && contactSection.getAttribute('data-bg-image')) { 
        contactSection.style.setProperty('--bg-url', `url(${contactSection.getAttribute('data-bg-image')})`);
    }


    /**
     * @function showHomePage
     * @description แสดงส่วนหลัก (Hero, Hero Images, CTA) และซ่อนส่วนรายการสถานที่/ติดต่อ
     */
    function showHomePage() {
        // ซ่อนส่วนรายการก่อนที่จะแสดงส่วนหลัก
        if (tourSection) tourSection.style.display = 'none'; 
        if (restaurantSection) restaurantSection.style.display = 'none'; 
        if (contactSection) contactSection.style.display = 'none'; 
        if (aboutSection) aboutSection.style.display = 'none'; 
        
        // ให้เวลาเล็กน้อยเพื่อให้ Transition ของส่วนรายการทำงาน
        setTimeout(() => {
            if (heroSection) heroSection.style.display = 'flex'; 
            if (tourHero) tourHero.style.display = 'flex';       
            if (restaurantHero) restaurantHero.style.display = 'flex'; 
            if (contactHero) contactHero.style.display = 'flex'; 
            if (aboutHero) aboutHero.style.display = 'flex'; 
            if (ctaSection) ctaSection.style.display = 'flex';   
        }, 100); // 100ms delay 
        
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }

    /**
     * @function showContentSection
     * @description ซ่อนส่วนหลักและแสดงส่วนรายการสถานที่/ติดต่อตามที่ระบุ
     * @param {HTMLElement} targetSection - ส่วนเนื้อหาที่ต้องการแสดง
     */
    function showContentSection(targetSection) { 
        if (targetSection) {
            // ซ่อนส่วนหลัก
            if (heroSection) heroSection.style.display = 'none';
            if (tourHero) tourHero.style.display = 'none';
            if (restaurantHero) restaurantHero.style.display = 'none';
            if (contactHero) contactHero.style.display = 'none'; 
            if (aboutHero) aboutHero.style.display = 'none'; 
            if (ctaSection) ctaSection.style.display = 'none'; 
            
            // ซ่อนส่วนรายการอื่น ๆ
            if (tourSection) tourSection.style.display = 'none'; 
            if (restaurantSection) restaurantSection.style.display = 'none';
            if (contactSection) contactSection.style.display = 'none'; 
            if (aboutSection) aboutSection.style.display = 'none'; 

            // แสดงส่วนที่ต้องการ (Opacity จะถูกจัดการโดย CSS Transition)
            targetSection.style.display = 'flex'; 
            
            // เลื่อนไปที่ส่วนนั้น
            window.scrollTo({
                top: targetSection.offsetTop - 80, 
                behavior: 'smooth' 
            });
        }
    }
    
    // ตัวจัดการ Back to Home
    document.querySelectorAll('.back-to-home-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            showHomePage();
        });
    });


    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href'); 
            const targetSection = document.querySelector(targetId);

            // ตรวจสอบว่าลิงก์นี้เป็นปุ่ม 'View' หรือไม่
            if (this.classList.contains('view-tour') || this.classList.contains('view-restaurant') || this.classList.contains('view-contact') || this.classList.contains('view-about')) {
                e.preventDefault(); 
                
                if (targetId === '#location-section-tour') {
                    showContentSection(tourSection);
                } else if (targetId === '#location-section-restaurant') {
                    showContentSection(restaurantSection);
                } else if (targetId === '#contact-section') {
                    showContentSection(contactSection);
                } else if (targetId === '#about-section') { 
                    showContentSection(aboutSection);
                }
                return; 
            }
            
            // Smooth Scroll เดิม (สำหรับลิงก์ NAV ที่ไม่ใช่ View)
            e.preventDefault();
            
            if (targetSection) {
                // ถ้าเป็นลิงก์ใน Nav Bar (สถานที่ท่องเที่ยว, ร้านอาหารแนะนำ, ติดต่อเรา หรือ เกี่ยวกับเรา)
                if (targetId === '#location-section-tour') {
                    showContentSection(tourSection);
                } else if (targetId === '#location-section-restaurant') {
                    showContentSection(restaurantSection);
                } else if (targetId === '#contact-section') { 
                    showContentSection(contactSection);
                } else if (targetId === '#about-section') { 
                    showContentSection(aboutSection);
                } else {
                    // Smooth Scroll ธรรมดาสำหรับส่วนอื่น ๆ
                    window.scrollTo({
                        top: targetSection.offsetTop - 80, 
                        behavior: 'smooth' 
                    });
                }
            }
        });
    });


    // --- Modal Functionality (Login, Detail, Search, Review) ---
    // ตัวแปร Modal
    const loginModal = document.getElementById('loginModal');
    const detailModal = document.getElementById('detailModal');
    const searchModal = document.getElementById('searchModal'); 
    const reviewModal = document.getElementById('reviewModal'); 

    // ตัวแปรปุ่มและฟอร์ม
    const loginForm = document.getElementById('loginForm');
    const searchForm = document.getElementById('searchForm');
    const contactForm = document.getElementById('contactForm'); 
    const accountToggle = document.getElementById('accountToggle'); 
    const searchToggle = document.getElementById('searchToggle');

    // ตัวแปรสำหรับ Detail Modal
    const modalTitle = document.getElementById('modalTitle');
    const modalDetails = document.getElementById('modalDetails');
    const modalImage = document.getElementById('modalImage');
    const modalBudget = document.getElementById('modalBudget'); 
    const modalTags = document.getElementById('modalTags');     
    const modalTipBox = document.getElementById('modalTipBox'); 
    const viewReviewsBtn = document.getElementById('viewReviewsBtn'); 
    
    // NEW: ตัวแปรสำหรับ Gallery
    const thumbnailNav = document.getElementById('thumbnailNav'); 

    // ตัวแปรสำหรับ Review Modal
    const reviewModalTitle = document.getElementById('reviewTargetName'); 

    // ตัวแปรปุ่มปิด (X)
    const loginCloseBtn = document.querySelector('#loginModal .close-btn');
    const detailCloseBtn = document.querySelector('#detailModal .close-btn');
    const searchCloseBtn = document.querySelector('#searchModal .close-btn');
    const reviewCloseBtn = document.querySelector('#reviewModal .close-btn'); 

    
    // ------------------------------------------------------------------
    // NEW: ฟังก์ชัน Gallery
    // ------------------------------------------------------------------

    /**
     * @function updateGallery
     * @description สร้าง Thumbnail และกำหนดรูปภาพหลัก
     * @param {string} imageString - string ของ URL รูปภาพคั่นด้วย comma
     */
    function updateGallery(imageString) {
        if (!imageString || !modalImage || !thumbnailNav) return;

        const imageUrls = imageString.split(',');
        thumbnailNav.innerHTML = ''; // Clear previous thumbnails

        imageUrls.forEach((url, index) => {
            // 1. สร้าง Thumbnail
            const img = document.createElement('img');
            img.src = url.trim();
            img.alt = `Thumbnail ${index + 1}`;
            img.setAttribute('data-full-src', url.trim());
            
            // กำหนดรูปแรกเป็น Active
            if (index === 0) {
                img.classList.add('active');
                modalImage.src = url.trim(); // Set main image to the first one
            }

            // 2. เพิ่ม Event Listener สำหรับเปลี่ยนรูปหลัก
            img.addEventListener('click', function() {
                modalImage.src = this.getAttribute('data-full-src');
                
                // อัปเดต Active Class
                thumbnailNav.querySelectorAll('img').forEach(thumb => {
                    thumb.classList.remove('active');
                });
                this.classList.add('active');
            });

            thumbnailNav.appendChild(img);
        });
        
        // ถ้ามีแค่รูปเดียว ให้ซ่อนแถบ Thumbnail
        if (imageUrls.length <= 1) {
            thumbnailNav.style.display = 'none';
        } else {
            thumbnailNav.style.display = 'flex';
        }
    }


    // ------------------------------------------------------------------
    // A. ฟังก์ชันเปิด Modal (UPDATED)
    // ------------------------------------------------------------------

    // 1. เปิด Login Modal (โค้ดเดิม)
    if (accountToggle && loginModal) {
        accountToggle.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'flex'; 
            document.body.style.overflow = 'hidden'; 
            
            if (nav.classList.contains('open')) {
                nav.classList.remove('open');
                document.body.classList.remove('menu-active');
            }
        });
    }
    
    // 2. เปิด Search Modal (โค้ดเดิม)
    if (searchToggle && searchModal) {
        searchToggle.addEventListener('click', function(e) {
            e.preventDefault();
            searchModal.style.display = 'flex'; 
            document.body.style.overflow = 'hidden'; 

            if (nav.classList.contains('open')) {
                nav.classList.remove('open');
                document.body.classList.remove('menu-active');
            }
        });
    }

    /**
     * 3. เปิด Detail Modal (เมื่อคลิกรายการสถานที่/ร้านอาหาร)
     * @param {string} title - ชื่อสถานที่/ร้านอาหาร
     * @param {string} details - รายละเอียด/คำบรรยายหลัก
     * @param {string} budget - ข้อมูลงบประมาณ
     * @param {string} tags - แท็กจุดเด่น
     * @param {string} images - URL รูปภาพคั่นด้วย comma
     */
    function openDetailModal(title, details, budget, tags, images) { // **UPDATED: รับ images parameter**
        modalTitle.textContent = title;
        modalDetails.textContent = details;
        
        // **NEW: อัปเดต Gallery ด้วยชุดรูปภาพที่ส่งมา**
        updateGallery(images);
        
        // แสดงงบประมาณ
        modalBudget.textContent = budget || 'ไม่มีข้อมูล';

        // จัดการแท็ก
        modalTags.innerHTML = ''; 
        if (tags) {
            const tagArray = tags.split(' '); 
            tagArray.forEach(tag => {
                if (tag.startsWith('#')) {
                    const tagSpan = document.createElement('span');
                    tagSpan.className = 'modal-tag';
                    tagSpan.textContent = tag;
                    modalTags.appendChild(tagSpan);
                }
            });
        }

        // UPDATED: จัดการกล่องคำแนะนำเฉพาะรายการ (โค้ดเดิม)
        modalTipBox.style.display = 'flex';
        modalTipBox.innerHTML = ''; 
        
        let recommendation = '';
        switch (title) {
            case "วัดพระศรีมหาธาตุ":
                recommendation = '💡 ควรเยี่ยมชมแต่โดยสุภาพ (ไม่ส่งเสียงดัง), ตรวจสอบเวลาทำการ และสามารถเดินทางได้โดยรถไฟฟ้า BTS สถานีวัดพระศรีมหาธาตุ';
                break;
            case "ตลาดนัดรถไฟ":
                recommendation = '💡 เหมาะสำหรับการมาช่วงเย็นวันศุกร์ถึงอาทิตย์ ควรมาเร็วเพื่อหลีกเลี่ยงคนเยอะ และเตรียมเงินสดสำหรับร้านสตรีทฟู้ดเล็กๆ';
                break;
            case "พิพิธภัณฑ์ศิลปะร่วมสมัย (MOCA)":
                recommendation = '💡 ควรจองตั๋วล่วงหน้าเพื่อความสะดวกในการเข้าชม และเผื่อเวลาอย่างน้อย 2-3 ชั่วโมงสำหรับเสพงานศิลป์อย่างเต็มที่';
                break;
            case "ตลาดนัดจตุจักรกลางคืน":
                recommendation = '💡 พื้นที่กว้างมาก ควรเตรียมแผนที่หรือนัดหมายจุดพบปะกับเพื่อน และระวังของมีค่าในช่วงที่คนหนาแน่น';
                break;
            case "เซ็นทรัลรามอินทรา":
                recommendation = '💡 เป็นศูนย์รวมความบันเทิงและช้อปปิ้งครบวงจร เหมาะสำหรับกิจกรรมครอบครัวในช่วงสุดสัปดาห์';
                break;
            case "Wallace":
                recommendation = '💡 ร้านอาหารสไตล์ยุโรปพรีเมียม ควรสวมชุดสุภาพ และสำรองที่นั่งล่วงหน้าเพื่อประสบการณ์ที่ดีที่สุด';
                break;
            case "โอยั๊วะเกษตร":
                recommendation = '💡 ร้านซีฟู้ดชื่อดัง เหมาะสำหรับการมาทานเป็นกลุ่มใหญ่ ควรโทรสอบถามเมนูแนะนำและสำรองโต๊ะในช่วงเย็น';
                break;
            default:
                modalTipBox.style.display = 'none';
                break;
        }

        if (recommendation) {
            modalTipBox.innerHTML = recommendation;
        }


        // กำหนดชื่อสถานที่ในปุ่มรีวิว
        viewReviewsBtn.setAttribute('data-target-title', title);
        
        detailModal.style.display = 'flex';
        // NEW: บังคับล็อคการเลื่อนเมื่อ Modal เปิด
        document.body.style.overflow = 'hidden'; 
    }
    
    // 4. ฟังก์ชันเปิด Review Modal (โค้ดเดิม)
    function openReviewModal(title) {
        reviewModalTitle.textContent = title;
        detailModal.style.display = 'none'; // ซ่อน Detail Modal ก่อน
        reviewModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; 
    }

    // UPDATED: Event Listener สำหรับการ์ด (ดึง data-images มาด้วย)
    const allCards = document.querySelectorAll('#locationList .location-card, #restaurantList .location-card');
    
    allCards.forEach(card => {
        // ใช้ 'click' Event โดยตรงบน Card เพื่อความมั่นใจ
        card.addEventListener('click', function(e) {
            e.preventDefault();
            // ใช้ this (ซึ่งคือ card) ดึง attribute โดยตรง
            const title = this.getAttribute('data-title');
            const details = this.getAttribute('data-details');
            const budget = this.getAttribute('data-budget');  
            const tags = this.getAttribute('data-tags');    
            const images = this.getAttribute('data-images');  // **NEW: ดึง data-images**
            
            if (title && details) {
                openDetailModal(title, details, budget, tags, images); // **UPDATED: ส่ง images ไปด้วย**
            } else {
                console.error("Missing data-title or data-details on clicked card.");
            }
        });
    }
    );

    // Event Listener สำหรับปุ่ม "ดูรีวิว" ภายใน Detail Modal (โค้ดเดิม)
    if (viewReviewsBtn) {
        viewReviewsBtn.addEventListener('click', function() {
            const targetTitle = this.getAttribute('data-target-title');
            if (targetTitle) {
                openReviewModal(targetTitle);
            }
        });
    }


    // --- ADDED: Force Video Playback (If using video background) --- (โค้ดเดิม)
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        heroVideo.play().catch(error => {
            console.error('Video playback failed (often due to browser autoplay policies):', error);
        });
    }

    // ------------------------------------------------------------------
    // เริ่มต้นแสดงหน้าหลักและซ่อนส่วนรายการสถานที่/ติดต่อ (โค้ดเดิม)
    // ------------------------------------------------------------------
    showHomePage(); 


    // ------------------------------------------------------------------
    // B. ฟังก์ชันปิด Modal และ Submit Form (โค้ดเดิม)
    // ------------------------------------------------------------------
    
    /**
     * @function closeModal
     * @description ปิด Modal และคืนค่าการเลื่อนของ Body หากไม่มี Modal อื่นหรือ Mobile Menu เปิดอยู่
     */
    function closeModal(modalElement) {
        if (modalElement) {
            modalElement.style.display = 'none';
        }
        
        // ตรวจสอบสถานะ Mobile Menu
        const isMenuOpen = document.body.classList.contains('menu-active');
        
        // ถ้าเมนูเปิดอยู่ ให้คงสถานะ overflow: hidden ไว้
        if (isMenuOpen) {
            return; 
        }

        // UPDATED: ตรวจสอบสถานะ Modal อื่นๆ และคืนค่าการเลื่อนอย่างเด็ดขาด
        // ใช้ delay สั้นๆ เพื่อให้แน่ใจว่า Modal ที่กำลังจะปิดได้ถูกซ่อนแล้ว
        setTimeout(() => {
            const anyModalOpen = loginModal.style.display === 'flex' || detailModal.style.display === 'flex' || searchModal.style.display === 'flex' || reviewModal.style.display === 'flex';
            
            // UPDATED: ใช้การคืนค่าแบบตั้งค่า `auto` โดยตรง เพื่อแก้ไขปัญหา Lock Scroll
            if (!anyModalOpen) {
                 document.body.style.overflow = 'auto';
            }
        }, 100); 
    }

    // ปิดเมื่อคลิกปุ่ม 'X'
    if (loginCloseBtn) loginCloseBtn.addEventListener('click', () => closeModal(loginModal));
    if (detailCloseBtn) detailCloseBtn.addEventListener('click', () => closeModal(detailModal));
    if (searchCloseBtn) searchCloseBtn.addEventListener('click', () => closeModal(searchModal));
    if (reviewCloseBtn) reviewCloseBtn.addEventListener('click', () => closeModal(reviewModal));


    // ปิดเมื่อคลิกนอก Modal
    window.addEventListener('click', function(event) {
        if (event.target === detailModal) {
            closeModal(detailModal);
        }
        if (event.target === loginModal) {
            closeModal(loginModal);
        }
        if (event.target === searchModal) { 
            closeModal(searchModal);
        }
        if (event.target === reviewModal) { 
            closeModal(reviewModal);
        }
    });

    // จำลองการ Login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Login Attempted for: ' + document.getElementById('email').value + '.');
            closeModal(loginModal); 
            loginForm.reset(); 
        });
    }

    // จำลองการค้นหา
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = document.getElementById('searchQuery').value;
            
            if (searchTerm) {
                alert(`Searching BLOOM for: "${searchTerm}".`);
                closeModal(searchModal); 
                searchForm.reset();
            }
        });
    }

    // จำลองการส่งฟอร์มติดต่อ (Contact Form)
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const message = document.getElementById('contactMessage').value;
            
            alert(`ข้อความจากคุณ ${name} ได้ถูกส่งแล้ว\nอีเมล: ${email}\nข้อความ: "${message.substring(0, 30)}..."\n\n(นี่คือการจำลองการส่งฟอร์ม)`);
            
            contactForm.reset();
        });
    }

    // --- ADDED: Animated Counter for 'About Us' Stats ---
    const statsSection = document.querySelector('.about-stats');
    let hasAnimated = false; // Flag to ensure animation runs only once

    function animateCounters() {
        const counters = document.querySelectorAll('.stat-item h4');
        const speed = 200; // The lower the number, the faster the count

        counters.forEach(counter => {
            const updateCount = () => {
                const targetText = counter.innerText; // e.g., "10+"
                const target = parseInt(targetText.replace('+', '')); // Get the number part
                const count = parseInt(counter.getAttribute('data-count') || '0');

                const increment = target / speed;

                if (count < target) {
                    counter.setAttribute('data-count', Math.ceil(count + increment));
                    counter.innerText = Math.ceil(count + increment);
                    setTimeout(updateCount, 1);
                } else {
                    counter.innerText = targetText; // Set back to original text like "10+"
                }
            };
            updateCount();
        });
        hasAnimated = true; // Set flag to true after animation starts
    }

    // Use Intersection Observer for better performance
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Check if the element is in view and animation hasn't run yet
            if (entry.isIntersecting && !hasAnimated) {
                animateCounters();
                observer.unobserve(entry.target); // Stop observing after animation
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the element is visible
    });

    if (statsSection) {
        observer.observe(statsSection);
    }

});