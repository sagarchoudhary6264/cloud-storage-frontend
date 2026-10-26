# Cloud Storage Client (Frontend)

### Related Repository
- **Backend API:** [Spring Boot Cloud Storage Backend](https://github.com/sagarchoudhary6264/cloud-storage-backend)

A modern, responsive React web interface for the Cloud Storage application built with Vite and Tailwind CSS.

---

## Features

- **Authentication:** User registration and login with JWT token persistence.
- **Storage Metrics:** Real-time visual progress bar tracking per-user 20 MB storage quota.
- **File Management:** Upload, list, preview metadata, and download files directly from the browser.
- **Public Link Sharing:** Instant generation and revocation of public download URLs with copy-to-clipboard functionality.
- **Permanent Purge:** Direct file deletion synchronized with backend disk storage.

---

## Tech Stack

- **Framework:** React 18 / 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **API Communication:** Native Fetch API with Bearer JWT Authorization

---

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18 or higher) installed.

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd cloud-storage-frontend