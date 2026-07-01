# Habit Hawk

A habit tracking application built with FastAPI (backend) and React Native/Expo (frontend).

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/)

## Quick Start

### Installation

**Windows:**
```bash
install.bat
```

**Mac/Linux:**
```bash
chmod +x install.sh
./install.sh
```

### Running the Application

**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

**Or use VS Code Debugger:**
1. Open the project in VS Code
2. Press `F5`
3. Select "Full Stack (Backend + Frontend)"

The backend will run on `http://localhost:8000` and the frontend will open in Expo.

## Detailed Installation

If you prefer to install manually or the scripts don't work:

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd habit_hawk_backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv env
   ```

3. Activate the virtual environment:
   - **Windows:** `env\Scripts\activate.bat`
   - **Mac/Linux:** `source env/bin/activate`

4. Install dependencies:
   ```bash
   pip install -r ../requirements.txt
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd habit_hawk_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application Manually

### Start Backend (FastAPI)

```bash
cd habit_hawk_backend
# Activate virtual environment first
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### Start Frontend (Expo)

```bash
cd habit_hawk_frontend
npm start
```

Follow the Expo CLI instructions to:
- Press `w` to open in web browser
- Press `i` to open iOS simulator (Mac only)
- Press `a` to open Android emulator
- Scan QR code with Expo Go app on your phone

## Project Structure

```
habit_hawk/
├── habit_hawk_backend/          # FastAPI backend
│   ├── auth/                    # Authentication routes & logic
│   ├── database/                # Database connection & models
│   ├── env/                     # Python virtual environment
│   ├── config.py                # Backend configuration
│   └── main.py                  # FastAPI application entry point
├── habit_hawk_frontend/         # React Native/Expo frontend
│   ├── src/                     # Frontend source code
│   ├── assets/                  # Images, fonts, etc.
│   └── package.json             # Node.js dependencies
├── requirements.txt             # Python dependencies
├── install.bat / install.sh     # Installation scripts
├── start.bat / start.sh         # Startup scripts
└── .vscode/launch.json          # VS Code debug configuration
```

## Development

### Backend Development

- The backend uses **FastAPI** with auto-reload enabled in development
- API documentation is auto-generated at `/docs` (Swagger UI)
- Authentication is handled with JWT tokens
- Database models use SQLAlchemy

### Frontend Development

- The frontend uses **React Native** with **Expo**
- Hot reload is enabled by default
- Uses Expo Router for navigation

### Debugging

Use the VS Code debugger for the best development experience:
1. Set breakpoints in your code
2. Press `F5` and select "Full Stack (Backend + Frontend)"
3. Both backend and frontend will start with debuggers attached
4. Backend will auto-reload on file changes

## API Endpoints

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

Key endpoints:
- `GET /` - Health check
- `GET /health` - Detailed health status
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- Authentication endpoints and more...

## Troubleshooting

### Python virtual environment issues
- Make sure you activate the virtual environment before running the backend
- On Windows, you may need to run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Port already in use
- If port 8000 is already in use, modify the port in `habit_hawk_backend/main.py` or kill the process using that port

### Expo connection issues
- Make sure your phone and computer are on the same network
- Try using the tunnel option in Expo: `npx expo start --tunnel`

## License

See [LICENSE](LICENSE) file for details.
