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

// PeerJS Signaling Server Configuration
// Using peerjs.metered.ca (free, stable) instead of default 0.peerjs.com (403 Forbidden)
const PEER_OPTIONS = {
    host: 'terminalac.cyberlation.net',
    port: 443,
    path: '/myapp',
    secure: true,
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    }
};

// Reconnection configuration with exponential backoff
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 2000; // 2 seconds
const MAX_RECONNECT_DELAY = 10000; // 10 seconds max

// Debug: log which signaling server we're using
console.log('[PEER] Using signaling server:', PEER_OPTIONS.host, '| TURN relay enabled');

// Helper: Calculate exponential backoff delay
function getBackoffDelay(attempt) {
    const delay = Math.min(INITIAL_RECONNECT_DELAY * Math.pow(2, attempt - 1), MAX_RECONNECT_DELAY);
    return delay;
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

// --- PeerJS Helper (Desktop - Connects to Mobile with Exponential Backoff) ---
function initDesktopPeer(targetMobileId, onOverrideCallback, onLogCallback) {
    if (typeof Peer === 'undefined') {
        console.error('[DESKTOP] PeerJS not loaded');
        onLogCallback?.('[ERR] PeerJS not loaded');
        return null;
    }

    if (!targetMobileId) {
        console.log('[DESKTOP] No target Mobile ID in URL');
        return null;
    }

    console.log('[DESKTOP] Initializing PeerJS, will connect to Mobile:', targetMobileId);
    onLogCallback?.(`[DESKTOP] Connecting to: ${targetMobileId}`);

    // Desktop creates peer with auto-generated ID using PEER_OPTIONS config
    const desktopPeer = new Peer(undefined, PEER_OPTIONS);
    let conn = null;
    let reconnectAttempts = 0;
    let isReconnecting = false;
    let reconnectTimer = null;

    function attemptConnectToMobile() {
        if (isReconnecting) {
            console.log('[DESKTOP] Reconnection already in progress, skipping');
            return;
        }
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.error('[DESKTOP] Max reconnection attempts reached. Check if mobile is online.');
            onLogCallback?.('[ERR] Max reconnection attempts reached. Restart page on both devices.');
            return;
        }

        isReconnecting = true;
        reconnectAttempts++;
        const delay = reconnectAttempts === 1 ? 0 : getBackoffDelay(reconnectAttempts - 1);
        
        console.log(`[DESKTOP] Connection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} to ${targetMobileId}${delay > 0 ? ` in ${delay/1000}s` : ''}`);
        onLogCallback?.(`[DESKTOP] Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);

        if (delay > 0) {
            reconnectTimer = setTimeout(() => {
                makeConnectionAttempt();
            }, delay);
        } else {
            makeConnectionAttempt();
        }
    }

    function makeConnectionAttempt() {
        console.log('[DESKTOP] Connecting to Mobile Net-Deck:', targetMobileId);
        conn = desktopPeer.connect(targetMobileId, { reliable: true });

        conn.on('open', () => {
            console.log('[DESKTOP] P2P Connection FULLY ESTABLISHED!');
            updateDesktopStatus(true);
            onLogCallback?.('[DESKTOP] Connection established!');
            
            // Reset reconnection state on success
            reconnectAttempts = 0;
            isReconnecting = false;
            clearTimeout(reconnectTimer);
        });

        conn.on('data', (data) => {
            console.log('[DESKTOP] Received data:', data);
            if (data.action === 'OVERRIDE' && data.code === SECRET_CODE) {
                console.log('[DESKTOP] Valid OVERRIDE received from mobile');
                onLogCallback?.('[DESKTOP] Override received! Hacking...');
                if (typeof onOverrideCallback === 'function') {
                    onOverrideCallback();
                }
            }
        });

        conn.on('error', (err) => {
            console.error('[DESKTOP] Connection error:', err, '| type:', err.type);
            onLogCallback?.(`[ERR] Connection error: ${err.message}`);
        });

        conn.on('close', () => {
            console.log('[DESKTOP] Connection closed by mobile');
            updateDesktopStatus(false);
            onLogCallback?.('[DESKTOP] Connection lost, reconnecting...');
            
            // Schedule reconnection with backoff if not destroyed
            if (!desktopPeer.destroyed) {
                isReconnecting = false;
                attemptConnectToMobile();
            }
        });
    }

    desktopPeer.on('open', (id) => {
        console.log('[DESKTOP] Peer opened with ID:', id);
        console.log('[DESKTOP] Connecting to Mobile Net-Deck:', targetMobileId);
        
        // Reset reconnection state when peer opens successfully
        reconnectAttempts = 0;
        isReconnecting = false;
        
        attemptConnectToMobile();
    });

    // Handle incoming connections (fallback if mobile connects to us)
    desktopPeer.on('connection', (incomingConn) => {
        console.log('[DESKTOP] Incoming connection from Mobile:', incomingConn.peer);
        onLogCallback?.('[DESKTOP] Incoming terminal connection');

        conn = incomingConn;
        const incomingId = incomingConn.peer;

        incomingConn.on('open', () => {
            console.log('[DESKTOP] Incoming connection from Mobile established!');
            updateDesktopStatus(true);
            onLogCallback?.('[DESKTOP] Terminal link established');
            
            // Reset reconnection state on success
            reconnectAttempts = 0;
            isReconnecting = false;
            clearTimeout(reconnectTimer);
        });

        incomingConn.on('data', (data) => {
            console.log('[DESKTOP] Received data on incoming:', data);
            if (data.action === 'OVERRIDE' && data.code === SECRET_CODE) {
                console.log('[DESKTOP] Valid OVERRIDE received on incoming connection');
                onLogCallback?.('[DESKTOP] Override received! Hacking...');
                if (typeof onOverrideCallback === 'function') {
                    onOverrideCallback();
                }
            }
        });

        incomingConn.on('close', () => {
            console.log('[DESKTOP] Incoming connection closed');
            updateDesktopStatus(false);
        });

        incomingConn.on('error', (err) => {
            console.error('[DESKTOP] Incoming connection error:', err);
        });
    });

    desktopPeer.on('error', (err) => {
        console.error('[DESKTOP] Peer error:', err, '| type:', err.type, '| message:', err.message);
        onLogCallback?.(`[ERR] Peer error: ${err.message}`);
        if (err.type === 'server-error' || err.message?.includes('403') || err.message?.includes('Forbidden')) {
            console.error('[DESKTOP] SIGNALING SERVER ERROR: 403 Forbidden - Check PEER_OPTIONS host/port');
            onLogCallback?.('[ERR] Signaling server error (403) - check config');
        }
    });

    desktopPeer.on('disconnected', () => {
        console.log('[DESKTOP] Disconnected from signaling server');
        onLogCallback?.('[DESKTOP] Disconnected from signaling server');
        
        // Prevent recursive reconnect loop
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            console.log('[DESKTOP] Attempting signaling server reconnect...');
            isReconnecting = false;
            attemptConnectToMobile();
        } else {
            console.error('[DESKTOP] Max attempts reached, stopping reconnect loop');
            onLogCallback?.('[ERR] Max attempts reached. Reload page to retry.');
        }
    });

    desktopPeer.on('close', () => {
        console.log('[DESKTOP] Peer destroyed');
        clearTimeout(reconnectTimer);
    });

    return desktopPeer;
}

// --- PeerJS Helper (Mobile - Listens for Desktop with Exponential Backoff) ---
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

    const peer = new Peer(sessionId, PEER_OPTIONS);
    let connections = new Set(); // Track all active connections
    let reconnectAttempts = 0;
    let isReconnecting = false;
    let reconnectTimer = null;

    // Handle visibility change - reconnect when tab becomes active again
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            if (peer.disconnected || peer.destroyed) {
                console.log('[NET-DECK] Tab active again, reconnecting peer...');
                onLogCallback?.('[NET-DECK] Tab focused, reconnecting...');
                
                if (!isReconnecting && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    isReconnecting = true;
                    reconnectAttempts++;
                    peer.reconnect();
                }
            } else if (connections.size === 0) {
                console.log('[NET-DECK] Tab active, waiting for terminal...');
                onLogCallback?.('[NET-DECK] Tab active, awaiting terminal...');
            }
        } else {
            console.log('[NET-DECK] Tab hidden, keeping connection alive...');
        }
    });

    peer.on('open', (id) => {
        console.log('[MOBILE] Peer listening on ID:', id);
        onLogCallback?.(`[NET-DECK] Listening for terminal...`);
        
        // Reset reconnection state when peer opens successfully
        reconnectAttempts = 0;
        isReconnecting = false;
        clearTimeout(reconnectTimer);
    });

    // Handle INCOMING connections from Desktop
    peer.on('connection', (conn) => {
        console.log('[MOBILE] Incoming connection from Desktop:', conn.peer, '| conn.open:', conn.open);
        connections.add(conn);
        onLogCallback?.('[NET-DECK] Terminal connecting...');

        // CRITICAL: Wait for connection to fully open before marking as connected
        conn.on('open', () => {
            console.log('[MOBILE] Connection FULLY OPEN with Desktop:', conn.peer);
            onLogCallback?.('[NET-DECK] Terminal connected');
            onConnectedCallback?.();
        });

        conn.on('data', (data) => {
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
        console.error('[MOBILE] Peer error:', err, '| type:', err.type, '| message:', err.message);
        onLogCallback?.(`[ERR] Peer error: ${err.message}`);
        onErrorCallback?.(err);
        if (err.type === 'server-error' || err.message?.includes('403') || err.message?.includes('Forbidden')) {
            console.error('[MOBILE] SIGNALING SERVER ERROR: 403 Forbidden - Check PEER_OPTIONS host/port');
            onLogCallback?.('[ERR] Signaling server error (403) - check config');
        }
    });

    peer.on('disconnected', () => {
        console.log('[MOBILE] Disconnected from signaling server');
        onLogCallback?.('[MOBILE] Disconnected from signaling server');
        
        // Apply exponential backoff instead of immediate reconnect
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && !isReconnecting) {
            isReconnecting = true;
            reconnectAttempts++;
            const delay = getBackoffDelay(reconnectAttempts);
            
            console.log(`[MOBILE] Reconnecting in ${delay/1000}s (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
            onLogCallback?.(`[MOBILE] Reconnecting in ${delay/1000}s...`);
            
            reconnectTimer = setTimeout(() => {
                if (peer.disconnected && !peer.destroyed && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    peer.reconnect();
                }
            }, delay);
        } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.error('[MOBILE] Max reconnection attempts reached. Check network.');
            onLogCallback?.('[ERR] Max reconnection attempts reached. Reload page to retry.');
        }
    });

    peer.on('close', () => {
        console.log('[MOBILE] Peer destroyed');
        clearTimeout(reconnectTimer);
    });

    // Send OVERRIDE to ALL active connections
    function sendOverride(code) {
        console.log('[MOBILE] sendOverride called, connections count:', connections.size);
        let sent = false;
        connections.forEach((conn, idx) => {
            console.log(`[MOBILE] Connection ${idx}: open=${conn.open}, peer=${conn.peer}, peerConnection=${!!conn.peerConnection}`);
            if (conn && conn.open) {
                conn.send({ action: 'OVERRIDE', code });
                console.log('[MOBILE] Override sent to terminal:', code);
                sent = true;
            } else {
                console.warn('[MOBILE] Connection not ready for sending:', { open: conn?.open, peer: conn?.peer });
            }
        });
        if (!sent) {
            console.warn('[MOBILE] Cannot send override - no active connections with open data channel');
        }
        return sent;
    }

    function getSessionId() {
        return sessionId;
    }

    function generateDesktopUrlWrapper() {
        return generateDesktopUrl(sessionId);
    }

    return { sendOverride, getSessionId, generateDesktopUrl: generateDesktopUrlWrapper, peer };
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
        PEER_OPTIONS,
        MAX_RECONNECT_ATTEMPTS,
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
