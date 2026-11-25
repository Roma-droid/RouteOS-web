// API Base URL - will be configured per deployment
const API_BASE = '/api';

// State management
const state = {
    currentPage: 'dashboard',
    theme: 'dark',
    firewallRunning: false,
    lastUpdate: 0,
};

// Theme management
const themeBtn = document.getElementById('themeBtn');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', state.theme);
    
    if (state.theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

themeBtn.addEventListener('click', toggleTheme);

// Initialize theme from localStorage or system preference
const savedTheme = localStorage.getItem('routeos-theme');
if (savedTheme) {
    state.theme = savedTheme;
    document.body.setAttribute('data-theme', state.theme);
    if (state.theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
} else {
    // Check prefers-color-scheme
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        state.theme = 'light';
        document.body.setAttribute('data-theme', 'light');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

// Sidebar navigation
const sidebarNavItems = document.querySelectorAll('.sidebar-nav-item');
const pageSections = document.querySelectorAll('.page');

sidebarNavItems.forEach(item => {
    item.addEventListener('click', () => {
        // Update active state
        sidebarNavItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Hide all pages, show selected
        pageSections.forEach(section => section.classList.remove('active'));
        const pageId = item.dataset.page;
        document.getElementById('page-' + pageId).classList.add('active');
        state.currentPage = pageId;
    });
});

// Default page activation
document.querySelector('.sidebar-nav-item[data-page="dashboard"]').click();

// Page-specific initialization
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initNetwork();
    initFirewall();
    initDHCP();
    initDNS();
    initVPN();
    initSystem();
});

// API helper functions
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const defaults = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options
    };
    
    try {
        const response = await fetch(url, defaults);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`API error [${endpoint}]:`, error);
        showError(error.message);
        return null;
    }
}

// Show error message
function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'var(--accent-error)';
    toast.style.color = 'white';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '6px';
    toast.style.zIndex = '1000';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Notification system
