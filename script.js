document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. Init Data & State ---
    let favorites = JSON.parse(localStorage.getItem('bloomFavorites')) || [];
    let currentRating = 0; // Variable to store selected rating

    // --- MOCK REVIEW DATA (Massive List) ---
    const reviewsData = {
        "MOCA Museum": [
            { name: "Ploy Ch.", avatar: "https://i.pravatar.cc/150?img=5", rating: 5, text: "มุมถ่ายรูปเยอะมากกก แสงสวยทุกจุด เตรียมชุดไปเปลี่ยนได้เลย คุ้มราคาบัตรนักศึกษาค่ะ", date: "2 days ago" },
            { name: "Art Ken", avatar: "https://i.pravatar.cc/150?img=11", rating: 4, text: "งานศิลปะดีครับ บรรยากาศเงียบสงบ แอร์เย็นฉ่ำ เดินเพลินๆ ได้ 2-3 ชั่วโมงเลย", date: "1 week ago" },
            { name: "Nong Nat", avatar: "https://i.pravatar.cc/150?img=32", rating: 5, text: "ชอบห้อง Richard Green มาก แสงสวยเหมือนอยู่ยุโรป", date: "1 month ago" },
            { name: "Camera Man", avatar: "https://i.pravatar.cc/150?img=60", rating: 4, text: "ห้ามใช้แฟลชและขาตั้งกล้องนะครับ แต่แสงธรรมชาติสวยอยู่แล้ว ถ่าย Portrait สวยมาก", date: "2 months ago" },
            { name: "Somsri", avatar: "https://i.pravatar.cc/150?img=44", rating: 5, text: "กาแฟร้านข้างล่างอร่อยค่ะ เดินเหนื่อยๆ ลงมาพักจิบกาแฟฟินมาก", date: "3 months ago" }
        ],
        "วัดพระศรีมหาธาตุ": [
            { name: "Somchai Sai-Mu", avatar: "https://i.pravatar.cc/150?img=13", rating: 5, text: "มาไหว้ขอพรช่วงสอบครับ สงบ ร่มรื่น เดินทางสะดวกติด BTS เลย", date: "Yesterday" },
            { name: "Auntie Da", avatar: "https://i.pravatar.cc/150?img=45", rating: 5, text: "วัดสะอาดมาก มีที่จอดรถเยอะ วันพระคนจะเยอะหน่อยนะคะ", date: "3 days ago" },
            { name: "User99", avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png", rating: 4, text: "สวยงามครับ เจดีย์ขาวองค์ใหญ่มาก", date: "2 months ago" },
            { name: "Mod Dam", avatar: "https://i.pravatar.cc/150?img=23", rating: 5, text: "มาให้อาหารปลาที่นี่ประจำ ร่มรื่นดีค่ะ", date: "1 week ago" },
            { name: "Big Boy", avatar: "https://i.pravatar.cc/150?img=59", rating: 5, text: "สายมูห้ามพลาด ท้าวเวสสุวรรณศักดิ์สิทธิ์มาก", date: "1 week ago" },
            { name: "Lisa", avatar: "https://i.pravatar.cc/150?img=34", rating: 4, text: "มาเวียนเทียนทุกปีค่ะ การจัดการดี", date: "1 month ago" }
        ],
        "Co-Working Space & Library": [
            { name: "Dek SPU 66", avatar: "https://i.pravatar.cc/150?img=3", rating: 5, text: "ที่สิงสถิตช่วง Midterm แอร์เย็น เน็ตแรง ปลั๊กเยอะ ดีสุดๆ", date: "10 mins ago" },
            { name: "BookWorm", avatar: "https://i.pravatar.cc/150?img=9", rating: 4, text: "เงียบดีครับ แต่ช่วงบ่ายๆ โต๊ะเต็มเร็วมาก ต้องรีบมาจอง", date: "2 days ago" },
            { name: "Group Work Team", avatar: "https://i.pravatar.cc/150?img=53", rating: 5, text: "ห้องประชุมกลุ่มดีมาก เสียงไม่ดังรบกวนข้างนอก", date: "3 days ago" },
            { name: "Sleepy Head", avatar: "https://i.pravatar.cc/150?img=12", rating: 4, text: "โซฟานุ่มเกินไปครับ นั่งอ่านหนังสือแล้วหลับตลอดเลย 555", date: "1 week ago" },
            { name: "Tech Geek", avatar: "https://i.pravatar.cc/150?img=68", rating: 5, text: "Wi-Fi แรงสะใจ โหลดไฟล์งานไวมาก รักเลย", date: "2 weeks ago" },
            { name: "Freshy", avatar: "https://i.pravatar.cc/150?img=26", rating: 5, text: "พี่บรรณารักษ์ใจดีค่ะ หนังสือใหม่ๆ เยอะเลย", date: "3 weeks ago" },
            { name: "No Name", avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png", rating: 3, text: "แอร์หนาวไปหน่อย อย่าลืมพกเสื้อกันหนาวมานะ", date: "1 month ago" }
        ],
        "เมเจอร์ รัชโยธิน": [
            { name: "Movie Buff", avatar: "https://i.pravatar.cc/150?img=60", rating: 5, text: "โรง IMAX ภาพชัดเสียงกระหึ่ม! ป๊อปคอร์นชีสคือเดอะเบสท์", date: "1 hour ago" },
            { name: "Jenny", avatar: "https://i.pravatar.cc/150?img=24", rating: 3, text: "ที่จอดรถหายากนิดนึงช่วงวันหยุด แนะนำให้นั่ง BTS มาสะดวกกว่า", date: "Yesterday" },
            { name: "K.O.", avatar: "https://i.pravatar.cc/150?img=12", rating: 4, text: "ลานเบียร์หน้าห้างบรรยากาศชิลดีครับ ดนตรีสดเพราะ", date: "2 days ago" },
            { name: "Pop Corn Lover", avatar: "https://i.pravatar.cc/150?img=33", rating: 5, text: "ป๊อปคอร์นชีสผสมหวานคือที่สุดดดด กินเพลินจนลืมดูหนัง", date: "1 week ago" },
            { name: "Bowling King", avatar: "https://i.pravatar.cc/150?img=56", rating: 4, text: "เลนโบว์ลิ่งดี เพลงมันส์ โยนสนุกครับ", date: "2 weeks ago" },
            { name: "Sarah", avatar: "https://i.pravatar.cc/150?img=42", rating: 5, text: "โรงหนังสะอาด พนักงานบริการดีค่ะ", date: "3 weeks ago" }
        ],
        "เซ็นทรัล รามอินทรา": [
            { name: "Mommy Pink", avatar: "https://i.pravatar.cc/150?img=44", rating: 4, text: "ห้างปรับปรุงใหม่สวยขึ้นเยอะเลย ของกินชั้นล่างเพียบ เดินสบายคนไม่พลุกพล่าน", date: "Yesterday" },
            { name: "Tee Lek", avatar: "https://i.pravatar.cc/150?img=59", rating: 5, text: "โรงหนังแอร์เย็นมาก เบาะนุ่ม ใหม่สะอาด ชอบครับ", date: "2 days ago" },
            { name: "Shopping Queen", avatar: "https://i.pravatar.cc/150?img=28", rating: 4, text: "B2S ใหญ่มาก เครื่องเขียนครบ เดินเพลินเลย", date: "3 days ago" },
            { name: "Food Fighter", avatar: "https://i.pravatar.cc/150?img=15", rating: 5, text: "ศูนย์อาหาร Food Patio อาหารอร่อย ราคาไม่แพง สะอาด", date: "1 week ago" },
            { name: "Driver", avatar: "https://i.pravatar.cc/150?img=3", rating: 5, text: "ที่จอดรถเยอะดีครับ ไม่ต้องวนหานาน", date: "2 weeks ago" },
            { name: "Cat Lover", avatar: "https://i.pravatar.cc/150?img=19", rating: 4, text: "มีโซน Pet Friendly ด้วย พาน้องแมวมาเดินเล่นได้", date: "1 month ago" }
        ],
        "ตลาดนัดจตุจักรกลางคืน": [
            { name: "Vintage Boy", avatar: "https://i.pravatar.cc/150?img=68", rating: 5, text: "เสื้อผ้ามือสองสวยๆ เยอะมาก ตาดีได้ตาร้ายเสีย ต้องมาเดินดูเอง", date: "Last Friday" },
            { name: "Alice In Wonderland", avatar: "https://i.pravatar.cc/150?img=28", rating: 4, text: "ของกินเยอะ แต่ร้อนหน่อยนะ เตรียมพัดลมมือถือมาด้วย", date: "1 week ago" },
            { name: "Night Owl", avatar: "https://i.pravatar.cc/150?img=51", rating: 5, text: "บรรยากาศดีมาก ของแปลกๆ เยอะ เดินสนุกกว่าตอนกลางวันอีก", date: "2 weeks ago" },
            { name: "Toy Collector", avatar: "https://i.pravatar.cc/150?img=39", rating: 5, text: "เจอของเล่นเก่าหายากที่นี่ ร้านพี่คนขายใจดีลดราคาให้ด้วย", date: "3 weeks ago" },
            { name: "Farang", avatar: "https://i.pravatar.cc/150?img=10", rating: 5, text: "Good vibes! Love the street food here.", date: "1 month ago" }
        ],
        "ตลาดนัดจตุจักรกลางวัน": [
            { name: "Tourist Guy", avatar: "https://i.pravatar.cc/150?img=33", rating: 5, text: "Amazing place! So many things to buy. Coconut ice cream is a must!", date: "Yesterday" },
            { name: "Ja Ae", avatar: "https://i.pravatar.cc/150?img=41", rating: 4, text: "เดินขาลากเลย ของเยอะจริงๆ แนะนำให้มาเช้าๆ แดดไม่ร้อน", date: "Last Sunday" },
            { name: "Plant Lover", avatar: "https://i.pravatar.cc/150?img=49", rating: 5, text: "โซนต้นไม้คือสวรรค์ ราคาถูกกว่าร้านข้างนอกเยอะ", date: "1 week ago" },
            { name: "Fashionista", avatar: "https://i.pravatar.cc/150?img=20", rating: 4, text: "เสื้อผ้าแฟชั่นเยอะมาก ต่อราคาได้นิดหน่อย อย่าลืมพกเงินสดนะ", date: "2 weeks ago" },
            { name: "Local Guide", avatar: "https://i.pravatar.cc/150?img=65", rating: 3, text: "คนเยอะมาก ระวังกระเป๋าด้วยนะครับ", date: "3 weeks ago" }
        ],
        "หม่าล่าเสฉวน": [
            { name: "Spicy Lover", avatar: "https://i.pravatar.cc/150?img=16", rating: 5, text: "เผ็ดชาสะใจ! น้ำจิ้มถั่วปรุงเองอร่อยมาก ราคาไม่แพงเริ่มต้นไม้ละ 5 บาท", date: "30 mins ago" },
            { name: "No Spicy", avatar: "https://i.pravatar.cc/150?img=29", rating: 3, text: "อร่อยนะ แต่รอนานไปหน่อยช่วงเย็น คนเยอะมาก", date: "Yesterday" },
            { name: "Poom", avatar: "https://i.pravatar.cc/150?img=55", rating: 5, text: "ฟองเต้าหู้ทอดคือที่สุด! ต้องสั่งแยกมาจุ่มน้ำซุป", date: "2 days ago" },
            { name: "Late Night Eater", avatar: "https://i.pravatar.cc/150?img=8", rating: 4, text: "ร้านปิดดึกดี เหมาะกับคนหิวรอบดึกอย่างเรา", date: "3 days ago" },
            { name: "Mala Addict", avatar: "https://i.pravatar.cc/150?img=42", rating: 5, text: "กินมาหลายร้าน ร้านนี้เด็ดสุดในย่านนี้แล้ว น้ำซุปหอมเครื่องเทศมาก", date: "1 week ago" },
            { name: "Save Money", avatar: "https://i.pravatar.cc/150?img=3", rating: 5, text: "กินอิ่มในงบ 100 บาท สบายกระเป๋า", date: "1 week ago" }
        ],
        "Meetup Mingle Cafe": [
            { name: "Boardgame Master", avatar: "https://i.pravatar.cc/150?img=52", rating: 5, text: "เกมเยอะมากก เจ้าของร้านสอนเล่นเป็นกันเอง ขนมอร่อยด้วย", date: "Yesterday" },
            { name: "Coffee Time", avatar: "https://i.pravatar.cc/150?img=35", rating: 4, text: "กาแฟดี นั่งทำงานได้ยาวๆ มีปลั๊กให้", date: "2 days ago" },
            { name: "Sweet Tooth", avatar: "https://i.pravatar.cc/150?img=18", rating: 5, text: "บิงซูอร่อยมากกก ถ้วยใหญ่กิน 3 คนยังจุก", date: "1 week ago" },
            { name: "Freelancer", avatar: "https://i.pravatar.cc/150?img=61", rating: 4, text: "บรรยากาศดี เพลงเพราะ เหมาะกับการนั่งปั่นงาน", date: "1 week ago" },
            { name: "Student B", avatar: "https://i.pravatar.cc/150?img=7", rating: 5, text: "ชอบมาติวหนังสือที่นี่ โต๊ะกว้างดี", date: "3 days ago" }
        ],
        "สุกี้จานบิน": [
            { name: "Buffet Hunter", avatar: "https://i.pravatar.cc/150?img=14", rating: 5, text: "น้ำซุปกระดูกหมูเข้มข้นมากก เนื้อลายสวย คุ้มราคาบุฟเฟต์สุดๆ", date: "2 hours ago" },
            { name: "Yui", avatar: "https://i.pravatar.cc/150?img=21", rating: 4, text: "ของสดดีค่ะ แต่โต๊ะค่อนข้างแคบไปหน่อยถ้านั่งหลายคน", date: "Yesterday" },
            { name: "Meat Lover", avatar: "https://i.pravatar.cc/150?img=58", rating: 5, text: "เนื้อออสเตรเลียดีมาก สั่งไม่อั้น คุ้มสุดๆ", date: "3 days ago" },
            { name: "Shabu Shabu", avatar: "https://i.pravatar.cc/150?img=30", rating: 4, text: "น้ำจิ้มอร่อย มีให้เลือกหลายแบบ พนักงานบริการดี", date: "5 days ago" },
            { name: "Hungry Man", avatar: "https://i.pravatar.cc/150?img=11", rating: 5, text: "กินจนตัวแตก ของหวานไอติมก็รวมในบุฟเฟต์ด้วย ดีงาม", date: "1 week ago" },
            { name: "Solo Eater", avatar: "https://i.pravatar.cc/150?img=5", rating: 5, text: "มาทานคนเดียวก็ไม่เขิน หม้อส่วนตัว สะดวกดี", date: "2 weeks ago" }
        ],
        "Little Chicky": [
            { name: "Chicken Run", avatar: "https://i.pravatar.cc/150?img=65", rating: 5, text: "ไก่กรอบนอกนุ่มใน ซอสหัวหอมอร่อยมากกก ให้เยอะด้วย", date: "1 hour ago" },
            { name: "Student A", avatar: "https://i.pravatar.cc/150?img=8", rating: 5, text: "ราคาดีงามเหมาะกับนักเรียน เซ็ตข้าวไก่ทอดอิ่มจุกๆ", date: "Yesterday" },
            { name: "K-Pop Fan", avatar: "https://i.pravatar.cc/150?img=26", rating: 5, text: "เปิดเพลงเกาหลีได้ใจมาก ไก่ทอดซอสเผ็ดคือดีย์", date: "3 days ago" },
            { name: "Budget Meal", avatar: "https://i.pravatar.cc/150?img=34", rating: 4, text: "ถูกและดีมีอยู่จริง ไก่ทอดชิ้นใหญ่มาก", date: "5 days ago" },
            { name: "Take Away", avatar: "https://i.pravatar.cc/150?img=40", rating: 4, text: "สั่งกลับบ้านยังกรอบอยู่เลย ชอบต๊อกบกกีด้วย", date: "1 week ago" },
            { name: "Ploy", avatar: "https://i.pravatar.cc/150?img=2", rating: 5, text: "เจ้าของร้านใจดีมาก แถมซอสให้ด้วย", date: "2 weeks ago" }
        ],
        "Bad Bad Burger": [
            { name: "Burger King", avatar: "https://i.pravatar.cc/150?img=57", rating: 5, text: "เบอร์เกอร์ชิ้นใหญ่มาก! เนื้อฉ่ำ ซอสทรัฟเฟิลหอมทะลุจมูก", date: "Yesterday" },
            { name: "Fit Girl", avatar: "https://i.pravatar.cc/150?img=42", rating: 4, text: "อร่อยแบบตะโกน แต่แคลอรี่ก็น่าจะตะโกนเหมือนกัน 555 นานๆ กินทีโอเคค่ะ", date: "3 days ago" },
            { name: "Western Guy", avatar: "https://i.pravatar.cc/150?img=12", rating: 5, text: "Best burger in this area! Authentic taste.", date: "4 days ago" },
            { name: "Cheese Lover", avatar: "https://i.pravatar.cc/150?img=22", rating: 5, text: "สั่งเพิ่มชีสเยิ้มๆ คือนิพพาน แป้งขนมปังนุ่มมาก", date: "1 week ago" },
            { name: "Night Rider", avatar: "https://i.pravatar.cc/150?img=66", rating: 5, text: "ร้านสวย นั่งชิลได้ เบียร์คราฟต์ดี", date: "2 weeks ago" }
        ],
        "โอยั๊วะเกษตร": [
            { name: "Party Man", avatar: "https://i.pravatar.cc/150?img=12", rating: 5, text: "ร้านประจำเวลานัดรวมรุ่น บรรยากาศริมน้ำดีมาก อาหารอร่อยทุกอย่าง", date: "Last Friday" },
            { name: "Romantic Couple", avatar: "https://i.pravatar.cc/150?img=25", rating: 4, text: "มาเดทตอนเย็นพระอาทิตย์ตกสวยมากครับ ยุงเยอะไปนิดขอยากันยุงได้", date: "Last Sunday" },
            { name: "Beer Fest", avatar: "https://i.pravatar.cc/150?img=69", rating: 5, text: "ขาหมูเยอรมันกับเบียร์เย็นๆ เข้ากันสุดๆ ดนตรีสดเล่นดี", date: "1 week ago" },
            { name: "Family Time", avatar: "https://i.pravatar.cc/150?img=46", rating: 4, text: "พาครอบครัวมาทานข้าว อาหารออกไว รสชาติถูกปากผู้ใหญ่", date: "2 weeks ago" },
            { name: "Alumni", avatar: "https://i.pravatar.cc/150?img=33", rating: 5, text: "คิดถึงบรรยากาศเก่าๆ ร้านยังรักษามาตรฐานได้ดี", date: "1 month ago" }
        ],
        "Uptojug Kitchen": [
            { name: "Cafe Hopper", avatar: "https://i.pravatar.cc/150?img=38", rating: 5, text: "ร้านสวยมากกก ตกแต่งดี ถ่ายรูปได้ทุกมุม อาหารฟิวชั่นรสชาติดี", date: "Yesterday" },
            { name: "Foodie", avatar: "https://i.pravatar.cc/150?img=4", rating: 4, text: "สปาเก็ตตี้คาโบนาร่าเข้มข้น แนะนำเลยครับ ราคาแรงนิดนึงแต่คุ้ม", date: "2 days ago" },
            { name: "Sweet Girl", avatar: "https://i.pravatar.cc/150?img=19", rating: 5, text: "ขนมเค้กอร่อยมาก โดยเฉพาะชีสเค้กหน้าไหม้", date: "4 days ago" },
            { name: "Date Night", avatar: "https://i.pravatar.cc/150?img=27", rating: 5, text: "บรรยากาศโรแมนติก เงียบสงบ เหมาะกับการพาแฟนมา", date: "1 week ago" },
            { name: "Influencer", avatar: "https://i.pravatar.cc/150?img=9", rating: 4, text: "แสงสวยถ่ายรูปอาหารขึ้นมาก แนะนำให้มาช่วงบ่ายแสงกำลังดี", date: "2 weeks ago" }
        ],
        "Wallace": [
            { name: "Luxury Life", avatar: "https://i.pravatar.cc/150?img=31", rating: 5, text: "สเต็กเนื้อนุ่มละลายในปาก บริการระดับ 5 ดาว เหมาะกับโอกาสพิเศษจริงๆ", date: "3 weeks ago" },
            { name: "Wine Lover", avatar: "https://i.pravatar.cc/150?img=10", rating: 5, text: "ไวน์ลิสต์ดีมาก บรรยากาศโรแมนติก แนะนำให้จองโต๊ะริมหน้าต่าง", date: "1 month ago" },
            { name: "Celebration", avatar: "https://i.pravatar.cc/150?img=48", rating: 5, text: "มาฉลองวันเกิดแฟน ทางร้านมีเค้กให้ด้วย ประทับใจมากครับ", date: "1 month ago" },
            { name: "Chef Table", avatar: "https://i.pravatar.cc/150?img=50", rating: 5, text: "อาหารจัดจานสวยงามเหมือนงานศิลปะ รสชาติซับซ้อน อร่อยครับ", date: "2 months ago" },
            { name: "Business Man", avatar: "https://i.pravatar.cc/150?img=60", rating: 5, text: "เหมาะกับการมาคุยธุรกิจ เงียบสงบ เป็นส่วนตัว", date: "3 months ago" }
        ]
    };

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
    
    // --- Review Variables ---
    const reviewModal = document.getElementById('reviewModal');
    const reviewClose = document.querySelector('.review-close-btn');
    const reviewList = document.getElementById('reviewList');
    const submitReviewBtn = document.getElementById('submitReviewBtn');
    let currentReviewTarget = ""; // เก็บชื่อสถานที่ปัจจุบันที่เปิดอยู่

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
        
        currentReviewTarget = data.title; // บันทึกชื่อสถานที่
        
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
    
    // --- OPEN REVIEW MODAL LOGIC (UPDATED) ---
    function openReviews() {
        if(!reviewModal) return;
        
        document.getElementById('reviewTargetName').textContent = currentReviewTarget;
        reviewList.innerHTML = ''; // เคลียร์ของเก่า

        // ดึงข้อมูลรีวิว (ถ้าไม่มี ให้ใช้ Default)
        let reviews = reviewsData[currentReviewTarget];
        if(!reviews || reviews.length === 0) {
            // Default Reviews ถ้ายังไม่มีใครรีวิว
            reviews = [
                { name: "Guest User", avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png", rating: 5, text: "สถานที่สวยงาม บรรยากาศดีครับ!", date: "Just now" }
            ];
        }

        // Generate HTML
        reviews.forEach(r => {
            const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
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
                    </div>
                </div>
            `;
            reviewList.innerHTML += html;
        });

        reviewModal.style.display = 'flex';
    }

    // --- STAR RATING LOGIC ---
    const starInputs = document.querySelectorAll('.star-rating-input i');
    
    if(starInputs.length > 0) {
        starInputs.forEach(star => {
            star.addEventListener('click', function() {
                const value = parseInt(this.getAttribute('data-value'));
                currentRating = value;
                updateStarVisuals(value);
            });
        });
    }

    function updateStarVisuals(rating) {
        starInputs.forEach(star => {
            const val = parseInt(star.getAttribute('data-value'));
            if(val <= rating) {
                star.classList.remove('fa-regular');
                star.classList.add('fa-solid', 'filled');
            } else {
                star.classList.remove('fa-solid', 'filled');
                star.classList.add('fa-regular');
            }
        });
    }

    // --- SUBMIT REVIEW LOGIC ---
    if(submitReviewBtn) {
        submitReviewBtn.addEventListener('click', () => {
            const text = document.getElementById('newReviewText').value;
            
            if (currentRating === 0) {
                alert('Please select a star rating!');
                return;
            }
            if(!text) { alert('Please write something!'); return; }
            
            // สร้างรีวิวใหม่ (Mock up)
            const newReview = {
                name: "You (Demo)",
                avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                rating: currentRating,
                text: text,
                date: "Just now"
            };
            
            // เพิ่มลงใน Array (ใน Memory ชั่วคราว)
            if(!reviewsData[currentReviewTarget]) reviewsData[currentReviewTarget] = [];
            reviewsData[currentReviewTarget].unshift(newReview); // เพิ่มบนสุด
            
            // Refresh List
            openReviews(); 
            
            // Clear input & Reset Stars
            document.getElementById('newReviewText').value = '';
            currentRating = 0;
            updateStarVisuals(0);
        });
    }

    // Bind Button
    const viewReviewsBtn = document.getElementById('viewReviewsBtn');
    if(viewReviewsBtn) {
        viewReviewsBtn.addEventListener('click', openReviews);
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
    if(reviewClose) reviewClose.addEventListener('click', () => closeModal(reviewModal));

    window.addEventListener('click', (e) => { 
        if(e.target === detailModal) closeModal(detailModal); 
        if(e.target === reviewModal) closeModal(reviewModal);
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

    // Scroll Reveal & Back to Top Logic
    const backToTopBtn = document.getElementById("backToTop");

    window.addEventListener('scroll', () => {
        // Reveal
        const reveals = document.querySelectorAll('.reveal');
        for (let i = 0; i < reveals.length; i++) {
            const windowHeight = window.innerHeight;
            const elementTop = reveals[i].getBoundingClientRect().top;
            const elementVisible = 150;
            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add('active');
            }
        }

        // Back to Top
        if (backToTopBtn) {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add("show");
            } else {
                backToTopBtn.classList.remove("show");
            }
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    showHomePage();
});

// Function for Search Suggestions (Called from HTML onclick)
function setSearch(text) {
    const input = document.getElementById('searchQuery');
    if(input) {
        input.value = text;
        input.focus();
    }
}