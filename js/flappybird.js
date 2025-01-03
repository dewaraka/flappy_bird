// Variabel konfigurasi permainan
// Canvas board dan dimensinya
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// Properti burung
let birdWidth = 34; // Lebar burung dalam piksel
let birdHeight = 24; // Tinggi burung dalam piksel
let birdX = boardWidth / 8; // Posisi X awal burung
let birdY = boardHeight / 2; // Posisi Y awal burung
let birdImg; // Objek gambar untuk burung

// Objek burung untuk menyimpan posisi dan dimensinya
let bird = { x: birdX, y: birdY, width: birdWidth, height: birdHeight };

// Konfigurasi pipa
let pipeArray = []; // Array untuk menyimpan pipa
let pipeWidth = 64; // Lebar setiap pipa
let pipeHeight = 512; // Tinggi setiap pipa
let pipeX = boardWidth; // Posisi X awal untuk pipa baru
let pipeY = 0; // Posisi Y awal untuk pipa

let topPipeImg; // Gambar untuk pipa atas
let bottomPipeImg; // Gambar untuk pipa bawah

// Properti fisika untuk burung dan pipa
let velocityX = -2; // Kecepatan pipa bergerak ke kiri
let velocityY = 0; // Kecepatan lompat burung
let gravity = 0.4; // Gravitasi yang memengaruhi burung

// Variabel status permainan
let gameOver = false; // Menentukan apakah permainan selesai
let score = 0; // Menyimpan skor pemain

// Fungsi yang dijalankan setelah DOM dimuat
$(document).ready(function () {
    board = $("#board")[0]; // Mendapatkan elemen canvas
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // Mendapatkan konteks 2D untuk menggambar

    // Memuat gambar burung
    birdImg = new Image();
    birdImg.src = "assets/images/flappybird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    // Memuat gambar pipa
    topPipeImg = new Image();
    topPipeImg.src = "assets/images/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "assets/images/bottompipe.png";

    // Memulai loop permainan
    requestAnimationFrame(update);

    // Menempatkan pipa setiap 1,5 detik
    setInterval(placePipes, 1500);

    // Mendengarkan tombol yang ditekan
    $(document).off("keydown").on("keydown", moveBird);

    // Fungsi tombol restart
    $("#restartButton").click(function () {
        bird.y = birdY; // Mengatur ulang posisi burung
        velocityY = 0; // Mengatur ulang kecepatan burung

        pipeArray = []; // Menghapus semua pipa

        score = 0; // Mengatur ulang skor

        gameOver = false; // Mengatur ulang status permainan

        // Memulai ulang loop permainan
        requestAnimationFrame(update);

        // Membersihkan canvas
        context.clearRect(0, 0, board.width, board.height);
    });
});

// Fungsi utama loop permainan
function update() {
    requestAnimationFrame(update); // Melanjutkan loop
    context.clearRect(0, 0, board.width, board.height); // Membersihkan canvas

    if (gameOver) {
        // Menampilkan "GAME OVER" dan skor
        context.fillStyle = "white";
        context.font = "45px sans-serif";
        context.fillText("GAME OVER", boardWidth / 7, boardHeight / 2 - 20);
        context.fillText("Skor: " + Math.floor(score), boardWidth / 4, boardHeight / 2 + 20);
        return; // Menghentikan pembaruan lebih lanjut
    }

    // Memperbarui posisi burung
    velocityY += gravity; // Menerapkan gravitasi
    bird.y = Math.max(bird.y + velocityY, 0); // Memperbarui posisi dan mencegah burung keluar atas canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height); // Menggambar burung

    if (bird.y > board.height) {
        gameOver = true; // Permainan selesai jika burung menyentuh bawah
        return;
    }

    // Memperbarui pipa
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX; // Menggerakkan pipa ke kiri
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height); // Menggambar pipa

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // Menambah skor saat burung melewati pipa
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true; // Permainan selesai jika burung bertabrakan dengan pipa
            return;
        }
    }

    // Menghapus pipa yang keluar layar
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // Menampilkan skor saat ini
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(Math.floor(score), 5, 45);
}

// Fungsi untuk menempatkan pipa pada posisi acak
function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2); // Mengacak tinggi pipa
    let openingSpace = board.height / 4; // Jarak antara pipa atas dan bawah

    // Membuat pipa atas
    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    // Membuat pipa bawah
    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

// Fungsi untuk menangani pergerakan burung
function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = -6; // Burung melompat ke atas

        if (gameOver) {
            bird.y = birdY; // Mengatur ulang posisi burung
            pipeArray = []; // Menghapus pipa
            score = 0; // Mengatur ulang skor
            gameOver = false; // Memulai ulang permainan
        }
    }
}

// Fungsi deteksi tabrakan
function detectCollision(a, b) {
    return a.x < b.x + b.width && // Tepi kiri burung tidak melewati tepi kanan pipa
           a.x + a.width > b.x && // Tepi kanan burung melewati tepi kiri pipa
           a.y < b.y + b.height && // Tepi atas burung tidak melewati tepi bawah pipa
           a.y + a.height > b.y; // Tepi bawah burung melewati tepi atas pipa
}