function showNotification(message, type = 'info') {
    const colors = {
        info: 'var(--accent-primary)',
        success: 'var(--accent-success)',
        warning: 'var(--accent-warning)',
        error: 'var(--accent-error)'
    };
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 24px;
        background: ${colors[type]};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        font-size: 14px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Dashboard initialization and data fetching
function initDashboard() {
    let lastTraffic = 0;
    let lastUpdate = 0;
    
    function updateDashboard() {
        const now = Date.now();
        
        if (now - lastUpdate > 1000) {
            // Simulate traffic data - in production, fetch from /api/traffic
            lastTraffic += Math.random() * 1024 * 1024; // ~1MB per second
            document.getElementById('totalTraffic').textContent = formatBytes(lastTraffic);
            lastUpdate = now;
        }
        
        // Update speeds (smoothed)
        const downloadSpeed = Math.round(Math.random() * 50 + 10);
        const uploadSpeed = Math.round(Math.random() * 20 + 5);
        document.getElementById('downloadSpeed').textContent = downloadSpeed + ' Mbps';
        document.getElementById('uploadSpeed').textContent = uploadSpeed + ' Mbps';
        
        // Simulated connected devices
        const devices = Math.floor(Math.random() * 20) + 1;
        document.getElementById('connectedDevices').textContent = devices;
        
        // Update CPU load
        document.getElementById('cpuLoad').textContent = Math.round(Math.random() * 80) + '%';
        
        // Recent activity
        updateRecentActivity();
        
        // Schedule next update
        requestAnimationFrame(updateDashboard);
    }
    
    function formatBytes(bytes) {
        if (bytes >= 1073741824) {
            return (bytes / 1073741824).toFixed(2) + ' GB';
        }
        if (bytes >= 1048576) {
            return (bytes / 1048576).toFixed(2) + ' MB';
        }
        if (bytes >= 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        }
        return bytes + ' B';
    }
    
    function updateRecentActivity() {
        const activityList = document.getElementById('recentActivity');
        const activities = [
            'Загрузка конфигурации firewall',
            'DHCP аренда адреса 192.168.1.105',
            'DNS запрос google-public-dns-a.google.com',
            'VPN соединение установлено',
            'Обновление прошивки недоступно',
            'Новое подключение устройства к Wi-Fi',
            'Пакет было dropped правилами firewall',
            'DNS ответ с кэша dnsmasq'
        ];
        
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        const time = new Date().toLocaleTimeString();
        activityList.innerHTML = `<div class="table-row"><span class="table-cell">${time}</span><span class="table-cell">${randomActivity}</span></div>`;
    }
    
    // Initial update
    updateDashboard();
}

// Network page initialization
function initNetwork() {
    const interfaceSelect = document.getElementById('interfaceSelect');
    
    // Mock interfaces
    const interfaces = [
        { name: 'lan', nameDisplay: 'LAN (eth0)' },
        { name: 'wan', nameDisplay: 'WAN (ppp0)' },
        { name: 'wlan0', nameDisplay: 'Wi-Fi (wlan0)' }
    ];
    
    interfaces.forEach(intf => {
        const option = document.createElement('option');
        option.value = intf.name;
        option.textContent = intf.nameDisplay;
        interfaceSelect.appendChild(option);
    });
    
    // Form submission
    const ipv4Form = document.getElementById('ipv4Form');
    ipv4Form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const interfaceName = interfaceSelect.value;
        const ipAddress = document.getElementById('ipv4Address').value;
        const subnetMask = document.getElementById('ipv4Mask').value;
        
        if (!interfaceName || !ipAddress) {
            showError('Выберите интерфейс и адрес');
            return;
        }
        
        const result = await apiFetch('/network/ipv4', {
            method: 'POST',
            body: JSON.stringify({
                interface: interfaceName,
                address: ipAddress,
                mask: subnetMask
            })
        });
        
        if (result) {
            showNotification('Настройки IP применены успешно', 'success');
        }
    });
    
    // Wi-Fi form
    const wifiForm = document.getElementById('wifiForm');
    wifiForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const ssid = document.getElementById('wifiSSID').value;
        const password = document.getElementById('wifiPassword').value;
        const channel = document.getElementById('wifiChannel').value;
        
        if (!ssid) {
            showError('Введите SSID');
            return;
        }
        
        const result = await apiFetch('/wifi/start-ap', {
            method: 'POST',
            body: JSON.stringify({ ssid, password, channel })
        });
        
        if (result) {
            showNotification('Точка доступа включена', 'success');
        }
    });
}

// Firewall auto-detection and initialization
FIREBACKENDS = ['nftables', 'iptables', 'ipfw', 'pf'];

async function detectFirewallBackend() {
    // Try each known backend to see which is available
    for (const backend of FIREBACKENDS) {
        try {
            const result = await apiFetch(`/firewall/detect?backend=${backend}`);
            if (result.available) {
                return backend;
            }
        } catch (e) {
            // Continue to next backend
        }
    }
    return 'nftables'; // fallback
}

async function loadFirewallStatus() {
    // First, detect the backend if not already known
    if (!state.firewallBackend) {
        const detected = await detectFirewallBackend();
        state.firewallBackend = detected;
        
        // Update the UI backend display
        const backendEl = document.getElementById('firewallBackend');
        if (backendEl) {
            backendEl.textContent = detected;
        }
    }
    
    const result = await apiFetch('/firewall/status');
    
    if (result) {
        const statusEl = document.getElementById('firewallStatus');
        const rulesEl = document.getElementById('rulesCount');
        
        if (result.active) {
            statusEl.textContent = 'Активен';
            statusEl.className = 'status-badge status-online';
        } else {
            statusEl.textContent = 'Отключен';
            statusEl.className = 'status-badge status-offline';
        }
        
        // Backend is already set from detection, but also update from result if provided
        if (result.backend && result.backend !== state.firewallBackend) {
            state.firewallBackend = result.backend;
            const backendEl = document.getElementById('firewallBackend');
            if (backendEl) {
                backendEl.textContent = result.backend;
            }
        }
        
        document.getElementById('firewallStatus').parentElement.style.display = 'flex';
        rulesEl.textContent = result.rules_count || 0;
    }
}

