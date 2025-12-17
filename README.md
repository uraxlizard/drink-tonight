# Drink Tonight 🍻

A modern web application for discovering and reserving nightlife venues (bars, clubs, restaurants) in your area. Built with React and Supabase, this platform connects venue owners with customers, making it easy to find the perfect spot for tonight.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Important Notes](#important-notes)

## ✨ Features

### For Users
- **Browse Venues**: Discover nearby places with detailed information including:
  - Ratings and distance
  - Category classification
  - Images, videos, and YouTube embeds
  - Working hours
  - Features (parking, WiFi, etc.)
  - VIP and 18+ indicators
  - "Tonight" special events/performers
- **Make Reservations**: Book tables directly from venue cards with:
  - Guest count selection
  - Contact information (name and phone)
  - Optional notes/special requests
  - Real-time reservation status updates
- **User Profiles**: Manage your account settings with tabs for:
  - Settings (profile info, password, payment methods)
  - Reservations (view reservation history)
  - Favorites (coming soon)
- **Interactive Map**: Browse venues on an interactive map (demo data)

### For Business Owners
- **Business Dashboard**: Complete management interface for venue owners
- **Place Management**: 
  - Add new venues with comprehensive details
  - Edit existing venue information
  - Delete venues
  - Upload images and videos
  - Set working hours and features
- **Reservation Management**:
  - View all reservations for owned venues
  - Filter by status (active vs completed)
  - Mark reservations as completed
  - Real-time notifications in navbar (updates every 30 seconds)
  - View reservation details (name, phone, guests, notes, date)
- **Account Settings**:
  - Update profile information
  - Change password
  - Manage payment methods

### Technical Features
- **Authentication**: Secure user registration and login via Supabase Auth with account type selection (normal/business)
- **State Management**: Redux store for UI state, authentication, places, and notifications
- **Routing**: Hash-based navigation (home, map, about, contact, profile)
- **Row Level Security (RLS)**: Database-level security policies
- **Real-time Updates**: Live reservation notifications for business accounts (polling every 30 seconds)
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Dark theme with smooth animations and transitions

## 🛠 Tech Stack

- **Frontend Framework**: React 19.2.0
- **Build Tool**: Create React App
- **State Management**: Redux 5.0.1
- **Styling**: Tailwind CSS 3.4.18
- **Maps**: React Leaflet 5.0.0, Leaflet 1.9.4
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment Ready**: Static site compatible with major hosting platforms

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher recommended)
- **npm** or **yarn** package manager
- **Supabase Account** (free tier available at [supabase.com](https://supabase.com))
- **Git** (for version control)

## 🚀 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd drink-tonight
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (see [Configuration](#configuration) section)

4. **Run database migrations** (see [Database Setup](#database-setup) section)

5. **Start the development server**:
   ```bash
   npm start
   ```

   The application will open at [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### Supabase Setup

1. **Create a Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the database to be provisioned

2. **Get your Supabase credentials**:
   - Navigate to Project Settings → API
   - Copy your `Project URL` and `anon/public` key

3. **Create environment file**:
   Create a `.env.local` file in the project root:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   **Important**: 
   - Never commit `.env.local` to version control
   - The `.env.local` file is already in `.gitignore`
   - Restart the dev server after creating/modifying `.env.local`

## 🗄 Database Setup

The project includes SQL migrations in the `supabase/migrations/` directory. Run these migrations in order:

1. **Places Schema** (`20251030192034_places_schema.sql`):
   - Creates the `places` table
   - Sets up Row Level Security policies
   - Allows public read access, authenticated write access

2. **Places Owner** (`20251031100000_places_owner.sql`):
   - Adds `user_id` column to track place owners
   - Updates RLS policies to restrict writes to owners only

3. **Reservations Schema** (`20251031120000_reservations_schema.sql`):
   - Creates the `reservations` table
   - Sets up RLS policies for reservation management
   - Allows users to create their own reservations
   - Allows place owners to view/manage reservations for their places

4. **Reservations Completed Status** (`20251031130000_reservations_completed_status.sql`):
   - Adds `completed` status option to reservations

### Running Migrations

**Option 1: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file's content
4. Run them in order

**Option 2: Using Supabase CLI** (if installed)
```bash
supabase db push
```

**Option 3: Using psql** (if you have direct database access)
```bash
psql -h <your-db-host> -U postgres -d postgres -f supabase/migrations/20251030192034_places_schema.sql
# Repeat for each migration file in order
```

## 📜 Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000).  
The page will reload when you make changes. You may also see lint errors in the console.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.  
It correctly bundles React in production mode and optimizes the build for the best performance.  
The build is minified and filenames include hashes.  
Your app is ready to be deployed!

### `npm run eject`
**Note: This is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

## 📁 Project Structure

```
drink-tonight/
├── public/                 # Static assets
│   ├── index.html         # HTML template
│   └── ...
├── src/
│   ├── components/        # React components
│   │   ├── AboutUsPage.jsx
│   │   ├── BusinessProfilePage.jsx
│   │   ├── ContactPage.jsx
│   │   ├── Footer.jsx
│   │   ├── LoginModal.jsx
│   │   ├── MapPage.jsx
│   │   ├── Navbar.jsx
│   │   ├── PlaceCard.jsx
│   │   ├── PlacesSection.jsx
│   │   ├── ProfilePage.jsx
│   │   └── RegisterModal.jsx
│   ├── lib/
│   │   ├── errorTranslations.js  # Error message translations
│   │   └── supabaseClient.js     # Supabase client configuration
│   ├── store/
│   │   ├── store.js       # Redux store configuration
│   │   └── store.test.js  # Store tests
│   ├── App.js             # Main application component
│   ├── index.js           # Application entry point
│   └── index.css          # Global styles
├── supabase/
│   ├── migrations/        # Database migration files
│   └── config.toml        # Supabase configuration
├── package.json
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md
```

## 🚢 Deployment

This React application can be deployed to any static hosting service. Here are instructions for popular platforms:

### Vercel (Recommended)

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   Or connect your GitHub repository at [vercel.com](https://vercel.com)

3. **Configure Environment Variables**:
   - Go to your project settings on Vercel
   - Add environment variables:
     - `REACT_APP_SUPABASE_URL`
     - `REACT_APP_SUPABASE_ANON_KEY`
   - Redeploy after adding variables

### Netlify

1. **Install Netlify CLI** (optional):
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod --dir=build
   ```
   Or connect your GitHub repository at [netlify.com](https://netlify.com)

4. **Configure Environment Variables**:
   - Go to Site settings → Environment variables
   - Add `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
   - Trigger a new deploy

### GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**:
   ```json
   "homepage": "https://yourusername.github.io/drink-tonight",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

   **Note**: Environment variables need to be set in your build process. Consider using GitHub Actions or another CI/CD solution.

### AWS Amplify

1. **Connect Repository**:
   - Go to AWS Amplify Console
   - Connect your Git repository

2. **Configure Build Settings**:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: build
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Add Environment Variables**:
   - In Amplify Console → App settings → Environment variables
   - Add `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`

### Firebase Hosting

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**:
   ```bash
   firebase init hosting
   ```

3. **Build and Deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

4. **Environment Variables**:
   - Use Firebase Functions or `.env.production` file
   - Or use Firebase Remote Config for runtime configuration

### Docker Deployment

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/build /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and Run**:
   ```bash
   docker build -t drink-tonight .
   docker run -p 80:80 drink-tonight
   ```

   **Note**: Environment variables should be injected at build time or via a reverse proxy.

### General Deployment Checklist

- [ ] Set up production Supabase project (or use existing)
- [ ] Configure environment variables on hosting platform
- [ ] Run database migrations on production database
- [ ] Build the project: `npm run build`
- [ ] Test the production build locally
- [ ] Deploy to hosting platform
- [ ] Verify environment variables are set correctly
- [ ] Test authentication flow
- [ ] Test reservation functionality
- [ ] Configure custom domain (optional)
- [ ] Set up SSL/HTTPS (usually automatic on modern platforms)

## ⚠️ Important Notes

### Security

- **Never commit `.env.local`** to version control
- The `REACT_APP_SUPABASE_ANON_KEY` is safe to expose in client-side code (it's designed for public use)
- Row Level Security (RLS) policies in Supabase protect your data
- Always use HTTPS in production

### Account Types

- **Normal Users**: Can browse places and make reservations. Profile tabs: Settings, Reservations, Favorites (coming soon)
- **Business Accounts**: Can manage places and view reservations. Profile tabs: Settings, Places, Reservations
  - Select account type during registration (normal or business)
  - Or update via Supabase dashboard: `auth.users` table → `raw_user_meta_data` → `accountType: 'business'` or `'firm'`
  - Business accounts receive real-time reservation notifications in the navbar

### Database Considerations

- Ensure all migrations are run in order
- RLS policies are critical for security - don't disable them
- Consider adding indexes for frequently queried columns
- Regular backups are recommended for production

### Performance

- Images should be optimized before uploading
- Consider using a CDN for static assets
- YouTube embeds may impact page load time
- Large video files should be hosted externally
- Map page currently uses demo data (not connected to database)
- Reservation notifications poll every 30 seconds (consider WebSockets for production)

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers supported
- Internet Explorer is not supported

## 📝 License

See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on the repository.

---

**Built with ❤️ using React and Supabase**
