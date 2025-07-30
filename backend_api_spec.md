# Backend API Specification for Smart WMS Frontend

This document outlines the API endpoints and JSON formats required by the Smart WMS Frontend application. The backend (Smart_WMS_BE) should implement or adjust its APIs to match these specifications to ensure proper data flow and functionality for the frontend.

## 1. Dashboard Summary API

**Endpoint:** `/api/dashboard/summary`
**Method:** `GET`
**Description:** Fetches a comprehensive summary of all dashboard metrics, including inventory, work status, in/out analysis, AMR performance, and sales analysis. This endpoint is crucial for populating the `UnifiedDashboard` component.

**Response JSON Structure (`DashboardSummary`):**

```json
{
  "inventorySummary": {
    "totalItems": number,
    "normalStockItems": number,
    "lowStockItems": number,
    "outOfStockItems": number,
    "totalQuantity": number
  },
  "workStatusSummary": {
    "completedToday": number,
    "inProgressToday": number,
    "pendingToday": number
  },
  "inOutAnalysis": {
    "totalInbound": number,
    "totalOutbound": number,
    "completionRate": number,
    "chartData": [
      {
        "name": string,
        "value": number
      }
      // ... more chart data entries
    ]
  },
  "amrAnalysis": {
    "totalAmrs": number,
    "activeAmrs": number,
    "errorAmrs": number,
    "statusDistribution": [
      {
        "name": string, // e.g., "moving", "charging", "idle", "error"
        "value": number
      }
      // ... more status distribution entries
    ]
  },
  "salesAnalysis": {
    "totalSalesAmount": number,
    "totalSalesCount": number,
    "companySalesDistribution": [
      {
        "name": string, // Company Name
        "value": number // Sales Count for the company
      }
      // ... more company sales distribution entries
    ],
    "salesTrend": [
      {
        "name": string, // Date (e.g., "yyyy-MM", "yyyy-MM-dd")
        "value": number // Sales Amount or Count for the period
      }
      // ... more sales trend entries
    ]
  }
}
```

**Notes for Backend Implementation:**
*   The `chartData` for `inOutAnalysis` should represent inbound and outbound quantities over time. The `name` field could be a date string (e.g., "2023-01", "2023-01-15").
*   The `statusDistribution` for `amrAnalysis` should provide counts for each AMR status (e.g., "moving", "charging", "idle", "error").
*   `companySalesDistribution` should aggregate sales by company, providing the count of sales for each company.
*   `salesTrend` should provide sales data (amount or count) over time, grouped by daily, weekly, or monthly periods as needed.

## 2. Existing APIs (from `lib/api.ts`)

The following APIs are already being called by the frontend. Ensure their functionality and response formats are consistent with the frontend's expectations.

### 2.1. Authentication

*   **Login**
    *   **Endpoint:** `/api/auth/login`
    *   **Method:** `POST`
    *   **Request Body:**
        ```json
        {
          "username": "string",
          "password": "string"
        }
        ```
    *   **Response:**
        ```json
        {
          "user": {
            "id": number,
            "username": "string",
            "email": "string",
            "fullName": "string",
            "role": "ADMIN" | "USER"
          },
          "message": "string"
        }
        ```
*   **Logout**
    *   **Endpoint:** `/api/auth/logout`
    *   **Method:** `POST`
    *   **Request Body:** (None)
    *   **Response:** (Success status, e.g., 200 OK)

### 2.2. Companies

*   **Fetch Companies**
    *   **Endpoint:** `/api/companies`
    *   **Method:** `GET`
    *   **Response:** `Company[]` (Array of Company objects)
        ```json
        [
          {
            "id": number,
            "companyName": "string",
            "contactPerson": "string",
            "contactNumber": "string",
            "address": "string"
          }
        ]
        ```
*   **Create Company**
    *   **Endpoint:** `/api/companies`
    *   **Method:** `POST`
    *   **Request Body:** `Omit<Company, 'id'>`
        ```json
        {
          "companyName": "string",
          "contactPerson": "string",
          "contactNumber": "string",
          "address": "string"
        }
        ```
    *   **Response:** `Company` (Created Company object with ID)
*   **Update Company**
    *   **Endpoint:** `/api/companies/{id}`
    *   **Method:** `PUT`
    *   **Request Body:** `Partial<Company>`
        ```json
        {
          "companyName"?: "string",
          "contactPerson"?: "string",
          "contactNumber"?: "string",
          "address"?: "string"
        }
        ```
    *   **Response:** `Company` (Updated Company object)
*   **Delete Company**
    *   **Endpoint:** `/api/companies/{id}`
    *   **Method:** `DELETE`
    *   **Response:** (Success status, e.g., 204 No Content)

### 2.3. Items

*   **Fetch Items**
    *   **Endpoint:** `/api/items`
    *   **Method:** `GET`
    *   **Response:** `Item[]` (Array of Item objects)
        ```json
        [
          {
            "id": number,
            "itemCode": "string",
            "itemName": "string",
            "itemGroup": "string",
            "spec": "string",
            "unit": "string",
            "unitPriceIn": number,
            "unitPriceOut": number
          }
        ]
        ```
