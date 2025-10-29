# VNU Dashboard

A modern Progressive Web App (PWA) dashboard for Vietnam National University students, built by reverse engineering the OneVNU mobile application API. This project provides a clean, responsive interface for accessing student information, grades, schedules, and academic data on any device.

## 🎓 About

This project was created by reverse engineering the OneVNU Flutter mobile application to extract its API endpoints and recreate the functionality as a web application. The original mobile app's API was discovered using Blutter, a Flutter reverse engineering tool.

## ✨ Features

### 📊 Academic Overview
- **GPA Tracking**: Visual charts showing semester and cumulative GPA trends
- **GPA Calculator**: Calculate cumulative, semester, academic year, custom period, and target GPA
- **Grade Distribution**: Subject score breakdown with interactive charts
- **Academic Summary**: Complete academic performance statistics

### 📅 Schedule Management
- **Class Timetable**: Weekly course schedule with time slots and locations
- **Exportable Timetable**: Export to .ics for Google Calendar, Apple Calendar, and more
- **Exam Schedule**: Upcoming exams with dates, times, and venues
- **Daily View**: Filter schedule by specific dates

### 🎯 Student Information
- **Personal Profile**: Student details including name, student ID, and program information
- **Class Information**: Current class, major, and academic program details
- **Dashboard Overview**: Quick stats and today's schedule at a glance

### 🔐 Authentication
- **Secure Login**: Integration with VNU's authentication system
- **Session Management**: Automatic token refresh and remember me functionality
- **Protected Routes**: Secure access to student data

### 📱 Progressive Web App (PWA)
- **Installable**: Add to home screen on mobile and desktop
- **Offline Support**: Service worker caching for offline access
- **Responsive Design**: Optimized for all screen sizes (mobile, tablet, desktop)
- **Native-like Experience**: Full-screen mode with status bar styling
- **Fast Loading**: Optimized performance with Next.js

## 🛠 Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4 with custom UI components (Shadcn/ui)
- **Charts**: Recharts for data visualization
- **HTTP Client**: Axios for API communication
- **TypeScript**: Full type safety throughout the application
- **PWA**: Service Workers for offline support and caching
- **Analytics**: Vercel Analytics & Speed Insights

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📱 Installing as PWA

### On Mobile (Android/iOS)
1. Open the website in your browser
2. For Android Chrome: Tap the menu (⋮) → "Add to Home screen"
3. For iOS Safari: Tap Share → "Add to Home Screen"
4. The app will appear on your home screen like a native app

### On Desktop
1. Visit the website in Chrome/Edge
2. Click the install icon (⊕) in the address bar
3. Or go to Menu → "Install VNU Dashboard"

## 🌐 Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js
   - Click "Deploy"

3. **Configure PWA** (automatic):
   - Manifest and service worker are automatically served
   - Icons use `/vnu_logo.png` from the public folder
   - All PWA features work out of the box

## 🏫 Supported Universities

If you can login to OneVNU, this should probably work for you too.

## 🔒 API Integration

The application integrates with the official VNU OneVNU mobile API:
- **Base URL**: `https://onevnu-mobile-api.vnu.edu.vn/api`
- **Authentication**: Bearer token-based authentication
  
Documentation can be found at: https://onevnu.apidog.io

## 📱 Mobile Optimization

- ✅ Touch-friendly buttons (44px minimum tap targets)
- ✅ Responsive layouts with mobile-first approach
- ✅ Optimized images and assets
- ✅ Fast loading with code splitting
- ✅ Smooth animations and transitions
- ✅ Dark mode support
- ✅ Gesture-friendly sidebar navigation

## ⚠️ Disclaimer

This project is an unofficial web interface for VNU's student system and is not officially associated with Vietnam National University or the original OneVNU application. It was created for educational purposes and personal use only. 

The official OneVNU mobile app remains the primary supported platform.

## 📄 License

This project is for educational purposes only.

---

Built with ❤️ for VNU students | Now available as a PWA 📱