function initFirewall() {
    // Auto-detect backend on init
    detectFirewallBackend().then(backend => {
        state.firewallBackend = backend;
        const backendEl = document.getElementById('firewallBackend');
        if (backendEl) {
            backendEl.textContent = backend;
        }
    });
    
    loadFirewallStatus();
    loadFirewallRules();
    
    // Auto-refresh every 5 seconds
    setInterval(() => {
        loadFirewallStatus();
        loadFirewallRules();
    }, 5000);
}

async function loadFirewallRules() {
    const result = await apiFetch('/firewall/rules');
    
    if (result && result.rules) {
        const rulesList = document.getElementById('rulesList');
        const backend = state.firewallBackend || 'nftables';
        
        if (result.rules.length === 0) {
            rulesList.innerHTML = '<p>Правила firewall не настроены</p>';
            return;
        }
        
        let html = '';
        result.rules.forEach((rule, index) => {
            // Add backend indicator to each rule
            const backendTag = `<span style="color: var(--text-small); font-size: 10px; margin-left: 4px;">${backend}</span>`;
            
            html += `
                <div class="table-row" style="border-top: 1px solid var(--border-color);">
                    <span class="table-cell">${rule.chain || 'input'}</span>
                    <span class="table-cell">${rule.table || 'filter'}</span>
                    <span class="table-cell">${rule.action || 'accept'}</span>
                    <span class="table-cell">${rule.protocol || 'all'}</span>
                    <span class="table-cell">${rule.src_addr || '-'}</span>
                    <span class="table-cell">${rule.dst_port ? rule.dst_port : '-'}</span>
                    <span class="table-cell">${backendTag}</span>
                    <span class="table-cell"><button class="btn btn-icon" onclick="deleteRule(${index})" title="Удалить правило">×</button></span>
                </div>
            `;
        });
        
        // Show backend info at top
        const backendInfo = result.backend ? `<div style="padding: 8px; color: var(--text-secondary); font-size: 12px; border-bottom: 1px solid var(--border-color);">Backend: ${result.backend}</div>` : '';
        
        rulesList.innerHTML = backendInfo + html;
    }
}

function addRuleForm() {
    const formCard = document.getElementById('addRuleFormCard');
    formCard.style.display = formCard.style.display === 'none' ? 'block' : 'none';
}

async function deleteRule(index) {
    if (confirm('Вы уверены, что хотите удалить правило №' + (index + 1) + '?')) {
        const result = await apiFetch('/firewall/rules', {
            method: 'DELETE',
            body: JSON.stringify({ index })
        });
        
        if (result) {
            loadFirewallRules();
            showNotification('Правило удалено', 'success');
        }
    }
}

// DHCP page initialization
function initDHCP() {
    loadDHCPStatus();
    loadDHCPLeases();
    
    setInterval(() => {
        loadDHCPLeases();
    }, 3000);
    
    const dhcpForm = document.getElementById('dhcpForm');
    dhcpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const result = await apiFetch('/dhcp/config', {
            method: 'POST',
            body: JSON.stringify({
                enable: document.getElementById('dhcpEnable').value === '1',
                range: document.getElementById('dhcpRange').value,
                gateway: document.getElementById('dhcpGateway').value,
                dns: document.getElementById('dhcpDNS').value,
                lease: parseInt(document.getElementById('dhcpLease').value)
            })
        });
        
        if (result) {
            showNotification('Конфигурация DHCP сохранена', 'success');
        }
    });
}

function loadDHCPStatus() {
    const enableSelect = document.getElementById('dhcpEnable');
    enableSelect.value = '1'; // Default to enabled
}

