# RouteOS Web Interface

Веб-интерфейс для Linux роутера на базе RouteOS с полным набором функций стандартного роутера.

## 📋 Обзор

Полнофункциональный веб-интерфейс для управления роутером с графическим интерфейсом, включающий:

- **Дашборд** — мониторинг трафика, скорости, подключенных устройств
- **Сеть** — настройки IPv4, Wi-Fi точка доступа
- **Firewall** — управление правилами iptables (авто-детекция бэкэнда)
- **DHCP** — сервер и аренды адресов
- **DNS** — конфигурация dnsmasq и статические записи
- **VPN** — OpenVPN и WireGuard
- **Система** — информация, логи, управление сервисами
- **Terminal** — встроенный терминал с 20+ командами

## 🚀 Быстрый старт

### 1. Запуск Python бэкенда

```bash
cd /home/roma/Проекты/RouteOS/web
python3 backend.py
```

### 2. Откройте веб-интерфейс

Откройте браузер по адресу: `http://127.0.0.1:5000/`

или

`http://127.0.0.1:5000/routeos`

### 3. Использование

Веб-интерфейс автоматически определяет доступные компоненты и предоставляет соответствующие страницы.

## 🛠️ Требования

- Python 3.x
- Flask (`pip3 install flask`)
- iptables (для firewall — обычно предустановлен в Linux)
- dnsmasq (для DHCP/DNS)
- Доступ к системе роутера

## 🌐 API Эндпоинты

Все эндпоинты доступны по адресу `http://<host>:5000/api/...`

### Firewall

| Эндпоинт | Метод | Описание |
|----------|-------|----------|
| `/api/firewall/status` | GET | Статус firewall, авто-детект бэкэнда |
| `/api/firewall/rules` | GET | Список текущих правил |
| `/api/firewall/rules` | POST | Добавить новое правило |
| `/api/firewall/rules` | DELETE | Удалить правило по индексу |

### Network

| Эндпоинт | Метод | Описание |
|----------|-------|----------|
| `/api/network/interfaces` | GET | Сетевые интерфейсы |
| `/api/network/ipv4` | POST | Настройка IPv4 адреса |

### DHCP

| Эндпоинт | Метод | Описание |
|----------|-------|----------|
| `/api/dhcp/config` | POST | Конфигурация DHCP сервера |
| `/api/dhcp/leases` | GET | Активные аренды |

### DNS

| Эндпоинт | Метод | Описание |
|----------|-------|----------|
| `/api/dns/config` | POST | Конфигурация DNS |

### VPN

| Эндпоинт | Метод | Описание |
|----------|-------|----------|
| `/api/vpn/openvpn` | POST | Конфигурация OpenVPN |
| `/api/vpn/wireguard` | POST | Конфигурация WireGuard |

### System

| Эндпоинт | Метод | Описание |
|----------|-------|----------|
| `/api/system/info` | GET | Информация о системе |
| `/api/system/services` | GET | Статус сервисов |
| `/api/system/logs` | GET | Системные логи |
| `/api/system/reboot` | POST | Перезагрузка системы |
| `/api/services/restart` | POST | Перезапуск сервиса |

## 🚀 Развертывание

### Вариант 1: Локальная разработка

```bash
cd /home/roma/Проекты/RouteOS/web
python3 backend.py
# Откройте http://127.0.0.1:5000/ в браузере
```

### Вариант 2: Системная служба

```bash
# Создать файл /etc/systemd/system/routeos-backend.service
[Unit]
Description=RouteOS Python Backend
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/python3 /home/roma/Проекты/RouteOS/web/backend.py
Restart=always
WorkingDirectory=/home/roma/Проекты/RouteOS/web

[Install]
WantedBy=multi-user.target

# Включить и запустить
systemctl enable routeos-backend
systemctl start routeos-backend
```

### Вариант 3: Зазадом nginx

