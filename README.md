# DropSync

DropSync is a lightweight web application that allows users to **instantly share text, files, images, and documents between devices** using a simple link or code. The platform is designed to be **fast, secure, and accessible**, making it easy to transfer content without login, complicated setup, or third-party apps.

## 🚀 Features

- **Instant Sharing**
  - Paste text or upload files and instantly generate a shareable link or code.

- **Multi-Content Support**
  - Share:
    - Text
    - Images
    - Documents
    - PDFs
    - ZIP files
    - Other common file formats

- **Cross-Device Access**
  - Access shared content from **any device** (phone, tablet, laptop, desktop).

- **Temporary Storage**
  - Files are stored temporarily and automatically deleted after a specified time.

- **Simple UI**
  - Minimalist and responsive design.
  - Drag & drop uploads.
  - Clipboard paste support.

- **Secure Sharing**
  - Encrypted data transfer (HTTPS).
  - Optional password protection.
  - One-time download links.

- **Fast & Reliable**
  - Optimized backend for quick uploads and downloads.
  - Designed to work even on slow networks.

## 🧠 How It Works

1. User pastes text or uploads a file.
2. The system stores the content temporarily in cloud storage.
3. A **unique share link or code** is generated.
4. The recipient opens the link from another device.
5. The content can be viewed or downloaded instantly.

## 🏗️ System Architecture

### Frontend
- Handles user interface and uploads
- Generates share links
- Displays shared content

### Backend
- Handles file uploads
- Generates unique IDs for sharing
- Manages storage and expiration
- Ensures security and validation

### Storage
- Temporary cloud storage
- Automatic deletion after expiration
- Supports large file uploads

## 🔐 Security

Security is a core part of the platform.

- HTTPS encrypted transfers
- Secure file upload validation
- Optional password protection
- Temporary storage with automatic deletion
- Unique share IDs to prevent guessing

## ⚙️ Tech Stack

**Frontend**
- HTML
- CSS
- JavaScript
- Modern UI framework (React / Next.js)

**Backend**
- Node.js / Express
- REST API

**Storage**
- Cloud storage via Lovable Cloud
- Temporary file management

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/RitenTam/dropsync.git