// ============================================================
// CYBERPUNK EDGERUNNERS TERMINAL - SHARED JAVASCRIPT
// WebSocket (WSS) Version - No PeerJS
// ============================================================

// --- Configuration ---
const SECRET_CODE = "2077";
const BLUEPRINTS = [
    "resourses/stage1_box_unfold.png",
    "resourses/stage2_figma_mockup.png",
    "resourses/stage3_paint_process.png"
];

// WebSocket Signaling Server
const WSS_URL = 'wss://terminalac.cyberlation.net/ws';

// Reconnection configuration
const MAX_RECONNECT_ATTEMPTS = 10;
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 5000;

// Debug
console.log('[WSS] Signaling server:', WSS_URL);

// Helper: Calculate exponential backoff delay with jitter
function getBackoffDelay(attempt) {
    const baseDelay = Math.min(INITIAL_RECONNECT_DELAY * Math.pow(1.5, attempt - 1), MAX_RECONNECT_DELAY);
    const jitter = Math.random() * 500; // 0-500ms jitter
    return Math.floor(baseDelay + jitter);
}

// Generate random session ID
function generateSessionId() {
    return 'arasaka-' + Math.random().toString(36).substring(2, 8);
}

// Extract target peer ID from URL parameters
function getTargetPeerId() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log('[DESKTOP] Parsed target ID from URL:', id);
    return id;
}

