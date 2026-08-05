# 🤖 BIGST4CK Telegram Bot

**Server Selling Bot with Pterodactyl Integration**

![Version](https://img.shields.io/badge/version-1.0.0-grey)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)
[![Fork](https://img.shields.io/badge/Fork-Repo-orange)](https://github.com/bigtechs2/BIGST4CK-Telegram/fork)
[![Download ZIP](https://img.shields.io/badge/Download-ZIP-red)](https://github.com/bigtechs2/BIGST4CK-Telegram/archive/refs/heads/main.zip)

**Built with ❤️ by bigmanjtech™**

---

## 📌 Table of Contents

- [About](#about)
- [Features](#features)
- [Server Plans](#server-plans)
- [Commands](#commands)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Contributors](#contributors)
- [License](#license)
- [Support / Contact](#support--contact)

---

## 🎯 About

**BIGST4CK Telegram Bot** is a powerful server selling bot that integrates with **Pterodactyl** to automate server creation, user management, and payment verification. It's designed to help you sell hosting plans directly from Telegram.

---

## ✨ Features

- 📋 **Server Plans** – 1GB to 10GB + Unlimited
- 💰 **Payment System** – Manual & Crypto support
- 👤 **User Management** – Register, status, server list
- 🔑 **Admin Panel** – Verify payments, ban/unban, delete servers
- 🚀 **Direct Commands** – `/1gb`, `/2gb`, ..., `/10gb`, `/unli`
- 📊 **Server Status** – View active servers & remaining days
- 🤖 **Pterodactyl API** – Auto-create users & servers
- 📞 **24/7 Support** – Contact owner directly
- 🛡️ **Ban System** – Block abusive users

---

## 💰 Server Plans

| Plan | RAM | CPU | Disk | Price (Monthly) |
|------|-----|-----|------|-----------------|
| **1 GB** | 1,024 MB | 50% | 5 GB | 1,500 TZS |
| **2 GB** | 2,048 MB | 100% | 10 GB | 2,500 TZS |
| **3 GB** | 3,072 MB | 150% | 15 GB | 3,500 TZS |
| **4 GB** | 4,096 MB | 200% | 20 GB | 5,000 TZS |
| **5 GB** | 5,120 MB | 250% | 25 GB | 6,500 TZS |
| **6 GB** | 6,144 MB | 300% | 30 GB | 8,000 TZS |
| **7 GB** | 7,168 MB | 350% | 35 GB | 9,500 TZS |
| **8 GB** | 8,192 MB | 400% | 40 GB | 11,000 TZS |
| **9 GB** | 9,216 MB | 450% | 45 GB | 13,000 TZS |
| **10 GB** | 10,240 MB | 500% | 50 GB | 15,000 TZS |
| **Unlimited** | ∞ | ∞ | ∞ | 25,000 TZS |

> *All plans include full root access and 24/7 support.*

---

## 📋 Commands

### User Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message |
| `/plans` | View all server plans |
| `/buy` | Purchase a server |
| `/status` | Your server status |
| `/myservers` | List all your servers |
| `/1gb` – `/10gb` | Create specific plan directly |
| `/unli` | Create unlimited server |
| `/contact` | Contact support |
| `/help` | Help & FAQ |

### Admin Commands

| Command | Description |
|---------|-------------|
| `/admin` | Admin panel |
| `/verify <user_id>` | Verify payment & create server |
| `/pending` | View pending orders |
| `/ban <user_id>` | Ban a user |
| `/unban <user_id>` | Unban a user |
| `/delserver <server_id>` | Delete a server |
| `/deluser <user_id>` | Delete a user |
| `/restart` | Restart the bot |

---

### Project Stucture 
```
BIGST4CK-Telegram/
├── commands/
│   ├── start.js
│   ├── plans.js
│   ├── buy.js
│   ├── status.js
│   ├── myservers.js
│   ├── contact.js
│   ├── help.js
│   ├── admin.js
│   ├── delserver.js
│   └── deluser.js
├── lib/
│   ├── database.js
│   ├── pterodactyl.js
│   ├── payments.js
│   └── createPanel.js
├── database/           # Auto-created
├── config.json
├── package.json
├── index.js
├── .env
└── README.md
```
---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- A **Telegram** account
- A **Pterodactyl** panel

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/bigtechs2/BIGST4CK-Telegram.git
cd BIGST4CK-Telegram

# 2. Install dependencies
npm install

# 3. Copy and configure the example config
cp config.example.json config.json

# 4. Create .env file
cp .env.example .env

# 5. Edit config.json and .env with your details
nano config.json
nano .env

# 6. Start the bot
npm start
```
---
## 💬 Support / Contact

| Name | Contact |
|------|---------|
| **[bigtechs1](https://wa.me/255777580820)** | WhatsApp |
| **[bigtechs2](https://wa.me/255636756591)** | WhatsApp ·
[Telegram](https://t.me/bigmanj09) |telegram|
| **[bigtechs3](https://wa.me/255705517165)** | WhatsApp |
| **[Join Group](https://chat.whatsapp.com/EWlNm6bMYJCELwzvnmboyC)** | WhatsApp Group |
| **[BIGST4CK Updates](https://whatsapp.com/channel/0029VbDJJY19WtC1T0Vgqp0v)** | WhatsApp Channel |
| **[bigmanjtech™](mailto:bigmanj.tech@gmail.com)** | Email |

---

### 📢 **BIGST4CK Family Group**

> Welcome to the **BIGST4CK Family Group**! 🚀 This is the official WhatsApp group for users, developers, and enthusiasts of the BIGST4CK brand. Share your experiences, ask questions, report bugs, suggest new features, and connect with the team and other users.

**[Join Group](https://chat.whatsapp.com/EWlNm6bMYJCELwzvnmboyC)**

---

### 📢 **BIGST4CK Updates Channel**

> 📢 The official broadcast channel for **BIGST4CK**. Get the latest news, updates, new features, release notes, and important announcements. Stay informed and never miss an update!

**[Join WhatsApp Channel](https://whatsapp.com/channel/0029VbDJJY19WtC1T0Vgqp0v)**

**Built by bigtech2 under bimanjtech™ with ♥︎**