function loadDHCPLeases() {
    const leasesList = document.getElementById('dhcpLeasesList');
    
    // Mock data - in production, fetch from /api/dhcp/leases
    const mockLeases = [
        { ip: '192.168.1.101', mac: 'AA:BB:CC:DD:EE:01', hostname: 'laptop-user', expires: '23 min ago' },
        { ip: '192.168.1.102', mac: 'AA:BB:CC:DD:EE:02', hostname: 'phone-user', expires: '1h 45min ago' },
        { ip: '192.168.1.103', mac: 'AA:BB:CC:DD:EE:03', hostname: 'tablet-user', expires: '5 min ago' }
    ];
    
    if (mockLeases.length === 0) {
        leasesList.innerHTML = '<p>Активных аренд нет</p>';
        return;
    }
    
    let html = '';
    mockLeases.forEach(lease => {
        html += `
            <div style="padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                <span style="flex: 1;">${lease.ip}</span>
                <span style="flex: 1; color: var(--text-secondary);">(${lease.mac})</span>
                <span style="flex: 2;">${lease.hostname}</span>
                <span style="color: var(--text-secondary); font-size: 11px;">${lease.expires}</span>
            </div>
        `;
    });
    
    leasesList.innerHTML = html;
}

// DNS page initialization
function initDNS() {
    loadDNSConfig();
    loadStaticDNS();
    
    const dnsForm = document.getElementById('dnsForm');
    dnsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const result = await apiFetch('/dns/config', {
            method: 'POST',
            body: JSON.stringify({
                enable: document.getElementById('dnsEnable').value === '1',
                servers: document.getElementById('dnsServers').value,
                cache: document.getElementById('dnsCache').value === '1',
                min_ttl: parseInt(document.getElementById('dnsMinTTL').value)
            })
        });
        
        if (result) {
            showNotification('Конфигурация DNS сохранена', 'success');
        }
    });
}

function loadDNSConfig() {
    // In production, fetch from /api/dns/config
    const dnsEnable = document.getElementById('dnsEnable');
    dnsEnable.value = '1';
    document.getElementById('dnsServers').value = '8.8.8.8,8.8.4.4';
    document.getElementById('dnsCache').value = '1';
    document.getElementById('dnsMinTTL').value = '60';
}

function loadStaticDNS() {
    const staticDnsList = document.getElementById('staticDnsList');
    
    // Mock static records
    const records = [
        { hostname: 'router', ip: '192.168.1.1' },
        { hostname: 'printer', ip: '192.168.1.50' }
    ];
    
    if (records.length === 0) {
        staticDnsList.innerHTML = '<p>Статических записей нет</p>';
        return;
    }
    
    let html = '';
    records.forEach(record => {
        html += `
            <div style="padding: 4px 0; border-bottom: 1px solid var(--border-color);">
                <span style="flex: 1;">${record.hostname}.local</span>
                <span style="flex: 1; color: var(--text-secondary);">→</span>
                <span style="flex: 1; color: var(--text-primary);">${record.ip}</span>
                <span style="color: var(--text-secondary); font-size: 11px; margin-left: 10px;"><button class="btn btn-icon" title="Удалить">×</button></span>
            </div>
        `;
    });
    
    staticDnsList.innerHTML = html;
}

// VPN page initialization
function initVPN() {
    loadOpenVPNConfig();
    loadWireGuardConfig();
}

function loadOpenVPNConfig() {
    // In production, fetch from /api/vpn/openvpn
    const openvpnEnable = document.getElementById('openvpnEnable');
    openvpnEnable.value = '1';
    document.getElementById('openvpnConfig').value = '/etc/openvpn/server.conf';
    document.getElementById('openvpnPort').value = '1194';
    document.getElementById('openvpnProto').value = 'udp';
}

