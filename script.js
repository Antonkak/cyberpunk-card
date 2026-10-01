// ============================================================
// CYBERPUNK EDGERUNNERS TERMINAL - SHARED JAVASCRIPT
// ============================================================

// --- Configuration ---
const SECRET_CODE = "2077";
const BLUEPRINTS = [
    "resourses/stage1_box_unfold.png",
    "resourses/stage2_figma_mockup.png",
    "resourses/stage3_paint_process.png"
];

// PeerJS Configuration with STUN servers for NAT traversal
const PEER_CONFIG = {
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    }
};

// Generate random session ID
function generateSessionId() {
    return 'arasaka-' + Math.random().toString(36).substring(2, 8);
}

// Extract target peer ID from URL parameters
function getTargetPeerId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || null;
}

// --- Utility Functions ---
function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Glitch Effect ---
function glitchEffect(message = 'SYSTEM OVERRIDE...') {
    return new Promise(resolve => {
        const glitchOverlay = document.createElement('div');
        glitchOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #000; z-index: 5000; display: flex; align-items: center;
            justify-content: center; font-family: 'Orbitron', monospace;
            color: #ff003c; font-size: 3rem; text-transform: uppercase; letter-spacing: 8px;
        `;
        glitchOverlay.innerHTML = message;
        document.body.appendChild(glitchOverlay);

        let count = 0;
        const interval = setInterval(() => {
            glitchOverlay.style.transform = `translateX(${Math.random() * 20 - 10}px)`;
            glitchOverlay.style.opacity = Math.random() > 0.2 ? 1 : 0;
            glitchOverlay.style.color = Math.random() > 0.5 ? '#ff003c' : '#00ffff';
            count++;

            if (count >= 12) {
                clearInterval(interval);
                document.body.removeChild(glitchOverlay);
                resolve();
            }
        }, 80);
    });
}

// --- Dev Logs Typewriter ---
function addDevLogs(containerId, logs, intervalMs = 350) {
    const container = document.getElementById(containerId);
    if (!container) return Promise.resolve();

    return new Promise(resolve => {
        let index = 0;
        const interval = setInterval(() => {
            if (index < logs.length) {
                const log = document.createElement('div');
                log.className = 'dev-log';
                log.textContent = logs[index];
                container.appendChild(log);
                index++;
            } else {
                clearInterval(interval);
                resolve();
            }
        }, intervalMs);
    });
}

// --- Audio Player Controls ---
function initAudioPlayer() {
    const playBtn = document.getElementById('play-transmission');
    const audioPlayer = document.getElementById('audio-player');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const timeInfo = document.getElementById('time-info');
    const volumeSlider = document.getElementById('volume-slider');

    if (!playBtn || !audioPlayer) return;

    playBtn.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playBtn.innerHTML = '&#10074;&#10074; PAUSE';
        } else {
            audioPlayer.pause();
            playBtn.innerHTML = '&#9654; PLAY';
        }
    });

    audioPlayer.addEventListener('timeupdate', () => {
        if (!audioPlayer.duration) return;
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = `${percent}%`;
        timeInfo.textContent = `${formatTime(audioPlayer.currentTime)} / ${formatTime(audioPlayer.duration)}`;
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        timeInfo.textContent = `0:00 / ${formatTime(audioPlayer.duration)}`;
    });

    audioPlayer.addEventListener('ended', () => {
        playBtn.innerHTML = '&#9654; PLAY';
        progressFill.style.width = '0%';
    });

    progressContainer.addEventListener('click', (e) => {
        if (!audioPlayer.duration) return;
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        audioPlayer.currentTime = (clickX / width) * audioPlayer.duration;
    });

    volumeSlider.addEventListener('input', () => {
        audioPlayer.volume = volumeSlider.value / 100;
    });

    return {
        play: () => audioPlayer.play(),
        pause: () => audioPlayer.pause(),
        setVolume: (v) => { audioPlayer.volume = v; volumeSlider.value = v * 100; }
    };
}

// --- Blueprints Gallery ---
function initGallery() {
    const galleryOverlay = document.getElementById('gallery-overlay');
    const galleryImage = document.getElementById('gallery-image');
    const galleryCaption = document.getElementById('gallery-caption');
    const galleryClose = document.getElementById('gallery-close');
    const galleryPrev = document.getElementById('gallery-prev');
    const galleryNext = document.getElementById('gallery-next');
    const viewBlueprintsBtn = document.getElementById('view-blueprints');

    if (!galleryOverlay || !galleryImage) return;

    let currentIndex = 0;

    function updateImage() {
        galleryImage.src = BLUEPRINTS[currentIndex];
        const fileName = BLUEPRINTS[currentIndex].split('/').pop();
        galleryCaption.textContent = `FILE [${currentIndex + 1}/${BLUEPRINTS.length}]: ${fileName}`;
    }

    function openGallery() {
        currentIndex = 0;
        updateImage();
        galleryOverlay.classList.add('active');
    }

    function closeGallery() {
        galleryOverlay.classList.remove('active');
    }

    function prev() {
        currentIndex = (currentIndex - 1 + BLUEPRINTS.length) % BLUEPRINTS.length;
        updateImage();
    }

    function next() {
        currentIndex = (currentIndex + 1) % BLUEPRINTS.length;
        updateImage();
    }

    viewBlueprintsBtn?.addEventListener('click', openGallery);
    galleryClose?.addEventListener('click', closeGallery);
    galleryPrev?.addEventListener('click', prev);
    galleryNext?.addEventListener('click', next);
    galleryOverlay?.addEventListener('click', (e) => {
        if (e.target === galleryOverlay) closeGallery();
    });

    return { open: openGallery, close: closeGallery };
}

// --- Keyboard Shortcuts ---
function initKeyboardShortcuts(closeModalFn, closeGalleryFn) {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModalFn?.();
            closeGalleryFn?.();
        }
    });
}

// --- Arasaka Init Logs (Desktop only) ---
function startArasakaInitLogs(containerId = 'arasaka-init-logs') {
    const logMessages = [
        "[ INIT ] ARASAKA Medical Terminal v3.2.1",
        "[ SYS ] Loading secure protocols...",
        "[ NET ] Connecting to Night City servers...",
        "[ PKG ] Container #2077-IS-564 locked for transport...",
        "[ STATUS ] Neural overload critical - awaiting external signal..."
    ];

    let index = 0;
    const container = document.getElementById(containerId);
    if (!container) return () => {};

    const interval = setInterval(() => {
        if (index < logMessages.length) {
            const p = document.createElement('p');
            p.textContent = logMessages[index];
            p.style.marginBottom = '4px';
            container.appendChild(p);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 800);

    return () => {
        clearInterval(interval);
        container.remove();
    };
}

// --- PeerJS Helper (Desktop - Connects to Mobile) ---
function initDesktopPeer(targetId, onOverrideCallback, onLogCallback) {
    if (typeof Peer === 'undefined') {
        console.error('[PEER] PeerJS not loaded');
        onLogCallback?.('[ERR] PeerJS not loaded');
        return null;
    }

    if (!targetId) {
        console.log('[PEER] No target ID in URL - waiting for net-deck link');
        onLogCallback?.('[NET] Awaiting net-deck URL parameter...');
        return null;
    }

    console.log('[PEER] Desktop connecting to mobile:', targetId);
    onLogCallback?.(`[NET] Connecting to net-deck: ${targetId}`);

    // Desktop auto-generates its own ID, connects to mobile's fixed ID
    const peer = new Peer(undefined, PEER_CONFIG);
    let conn = null;

    peer.on('open', (id) => {
        console.log('[PEER] Desktop peer registered with ID:', id);
        onLogCallback?.(`[NET] Terminal initialized (ID: ${id})`);
        
        // Connect to mobile after registration
        conn = peer.connect(targetId, { reliable: true });
        
        conn.on('open', () => {
            console.log('[PEER] Connected to net-deck:', targetId);
            onLogCallback?.('[NET] Net-deck link established');
        });

        conn.on('close', () => {
            console.log('[PEER] Disconnected from net-deck');
            onLogCallback?.('[NET] Net-deck disconnected');
        });

        conn.on('error', (err) => {
            console.error('[PEER] Connection error:', err);
            onLogCallback?.(`[ERR] Connection error: ${err.message}`);
        });
    });

    peer.on('error', (err) => {
        console.error('[PEER] Peer error:', err);
        onLogCallback?.(`[ERR] Peer error: ${err.message}`);
    });

    peer.on('disconnected', () => {
        console.log('[PEER] Disconnected from signaling server, reconnecting...');
        onLogCallback?.('[NET] Disconnected, reconnecting...');
        peer.reconnect();
    });

    peer.on('close', () => {
        console.log('[PEER] Desktop peer destroyed');
    });

    // Listen for incoming connections (fallback if mobile connects to us)
    peer.on('connection', (incomingConn) => {
        console.log('[PEER] Incoming connection from:', incomingConn.peer);
        onLogCallback?.(`[NET] Incoming from: ${incomingConn.peer}`);
        
        incomingConn.on('data', (data) => {
            if (data.action === 'OVERRIDE' && data.code === SECRET_CODE) {
                console.log('[PEER] Valid override code received');
                onOverrideCallback?.();
            } else if (data.action === 'OVERRIDE') {
                console.log('[PEER] Invalid override code:', data.code);
            }
        });

        incomingConn.on('close', () => {
            console.log('[PEER] Incoming connection closed');
        });
    });

    return peer;
}

// --- PeerJS Helper (Mobile - Listens for Desktop) ---
function initMobilePeer(onConnectedCallback, onErrorCallback, onLogCallback) {
    if (typeof Peer === 'undefined') {
        console.error('[PEER] PeerJS not loaded');
        onErrorCallback?.(new Error('PeerJS not loaded'));
        onLogCallback?.('[ERR] PeerJS not loaded');
        return null;
    }

    // Mobile generates the session ID and acts as listener
    const sessionId = generateSessionId();
    console.log('[PEER] Mobile session ID:', sessionId);
    onLogCallback?.(`[NET-DECK] Session ID: ${sessionId}`);

    const peer = new Peer(sessionId, PEER_CONFIG);
    let conn = null;

    peer.on('open', (id) => {
        console.log('[PEER] Mobile peer listening on ID:', id);
        onLogCallback?.(`[NET-DECK] Listening for terminal...`);
    });

    peer.on('connection', (incomingConn) => {
        console.log('[PEER] Terminal connected:', incomingConn.peer);
        conn = incomingConn;
        onLogCallback?.('[NET-DECK] Terminal connected');
        onConnectedCallback?.();

        incomingConn.on('data', (data) => {
            // Handle any data from desktop if needed
            console.log('[PEER] Data from terminal:', data);
        });

        incomingConn.on('close', () => {
            console.log('[PEER] Terminal disconnected');
            onLogCallback?.('[NET-DECK] Terminal disconnected');
        });

        incomingConn.on('error', (err) => {
            console.error('[PEER] Connection error:', err);
            onLogCallback?.(`[ERR] Connection error: ${err.message}`);
        });
    });

    peer.on('error', (err) => {
        console.error('[PEER] Mobile peer error:', err);
        onLogCallback?.(`[ERR] Peer error: ${err.message}`);
        onErrorCallback?.(err);
    });

    peer.on('disconnected', () => {
        console.log('[PEER] Disconnected from signaling server, reconnecting...');
        onLogCallback?.('[NET] Disconnected, reconnecting...');
        peer.reconnect();
    });

    peer.on('close', () => {
        console.log('[PEER] Mobile peer destroyed');
    });

    function sendOverride(code) {
        if (conn && conn.open) {
            conn.send({ action: 'OVERRIDE', code });
            console.log('[PEER] Override sent to terminal:', code);
            return true;
        }
        console.warn('[PEER] Cannot send override - no active connection');
        return false;
    }

    function getSessionId() {
        return sessionId;
    }

    function generateDesktopUrl() {
        return `${window.location.origin}/index.html?id=${sessionId}`;
    }

    return { sendOverride, getSessionId, generateDesktopUrl, peer };
}

// --- Share URL (Mobile) ---
async function shareUrl(url) {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Arasaka Terminal Link',
                text: 'Connect your net-deck to the terminal',
                url
            });
        } catch (err) {
            if (err.name !== 'AbortError') {
                await copyToClipboard(url);
            }
        }
    } else {
        await copyToClipboard(url);
    }
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Clipboard write failed:', err);
        return false;
    }
}

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SECRET_CODE,
        BLUEPRINTS,
        PEER_CONFIG,
        generateSessionId,
        getTargetPeerId,
        glitchEffect,
        addDevLogs,
        initAudioPlayer,
        initGallery,
        initKeyboardShortcuts,
        startArasakaInitLogs,
        initDesktopPeer,
        initMobilePeer,
        shareUrl,
        formatTime,
        sleep
    };
}