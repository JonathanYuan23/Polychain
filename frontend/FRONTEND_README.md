# Polychain Frontend

A Bloomberg Terminal-style supply chain visualization dashboard built with React, TypeScript, Vite, and shadcn/ui.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun runtime
- Backend API running on `http://localhost:8080` (see `/server` folder)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   # or if you have bun installed:
   bun install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` if your backend is running on a different port:
   ```env
   VITE_API_URL=http://localhost:8080
   ```

3. **Start development server:**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:5173` (Vite's default port)

## 📦 Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── CompanySearch.tsx       # Search bar for companies
│   │   ├── SupplyChainGraph.tsx    # Network visualization (vis-network)
│   │   ├── MetricsPanel.tsx        # Right sidebar metrics
│   │   ├── ControlPanel.tsx        # Left sidebar controls
│   │   ├── DependenciesListView.tsx # List view of relationships
│   │   └── ui/                     # shadcn/ui components
│   ├── services/
│   │   └── api.ts                  # Backend API client
│   ├── hooks/
│   │   └── use-api.ts              # React Query hooks for API
│   ├── types/
│   │   └── supply-chain.ts         # TypeScript interfaces
│   ├── data/
│   │   └── sample-data.ts          # Mock data (fallback)
│   ├── pages/
│   │   ├── Index.tsx               # Main dashboard page
│   │   └── NotFound.tsx            # 404 page
│   ├── App.tsx                     # App shell with routing
│   └── main.tsx                    # Entry point
├── public/
├── .env.example                    # Environment template
└── package.json
```

## 🔌 API Integration

The frontend connects to the Go backend API with these endpoints:

### GET `/api/health`
Check backend connectivity
```typescript
import { checkHealth } from '@/services/api';

const health = await checkHealth();
// { status: "healthy", timestamp: "2024-11-03T..." }
```

### GET `/api/companies/{name}/relationships`
Fetch all relationships for a company
```typescript
import { getCompanyRelationships } from '@/services/api';

const data = await getCompanyRelationships('Apple');
// {
//   company: "Apple",
//   buyers: [...],
//   suppliers: [...]
// }
```

### POST `/api/relationships`
Create a single relationship
```typescript
import { createRelationship } from '@/services/api';

await createRelationship({
  buyer: "Apple",
  supplier: "TSMC",
  relation_type: "manufactures_for",
  product: ["A17 Chip"],
  reason: "Chip manufacturing",
  value: "$25B",
  extracted_from: "Apple 10-K",
  evidence: "TSMC manufactures our chips"
});
```

### POST `/api/relationships/bulk`
Bulk load multiple relationships
```typescript
import { bulkLoadRelationships } from '@/services/api';

const result = await bulkLoadRelationships([...relationships]);
// { success: 12, failed: 0, errors: [] }
```

## 🎨 Features

### ✅ Current Features
- **Company Search**: Search from 18 companies in seed data
- **Network Visualization**: Interactive graph using vis-network
- **Metrics Dashboard**: Financial metrics and supplier concentration
- **List View**: Tabular view of dependencies
- **Filters**: Filter by relationship type, value ranges
- **Terminal Theme**: Bloomberg-inspired dark theme
- **Real-time Data**: Fetches live data from Neo4j via Go backend
- **Health Monitoring**: Shows connection status and errors
- **Loading States**: Smooth UX during data fetching

### 🔄 Backend Integration Status
- ✅ API service layer created
- ✅ React Query hooks integrated
- ✅ Components using real backend data
- ✅ Loading and error states implemented
- ⏳ Search endpoint uses static company list (18 companies from seed data)

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# Backend API base URL
VITE_API_URL=http://localhost:8080

# Add other environment variables as needed
```

### Backend Requirements

The frontend expects the backend to be running with:
- CORS enabled for `http://localhost:5173`
- Neo4j database populated with company data
- All API endpoints functional (see `/backend/server/README.md`)

## 🎯 Future Enhancements

Potential improvements for the application:

1. **Dynamic company search endpoint**
   - Implement `/api/companies/search?q={query}` in backend
   - Query all company names from Neo4j database
   - Replace static company list with dynamic search

2. **Relationship creation UI**
   - Add modal/form to create new relationships
   - Use `createRelationship()` API call
   - Automatically refresh data after creation

3. **Advanced filtering**
   - Filter by date ranges
   - Filter by relationship strength
   - Multi-level network depth exploration

4. **Export capabilities**
   - Export network as image
   - Export data as CSV/JSON
   - Generate supply chain reports

5. **Real-time updates**
   - WebSocket integration for live updates
   - Notifications for new relationships
   - Collaborative viewing

## 📚 Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Visualization**: vis-network, vis-data
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

## 🐛 Troubleshooting

### Backend Connection Issues

**Problem**: "Failed to fetch" or CORS errors

**Solution**:
1. Check backend is running: `curl http://localhost:8080/api/health`
2. Verify CORS is enabled in Go server (should allow `http://localhost:5173`)
3. Check `.env` file has correct `VITE_API_URL`

### Port Already in Use

**Problem**: "Port 5173 is already in use"

**Solution**:
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or specify different port
npm run dev -- --port 3000
```

### TypeScript Errors

**Problem**: Import errors or type mismatches

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

## 🎨 Customization

### Theme Colors

The terminal theme is defined in `src/index.css`. Key colors:

```css
--terminal-green: #00ff00      /* Success/Active */
--terminal-yellow: #ffd700     /* Warnings/Highlights */
--terminal-blue: #00bfff       /* Links */
--terminal-red: #ff4444        /* Errors */
--background: #0a0a0f          /* Dark background */
```

### Adding New Components

The project uses shadcn/ui. To add new components:

```bash
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add date-picker
```

## 📖 Related Documentation

- [Backend API Documentation](../backend/server/README.md)
- [Backend Setup Guide](../backend/server/SETUP.md)
- [API Quick Reference](../backend/server/QUICKREF.md)

## 🤝 Contributing

When making changes:

1. Follow the existing code style
2. Update TypeScript types in `types/supply-chain.ts`
3. Test with both mock and real backend data
4. Update this README if adding new features

## 📄 License

Part of the Polychain project.

---

**Need help?** Check the main project README or backend documentation.
