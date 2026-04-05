# Inventory Management System (IMS) - Functional Document

**Version:** 1.0.0  
**Date:** February 2026  
**Framework:** Angular 19  
**Technology Stack:** TypeScript, SCSS, Bootstrap 5, AG-Grid, Angular Material

---

## 1. Executive Summary

The Inventory Management System (IMS) is a web-based application designed to manage and streamline inventory operations, sales orders, purchase orders, and generate comprehensive reports. This standalone Angular application provides role-based access with user authentication and a dashboard-driven interface for efficient inventory management.

---

## 2. System Overview

### 2.1 Key Features
- **User Authentication:** Secure login system with role-based access control
- **Sales Order Management:** Create, view, and manage sales transactions
- **Purchase Order Management:** Manage vendor purchases and stock replenishment
- **Inventory Tracking:** Real-time inventory monitoring and management
- **Reporting:** Generate comprehensive reports for business analytics
- **Dashboard Navigation:** Intuitive sidebar navigation with collapsible menu
- **User Session Management:** Secure session handling with token-based authentication

### 2.2 System Architecture
- **Frontend:** Angular 19 (Standalone Components)
- **UI Framework:** Bootstrap 5, Angular Material
- **Data Grid:** AG-Grid with NgX-DataTable support
- **State Management:** LocalStorage for session management
- **HTTP Client:** Angular HTTP Service for API communication
- **Routing:** Standalone routing with guards

---

## 3. Functional Modules

### 3.1 Authentication Module

#### 3.1.1 Login Component
- **Path:** `/login`
- **Functionality:**
  - User credential validation
  - Mock authentication (Username: `sandeep`, Password: `12345678`)
  - Token generation and storage in localStorage
  - Session persistence across page refreshes
  - Error handling for invalid credentials

#### 3.1.2 Admin Login Component
- **Path:** `/admin`
- **Functionality:**
  - Separate admin authentication pathway
  - Admin-specific access controls
  - Administrative privileges and features

#### 3.1.3 Authentication Guard
- **File:** `auth.guard.ts`
- **Functionality:**
  - Route protection for authenticated routes
  - Automatic redirection to login for unauthorized access
  - Token validation before route activation
  - Protects all child routes under `/dashboard`

#### 3.1.4 Authentication Service
- **File:** `auth-service.service.ts`
- **Methods:**
  - `login(credentials)`: Validates user credentials and returns authentication token
  - `logout()`: Clears authentication token and redirects to login
  - `isAuthenticated()`: Checks if user is currently authenticated
  - `setAuthToken(token)`: Stores authentication token in localStorage

---

### 3.2 Dashboard Module

#### 3.2.1 Dashboard Component
- **Path:** `/dashboard`
- **Standalone:** Yes
- **Functionality:**
  - Main application hub after successful login
  - Displays navigation sidebar with menu items
  - Manages active route highlighting
  - Search functionality (contextual based on current route)
  - User session information display
  - Responsive layout with collapsible sidebar

#### 3.2.2 Navigation Menu Items
| Menu Item | Icon | Path | Description |
|-----------|------|------|-------------|
| Sales | fas fa-chart-line | `/dashboard/sales` | Sales order management |
| Purchases | fas fa-box | `/dashboard/purchases` | Purchase order management |
| Reports | fas fa-file-alt | `/dashboard/reports` | Business reporting |
| Inventory | fas fa-cogs | `/dashboard/inventory` | Inventory management |

#### 3.2.3 Dashboard Features
- **Sidebar Toggle:** Collapsible navigation sidebar for better screen space usage
- **Active Link Highlighting:** Visual indication of current page
- **User Display:** Shows logged-in user information
- **Logout Functionality:** Secure logout with token clearing
- **Dropdown Menu:** Additional user options and settings

---

### 3.3 Sales Order Module

#### 3.3.1 Sales Order Component
- **Path:** `/dashboard/sales`
- **Standalone:** Yes
- **Functionality:**
  - Create and manage sales orders
  - Track sales transactions
  - Calculate total amounts with discounts
  - Item-level detail management

#### 3.3.2 Sales Details Model
```typescript
class SaleDetails {
  itemId: string;           // Unique item identifier
  itemName: string;         // Product name
  quantity: number;         // Order quantity
  price: number;            // Unit price
  discount: number;         // Discount percentage/amount
  total: number;            // Calculated total (price - discount)
}
```

#### 3.3.3 Features
- Line item management with add/remove functionality
- Automatic total calculation
- Discount application per item
- Multiple items per order support
- Order status tracking

---

### 3.4 Purchase Order Module