```nginx
 upstream routeos_backend {
     server 127.0.0.1:5000;
 }

 server {
     listen 80;
     server_name routeos.your-domain.com;
     
     location / {
         proxy_pass http://routeos_backend;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
     
     location ~ \.(css|js|png|jpg|svg|ico)$ {
         root /home/roma/Проекты/RouteOS/web;
         expires 30d;
         add_header Cache-Control "public, static";
     }
 }
```

## 🔥 Firewall (iptables)

Веб-интерфейс автоматически определяет бэкэнд firewall:

- Проверяет `/usr/bin/iptables` — использует iptables
- Фолбэк на nftables если iptables недоступен
- Панель управления показывает: `Backend: iptables`

### Управление правилами

- Добавить правило: выберите действие, протокол, порт, адрес источника и направление
- Удалить правило: нажмите кнопку × рядом с правилом
- Правила сохраняются в конфигурации iptables

## 📡 VPN

### OpenVPN

- Настройка порта, протокола (UDP/TCP)
- Генерация конфигурационного файла
- Поддержка TLS аутентификации

### WireGuard

- Генерация пар ключей (приватный/публичный)
- Настройка адреса сервера и порта
- Автоматическое применение конфигурации

## 📊 Дашборд

- Общий трафик (увеличивается в реальном времени)
- Скорость скачивания/отдачи (в Mbps)
- Количество подключенных устройств
- Последние действия системы

## 💻 Terminal (Встроенный терминал)

Доступно 20+ команд:

- `help` / `?` — справка
- `ls` / `dir` — список файлов
- `pwd` — текущая директория
- `whoami` — текущий пользователь
- `clear` / `cls` — очистка экрана
- `reboot` — перезагрузка системы (с подтверждением)
- `shutdown` — выключение системы (с подтверждением)
- `status` — статус системы
- `firewall` — статус firewall
- `dhcp` — статус DHCP
- `dns` — статус DNS
- `vpn` — статус VPN
- `network` — сетевой статус
- `ping <хост>` — пинг хоста
- `exit` — выход

## 📁 Структура проекта

```
/home/roma/Проекты/RouteOS/web/
├── index.html      # Веб-интерфейс (662 строки)
├── style.css       # Стили (594 строки)
├── script.js       # JavaScript логика (924 строки)
├── backend.py      # Python Flask бэкенд (25KB)
└── README.md       # Этот файл
```

## 🐍 Зависимости Python

```bash
pip3 install flask flask-cors
# Или используйте --break-system-packages:
pip3 install flask flask-cors --break-system-packages
```

## 📜 Лицензия

MIT License - свободное использование для личных и comerciales проектов.

## 👨‍💻 Автор

RouteOS Web Interface - проект для управления роутерами Linux на базе RouteOS.

---

## 🆘 Поддержка и устранение неполадок

### Типичные проблемы:

1. **Не запускается backend**
   ```bash
   pip3 install flask --break-system-packages
   python3 backend.py
   ```

2. **Firewall не détect**
   - Убедитесь, что iptables установлен: `which iptables`
   - Проверьте права доступа

3. **Не могу изменить настройки**
   - Требуются права root для записи в /etc/ файлы
   - Используйте sudo или запускайте от имени root

4. **Страница не загружается**
   - Проверьте, запущен ли backend: `ps aux | grep backend.py`
   - Проверьте порт: `curl http://127.0.0.1:5000`

### Логи:

Логи работы бэкенда можно найти в консоли при запуске или в `/tmp/backend.log`.

## ✅ Что работает

- [x] Веб-интерфейс со всеми 8 страницами
- [x] Авто-детект iptables/nftables
- [x] Управление правилами firewall
- [x] DHCP сервер
- [x] DNS конфигурация
- [x] OpenVPN конфигурация
- [x] WireGuard конфигурация
- [x] Системная информация
- [x] Системные логи
- [x] Terminal эмулятор
- [x] responsive design (мобильный + десктоп)
- [x] Dark theme
- [x] Toast-уведомления
- [x] Автообновление данных
<tool_call>
<parameter name="pattern">
pattern
