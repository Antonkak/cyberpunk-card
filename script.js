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

// --- Update Desktop Connection Status UI ---
function updateDesktopStatus(connected) {
    const statusElements = document.querySelectorAll('.status-line, .connection-status, #netdeck-waiting, #netdeck-connected, #connection-status');
    statusElements.forEach(el => {
        if (connected) {
            if (el.textContent.includes('WAITING') || el.textContent.includes('CONNECTING') || el.textContent.includes('AWAITING')) {
                el.textContent = '[ NET-DECK LINK: ESTABLISHED ]';
                el.style.color = '#00f0ff';
                el.classList.remove('waiting');
                el.classList.add('connected');
            }
        }
    });
}

// --- PeerJS Helper (Desktop - Connects to Mobile) ---
function initDesktopPeer(targetMobileId, onOverrideCallback) {
    if (typeof Peer === 'undefined') {
        console.error('[DESKTOP] PeerJS not loaded');
        return null;
    }

    if (!targetMobileId) {
        console.log('[DESKTOP] No target Mobile ID in URL');
        return null;
    }

    console.log('[DESKTOP] Initializing PeerJS, will connect to Mobile:', targetMobileId);

    // Desktop creates peer with auto-generated ID
    const desktopPeer = new Peer(undefined, PEER_CONFIG);
    let conn = null;

    desktopPeer.on('open', (id) => {
        console.log('[DESKTOP] Peer opened with ID:', id);
        console.log('[DESKTOP] Connecting to Mobile Net-Deck:', targetMobileId);

        // CRITICAL: Connect STRICTLY inside 'open' event
        conn = desktopPeer.connect(targetMobileId, { reliable: true });

        conn.on('open', () => {
            console.log('[DESKTOP] P2P Connection established!');
            updateDesktopStatus(true);
        });

        // Listen for data from mobile (OVERRIDE command)
        conn.on('data', (data) => {
            console.log('[DESKTOP] Received data:', data);
            if (data.action === 'OVERRIDE' && data.code === SECRET_CODE) {
                console.log('[DESKTOP] Valid OVERRIDE received from mobile');
                if (typeof onOverrideCallback === 'function') {
                    onOverrideCallback();
                }
            }
        });

        conn.on('error', (err) => {
            console.error('[DESKTOP] Connection error:', err);
        });

        conn.on('close', () => {
            console.log('[DESKTOP] Connection closed by mobile');
            updateDesktopStatus(false);
        });
    });

    // Also handle incoming connections (fallback if mobile connects to us)
    desktopPeer.on('connection', (incomingConn) => {
        console.log('[DESKTOP] Incoming connection from Mobile:', incomingConn.peer);
        conn = incomingConn;

        conn.on('open', () => {
            console.log('[DESKTOP] Incoming connection from Mobile established!');
            updateDesktopStatus(true);
        });

        conn.on('data', (data) => {
            console.log('[DESKTOP] Received data on incoming:', data);
            if (data.action === 'OVERRIDE' && data.code === SECRET_CODE) {
                console.log('[DESKTOP] Valid OVERRIDE received on incoming connection');
                if (typeof onOverrideCallback === 'function') {
                    onOverrideCallback();
                }
            }
        });

        conn.on('close', () => {
            console.log('[DESKTOP] Incoming connection closed');
            updateDesktopStatus(false);
        });

        conn.on('error', (err) => {
            console.error('[DESKTOP] Incoming connection error:', err);
        });
    });

    desktopPeer.on('error', (err) => {
        console.error('[DESKTOP] Peer error:', err);
    });

    desktopPeer.on('disconnected', () => {
        console.log('[DESKTOP] Disconnected from signaling server, reconnecting...');
        desktopPeer.reconnect();
    });

    desktopPeer.on('close', () => {
        console.log('[DESKTOP] Peer destroyed');
    });

    return desktopPeer;
}

// --- PeerJS Helper (Mobile - Listens for Desktop) ---
function initMobilePeer(onConnectedCallback, onErrorCallback, onLogCallback) {
    if (typeof Peer === 'undefined') {
        console.error('[MOBILE] PeerJS not loaded');
        onErrorCallback?.(new Error('PeerJS not loaded'));
        onLogCallback?.('[ERR] PeerJS not loaded');
        return null;
    }

    // Mobile generates the session ID and acts as LISTENER
    const sessionId = generateSessionId();
    console.log('[MOBILE] Net-Deck Session ID:', sessionId);
    onLogCallback?.(`[NET-DECK] Session ID: ${sessionId}`);

    const peer = new Peer(sessionId, PEER_CONFIG);
    let connections = new Set(); // Track all active connections

    peer.on('open', (id) => {
        console.log('[MOBILE] Peer listening on ID:', id);
        onLogCallback?.(`[NET-DECK] Listening for terminal...`);
    });

    // Handle INCOMING connections from Desktop
    peer.on('connection', (conn) => {
        console.log('[MOBILE] Terminal connected:', conn.peer);
        connections.add(conn);
        onLogCallback?.('[NET-DECK] Terminal connected');
        onConnectedCallback?.();

        conn.on('data', (data) => {
            // Handle any data from desktop if needed
            console.log('[MOBILE] Data from terminal:', data);
        });

        conn.on('close', () => {
            console.log('[MOBILE] Terminal disconnected');
            connections.delete(conn);
            onLogCallback?.('[NET-DECK] Terminal disconnected');
        });

        conn.on('error', (err) => {
            console.error('[MOBILE] Connection error:', err);
            onLogCallback?.(`[ERR] Connection error: ${err.message}`);
        });
    });

    peer.on('error', (err) => {
        console.error('[MOBILE] Peer error:', err);
        onLogCallback?.(`[ERR] Peer error: ${err.message}`);
        onErrorCallback?.(err);
    });

    peer.on('disconnected', () => {
        console.log('[MOBILE] Disconnected from signaling server, reconnecting...');
        onLogCallback?.('[NET] Disconnected, reconnecting...');
        peer.reconnect();
    });

    peer.on('close', () => {
        console.log('[MOBILE] Peer destroyed');
    });

    // Send OVERRIDE to ALL active connections
    function sendOverride(code) {
        let sent = false;
        connections.forEach(conn => {
            if (conn && conn.open) {
                conn.send({ action: 'OVERRIDE', code });
                console.log('[MOBILE] Override sent to terminal:', code);
                sent = true;
            }
        });
        if (!sent) {
            console.warn('[MOBILE] Cannot send override - no active connections');
        }
        return sent;
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
