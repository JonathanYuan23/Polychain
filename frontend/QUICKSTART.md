# 🎯 Frontend Quick Start Guide

## Run the Frontend (30 seconds)

### Option 1: Quick Start Script
```bash
cd frontend
./start.sh
```

### Option 2: Manual Start
```bash
cd frontend

# 1. Install dependencies (first time only)
npm install
# or if you have bun:
bun install

# 2. Configure environment (first time only)
cp .env.example .env

# 3. Start dev server
npm run dev
# or:
bun run dev
```

The frontend will start on **http://localhost:5173**

## ✅ What's Ready

### API Integration
- ✅ **API Client** (`src/services/api.ts`) - Complete with all backend endpoints
- ✅ **React Query Hooks** (`src/hooks/use-api.ts`) - Integrated and working
- ✅ **Data Transformers** (`src/utils/data-transform.ts`) - Backend ↔ Frontend conversion
- ✅ **TypeScript Types** - Fully typed API responses
- ✅ **Environment Config** - `.env.example` template provided

### UI Components
- ✅ **CompanySearch** - Search bar with company list
- ✅ **SupplyChainGraph** - Network visualization with vis-network
- ✅ **MetricsPanel** - Financial metrics sidebar
- ✅ **ControlPanel** - Filters and controls
- ✅ **DependenciesListView** - Table view of relationships
- ✅ **Loading & Error States** - Proper UX for API calls

### Current Status
✅ **Fully integrated with backend API** - Fetches real data from Neo4j database

## 🔌 API Endpoints Available

The frontend can call these backend endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Check backend status |
| `/api/companies/{name}/relationships` | GET | Get company's buyers & suppliers |
| `/api/relationships` | POST | Create single relationship |
| `/api/relationships/bulk` | POST | Bulk load relationships |

## 🎯 Features

- **Real-time data** from Neo4j via Go backend
- **Health monitoring** - Shows connection status (LIVE/OFFLINE)
- **Loading states** - Smooth UX during data fetches
- **Error handling** - Clear messages when backend is down
- **Company search** - Search from 18 companies in seed data
- **Network visualization** - Interactive graph of supply chain relationships
- **Metrics dashboard** - Financial analysis and insights

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Backend Not Running
```bash
# Start backend first
cd ../server
make run
```

### CORS Errors
Make sure backend allows `http://localhost:5173` in CORS settings (already configured in backend/server/main.go)

### Dependencies Not Installing
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation

- **`FRONTEND_README.md`** - Full frontend documentation
- **`API_INTEGRATION.md`** - Step-by-step API integration guide
- **`../backend/server/README.md`** - Backend API documentation
- **`../backend/server/QUICKREF.md`** - Backend quick reference

## 🎨 Tech Stack

- **React 18** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** + **shadcn/ui** - Styling
- **React Query** - Data fetching
- **vis-network** - Graph visualization
- **Recharts** - Charts
- **React Router** - Routing

## 📦 Available Scripts

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
```

## 🎯 Current Workflow

### Complete Setup
1. **Start backend:** `cd server && make run`
2. **Load seed data:** `cd server && make seed`
3. **Start frontend:** `cd frontend && npm run dev`
4. **Open browser:** `http://localhost:5173`
5. **Search companies:** Try "Apple", "TSMC", "NVIDIA", "Tesla", "Microsoft", etc.
6. **View network:** Click a company to see its supply chain visualization

### Available Companies (from seed data)
- Apple, TSMC, Foxconn, Samsung
- NVIDIA, SK Hynix
- Tesla, Panasonic, CATL
- Microsoft, Amazon, Intel
- Google, Broadcom
- Ford, LG Energy Solution
- Boeing, GE Aerospace

---

**Need help?** Check `FRONTEND_README.md` for full documentation or `../backend/server/QUICKREF.md` for backend API reference.