function loadWireGuardConfig() {
    // In production, fetch from /api/vpn/wireguard
    const wireguardEnable = document.getElementById('wireguardEnable');
    wireguardEnable.value = '1';
    
    // Generate mock keys
    document.getElementById('wireguardPrivateKey').value = 'Vmx7nQl6Kvy8lF5cD3xXxYyZz00AA11BB22CC33DD44EE55FF66AA77BB88CC99';
    document.getElementById('wireguardPublicKey').value = 'ABCD1234EFGH5678IJKL90MNOPQRSTUV';
    document.getElementById('wireguardServerAddr').value = '10.0.0.1/24';
    document.getElementById('wireguardPort').value = '51820';
}

document.getElementById('openvpnForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const result = await apiFetch('/vpn/openvpn', {
        method: 'POST',
        body: JSON.stringify({
            enable: document.getElementById('openvpnEnable').value === '1',
            config: document.getElementById('openvpnConfig').value,
            port: parseInt(document.getElementById('openvpnPort').value),
            proto: document.getElementById('openvpnProto').value
        })
    });
    
    if (result) {
        showNotification('OpenVPN конфигурация сохранена', 'success');
    }
});

document.getElementById('wireguardForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const result = await apiFetch('/vpn/wireguard', {
        method: 'POST',
        body: JSON.stringify({
            enable: document.getElementById('wireguardEnable').value === '1',
            private_key: document.getElementById('wireguardPrivateKey').value,
            public_key: document.getElementById('wireguardPublicKey').value,
            server_addr: document.getElementById('wireguardServerAddr').value,
            port: parseInt(document.getElementById('wireguardPort').value)
        })
    });
    
    if (result) {
        showNotification('WireGuard конфигурация сохранена', 'success');
    }
});

// System page initialization
function initSystem() {
    loadSystemInfo();
    loadServicesStatus();
    loadSystemLogs();
    
    // Refresh system info every 10 seconds
    setInterval(() => {
        loadSystemInfo();
        loadServicesStatus();
    }, 10000);
    
    // Refresh logs every 5 seconds
    setInterval(() => {
        loadSystemLogs();
    }, 5000);
}

async function loadSystemInfo() {
    const result = await apiFetch('/system/info');
    
    if (result) {
        document.getElementById('systemHostname').textContent = result.hostname || 'routeos';
        document.getElementById('systemKernel').textContent = result.kernel || '5.15.0-rosa';
        document.getElementById('systemArch').textContent = result.arch || 'x86_64';
        
        // Uptime formatting
        if (result.uptime) {
            const days = Math.floor(result.uptime / 86400);
            const hours = Math.floor((result.uptime % 86400) / 3600);
            const minutes = Math.floor((result.uptime % 3600) / 60);
            let uptimeStr = '';
            if (days > 0) uptimeStr += days + ' дн. ';
            if (hours > 0) uptimeStr += hours + ' час. ';
            if (minutes > 0 || !uptimeStr) uptimeStr += minutes + ' мин.';
            document.getElementById('systemUptime').textContent = uptimeStr || '0 мин.';
        }
    }
}

async function loadServicesStatus() {
    // In production, fetch from /api/services
    // Mock status updates
    const services = ['dnsmasq', 'nftables', 'openvpn', 'wireguard', 'sshd', 'cron'];
    
    services.forEach(service => {
        const checkbox = document.getElementById('service' + service.charAt(0).toUpperCase() + service.slice(1));
        if (checkbox) {
            checkbox.checked = Math.random() > 0.1; // Mostly enabled
        }
    });
}

function restartService(serviceName) {
    // In production, call /api/services/restart
    showNotification('Перезапуск ' + serviceName + '...', 'info');
    setTimeout(() => {
        showNotification(serviceName + ' перезапущен', 'success');
    }, 1000);
}

function confirmReboot() {
    if (confirm('Вы действительно хотите перезагрузить систему? Все несохраненные изменения будут потеряны.')) {
        // In production, call /api/system/reboot
        showNotification('Инициирована перезагрузка системы', 'warning');
        setTimeout(() => {
            window.location.href = window.location.href; // Simulate reload
        }, 2000);
    }
}