#### 3.4.1 Purchase Order Component
- **Path:** `/dashboard/purchases`
- **Standalone:** Yes
- **Functionality:**
  - Create and manage purchase orders from vendors
  - Track incoming inventory
  - Manage supplier information
  - Purchase order status tracking

#### 3.4.2 Features
- Vendor/supplier selection
- Line item management
- Quantity and cost tracking
- Delivery status monitoring
- Historical purchase record maintenance

---

### 3.5 Inventory Module

#### 3.5.1 Inventory Component
- **Path:** `/dashboard/inventory`
- **Standalone:** Yes
- **Functionality:**
  - Real-time inventory level monitoring
  - Stock status tracking
  - Low stock alerts
  - Inventory adjustment operations

#### 3.5.2 Features
- Item master maintenance
- Stock level visibility
- Movement history tracking
- Reorder point configuration
- Batch/lot management capability

---

### 3.6 Report Module

#### 3.6.1 Report Component
- **Path:** `/dashboard/reports`
- **Standalone:** Yes
- **Functionality:**
  - Generate business analytics reports
  - Sales performance analysis
  - Purchase trending
  - Inventory metrics

#### 3.6.2 Report Types
- Sales summary reports
- Purchase order reports
- Inventory status reports
- Stock movement reports
- Financial reports with margins

---

### 3.7 Error Handling Module

#### 3.7.1 Page Not Found Component
- **Path:** `**` (catch-all route)
- **Functionality:**
  - Display user-friendly error message for invalid routes
  - Provide navigation links back to valid pages
  - Maintain application styling consistency

---

## 4. Data Models

### 4.1 SaleDetails Model
**Location:** `src/app/project/models/model.ts`

```typescript
export class SaleDetails {
  itemId: string = '';
  itemName: string = '';
  quantity: number = 1;
  price: number = 1;
  discount: number = 0;
  total: number = 1;

  constructor(init?: Partial<SaleDetails>) {
    Object.assign(this, init);
  }
}
```

**Purpose:** Represents individual line items in sales orders with support for partial object initialization.

---

## 5. Service Architecture

### 5.1 HTTP Service
- **File:** `httpservice.service.ts`
- **Functionality:**
  - Centralized HTTP communication
  - API request/response handling
  - Error management
  - Request interceptors (if configured)

### 5.2 Auth Service
- **File:** `auth-service.service.ts`
- **Methods:**
  - Credential validation
  - Token management
  - Session persistence
  - User authentication state

---

## 6. Routing Structure

```
/
├── login (public)
├── admin (public)
└── dashboard (protected)
    ├── sales
    ├── purchases
    ├── reports
    └── inventory
```

**Protection:** All routes under `/dashboard` are protected by `authGuard`. Unauthenticated users are redirected to `/login`.

---

## 7. UI Components

### 7.1 Technology Stack
- **Bootstrap 5:** Responsive layout and styling
- **Angular Material:** Material Design components
- **AG-Grid:** Advanced data grid for table displays
- **NgX-DataTable:** Alternative data table component
- **NgX-Toastr:** Toast notifications for user feedback
- **Font Awesome:** Icon library for menu items and UI elements

### 7.2 Responsive Design
- Collapsible sidebar for mobile views
- Flexible grid layouts
- Mobile-optimized components
- Touch-friendly interface elements

---

## 8. Authentication & Security

### 8.1 Authentication Flow
1. User navigates to `/login`
2. Enters credentials (username & password)
3. AuthService validates against mock credentials
4. Upon success, token is generated and stored in localStorage
5. User is redirected to `/dashboard`
6. AuthGuard validates token on subsequent navigation

### 8.2 Security Features
- **Token-based authentication:** JWT tokens (mock implementation)
- **Route guards:** Protected routes require valid authentication
- **Session persistence:** Tokens stored in browser localStorage
- **Logout functionality:** Clear tokens and redirect to login
- **Role-based access:** Separate login paths for users and admins

### 8.3 Security Considerations
- **Mock Credentials:** Current implementation uses hardcoded mock credentials (for development only)
- **HTTPS Requirement:** Implement SSL/TLS in production
- **Token Expiration:** Should implement token expiration and refresh mechanisms
- **Secure Storage:** Consider secure cookie storage instead of localStorage for sensitive tokens

---

## 9. User Interface Flow

### 9.1 User Journey
```
Start
  ↓
Login Page
  ↓
[Valid Credentials]
  ↓
Dashboard (Main Hub)
  ↓
Sales/Purchase/Inventory/Reports
  ↓
[End Session]
  ↓
Logout → Login
```

