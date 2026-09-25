// Oyun Değişkenleri
let totalBoys = 39;
let charmedCount = 0;
let remainingTime = 600; // 10 dakika
let isTeacherWatching = false;
let currentTargetBoy = null;
let charmProgress = 0;
let charmInterval = null;
let gameTimer = null;

// DOM Elemanları
const boysGrid = document.getElementById('boys-grid');
const teacher = document.getElementById('teacher');
const teacherStatus = document.getElementById('teacher-status');
const warningMsg = document.getElementById('warning-msg');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const modal = document.getElementById('game-over-modal');
const player = document.getElementById('player');
const leftBeam = document.querySelector('.left-beam');
const rightBeam = document.querySelector('.right-beam');

// 1. 39 Erkek Öğrenciyi Oluştur
for (let i = 1; i <= totalBoys; i++) {
    const card = document.createElement('div');
    card.classList.add('boy-card');
    card.dataset.id = i;

    card.innerHTML = `
        <div class="boy-model">
            <div class="boy-head">
                <div class="boy-hair"></div>
            </div>
            <div class="boy-body"></div>
        </div>
        <div class="progress-bar-container">
            <div class="progress-bar"></div>
        </div>
    `;

    // Etkileşimler (Tıklayıp Basılı Tutma)
    card.addEventListener('mousedown', (e) => startCharming(card, e));
    card.addEventListener('mouseup', stopCharming);
    card.addEventListener('mouseleave', stopCharming);

    boysGrid.appendChild(card);
}

// 2. Zamanlayıcı (10 Dakika)
gameTimer = setInterval(() => {
    remainingTime--;
    let minutes = Math.floor(remainingTime / 60);
    let seconds = remainingTime % 60;
    timerDisplay.innerText = `Kalan Süre: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    if (remainingTime <= 0) {
        endGame(false, "Süre Bitti! Tüm erkekleri zamanında aşık edemedin.");
    }
}, 1000);

// 3. Öğretmen Döngüsü (Ders Anlatma / Sınıfa Bakma)
function teacherCycle() {
    const teachDurations = [5000, 10000, 20000, 30000];
    const currentTeachTime = teachDurations[Math.floor(Math.random() * teachDurations.length)];

    isTeacherWatching = false;
    teacher.className = "teaching";
    teacherStatus.innerText = "Öğretmen Ders Anlatıyor";
    warningMsg.classList.add('hidden');

    // Herkes rahat davranıyor
    document.querySelectorAll('.boy-card').forEach(b => b.classList.remove('studying'));

    // Bakmadan 2 saniye önce uyarı
    setTimeout(() => {
        warningMsg.classList.remove('hidden');
    }, Math.max(0, currentTeachTime - 2000));

    // Öğretmen Dönüyor!
    setTimeout(() => {
        isTeacherWatching = true;
        warningMsg.classList.add('hidden');
        teacher.className = "watching";
        teacherStatus.innerText = "ÖĞRETMEN SINIFA BAKIYOR!";

        // Öğretmen baktığında tüm öğrenciler ders çalışır gibi sıraya eğilir
        document.querySelectorAll('.boy-card').forEach(b => b.classList.add('studying'));

        // Eğer o sırada aşık etmeye çalışıyorsak YAKALANDIK!
        if (currentTargetBoy !== null) {
            endGame(false, "DISIPLINE GÖNDERILDIN! Öğretmen seni bir erkeğe bakarken yakaladı!");
            return;
        }

        const watchDurations = [5000, 7000, 10000];
        const currentWatchTime = watchDurations[Math.floor(Math.random() * watchDurations.length)];

        setTimeout(() => {
            teacherCycle();
        }, currentWatchTime);

    }, currentTeachTime);
}

teacherCycle();

// 4. Aşık Etme Mekaniği (Tam 9 Saniye)
function startCharming(boyCard, event) {
    if (boyCard.classList.contains('in-love')) return;

    if (isTeacherWatching) {
        endGame(false, "DISIPLINE GÖNDERILDIN! Öğretmen sınıfa bakarken hareket ettin!");
        return;
    }

    currentTargetBoy = boyCard;
    charmProgress = 0;
    const progressBar = boyCard.querySelector('.progress-bar');

    // Pembe Göz Işınlarını Aktif Et ve Hedefe Yönlendir
    drawEyeBeams(boyCard);

    // 9 Saniye Süre (90 x 100ms)
    charmInterval = setInterval(() => {
        charmProgress += (100 / 90);
        progressBar.style.width = charmProgress + "%";

        if (charmProgress >= 100) {
            stopCharming();
            boyCard.classList.add('in-love');
            charmedCount++;
            scoreDisplay.innerText = `Aşık Edilen: ${charmedCount} / ${totalBoys}`;

            if (charmedCount === totalBoys) {
                endGame(true, "TEBRİKLER! Bütün sınıf sana aşık oldu!");
            }
        }
    }, 100);
}

function stopCharming() {
    if (charmInterval) clearInterval(charmInterval);
    hideEyeBeams();

    if (currentTargetBoy && !currentTargetBoy.classList.contains('in-love')) {
        const progressBar = currentTargetBoy.querySelector('.progress-bar');
        if (progressBar) progressBar.style.width = "0%";
    }
    currentTargetBoy = null;
}

// 5. Gözlerden Çıkan Lazer/Işın Efekti
function drawEyeBeams(target) {
    const playerRect = player.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const startX = playerRect.left + playerRect.width / 2;
    const startY = playerRect.top + 20;

    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;

    const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
    const distance = Math.hypot(endX - startX, endY - startY);

    leftBeam.style.width = distance + 'px';
    leftBeam.style.left = '25px';
    leftBeam.style.top = '15px';
    leftBeam.style.transform = `rotate(${angle}deg)`;
    leftBeam.style.display = 'block';
}

function hideEyeBeams() {
    leftBeam.style.display = 'none';
}

// 6. Oyun Bitiş Ekranı
function endGame(isWin, message) {
    clearInterval(gameTimer);
    clearInterval(charmInterval);
    hideEyeBeams();
    modal.classList.remove('hidden');
    document.getElementById('modal-title').innerText = isWin ? "Kazandın! 🎉" : "Kaybettin! ❌";
    document.getElementById('modal-msg').innerText = message;
}