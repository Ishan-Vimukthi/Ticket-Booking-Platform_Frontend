# Backend Requirements for Customer Management Integration

## 🎯 Overview
The frontend customer management system has been updated to integrate with real backend APIs. The customer analytics are working, but the customer table is empty because the backend endpoints need specific data structure and field mappings.

## 📊 Current Status
- ✅ Customer Analytics API working: `/api/ecom/customers/analytics`
- ❌ Customer List API needed: `/api/ecom/customers`
- ❌ Backend server appears to be down (connection refused on localhost:5000)

## 🔧 Required Backend Implementation

### 1. Customer List Endpoint
**Endpoint**: `GET /api/ecom/customers`
**Authentication**: Bearer token via `Authorization` header

**Required Response Format**:
```json
{
  "status": "SUCCESS",
  "data": [
    {
      "id": "customer_id_here",
      "email": "customer@example.com",
      "full_name": "Customer Full Name",
      "phone": "+1234567890",
      "address": {
        "street": "123 Main St",
        "city": "City Name",
        "state": "State",
        "zip": "12345"
      },
      "stats": {
        "totalOrders": 5,
        "totalSpent": 114.8,
        "firstOrderDate": "2024-01-15T00:00:00Z",
        "lastOrderDate": "2024-12-01T00:00:00Z"
      },
      "createdAt": "2024-01-15T00:00:00Z",
      "updatedAt": "2024-12-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 3,
    "totalPages": 1
  }
}
```

### 2. Key Field Mappings
The frontend expects these specific fields:

| Backend Field | Frontend Usage | Required |
|--------------|----------------|----------|
| `full_name` | Customer display name | ✅ Yes |
| `email` | Contact & search | ✅ Yes |
| `phone` | Contact display | ❌ Optional (defaults to 'N/A') |
| `stats.totalOrders` | Order count display | ✅ Yes |
| `stats.totalSpent` | Revenue calculations | ✅ Yes |
| `stats.firstOrderDate` | Customer since date | ❌ Optional |
| `stats.lastOrderDate` | Last activity | ❌ Optional |

### 3. Authentication Requirements
The frontend sends authentication as:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

The token is stored in `localStorage` as `ecom_token`.

### 4. Search & Filtering Support
The frontend supports these query parameters:
- `page` - Page number for pagination
- `limit` - Items per page
- `search` - Search term for name/email filtering
- `sort` - Sort field
- `order` - Sort direction (asc/desc)

### 5. Customer Type Classification
The frontend calculates customer types based on:
- **New**: 1 order or < $50 spent
- **Regular**: 2-5 orders or $50-$200 spent  
- **Loyal**: 6+ orders or $200+ spent

## 🚨 Current Issues

### 1. Backend Server Down
```
Error: Unable to connect to the remote server (localhost:5000)
```
**Action Needed**: Start the backend server

### 2. Missing Customer Data
When analytics show 3 customers but table is empty, it means:
- Analytics endpoint works but returns aggregated data
- Customer list endpoint either doesn't exist or returns wrong format

## 🔄 Frontend Data Transformation
The frontend transforms backend data like this:

```javascript
// Frontend expects this structure after transformation:
{
  _id: customer.id,
  id: customer.id,
  email: customer.email,
  name: customer.full_name,  // ← Maps from backend full_name
  phone: customer.phone || 'N/A',
  address: customer.address || {},
  orderCount: customer.stats?.totalOrders || 0,  // ← Used for table display
  totalSpent: customer.stats?.totalSpent || 0,
  firstOrderDate: customer.stats?.firstOrderDate,
  lastOrderDate: customer.stats?.lastOrderDate
}
```

## 🧪 Testing Commands
Once backend is running, test with:

```powershell
# Test customer list endpoint
Invoke-WebRequest -Uri "http://localhost:5000/api/ecom/customers" -Method GET

# Test with authentication
Invoke-WebRequest -Uri "http://localhost:5000/api/ecom/customers" -Headers @{"Authorization"="Bearer YOUR_TOKEN"} -Method GET
```

## 📝 Example Working Response
Based on analytics showing "3 customers, $309.40 revenue", the customer endpoint should return something like:

```json
{
  "status": "SUCCESS", 
  "data": [
    {
      "id": "1",
      "email": "henry@example.com",
      "full_name": "henry ford",
      "phone": "+1234567890",
      "stats": {
        "totalOrders": 5,
        "totalSpent": 114.8,
        "firstOrderDate": "2024-01-15T00:00:00Z",
        "lastOrderDate": "2024-12-01T00:00:00Z"
      }
    },
    {
      "id": "2", 
      "email": "test@example.com",
      "full_name": "Test Customer",
      "phone": "+1234567891",
      "stats": {
        "totalOrders": 1,
        "totalSpent": 35.0,
        "firstOrderDate": "2024-11-01T00:00:00Z",
        "lastOrderDate": "2024-11-01T00:00:00Z"
      }
    },
    {
      "id": "3",
      "email": "jone@example.com", 
      "full_name": "Jone Smith",
      "phone": "+1234567892",
      "stats": {
        "totalOrders": 3,
        "totalSpent": 159.6,
        "firstOrderDate": "2024-06-01T00:00:00Z",
        "lastOrderDate": "2024-11-15T00:00:00Z"
      }
    }
  ]
}
```

## 🎯 Next Steps for Backend Team

1. **Start the backend server** on localhost:5000
2. **Implement/fix the customer list endpoint** with the required data structure
3. **Ensure authentication is working** with Bearer tokens
4. **Test the endpoint** returns the expected JSON format
5. **Verify customer stats calculation** matches the analytics data

Once these are implemented, the frontend customer table should automatically populate with real data!