function loadSystemLogs() {
    const logsTextarea = document.getElementById('systemLogs');
    
    // In production, fetch from /api/system/logs
    const mockLogs = [
        '[ $(date) ] Kernel: nftables rule updated',
        '[ $(date) ] Dnsmasq: DHCP discover from AA:BB:CC:DD:EE:01',
        '[ $(date) ] Firewall: incoming connection allowed on LAN',
        '[ $(date) ] OpenVPN: client connected from 10.0.0.2',
        '[ $(date) ] System: cron job executed successfully',
        '[ $(date) ] Network: WAN interface reconnected',
        '[ $(date) ] Dnsmasq: DNS query for google.com answered',
        '[ $(date) ] WireGuard: handshake established with peer',
        '[ $(date) ] System: boot complete',
        '[ $(date) ] Firewall: rule deleted by admin'
    ];
    
    const randomLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
    logsTextarea.value = randomLog + '\n' + logsTextarea.value.substring(0, 200);
}

// Terminal emulator
const terminalCommands = {
    help: 'Show available commands',
    ls: 'List files',
    cd: 'Change directory',
    pwd: 'Print working directory',
    whoami: 'Show current user',
    clear: 'Clear terminal',
    reboot: 'Reboot the system',
    shutdown: 'Shutdown the system',
    status: 'Show system status',
    firewall: 'Show firewall status',
    dhcp: 'Show DHCP status',
    dns: 'Show DNS status',
    vpn: 'Show VPN status',
    network: 'Show network status',
    ping: 'Ping a host',
    exit: 'Exit terminal'
};

function initTerminal() {
    const input = document.getElementById('terminalInput');
    const output = document.getElementById('terminalOutput');
    const hostnameEl = document.getElementById('terminalHostname');
    
    // Set hostname
    hostnameEl.textContent = 'routeos';
    
    // Add initial prompt
    addTerminalLine('root@RouteOS ~ #', 'prompt');
    
    // Focus input
    input.focus();
    
    // Handle input
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = input.value.trim();
            if (command) {
                processTerminalCommand(command);
            }
            input.value = '';
            // Keep input at full width after submit
            input.style.width = '100%';
        }
    });
}

