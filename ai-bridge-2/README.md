# AI Bridge Browser Extension

A beautiful and modern browser extension with **Firebase authentication** that opens as a tab when clicked.

## Features

- 🎨 **Modern UI Design**: Clean, responsive interface with smooth animations
- 🔐 **Firebase Authentication**: Real authentication system with email/password
- 💾 **Session Management**: Persistent login state using Firebase Auth
- 📱 **Responsive Design**: Works perfectly on different screen sizes
- ⚡ **Fast & Lightweight**: Optimized performance with Firebase SDK
- 🛡️ **Secure**: Industry-standard authentication with Firebase

## Installation Instructions

### For Chrome/Edge/Brave:

1. **Download or Clone** this repository to your local machine

2. **Create Extension Icons** (Required):
   - Create an `icons` folder in the extension directory
   - Add three icon files:
     - `icon16.png` (16x16 pixels)
     - `icon48.png` (48x48 pixels) 
     - `icon128.png` (128x128 pixels)
   
   You can create simple icons using any image editor or download free icons from sites like:
   - [Flaticon](https://www.flaticon.com/)
   - [Icons8](https://icons8.com/)
   - [Feather Icons](https://feathericons.com/)

3. **Load the Extension**:
   - Open Chrome/Edge/Brave
   - Go to `chrome://extensions/` (or `edge://extensions/` for Edge)
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the folder containing your extension files

4. **Use the Extension**:
   - Click the extension icon in your browser toolbar
   - The extension will open in a new tab with the login/signup panel
   - Create an account or login to access the home page

## File Structure

```
ai-bridge-extension/
├── manifest.json          # Extension configuration with Firebase permissions
├── background.js          # Background service worker
├── tab.html              # Main extension page with Firebase SDK
├── styles.css            # Styling and animations
├── script.js             # Firebase authentication logic
├── firebase-config.js    # Firebase configuration (optional)
├── icons/                # Extension icons (you need to create this)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

## How It Works

1. **Extension Click**: When you click the extension icon, it opens `tab.html` in a new tab
2. **Firebase Auth Check**: The app checks if you're already logged in using Firebase Auth
3. **Login/Signup Panel**: If not logged in, shows the authentication panel
4. **Form Validation**: Validates email format, password strength, and required fields
5. **Firebase Authentication**: Uses Firebase Auth for secure user authentication
6. **Home Page**: After successful login, shows a welcome page with user info

## Firebase Integration

This extension uses **Firebase Authentication** for secure user management:

### Features:
- ✅ **Real Authentication**: No more demo credentials
- ✅ **Email/Password Signup**: Create new accounts
- ✅ **Email/Password Login**: Sign in with existing accounts
- ✅ **Session Persistence**: Stays logged in across browser sessions
- ✅ **Error Handling**: Specific error messages for different auth scenarios
- ✅ **Security**: Industry-standard authentication with Firebase

### Firebase Services Used:
- **Authentication**: Email/password signup and login
- **Analytics**: Basic usage analytics (optional)

### Error Handling:
The extension handles common Firebase auth errors:
- `auth/user-not-found`: No account with that email
- `auth/wrong-password`: Incorrect password
- `auth/email-already-in-use`: Email already registered
- `auth/weak-password`: Password too weak
- `auth/invalid-email`: Invalid email format
- `auth/too-many-requests`: Rate limiting

## Testing the Extension

### Create a New Account:
1. Click the extension icon
2. Switch to "Sign Up" tab
3. Enter your full name, email, and password (6+ characters)
4. Click "Sign Up"
5. You'll be automatically logged in and see the home page

### Login with Existing Account:
1. Click the extension icon
2. Enter your email and password
3. Click "Login"
4. You'll see the home page with your name

### Logout:
1. Click the "Logout" button on the home page
2. You'll be returned to the login/signup panel

## Customization

### Styling
- Modify `styles.css` to change colors, fonts, and layout
- The extension uses a purple gradient theme that can be easily customized

### Functionality
- Edit `script.js` to add more features or modify authentication logic
- Update `tab.html` to change the UI structure

### Firebase Configuration
The Firebase config is already set up in `script.js`. To use your own Firebase project:
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Replace the `firebaseConfig` object in `script.js` with your project's config

## Browser Compatibility

- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Brave (Chromium-based)
- ❌ Firefox (requires different manifest format)
- ❌ Safari (requires different extension format)

## Security Features

This extension uses Firebase's secure authentication system:

- ✅ **HTTPS-only communication** with Firebase
- ✅ **Secure token-based authentication**
- ✅ **Password strength validation**
- ✅ **Rate limiting protection**
- ✅ **Session management**
- ✅ **Input validation and sanitization**

## Troubleshooting

**Extension not loading:**
- Make sure all files are in the same directory
- Check that `manifest.json` is valid JSON
- Ensure icons are present and correctly named
- Verify Firebase configuration is correct

**Authentication not working:**
- Check browser console for Firebase errors
- Ensure you have internet connection (Firebase requires it)
- Verify Firebase project is properly configured
- Check that Email/Password authentication is enabled in Firebase Console

**Icons not showing:**
- Create the `icons` folder and add the required icon files
- Ensure icon files are PNG format
- Check that file names match exactly

**Firebase errors:**
- Check Firebase Console for project status
- Verify API keys and configuration
- Ensure Authentication service is enabled
- Check browser console for detailed error messages

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues or have questions, please check the troubleshooting section above or create an issue in the repository. 