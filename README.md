# FreshTrack — Production-Ready Food Expiry Tracker

FreshTrack is a modern, full-stack web application designed to help users manage their food inventory and reduce waste. This version is built with React, Tailwind CSS 4, and Supabase.

## 🚀 Features

- **Supabase Authentication**: Secure email/password login and signup.
- **Dynamic Inventory**: Real-time management of food items with database persistence.
- **Smart Expiry Logic**: Automatic categorization of items (Fresh, Expiring, Expired).
- **Beautiful Dashboard**: Visual analytics with charts and interactive stats.
- **Responsive Design**: Fully optimized for mobile and desktop views.
- **Modern UI**: Built with Framer Motion, Lucide Icons, and glassmorphism effects.

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Backend/Database**: Supabase (PostgreSQL + Auth)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Toasts**: Sonner

## ⚙️ Setup Instructions

### 1. Supabase Configuration
1. Create a new project on [Supabase](https://supabase.com/).
2. Navigate to the **SQL Editor** and run the contents of `supabase_schema.sql` found in this repository.
3. Go to **Project Settings > API** to find your Project URL and Anon Key.

### 2. Environment Variables
1. Create a `.env` file in the root directory (copy from `.env.example`).
2. Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Installation
```bash
npm install
```

### 4. Running Locally
```bash
npm run dev
```

## 📦 Deployment

This project is ready for deployment on **Vercel** or **Netlify**.
- **Vercel**: Connect your GitHub repo and add the environment variables in the Vercel dashboard.
- **Netlify**: Use the `npm run build` command and set the publish directory to `dist`.

## 📄 License
MIT