function processTerminalCommand(command) {
    const lowerCmd = command.toLowerCase();
    const output = document.getElementById('terminalOutput');
    
    // Add user command line
    addTerminalLine(command, 'command');
    
    // Handle commands
    switch (true) {
        case lowerCmd === 'clear' || lowerCmd === 'cls':
            clearTerminalOutput();
            addTerminalLine('root@RouteOS ~ #', 'prompt');
            break;
            
        case lowerCmd === 'help' || lowerCmd === '?':
            addTerminalLine('Доступные команды:', 'info');
            addTerminalLine('  help|?       - Show available commands', 'command');
            addTerminalLine('  ls           - List files', 'command');
            addTerminalLine('  pwd          - Print working directory', 'command');
            addTerminalLine('  whoami       - Show current user', 'command');
            addTerminalLine('  clear        - Clear terminal', 'command');
            addTerminalLine('  reboot       - Reboot the system', 'command');
            addTerminalLine('  shutdown     - Shutdown the system', 'command');
            addTerminalLine('  status       - Show system status', 'command');
            addTerminalLine('  firewall     - Show firewall status', 'command');
            addTerminalLine('  dhcp         - Show DHCP status', 'command');
            addTerminalLine('  dns          - Show DNS status', 'command');
            addTerminalLine('  vpn          - Show VPN status', 'command');
            addTerminalLine('  network      - Show network status', 'command');
            addTerminalLine('  ping <host>  - Ping a host', 'command');
            addTerminalLine('  exit         - Exit terminal', 'command');
            break;
            
        case lowerCmd === 'ls' || lowerCmd === 'dir':
            addTerminalLine('bin  etc  home  lib  proc  sys  tmp  usr  var', 'output');
            break;
            
        case lowerCmd === 'pwd':
            addTerminalLine('/home', 'output');
            break;
            
        case lowerCmd === 'whoami':
            addTerminalLine('root', 'output');
            break;
            
        case lowerCmd === 'reboot':
            if (confirm('Вы действительно хотите перезагрузить систему?')) {
                addTerminalLine('Инициирована перезагрузка...', 'warning');
                showNotification('Перезагрузка системы', 'warning');
                setTimeout(() => {
                    window.location.href = window.location.href;
                }, 1000);
            }
            break;
            
        case lowerCmd === 'shutdown':
            if (confirm('Вы действительно хотите выключить систему?')) {
                addTerminalLine('Выключение системы...', 'warning');
                showNotification('Выключение системы', 'warning');
            }
            break;
            
        case lowerCmd === 'status':
            addTerminalLine('System: Online', 'output');
            addTerminalLine('Uptime: 2 days, 4 hours, 12 minutes', 'output');
            addTerminalLine('Load: 15%', 'output');
            break;
            
        case lowerCmd === 'firewall':
            addTerminalLine('Firewall: nftables active', 'output');
            addTerminalLine('Rules: 12 rules loaded', 'output');
            addTerminalLine('Backend: nftables', 'output');
            break;
            
        case lowerCmd === 'dhcp':
            addTerminalLine('DHCP Server: Enabled', 'output');
            addTerminalLine('Leases: 3 active', 'output');
            addTerminalLine('Range: 192.168.1.100 - 192.168.1.200', 'output');
            break;
            
        case lowerCmd === 'dns':
            addTerminalLine('DNS: dnsmasq active', 'output');
            addTerminalLine('Servers: 8.8.8.8, 8.8.4.4', 'output');
            addTerminalLine('Cache: Enabled', 'output');
            break;
            
        case lowerCmd === 'vpn':
            addTerminalLine('VPN: WireGuard active', 'output');
            addTerminalLine('Port: 51820', 'output');
            addTerminalLine('Peers: 1 connected', 'output');
            break;
            
        case lowerCmd === 'network':
            addTerminalLine('LAN: 192.168.1.1/24', 'output');
            addTerminalLine('WAN: DHCP obtained', 'output');
            addTerminalLine('Wi-Fi: Access point enabled', 'output');
            break;
            
        case lowerCmd.startsWith('ping '):
            const host = command.substring(5).trim();
            addTerminalLine(`PING ${host} (192.168.1.1): 56 data bytes`, 'output');
            addTerminalLine('64 bytes from 192.168.1.1: icmp_seq=0 ttl=64 time=2.34 ms', 'output');
            addTerminalLine('64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=2.11 ms', 'output');
            addTerminalLine('64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=2.28 ms', 'output');
            addTerminalLine('--- ${host} ping statistics ---', 'output');
            addTerminalLine('3 packets transmitted, 3 received, 0% packet loss, time 2002ms', 'output');
            addTerminalLine('rtt min/avg/max/mdev = 2.112/2.245/2.341/0.098 ms', 'output');
            break;
            
        case lowerCmd === 'exit':
            addTerminalLine('Goodbye!', 'info');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
            break;
            
        default:
            addTerminalLine(`: command not found: ${command}`, 'error');
            addTerminalLine('Type "help" for available commands.', 'info');
    }
}

function addTerminalLine(text, type) {
    const output = document.getElementById('terminalOutput');
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.innerHTML = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function clearTerminalOutput() {
    const output = document.getElementById('terminalOutput');
    output.innerHTML = '';
}

function handleTerminalKey(e) {
    // Allow Ctrl+C, Ctrl+V, etc. to work naturally
    if (e.key === 'Escape') {
        e.target.value = '';
        e.target.blur();
    }
}

// Initialize terminal when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    initTerminal();
    // ... existing init code
});

// Quick error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});