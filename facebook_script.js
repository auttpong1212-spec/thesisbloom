document.addEventListener('DOMContentLoaded', () => {
    // ฟังการคลิกจากทั้ง Body เพื่อคุมทุกปุ่มในหน้า
    document.body.addEventListener('click', (e) => {
        
        // 1. ระบบกด Like
        const likeBtn = e.target.closest('.like-btn');
        if (likeBtn) {
            likeBtn.classList.toggle('active');
            const icon = likeBtn.querySelector('i');
            
            if (likeBtn.classList.contains('active')) {
                icon.className = 'fa-solid fa-thumbs-up';
                likeBtn.style.color = '#0866ff'; // เปลี่ยนเป็นสีฟ้า Facebook
            } else {
                icon.className = 'fa-regular fa-thumbs-up';
                likeBtn.style.color = ''; // กลับเป็นสีเดิม (สีเทา)
            }
        }

        // 2. ระบบเปิดกล่องคอมเมนต์
        const commentBtn = e.target.closest('.comment-btn');
        if (commentBtn) {
            const section = commentBtn.closest('.fb-post').querySelector('.comment-section');
            section.style.display = (section.style.display === 'block') ? 'none' : 'block';
        }

        // 3. ระบบ Share
        if (e.target.closest('.share-btn')) {
            alert('แชร์เนื้อหาจาก BLOOM ไปยังหน้า Feed ของคุณแล้ว! 🚀');
        }

        // 5. ระบบ Lightbox (ดูรูปภาพขนาดใหญ่)
        // เช็คว่าเป็นรูปในโพสต์ (.post-main-img) หรือรูปใน Grid ด้านข้าง
        if (e.target.classList.contains('post-main-img') || (e.target.tagName === 'IMG' && e.target.closest('.fb-photo-grid'))) {
            const src = e.target.src;
            const lightbox = document.getElementById('fbLightbox');
            const lightboxImg = document.getElementById('lightboxImg');
            if (lightbox && lightboxImg) {
                lightbox.style.display = 'flex';
                lightboxImg.src = src;
                document.body.style.overflow = 'hidden'; // ล็อกไม่ให้เลื่อนหน้าหลัง
            }
        }

        // ปิด Lightbox (กดปุ่ม X หรือกดที่พื้นหลัง)
        if (e.target.classList.contains('lightbox-close') || e.target.classList.contains('lightbox-modal')) {
            const lightbox = document.getElementById('fbLightbox');
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto'; // ปลดล็อกการเลื่อนหน้า
        }
    });

    // 4. ระบบเพิ่มคอมเมนต์ (กด Enter)
    document.body.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.placeholder.includes('Enter')) {
            const list = e.target.closest('.comment-section').querySelector('.comment-list');
            const val = e.target.value.trim();
            if (val !== "") {
                const div = document.createElement('div');
                div.style.cssText = "display:flex; gap:8px; margin-bottom:10px; font-size:13px;";
                div.innerHTML = `<div style="width:32px; height:32px; border-radius:50%; background:#FFCE70; display:flex; align-items:center; justify-content:center; color:#0866ff; font-weight:bold;">Me</div>
                                 <div style="background:#3a3b3c; padding:8px 12px; border-radius:18px;"><b>You (Guest)</b><br>${val}</div>`;
                list.appendChild(div);
                e.target.value = "";
            }
        }
    });
});