### 9.2 Dashboard Navigation
- **Top Navigation:** User info, logout button
- **Sidebar Navigation:** Menu items with icons, collapsible
- **Main Content Area:** Child component display
- **Search Bar:** Contextual search functionality

---

## 10. Utilities & Directives

### 10.1 Back to Top Directive
- **File:** `back-to-top.directive.ts`
- **Functionality:** Provides scroll-to-top functionality for long pages

### 10.2 Restore Fit Column Width Directive
- **File:** `restore-fit-column-width/`
- **Functionality:** Manages and restores data grid column widths
- **Use Case:** Maintains user-customized column layouts across sessions

---

## 11. Development & Build Configuration

### 11.1 Build Scripts
- `npm start`: Start development server on `http://localhost:4200`
- `npm run build`: Build production-optimized bundle
- `npm run watch`: Build in watch mode for development
- `npm test`: Run unit tests with Karma

### 11.2 Configuration Files
- `angular.json`: Angular CLI configuration
- `tsconfig.json`: TypeScript configuration
- `tsconfig.app.json`: Application-specific TypeScript settings
- `tsconfig.spec.json`: Test-specific TypeScript settings

---

## 12. Testing Strategy

### 12.1 Unit Testing
- **Framework:** Jasmine
- **Runner:** Karma
- **Coverage:** Enabled via karma-coverage
- **Component Tests:** `.spec.ts` files for each component
- **Service Tests:** Authentication and HTTP service tests

### 12.2 Test Execution
```bash
ng test                    # Run all tests
ng test --code-coverage    # Generate coverage report
```

---

## 13. Known Limitations & Future Enhancements

### 13.1 Current Limitations
- Mock authentication (no real backend API)
- In-memory data storage (no database persistence)
- Basic error handling
- Limited real-time updates
- No email notifications
- No offline functionality

### 13.2 Future Enhancements
1. **Backend Integration:** Connect to actual REST API
2. **Database Integration:** Persistent data storage
3. **Advanced Filtering:** Complex search and filter capabilities
4. **Export Functionality:** Export reports to PDF/Excel
5. **Multi-language Support:** i18n implementation
6. **Real-time Notifications:** WebSocket integration for live updates
7. **Audit Logging:** Track all user actions
8. **Advanced Analytics:** Business intelligence dashboards
9. **Mobile App:** Native mobile application
10. **Offline Mode:** Progressive Web App (PWA) capabilities

---

## 14. Deployment & Environment

### 14.1 Development Environment
- **Node.js Version:** Compatible with Angular 19
- **Package Manager:** npm
- **Development Server:** Angular CLI dev server

### 14.2 Production Build
```bash
ng build --configuration production
```

**Output:** Production-optimized build artifacts in `dist/` directory

### 14.3 Dependencies Summary
| Package | Version | Purpose |
|---------|---------|---------|
| @angular/core | ^19.0.0 | Core Angular framework |
| @angular/material | ^19.0.2 | Material Design components |
| ag-grid-angular | ^32.3.3 | Data grid component |
| bootstrap | ^5.3.3 | CSS framework |
| ngx-toastr | ^19.0.0 | Toast notifications |
| rxjs | ~7.8.0 | Reactive programming |

---

## 15. Troubleshooting & Support

### 15.1 Common Issues
- **Authentication Failures:** Verify credentials (sandeep/12345678)
- **Route Navigation Issues:** Check authGuard configuration
- **UI Layout Problems:** Clear browser cache and rebuild
- **API Connection Errors:** Ensure mock service is running

### 15.2 Debug Mode
```bash
ng serve --poll 2000    # Enable polling for changes
ng serve --open         # Auto-open browser
ng serve --source-map   # Enable source maps for debugging
```

---

## 16. Contact & Support

**Project Name:** Inventory Management System (IMS)  
**Version:** 1.0.0  
**Technology:** Angular 19 Standalone Components  
**Last Updated:** February 2026

---

## Appendix A: File Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── dashboard.component.ts
│   │   ├── dashboard.component.html
│   │   └── dashboard.component.scss
│   ├── Login/
│   │   ├── login/
│   │   └── admin-login/
│   ├── project/
│   │   ├── inventory/
│   │   ├── sales-order/
│   │   ├── purchase-order/
│   │   ├── report/
│   │   └── models/
│   ├── services/
│   │   ├── auth.guard.ts
│   │   ├── httpservice.service.ts
│   │   └── authService/
│   ├── utilities/
│   │   ├── back-to-top.directive.ts
│   │   └── restore-fit-column-width/
│   ├── app.routes.ts
│   └── app.config.ts
├── main.ts
└── styles.scss
```

---

**Document End**
