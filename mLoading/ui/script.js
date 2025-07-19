function loading(num) {
	let current = parseInt($(".text-progress").text(), 10) || 0;
	const step = 1;
	const delay = 700 / Math.abs(num - current);

	const interval = setInterval(function () {
		if (current < num) {
			current += step;
			if (current > num) current = num;
		} else if (current > num) {
			current -= step;
			if (current < num) current = num;
		} else {
			clearInterval(interval);
		}
		$(".text-progress").text(current + "%");
	}, delay);

	$(".progressbar-value").width(num + "%");
}

window.addEventListener('message', function(e) {
	if (e.data.eventName === 'loadProgress') {
		var num = (e.data.loadFraction * 100).toFixed(0);
		loading(num);
	}
});

// Music player

const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressSlider = document.getElementById('progress-slider');
const progressFill = document.getElementById('progress-fill');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const songTitle = document.getElementById('song-title');
const artistEl = document.getElementById('artist');

const songs = [
    {
        title: "Bara",
        artist: "Yvnnis",
        src: "music/bara.mp3"
    },
    {
        title: "Maudit",
        artist: "Junel",
        src: "music/maudit.mp3"
    },
    {
        title: "Nostalgique",
        artist: "Dudul & Dibz",
        src: "music/nostalgique.mp3"
    },
    {
        title: "Tequila",
        artist: "Keeqaid",
        src: "music/tequila.mp3"
    }
];

let currentSongIndex = Math.floor(Math.random() * songs.length);
let isPlaying = false;
let updateTimer;

const audio = new Audio();
const volumeBtn = document.getElementById('volume-btn');
const volumeSlider = document.getElementById('volume-slider');
const volumeProgressFill = document.getElementById('volume-progress-fill');
let isMuted = false;
let lastVolume = 1;

initVolume(0.1);
volumeProgressFill.style.transform = `scaleX(${volumeSlider.value})`;

function loadSong(songIndex) {
    const song = songs[songIndex];
    audio.src = song.src;
    songTitle.textContent = song.title;
    artistEl.textContent = song.artist;
    
    audio.currentTime = 0;
    progressFill.style.width = '0%';
    progressSlider.value = 0;
    currentTimeEl.textContent = '0:00';
    durationEl.textContent = '0:00';

    audio.addEventListener('canplaythrough', function onCanPlayThrough() {
        updateSongInfo();
        audio.removeEventListener('canplaythrough', onCanPlayThrough);
    });

    if (isPlaying) {
        audio.play().catch(e => console.error("Erreur de lecture:", e));
    }
}

volumeBtn.addEventListener('click', toggleMute);
volumeSlider.addEventListener('input', setVolume);

function toggleMute() {
    if (isMuted) {
        audio.volume = lastVolume;
        volumeSlider.value = lastVolume;
        updateVolumeIcon(lastVolume);
    } else {
        lastVolume = audio.volume;
        audio.volume = 0;
        volumeSlider.value = 0;
        updateVolumeIcon(0);
    }
    isMuted = !isMuted;
}

function setVolume() {
    const volume = parseFloat(volumeSlider.value);
    audio.volume = volume;
    volumeProgressFill.style.transform = `scaleX(${volume})`;
    updateVolumeIcon(volume);
    if (isMuted && volume > 0) isMuted = false;
    if (volume === 0) isMuted = true;
}

function updateVolumeIcon(volume) {
    const icon = volumeBtn.querySelector('i');
    
    if (volume <= 0) {
        icon.className = 'fas fa-volume-mute';
    } else if (volume < 0.5) {
        icon.className = 'fas fa-volume-down';
    } else {
        icon.className = 'fas fa-volume-up';
    }
}


function togglePlay() {
    if (audio.paused) {
        audio.play().then(() => {
            isPlaying = true;
            updatePlayButton();
            updateTimer = setInterval(updateProgress, 1000);
        }).catch(e => console.error("Erreur de lecture:", e));
    } else {
        audio.pause();
        isPlaying = false;
        updatePlayButton();
        clearInterval(updateTimer);
    }
}

function updatePlayButton() {
    const icon = playBtn.querySelector('i');
    icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
}

function updateProgress() {
    if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressSlider.value = progress;
        progressFill.style.width = `${progress}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }
}

function updateSongInfo() {
    if (!isNaN(audio.duration)) {
        durationEl.textContent = formatTime(audio.duration);
    } else {
        durationEl.textContent = "0:00";
    }
    currentTimeEl.textContent = formatTime(audio.currentTime);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function changeSong(direction) {
    audio.pause();
    clearInterval(updateTimer);
    
    currentSongIndex = (currentSongIndex + direction + songs.length) % songs.length;
    loadSong(currentSongIndex);

    if (isPlaying) {
        audio.play().then(() => {
            updateTimer = setInterval(updateProgress, 1000);
        }).catch(e => console.error("Erreur de lecture:", e));
    }
}

function initVolume(vol = 0.1) {
    audio.volume = vol;
    volumeSlider.value = vol;
    volumeProgressFill.style.transform = `scaleX(${vol})`;
    updateVolumeIcon(vol);
}

function setProgress() {
    const progress = progressSlider.value;
    const duration = audio.duration;
    audio.currentTime = (progress / 100) * duration;
    progressFill.style.width = `${progress}%`;
    updateProgress();
}

playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', () => changeSong(-1));
nextBtn.addEventListener('click', () => changeSong(1));

let isSeeking = false;
progressSlider.addEventListener('input', () => {
    if (!isSeeking) {
        isSeeking = true;
        audio.pause();
        clearInterval(updateTimer);
    }
    const duration = audio.duration || 100;
    const seekTime = (progressSlider.value / 100) * duration;
    currentTimeEl.textContent = formatTime(seekTime);
    progressFill.style.width = `${progressSlider.value}%`;
});

progressSlider.addEventListener('change', () => {
    isSeeking = false;
    setProgress();
    if (isPlaying) {
        audio.play().catch(e => console.error("Erreur de lecture:", e));
        updateTimer = setInterval(updateProgress, 1000);
    }
});

audio.addEventListener('ended', () => {
    clearInterval(updateTimer);
    isPlaying = false;
    updatePlayButton();
    changeSong(1);
});

document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            togglePlay();
            break;
        case 'ArrowLeft':
            audio.currentTime = Math.max(0, audio.currentTime - 5);
            updateProgress();
            break;
        case 'ArrowRight':
            audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
            updateProgress();
            break;
        case 'ArrowUp':
            audio.volume = Math.min(1, audio.volume + 0.1);
            break;
        case 'ArrowDown':
            audio.volume = Math.max(0, audio.volume - 0.1);
            break;
    }
});

loadSong(currentSongIndex);

audio.play().then(() => {
    isPlaying = true;
    updatePlayButton();
    updateTimer = setInterval(updateProgress, 1000);
}).catch(e => console.error("Erreur de lecture:", e));


// Social Links

document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const url = e.currentTarget.getAttribute('href');
        try {
            if (window.invokeNative) {
                window.invokeNative('openUrl', url);
            } else {
                window.open(url, '_blank');
            }
        } catch (e) {
            console.error('Error opening URL:', e);
            window.open(url, '_blank');
        }
    });
});