*   **Create Item**
    *   **Endpoint:** `/api/items`
    *   **Method:** `POST`
    *   **Request Body:** `Omit<Item, 'id'>`
        ```json
        {
          "itemCode": "string",
          "itemName": "string",
          "itemGroup": "string",
          "spec": "string",
          "unit": "string",
          "unitPriceIn": number,
          "unitPriceOut": number
        }
        ```
    *   **Response:** `Item` (Created Item object with ID)
*   **Update Item**
    *   **Endpoint:** `/api/items/{id}`
    *   **Method:** `PUT`
    *   **Request Body:** `Partial<Item>`
        ```json
        {
          "itemCode"?: "string",
          "itemName"?: "string",
          "itemGroup"?: "string",
          "spec"?: "string",
          "unit"?: "string",
          "unitPriceIn"?: number,
          "unitPriceOut"?: number
        }
        ```
    *   **Response:** `Item` (Updated Item object)
*   **Delete Item**
    *   **Endpoint:** `/api/items/{id}`
    *   **Method:** `DELETE`
    *   **Response:** (Success status, e.g., 204 No Content)

### 2.4. In/Out Orders

*   **Fetch In/Out Data (History/Requests)**
    *   **Endpoint:** `/api/inout/orders`
    *   **Method:** `GET`
    *   **Response:** `(InOutRecord | InOutRequest)[]` (Array of InOut records/requests)
        ```json
        [
          {
            "id": number,
            "type": "INBOUND" | "OUTBOUND",
            "status": "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED",
            "company": "string", // Company Name
            "productName": "string", // Item Name
            "quantity": number,
            "date": "YYYY-MM-DD",
            "time": "HH:MM:SS"
          }
        ]
        ```
*   **Create Inbound Order**
    *   **Endpoint:** `/api/inout/orders`
    *   **Method:** `POST`
    *   **Request Body:**
        ```json
        {
          "itemId": number,
          "quantity": number,
          "companyId": number,
          "expectedDate": "YYYY-MM-DD",
          "notes": "string",
          "type": "INBOUND"
        }
        ```
    *   **Response:** `InOutRequest` (Created InOutRequest object)
*   **Create Outbound Order**
    *   **Endpoint:** `/api/inout/orders`
    *   **Method:** `POST`
    *   **Request Body:**
        ```json
        {
          "itemId": number,
          "quantity": number,
          "companyId": number,
          "expectedDate": "YYYY-MM-DD",
          "destination": "string",
          "notes": "string",
          "type": "OUTBOUND"
        }
        ```
    *   **Response:** `InOutRequest` (Created InOutRequest object)
*   **Update In/Out Record Status**
    *   **Endpoint:** `/api/inout/orders/{id}/status`
    *   **Method:** `PUT`
    *   **Request Body:** `Partial<InOutRecord>` (only status is typically updated here)
        ```json
        {
          "status": "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED"
        }
        ```
    *   **Response:** `InOutRecord` (Updated InOutRecord object)

### 2.5. Inventory

*   **Fetch Inventory Data**
    *   **Endpoint:** `/api/inventory`
    *   **Method:** `GET`
    *   **Response:** `InventoryItem[]` (Array of InventoryItem objects)
        ```json
        [
          {
            "id": number,
            "name": "string", // Item Name
            "itemCode": "string",
            "specification": "string",
            "quantity": number,
            "location": "string",
            "status": "정상" | "부족" | "품절" // Based on quantity vs safety stock
          }
        ]
        ```

### 2.6. Schedules

*   **Fetch Schedules**
    *   **Endpoint:** `/api/schedules`
    *   **Method:** `GET`
    *   **Query Parameters:**
        *   `startDate`: `string` (ISO 8601 format, e.g., "2023-01-01T00:00:00.000Z")
        *   `endDate`: `string` (ISO 8601 format, e.g., "2023-01-31T23:59:59.999Z")
    *   **Response:** `Schedule[]` (Array of Schedule objects)
        ```json
        [
          {
            "id": number,
            "title": "string",
            "start": "ISO 8601 datetime string",
            "end": "ISO 8601 datetime string",
            "allDay": boolean
          }
        ]
        ```

### 2.7. Users

*   **Fetch Users**
    *   **Endpoint:** `/api/users`
    *   **Method:** `GET`
    *   **Response:** `User[]` (Array of User objects)
        ```json
        [
          {
            "id": number,
            "username": "string",
            "email": "string",
            "fullName": "string",
            "role": "ADMIN" | "USER"
          }
        ]
        ```
*   **Create User**
    *   **Endpoint:** `/api/users`
    *   **Method:** `POST`
    *   **Request Body:**
        ```json
        {
          "username": "string",
          "email": "string",
          "password": "string",
          "fullName": "string",
          "role": "ADMIN" | "USER"
        }
        ```
    *   **Response:** `User` (Created User object with ID)
*   **Update User**
    *   **Endpoint:** `/api/users/{id}`
    *   **Method:** `PUT`
    *   **Request Body:**
        ```json
        {
          "username"?: "string",
          "email"?: "string",
          "password"?: "string",
          "fullName"?: "string",
          "role"?: "ADMIN" | "USER",
          "status"?: "ACTIVE" | "INACTIVE" | "SUSPENDED"
        }
        ```
    *   **Response:** `User` (Updated User object)
*   **Delete User**
    *   **Endpoint:** `/api/users/{id}`
    *   **Method:** `DELETE`
    *   **Response:** (Success status, e.g., 204 No Content)
