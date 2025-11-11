# mIP - IP Geolocation Tracker

![miP app logo](https://mip-web.vercel.app/app-logo.png)

A modern web application that allows users to track and visualize IP address geolocation information with maps and search history.

## Features

### 🔐 Authentication

- Secure login system with email and password
- Session management with HTTP-only cookies
- Protected routes with middleware
- Automatic redirect to login for unauthenticated users

### 🌍 IP Geolocation

- **User IP Detection**: Automatically displays your current IP and location
- **Custom IP Search**: Enter any IP address to get detailed geolocation data
- **IP Validation**: Built-in validation for IPv4 and IPv6 addresses
- **Error Handling**: User-friendly error messages for invalid IP addresses

### 📍 Interactive Map

- **Visual Location Display**: Interactive Leaflet map showing exact coordinates
- **Location Pinning**: Precise markers for IP locations
- **Responsive Design**: Maps adapt to different screen sizes

### 📊 Search History

- **History Tracking**: Automatically saves all IP searches
- **Clickable History**: Click any history item to re-display its information
- **Bulk Operations**: Select multiple history items for deletion
- **Clear Search**: Reset to your original IP with one click

### 🎨 Modern UI/UX

- **Responsive Design**: Works seamlessly on desktop and mobile
- **Loading States**: Skeleton loaders and spinners for better UX
- **Dark/Light Theme**: Modern interface with proper contrast
- **Form Validation**: Real-time validation with helpful error messages

## System Architecture

This is the **frontend** part of a complete full-stack IP geolocation tracking system:

```
┌─────────────────────────────────────────────────────────────┐
│                    mIP Frontend (Next.js)                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐│
│  │   Login Form    │  │  IP Geolocation  │  │ Interactive  ││
│  │   Component     │  │    Dashboard     │  │     Map      ││
│  └─────────────────┘  └─────────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────┘
                                │
                                │ API Calls
                                │
┌─────────────────────────────────────────────────────────────┐
│                  mIP API (Node.js/Express)                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐│
│  │  Authentication │  │     History     │  │  PostgreSQL  ││
│  │     Routes      │  │   Management    │  │   Database   ││
│  └─────────────────┘  └─────────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────┘
                                │
                                │ External API
                                │
┌─────────────────────────────────────────────────────────────┐
│                    IPInfo.io API                           │
│              Geolocation Data Provider                     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Authentication**: Frontend → mIP API → Database validation
2. **IP Geolocation**: Frontend → IPInfo.io API → Display results
3. **History Storage**: Frontend → mIP API → PostgreSQL database
4. **History Retrieval**: Frontend → mIP API → Database query → Display

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn components
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query (React Query)
- **Maps**: Leaflet with React-Leaflet
- **Authentication**: Custom middleware with cookie-based sessions
- **APIs**: IPInfo.io for geolocation data

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun
- Running mIP API backend (see [mIP API setup](https://github.com/LuisCabantac/mip-api))

### Quick Start (Full System)

1. **Set up the backend first**:

```bash
# Clone and setup the API
git clone https://github.com/LuisCabantac/mip-api.git
cd mip-api
npm install
# Configure .env.local with database credentials
npm run seed  # Creates test user
npm run dev   # Runs on http://localhost:8000
```

2. **Then set up this frontend**:

```bash
# In a new terminal
git clone https://github.com/LuisCabantac/mip.git
cd mip
npm install
# Configure .env.local (see below)
npm run dev   # Runs on http://localhost:3000
```

### Frontend-Only Setup

### Installation

1. Clone the repository:

```bash
git clone https://github.com/LuisCabantac/mip.git
cd mip
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

```bash
# Backend API Configuration
API_URL=https://mip-api.vercel.app              # Your deployed mIP API
NEXT_PUBLIC_API_URL=https://mip-api.vercel.app  # Public API URL
NEXT_PUBLIC_IPINFO_TOKEN=your_ipinfo_token_here # IPInfo.io API token

# For local development with local API:
# API_URL=http://localhost:8000
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

> **Note**: You'll need to have the [mIP API backend](https://github.com/LuisCabantac/mip-api) running either locally or deployed to use authentication and history features.

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable                   | Description                              | Required | Example                      |
| -------------------------- | ---------------------------------------- | -------- | ---------------------------- |
| `API_URL`                  | Backend API URL for server-side requests | Yes      | `https://mip-api.vercel.app` |
| `NEXT_PUBLIC_API_URL`      | Public API URL for client-side requests  | Yes      | `https://mip-api.vercel.app` |
| `NEXT_PUBLIC_IPINFO_TOKEN` | IPInfo.io API token for geolocation data | Yes      | `your_token_here`            |

> **💡 Tip**: For local development, use `http://localhost:8000` for both API URLs if running the backend locally.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── HomePage.tsx       # Main dashboard component
│   ├── LoginPage.tsx      # Login form component
│   ├── Map.tsx            # Interactive map component
│   └── ...
├── lib/                   # Utilities and configurations
│   ├── actions/           # Server actions
│   ├── services/          # API service functions
│   ├── schema/            # Zod validation schemas
│   └── utils.ts           # Utility functions
└── middleware.ts          # Authentication middleware
```

## API Integration

The app integrates with:

- **Custom Backend API**: Handles user authentication and history storage
- **IPInfo.io API**: Provides IP geolocation data and geographic information

### Backend API (mIP API)

This frontend works with a companion Node.js/Express API that provides:

#### 🔐 Authentication Features

- JWT token-based authentication
- Password hashing with bcrypt
- User seeder for testing (`test@example.com` / `password123`)

#### 📊 History Management

- Store geolocation searches in PostgreSQL database
- Retrieve user-specific search history
- Delete multiple history records
- Individual history record access

#### 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase/PostgreSQL with Drizzle ORM
- **Authentication**: JWT, bcrypt
- **Validation**: Zod schemas
- **Deployment**: Vercel

#### 📡 API Endpoints

```bash
# Authentication
POST /api/login

# History Management (requires JWT)
GET /api/history
POST /api/history
GET /api/history/single/:historyId
DELETE /api/history
```

#### 🧪 Test User

After running the API seeder, you can login with:

- **Email**: `test@example.com`
- **Password**: `password123`

For more details about the backend API, visit: [mIP API Repository](https://github.com/LuisCabantac/mip-api)

## Features Checklist

- ✅ Simple login form with email and password validation
- ✅ Database credential validation via API
- ✅ Redirect to home after successful login
- ✅ Display user's IP and geolocation information
- ✅ Search functionality for custom IP addresses
- ✅ IP address validation and error handling
- ✅ Clear search to revert to user's IP
- ✅ Search history tracking and display
- ✅ Clickable history items to re-display information
- ✅ Multiple history selection and deletion
- ✅ Interactive map with location pinning

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- **[mIP API](https://github.com/LuisCabantac/mip-api)** - The backend API that powers authentication and history management

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Maps powered by [Leaflet](https://leafletjs.com/)
- Geolocation data from [IPInfo.io](https://ipinfo.io/)
- UI components from [Shadcn](https://ui.shadcn.com/)
- Backend powered by the companion [mIP API](https://github.com/LuisCabantac/mip-api)
