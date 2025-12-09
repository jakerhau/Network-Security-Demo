# Network Security Demo - WebAuthn Authentication

A modern web application demonstrating passwordless authentication using WebAuthn/Passkey technology built with Next.js.

## Features

- 🔐 **Passwordless Authentication** - Login with WebAuthn/Passkey
- 📱 **FaceID/TouchID Support** - Biometric authentication
- 🛡️ **Security Features**: CSRF Protection, Rate Limiting, Account Lockout, Session Rotation, Security Headers

## Tech Stack

- **Framework**: Next.js 15
- **Database**: MongoDB with Mongoose
- **Authentication**: WebAuthn/Passkey (@simplewebauthn)
- **Session**: Iron Session
- **Rate Limiting**: Upstash Redis
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Upstash Redis (for rate limiting)

### Installation

1. Clone and install:
```bash
git clone https://github.com/jakerhau/Network-Security-Demo.git
cd Network-Security-Demo
npm install
```

2. Create `.env.local`:
```env
MONGO_URI=your_mongodb_connection_string
SECRET_COOKIE_PASSWORD=your_secret_cookie_password
JWT_SECRET=your_jwt_secret
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

3. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/src/app` - Next.js app router pages
- `/lib` - Utility functions and configurations
- `/src/components` - React components
- `/src/models` - MongoDB models

## License

MIT