// Generate desktop URL that works on GitHub Pages (handles subfolder paths like /cyberpunk-card/)
function generateDesktopUrl(sessionId) {
    const currentPath = window.location.pathname;
    const folderPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    const desktopUrl = `${window.location.origin}${folderPath}index.html?id=${sessionId}`;
    console.log('[NET-DECK] Formatted Desktop URL:', desktopUrl);
    return desktopUrl;
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

// ============================================================
// WebSocket Client (Replaces PeerJS)
// ============================================================

class WSSClient {
    constructor(onMessageCallback, onStatusCallback, onLogCallback) {
        this.url = WSS_URL;
        this.socket = null;
        this.roomId = null;
        this.clientType = null; // 'mobile' or 'desktop'
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
        this.reconnectTimer = null;
        this.shouldReconnect = true;
        
        this.onMessageCallback = onMessageCallback;
        this.onStatusCallback = onStatusCallback; // 'connecting', 'connected', 'disconnected', 'error'
        this.onLogCallback = onLogCallback;
    }

    connect(roomId, clientType) {
        this.roomId = roomId;
        this.clientType = clientType;
        this.shouldReconnect = true;
        this.reconnectAttempts = 0;
        this._createConnection();
    }

    _createConnection() {
        if (this.socket) {
            this.socket.onopen = null;
            this.socket.onmessage = null;
            this.socket.onclose = null;
            this.socket.onerror = null;
            if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
                this.socket.close();
            }
        }

        console.log(`[WSS] Connecting to ${this.url}...`);
        this.onLogCallback?.(`[WSS] Connecting to signaling server...`);
        this.onStatusCallback?.('connecting');

        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log('[WSS] Connection established');
            this.onLogCallback?.('[WSS] Connected to signaling server');
            this.reconnectAttempts = 0;
            this.isReconnecting = false;
            this._joinRoom();
        };

        this.socket.onmessage = (event) => {
            let message;
            try {
                message = JSON.parse(event.data);
            } catch (e) {
                console.error('[WSS] Invalid message:', event.data);
                return;
            }
            console.log('[WSS] Received:', message.action);
            this._handleMessage(message);
        };

        this.socket.onclose = (event) => {
            console.log('[WSS] Connection closed:', event.code, event.reason);
            this.onLogCallback?.(`[WSS] Disconnected (${event.code})`);
            this.onStatusCallback?.('disconnected');
            this._scheduleReconnect();
        };

        this.socket.onerror = (error) => {
            console.error('[WSS] Error:', error);
            this.onLogCallback?.('[ERR] WebSocket connection error');
            this.onStatusCallback?.('error');
        };
    }

    _joinRoom() {
        if (!this.roomId) return;
        this._send({ action: 'JOIN_ROOM', roomId: this.roomId });
        this._send({ action: 'IDENTIFY', clientType: this.clientType });
        this.onLogCallback?.(`[WSS] Joined room: ${this.roomId}`);
    }

    _handleMessage(message) {
        switch (message.action) {
            case 'ROOM_STATE': {
                const { clientCount, isFull } = message;
                console.log(`[WSS] Room state: ${clientCount} clients, full: ${isFull}`);
                this.onLogCallback?.(`[WSS] Room clients: ${clientCount}`);
                if (this.clientType === 'desktop') {
                    if (isFull) {
                        this.onStatusCallback?.('connected');
                        updateDesktopStatus(true);
                    } else {
                        this.onStatusCallback?.('waiting');
                        updateDesktopStatus(false);
                    }
                }
                break;
            }
            case 'CONNECTED': {
                console.log('[WSS] Room CONNECTED - both clients present');
                this.onLogCallback?.('[WSS] Terminal linked!');
                if (this.clientType === 'desktop') {
                    this.onStatusCallback?.('connected');
                    updateDesktopStatus(true);
                }
                break;
            }
            case 'DISCONNECTED': {
                console.log('[WSS] Room DISCONNECTED - peer left');
                this.onLogCallback?.('[WSS] Terminal disconnected');
                if (this.clientType === 'desktop') {
                    this.onStatusCallback?.('disconnected');
                    updateDesktopStatus(false);
                }
                break;
            }
            case 'OVERRIDE': {
                console.log('[WSS] OVERRIDE received:', message.code);
                this.onLogCallback?.('[WSS] Override signal received!');
                if (this.onMessageCallback) {
                    this.onMessageCallback(message);
                }
                break;
            }
            case 'ERROR': {
                console.error('[WSS] Server error:', message.message);
                this.onLogCallback?.(`[ERR] ${message.message}`);
                break;
            }
            case 'PONG': {
                // Heartbeat response
                break;
            }
            default:
                console.log('[WSS] Unhandled message:', message);
        }
    }

    _send(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
            return true;
        }
        console.warn('[WSS] Cannot send - socket not open');
        return false;
    }

    sendOverride(code) {
        if (this.clientType !== 'mobile') {
            console.warn('[WSS] Only mobile can send OVERRIDE');
            return false;
        }
        return this._send({ action: 'OVERRIDE', code });
    }

    _scheduleReconnect() {
        if (!this.shouldReconnect) return;
        if (this.isReconnecting) return;
        if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.error('[WSS] Max reconnect attempts reached');
            this.onLogCallback?.('[ERR] Max reconnection attempts. Reload page.');
            this.onStatusCallback?.('failed');
            return;
        }

        this.isReconnecting = true;
        this.reconnectAttempts++;
        const delay = getBackoffDelay(this.reconnectAttempts);

        console.log(`[WSS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        this.onLogCallback?.(`[WSS] Reconnecting in ${Math.round(delay/1000)}s...`);

        this.reconnectTimer = setTimeout(() => {
            this.isReconnecting = false;
            if (this.shouldReconnect) {
                this._createConnection();
            }
        }, delay);
    }

    disconnect() {
        this.shouldReconnect = false;
        clearTimeout(this.reconnectTimer);
        if (this.socket) {
            this.socket.close(1000, 'Client disconnect');
            this.socket = null;
        }
    }

    getRoomId() {
        return this.roomId;
    }

    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }
}

// --- Mobile Net-Deck Initialization ---
function initMobileClient(onConnectedCallback, onErrorCallback, onLogCallback) {
    // Get or generate session ID
    let sessionId = sessionStorage.getItem('arasaka_session_id');
    if (!sessionId) {
        sessionId = generateSessionId();
        sessionStorage.setItem('arasaka_session_id', sessionId);
    }
    console.log('[MOBILE] Net-Deck Session ID:', sessionId);
    onLogCallback?.(`[NET-DECK] Session ID: ${sessionId}`);

    const wssClient = new WSSClient(
        // onMessage - handle OVERRIDE from server (mobile doesn't expect OVERRIDE, but keep for symmetry)
        (message) => {
            if (message.action === 'OVERRIDE') {
                // Mobile sent it, server echoed back - ignore or confirm
            }
        },
        // onStatus
        (status) => {
            if (status === 'connected') {
                onConnectedCallback?.();
            }
        },
        // onLog
        onLogCallback
    );

    // Connect to signaling server
    wssClient.connect(sessionId, 'mobile');

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            if (!wssClient.isConnected()) {
                console.log('[NET-DECK] Tab active, reconnecting...');
                onLogCallback?.('[NET-DECK] Tab focused, reconnecting...');
                wssClient.connect(sessionId, 'mobile');
            } else {
                console.log('[NET-DECK] Tab active, connection alive');
                onLogCallback?.('[NET-DECK] Tab active, awaiting terminal...');
            }
        } else {
            console.log('[NET-DECK] Tab hidden, keeping connection alive...');
        }
    });

    function sendOverride(code) {
        console.log('[MOBILE] Sending OVERRIDE:', code);
        onLogCallback?.('[NET-DECK] Sending override...');
        return wssClient.sendOverride(code);
    }

    function getSessionId() {
        return sessionId;
    }

    function generateDesktopUrlWrapper() {
        return generateDesktopUrl(sessionId);
    }

    return { sendOverride, getSessionId, generateDesktopUrl: generateDesktopUrlWrapper, wssClient };
}

// --- Desktop Terminal Initialization ---
function initDesktopClient(onOverrideCallback, onLogCallback) {
    const targetRoomId = getTargetPeerId();
    
    if (!targetRoomId) {
        console.log('[DESKTOP] No target room ID in URL');
        onLogCallback?.('[ERR] No session ID in URL. Scan QR from net-deck.');
        return null;
    }

    console.log('[DESKTOP] Target room:', targetRoomId);
    onLogCallback?.(`[DESKTOP] Connecting to: ${targetRoomId}`);

    const wssClient = new WSSClient(
        // onMessage - handle OVERRIDE from mobile
        (message) => {
            if (message.action === 'OVERRIDE' && message.code === SECRET_CODE) {
                console.log('[DESKTOP] Valid OVERRIDE received from mobile');
                onLogCallback?.('[DESKTOP] Override received! Hacking...');
                if (typeof onOverrideCallback === 'function') {
                    onOverrideCallback();
                }
            }
        },
        // onStatus
        (status) => {
            // Status updates handled in WSSClient._handleMessage via updateDesktopStatus
        },
        // onLog
        onLogCallback
    );

    // Connect to signaling server
    wssClient.connect(targetRoomId, 'desktop');

    return wssClient;
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
        WSS_URL,
        MAX_RECONNECT_ATTEMPTS,
        generateSessionId,
        getTargetPeerId,
        glitchEffect,
        addDevLogs,
        initAudioPlayer,
        initGallery,
        initKeyboardShortcuts,
        startArasakaInitLogs,
        initMobileClient,
        initDesktopClient,
        shareUrl,
        formatTime,
        sleep
    };
}
