# Live MART - Setup Guide

This guide will walk you through setting up the Live MART project from scratch.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
  
- **npm** (comes with Node.js)
  - Verify installation: `npm --version`
  
- **Git** (optional, for version control)
  - Download from: https://git-scm.com/
  
- **Code Editor** (VS Code recommended)
  - Download from: https://code.visualstudio.com/

- **Firebase Account**
  - Sign up at: https://firebase.google.com/

---

## 🚀 Step-by-Step Setup

### Step 1: Install Node.js

1. Visit https://nodejs.org/
2. Download the LTS version for your operating system
3. Run the installer and follow the installation wizard
4. Verify installation by opening terminal/command prompt:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Project Installation

1. **Navigate to project directory**
   ```bash
   cd path/to/livemart-project
   ```

2. **Install all dependencies**
   ```bash
   npm install
   ```
   
   This will install:
   - React and React DOM
   - React Router DOM
   - Firebase SDK
   - Lucide React (icons)
   - Date-fns (date utilities)

3. **Wait for installation to complete** (may take 2-5 minutes)

### Step 3: Firebase Project Setup

#### 3.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "live-mart" (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

#### 3.2 Enable Authentication

1. In Firebase Console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Enable **Email/Password** authentication:
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"
4. (Optional) Enable **Google** authentication:
   - Click "Google"
   - Toggle "Enable"
   - Select support email
   - Click "Save"

#### 3.3 Create Firestore Database

1. In Firebase Console, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in test mode" (we'll add security rules later)
4. Choose a location (select closest to your region)
5. Click "Enable"

#### 3.4 Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon "</>" to add a web app
5. Register app with nickname "Live MART Web"
6. Copy the Firebase configuration object (looks like this):
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "your-app.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-app.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:..."
   };
   ```

#### 3.5 Update Project with Firebase Config

1. Open `src/firebase/config.js` in your code editor
2. Replace the placeholder config with your actual Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_ACTUAL_API_KEY",
     authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
     projectId: "YOUR_ACTUAL_PROJECT_ID",
     storageBucket: "YOUR_ACTUAL_STORAGE_BUCKET",
     messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
     appId: "YOUR_ACTUAL_APP_ID"
   };
   ```
3. Save the file

#### 3.6 Set Up Firestore Security Rules (Important!)

1. In Firebase Console, go to "Firestore Database"
2. Click the "Rules" tab
3. Replace the default rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own data
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Products can be read by anyone authenticated
       // Can be written by retailers and wholesalers
       match /products/{productId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
       
       // Orders can be read/written by authenticated users
       match /orders/{orderId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
       
       // Wholesaler orders
       match /wholesalerOrders/{orderId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
       
       // Feedback
       match /feedback/{feedbackId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
     }
   }
   ```
4. Click "Publish"

### Step 4: Running the Application

1. **Start the development server**
   ```bash
   npm start
   ```

2. **Wait for compilation** (30-60 seconds)

3. **Application will automatically open** in your default browser at:
   ```
   http://localhost:3000
   ```

4. If it doesn't open automatically, manually navigate to http://localhost:3000

---

## 🧪 Testing the Application

### Test User Registration

1. Click "Sign Up" button
2. Select role: Customer
3. Fill in:
   - Name: Test Customer
   - Email: customer@test.com
   - Phone: 1234567890
   - Password: test123
   - Confirm Password: test123
4. Click "Sign Up"
5. You should be redirected to the Customer Dashboard

### Test Retailer Account

1. Logout (if logged in)
2. Sign up with:
   - Role: Retailer
   - Name: Test Retailer
   - Email: retailer@test.com
   - Password: test123
3. Add some products in the dashboard
4. Note: Products need to be added before customers can see them

### Test Wholesaler Account

1. Logout (if logged in)
2. Sign up with:
   - Role: Wholesaler
   - Name: Test Wholesaler
   - Email: wholesaler@test.com
   - Password: test123
3. Add wholesale products
4. Retailers can now order from these products

---

## 📊 Seeding Initial Data (Optional)

To have some test data, you can manually add products through the Retailer/Wholesaler dashboards, or use Firebase Console:

1. Go to Firebase Console → Firestore Database
2. Click "Start collection"
3. Collection ID: `products`
4. Add documents with fields:
   - name: (string) e.g., "iPhone 15"
   - description: (string) e.g., "Latest Apple smartphone"
   - price: (number) e.g., 79999
   - stock: (number) e.g., 50
   - category: (string) e.g., "Electronics"
   - retailerId: (string) use a retailer's user ID
   - createdAt: (string) current ISO date

---

## 🔧 Troubleshooting

### Issue: "Module not found" errors

**Solution:**
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Issue: Firebase errors (auth/configuration-not-found)

**Solution:**
- Double-check your Firebase config in `src/firebase/config.js`
- Ensure all fields are correctly copied from Firebase Console
- Make sure Authentication is enabled in Firebase Console

### Issue: Port 3000 already in use

**Solution:**
```bash
# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or use a different port:
PORT=3001 npm start
```

### Issue: Cannot read data from Firestore

**Solution:**
- Check Firestore security rules
- Verify you're logged in
- Check browser console for detailed errors

---

## 🏗️ Building for Production

When you're ready to deploy:

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

---

## 📱 Development Tips

### Hot Reload
- Changes to code automatically reload the browser
- Keep the terminal running while developing

### Browser DevTools
- Press F12 to open DevTools
- Check Console tab for errors
- Use Application tab to view Local Storage (cart data)

### Firebase Console
- Monitor Authentication users
- View Firestore data in real-time
- Check usage and quotas

---

## 🎯 Next Steps

After setup is complete:

1. **Familiarize yourself with the code structure**
   - Read through main components
   - Understand routing in `App.js`
   - Review authentication flow in `AuthContext.js`

2. **Test all features**
   - Registration and login
   - Product browsing and search
   - Cart and checkout
   - Order tracking
   - Feedback system

3. **Customize as needed**
   - Add your team members' names
   - Customize colors and styling
   - Add additional features

4. **Prepare for demo**
   - Create test accounts
   - Add sample products
   - Test complete user flows

---

## 📞 Getting Help

If you encounter issues:

1. Check the error message in the terminal
2. Check browser console (F12) for errors
3. Review Firebase Console for authentication/database issues
4. Refer to documentation:
   - React: https://react.dev/
   - Firebase: https://firebase.google.com/docs
   - React Router: https://reactrouter.com/

---

## ✅ Setup Checklist

- [ ] Node.js installed
- [ ] Project dependencies installed (`npm install`)
- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created
- [ ] Firebase config updated in project
- [ ] Security rules configured
- [ ] Application running (`npm start`)
- [ ] Test accounts created
- [ ] Sample data added

---

**You're all set! Happy coding! 🚀**
