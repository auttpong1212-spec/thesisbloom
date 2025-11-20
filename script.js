document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. Init Data & State ---
    let favorites = JSON.parse(localStorage.getItem('bloomFavorites')) || [];
    
    // --- 2. Menu Navigation ---
    const menuIcon = document.querySelector('.menu-icon');
    const nav = document.querySelector('.nav');
    if (menuIcon && nav) {
        menuIcon.addEventListener('click', function() {
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

    // --- 3. Sections Switching ---
    const sections = {
        home: [document.querySelector('.hero'), document.getElementById('tour-hero'), document.getElementById('restaurant-hero'), document.getElementById('contact-hero'), document.getElementById('about-hero')],
        tour: document.getElementById('location-section-tour'),
        dining: document.getElementById('location-section-restaurant'),
        contact: document.getElementById('contact-section'),
        about: document.getElementById('about-section')
    };

    function hideAll() { Object.values(sections).flat().forEach(el => { if(el) el.style.display = 'none'; }); }
    function showHomePage() { hideAll(); sections.home.forEach(el => { if(el) el.style.display = 'flex'; }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    function showSection(section) { if (!section) return; hideAll(); section.style.display = 'flex'; window.scrollTo({ top: 0, behavior: 'smooth' }); }

    // Navigation Listeners
    document.querySelectorAll('.back-to-home-btn').forEach(btn => { btn.addEventListener('click', (e) => { e.preventDefault(); showHomePage(); }); });
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (this.classList.contains('back-to-home-btn')) return;
            if (id === '#location-section-tour') { e.preventDefault(); showSection(sections.tour); }
            else if (id === '#location-section-restaurant') { e.preventDefault(); showSection(sections.dining); }
            else if (id === '#contact-section') { e.preventDefault(); showSection(sections.contact); }
            else if (id === '#about-section') { e.preventDefault(); showSection(sections.about); }
            else {
                const target = document.querySelector(id);
                if (target && sections.home[0].style.display !== 'none') { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
            }
        });
    });

    // --- 4. FAVORITES SYSTEM ---
    function toggleFavorite(title, btn) {
        const index = favorites.indexOf(title);
        const icon = btn.querySelector('i');
        
        if (index === -1) {
            favorites.push(title); // Add
            btn.classList.add('active');
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
        } else {
            favorites.splice(index, 1); // Remove
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
            if(btn) {
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

    // --- 6. Modal System ---
    const detailModal = document.getElementById('detailModal');
    const detailClose = document.querySelector('.detail-close-btn');
    
    function updateGallery(imageString) {
        const nav = document.getElementById('thumbnailNav'); const main = document.getElementById('modalImage');
        if (!main || !nav) return;
        nav.innerHTML = ''; main.src = ''; 
        if (!imageString) { nav.style.display = 'none'; return; }
        const urls = imageString.split(',');
        urls.forEach((url, i) => {
            const img = document.createElement('img'); img.src = url.trim();
            if (i === 0) { img.classList.add('active'); main.src = url.trim(); }
            img.addEventListener('click', function() { main.src = url.trim(); nav.querySelectorAll('img').forEach(t => t.classList.remove('active')); this.classList.add('active'); });
            nav.appendChild(img);
        });
        nav.style.display = urls.length <= 1 ? 'none' : 'flex';
    }

    function openDetail(data) {
        if(!detailModal) return;
        document.getElementById('modalTitle').textContent = data.title || '';
        document.getElementById('modalDetails').textContent = data.details || '';
        document.getElementById('modalBudget').textContent = data.budget ? `Budget: ${data.budget}` : '';
        
        document.getElementById('modalHighlight').textContent = data.highlight || '-';
        document.getElementById('modalHours').textContent = data.hours || 'See details';
        document.getElementById('modalPhone').textContent = data.phone || '-';
        document.getElementById('modalParking').textContent = data.parking || '-';

        updateGallery(data.images);
        
        const tagBox = document.getElementById('modalTags'); tagBox.innerHTML = '';
        if(data.tags) data.tags.split(' ').forEach(t => {
            if(t.startsWith('#')) { const s = document.createElement('span'); s.className='modal-tag'; s.textContent=t; tagBox.appendChild(s); }
        });

        const mapBtn = document.getElementById('googleMapBtn');
        if(mapBtn) {
            mapBtn.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.title)}`;
        }

        detailModal.style.display = 'flex'; 
        document.body.style.overflow = 'hidden';
    }

    document.querySelectorAll('.location-card').forEach(card => {
        // Heart Click
        const favBtn = card.querySelector('.favorite-btn');
        if(favBtn) {
            favBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const title = card.getAttribute('data-title');
                toggleFavorite(title, this);
            });
        }

        // Card Click
        card.addEventListener('click', function(e) {
            if(e.target.closest('.favorite-btn')) return;
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

    function closeModal(m) { if(m) m.style.display='none'; document.body.style.overflow='auto'; }
    if(detailClose) detailClose.addEventListener('click', () => closeModal(detailModal));
    window.addEventListener('click', (e) => { 
        if(e.target === detailModal) closeModal(detailModal); 
        if(e.target === document.getElementById('loginModal')) closeModal(document.getElementById('loginModal'));
        if(e.target === document.getElementById('signupModal')) closeModal(document.getElementById('signupModal'));
        if(e.target === document.getElementById('searchModal')) closeModal(document.getElementById('searchModal'));
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

    // Open/Close Handlers
    if(loginClose) loginClose.addEventListener('click', () => closeModal(loginModal));
    if(signupClose) signupClose.addEventListener('click', () => closeModal(signupModal));
    
    if(openSignupBtn) {
        openSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(loginModal);
            signupModal.style.display = 'flex';
        });
    }

    // Check Status
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
            accountToggle.onclick = function(e) {
                e.preventDefault();
                if(confirm('Log out from ' + user + '?')) handleLogout();
            };
        } else {
            accountToggle.classList.remove('logged-in');
            accountToggle.onclick = function(e) {
                e.preventDefault();
                loginModal.style.display = 'flex';
            };
        }
    }

    function handleLogout() {
        localStorage.removeItem('bloomUser');
        alert('Logged out successfully!');
        checkLoginStatus();
        window.location.reload();
    }

    // Signup Logic
    if(signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const pass = document.getElementById('signupPassword').value;

            // Save user to LocalStorage
            const userObj = { name: name, email: email, pass: pass };
            localStorage.setItem('registeredUser', JSON.stringify(userObj));

            alert('Account created successfully! Please login.');
            closeModal(signupModal);
            loginModal.style.display = 'flex';
        });
    }

    // Login Logic
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            // Get Registered Data
            const registeredUser = JSON.parse(localStorage.getItem('registeredUser'));

            // Logic: Check against Registered Data OR Demo Data
            let isLoginSuccess = false;

            if (registeredUser && email === registeredUser.email && password === registeredUser.pass) {
                isLoginSuccess = true;
            } else if (email === 'admin@spu.ac.th' && password === '1234') {
                isLoginSuccess = true;
            }

            if (isLoginSuccess) {
                localStorage.setItem('bloomUser', email);
                alert('Welcome back!');
                closeModal(loginModal);
                checkLoginStatus();
            } else {
                alert('Invalid email or password!');
            }
        });
    }

    checkLoginStatus(); // Run on load

    // --- 8. Search System ---
    const searchModal = document.getElementById('searchModal');
    const searchToggle = document.getElementById('searchToggle');
    const searchClose = document.querySelector('.search-close-btn');
    const searchForm = document.getElementById('searchForm');

    if(searchToggle) searchToggle.addEventListener('click', (e) => { e.preventDefault(); searchModal.style.display='flex'; });
    if(searchClose) searchClose.addEventListener('click', () => closeModal(searchModal));

    if(searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('searchQuery').value.toLowerCase();
            const allCards = document.querySelectorAll('.location-card');
            closeModal(searchModal);
            
            if(query) {
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
                if(!found) alert('No results found for "' + query + '"');
            }
        });
    }

    showHomePage();
});