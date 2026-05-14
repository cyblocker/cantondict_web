# 粵語字典 (CantonDict Web)

A modern, high-performance Cantonese dictionary web application built with React, TypeScript, and SQLite (via WebAssembly). This project is a migration of the legacy `cantondict_flutter` app into a modern, offline-capable PWA.

![Icon](public/icon.png)

## ✨ Features

- **Multi-Mode Lookup**:
  - **Character Lookup**: Search for individual characters with detailed pronunciations and definitions.
  - **Paragraph Lookup**: Smart analysis of entire sentences with a context-aware pronunciation scoring heuristic.
- **Multiple Romanization Systems**: Support for Yale, Jyutping, Cantonese Pinyin, and Guangzhou schemes.
- **Bi-directional Chinese Support**: Toggle between Traditional and Simplified Chinese interfaces and data.
- **Premium UI/UX**:
  - Glassmorphism design with system-adaptive Dark Mode.
  - Responsive layout (Mobile-first Bottom Sheet vs. Desktop Centered Modal).
  - Smooth micro-animations.
- **Offline-First (PWA)**: Works entirely in the browser using SQLite WASM. No internet required after initial load.
- **Multilingual UI**: Full support for Traditional Chinese, Simplified Chinese, and English.

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Database**: [sql.js](https://github.com/sql-js/sql.js) (SQLite WebAssembly)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS with modern tokens
- **Hosting**: Optimized for Cloudflare Pages

## 🚀 Getting Started

### Local Development

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd cantondict_web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🌐 Deployment (Cloudflare Pages)

1. Connect your GitHub repository to **Cloudflare Pages**.
2. Use the following **Build Settings**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
3. Add your custom domain (e.g., `yut.cyblocker.com`) in the Cloudflare Dashboard.

## 📄 License

Created by [cyblocker](https://cyblocker.com). 

This project is built for the Cantonese learning community. The dictionary data is bundled as `public/data/CantonDict.db`.
