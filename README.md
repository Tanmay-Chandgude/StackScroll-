# 🌐 StackScroll

**StackScroll** is a modern, full-stack technical blogging platform built with React, Vite, Tailwind CSS, and Supabase. It enables developers to publish, manage, and share technical articles with ease in a sleek, glass-inspired UI.

---

## 🚀 Features

### 🔧 Core Stack
- ⚛️ **React + Vite** for lightning-fast development
- 🎨 **Tailwind CSS** for utility-first styling
- 🌐 **React Router** for smooth navigation
- 🧠 **Supabase** for backend (Database + Auth + RLS)
- 📝 **Markdown** support for post formatting

### 🖥️ UI & UX
- Glassmorphism UI with black and green theme
- Responsive layout for mobile and desktop
- Clean homepage with call-to-action
- Smooth transitions & hover effects

### 🧩 Pages
- **Home Page** – Intro & CTA
- **Blog List Page** – Displays all published posts
- **Write Post Page** – Authenticated users can write and publish posts
- **Auth Page** – Sign in & sign up with validation and feedback

### 🔐 Authentication
- Fully integrated Supabase Auth
- Sign in / Sign up with validation and error handling
- Email verification and password checks
- Protected routes (e.g., `/write`)
- Redirect to login if not authenticated

### 📬 Blog Features
- Create & publish articles
- Markdown-based content rendering
- Delete own posts
- Share post via clipboard link
- Posts stored securely with **Row-Level Security (RLS)**:
  - ✅ Anyone can read
  - ✍️ Only logged-in users can create
  - 🔒 Only authors can edit/delete their posts

---

## ⚙️ Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/stackscroll.git
cd stackscroll
npm install
