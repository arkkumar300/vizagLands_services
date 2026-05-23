# Vizag Lands - Real Estate Backend API

A comprehensive Node.js backend for a real estate e-commerce platform with MySQL database and Sequelize ORM.

## Features

- Role-based authentication (Owner, Agent, Builder, Admin)
- JWT token authentication (3-year expiry)
- Property management with categories
- Image upload and management with Sharp processing
- Lead generation and management
- Client dashboard with analytics
- Blog management
- Address management with city/locality hierarchy
- Property profiles with detailed specifications

## Tech Stack

- Node.js with Express
- MySQL with Sequelize ORM
- JWT for authentication
- Multer + Sharp for image processing
- CORS enabled
- UUID for primary keys

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- NPM or Yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=vizag_lands
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=3y

UPLOAD_DIR=uploads
MAX_FILE_SIZE=52428800
```

4. Create MySQL database:
```sql
CREATE DATABASE vizag_lands;
```

5. Start the server:
```bash
npm start
```

The server will automatically create all database tables on first run.

## API Endpoints

### Authentication

#### Register Client
```
POST /api/auth/register
Body: {
  "fullName": "John Doe",
  "phoneNumber": "1234567890",
  "email": "john@example.com",
  "password": "password123",
  "role": "owner" // owner, agent, or builder
}
```

#### Client Login
```
POST /api/auth/login/client
Body: {
  "email": "john@example.com",
  "password": "password123"
}
```

#### Admin Login
```
POST /api/auth/login/admin
Body: {
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Categories

#### Create Category (Admin only)
```
POST /api/categories
Headers: Authorization: Bearer <token>
Body: {
  "name": "Plots",
  "slug": "plots",
  "description": "Plot listings",
  "photo": "/uploads/images/category.webp",
  "status": "active"
}
```

#### Get All Categories
```
GET /api/categories?status=active&search=plot
```

#### Get Category by ID
```
GET /api/categories/:id
```

#### Update Category (Admin only)
```
PUT /api/categories/:id
Headers: Authorization: Bearer <token>
Body: { "name": "Updated Name" }
```

#### Delete Category (Admin only)
```
DELETE /api/categories/:id
Headers: Authorization: Bearer <token>
```

### Properties

#### Create Property (Client only)
```
POST /api/properties
Headers: Authorization: Bearer <token>
Body: {
  "categoryId": "uuid",
  "propertyName": "Green Villa",
  "title": "3BHK Villa in Gated Community",
  "description": "Spacious villa with modern amenities",
  "marketType": "sale", // sale, rent, lease
  "propertyKind": "residential",
  "price": 5000000,
  "catType":"Residential"
  "photos": ["/uploads/images/photo1.webp"],
  "videos": ["/uploads/videos/tour.mp4"],
  "youtubeUrl": "https://youtube.com/watch?v=...",
  "amenities": [
    {
      "name": "Swimming Pool",
      "description": "Olympic size pool",
      "photo": "/uploads/images/pool.webp"
    }
  ],
  "address": {
    "city": "Visakhapatnam",
    "locality": "Madhurawada",
    "subLocality": "Sector 5",
    "apartmentDoorNo": "D-201",
    "nearby": "Near Beach Road",
    "landmark": "Opposite Mall",
    "pincode": "530048"
  },
  "propertyProfile": {
    "type": "villa",
    "bedrooms": 3,
    "bathrooms": 2,
    "balconies": 2,
    "carpetArea": 1500,
    "isParkingAvailable": true,
    "parkingType": "both",
    "status": "ready_to_move",
    "areaUnit": "sqft",
    "buildArea": 1800,
    "superBuildArea": 2000
  }
}
```

#### Get All Properties
```
GET /api/properties?page=1&limit=10&categoryId=uuid&marketType=sale&status=verified&minPrice=100000&maxPrice=5000000&city=Visakhapatnam&locality=Madhurawada&clientId=uuid
```

#### Get Most Viewed Properties
```
GET /api/properties/most-viewed?limit=10
```

#### Get Property by ID
```
GET /api/properties/:id?incrementView=true
```

#### Update Property
```
PUT /api/properties/:id
Headers: Authorization: Bearer <token>
Body: { "title": "Updated Title", "price": 5500000 }
```

#### Delete Property
```
DELETE /api/properties/:id
Headers: Authorization: Bearer <token>
```

### Leads

#### Create Lead (Public)
```
POST /api/leads
Body: {
  "propertyId": "uuid",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phoneNumber": "9876543210",
  "message": "Interested in this property",
  "leadType": "inquiry" // inquiry, site_visit, callback, other
}
```

#### Get All Leads (Authenticated)
```
GET /api/leads?page=1&limit=10&status=new&leadType=inquiry&propertyId=uuid
Headers: Authorization: Bearer <token>
```

#### Get Lead by ID
```
GET /api/leads/:id
Headers: Authorization: Bearer <token>
```

#### Update Lead
```
PUT /api/leads/:id
Headers: Authorization: Bearer <token>
Body: {
  "status": "contacted", // new, contacted, completed, rejected
  "remark": "Called and scheduled site visit"
}
```

#### Delete Lead
```
DELETE /api/leads/:id
Headers: Authorization: Bearer <token>
```

### Clients

#### Get All Clients (Admin only)
```
GET /api/clients?page=1&limit=10&role=owner&status=active&search=john
Headers: Authorization: Bearer <token>
```

#### Get Client by ID
```
GET /api/clients/:id
Headers: Authorization: Bearer <token>
```

#### Update Client
```
PUT /api/clients/:id
Headers: Authorization: Bearer <token>
Body: {
  "fullName": "John Updated",
  "kycProofName": "Aadhaar",
  "kycProofNumber": "1234-5678-9012",
  "companyName": "Real Estate Co.",
  "postLimit": 5 // Admin only
}
```

#### Delete Client (Admin only)
```
DELETE /api/clients/:id
Headers: Authorization: Bearer <token>
```

### Blogs

#### Create Blog (Admin only)
```
POST /api/blogs
Headers: Authorization: Bearer <token>
Body: {
  "name": "Real Estate Investment Tips",
  "slug": "investment-tips",
  "photo": "/uploads/images/blog.webp",
  "description": "Short description",
  "content": "Full blog content here",
  "status": "published" // draft, published, archived
}
```

#### Get All Blogs
```
GET /api/blogs?page=1&limit=10&status=published&search=investment
```

#### Get Blog by ID
```
GET /api/blogs/:id
```

#### Update Blog (Admin only)
```
PUT /api/blogs/:id
Headers: Authorization: Bearer <token>
Body: { "status": "published" }
```

#### Delete Blog (Admin only)
```
DELETE /api/blogs/:id
Headers: Authorization: Bearer <token>
```

### Dashboard

#### Main Dashboard (Public)
```
GET /api/dashboard?limit=10&page=1
Response: {
  "categories": [...],
  "mostViewedProperties": {...},
  "cityLocalities": [
    {
      "city": "Visakhapatnam",
      "localities": ["Madhurawada", "MVP Colony", "Beach Road"]
    }
  ]
}
```

#### Client Dashboard (Client only)
```
GET /api/dashboard/client
Headers: Authorization: Bearer <token>
Response: {
  "addedPropertiesCount": 5,
  "verifiedPropertiesCount": 3,
  "totalViews": 1250,
  "totalLeadsCount": 42,
  "properties": [...],
  "leads": [...]
}
```

#### Client Leads Page (Client only)
```
GET /api/dashboard/client/leads
Headers: Authorization: Bearer <token>
Response: {
  "totalLeads": 42,
  "leadsThisMonth": 15,
  "contactedLeads": 20,
  "completedLeads": 10,
  "leads": [...]
}
```

### Image Management

#### Upload Single Image
```
POST /api/images/upload
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Form Data:
  - image: <file>
  - width: 1200 (optional)
  - quality: 80 (optional)
  - folder: "images" (optional)
```

#### Upload Multiple Images
```
POST /api/images/upload-multiple
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Form Data:
  - images: <files[]>
  - width: 1200 (optional)
  - quality: 80 (optional)
  - folder: "images" (optional)
```

#### Upload Document
```
POST /api/images/upload-document
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Form Data:
  - document: <file>
  - folder: "documents" (optional)
```

#### Delete File
```
DELETE /api/images/delete
Headers: Authorization: Bearer <token>
Body: {
  "filePath": "/uploads/images/filename.webp"
}
```

## Database Models

### Admin
- id, fullName, email, password, phoneNumber, status

### Category
- id, name, slug, description, photo, status

### Client
- id, fullName, phoneNumber, email, password, role, kycProofName, kycProofNumber, kycUploadFile, companyName, address, website, bio, postLimit, status, isVerified

### Address
- id, propertyId, name, city, locality, subLocality, apartmentDoorNo, nearby, landmark, pincode, fullAddress

### PropertyProfile
- id, type, bedrooms, bathrooms, balconies, carpetArea, isParkingAvailable, parkingType, status, areaUnit, buildArea, superBuildArea

### Property
- id, clientId, categoryId, addressId, propertyProfileId, propertyName, title, description, marketType, propertyKind, price, photos (JSON), videos (JSON), youtubeUrl, amenities (JSON), viewCount, status, isActive

### Lead
- id, propertyId, name, email, phoneNumber, message, leadType, status, remark

### Blog
- id, name, slug, photo, description, content, status

## Key Features

### 1. Role-Based Access Control
- **Admin**: Full access to all operations, can manage categories, blogs, and client permissions
- **Client** (Owner/Agent/Builder): Can add properties (up to post limit), manage own properties, view leads

### 2. Post Limit System
- Clients have a default post limit of 2 properties
- Admin can adjust post limits per client
- System prevents property creation if limit is exceeded

### 3. Property Status Workflow
- **Pending**: Initial status after creation
- **Verified**: Admin-approved property
- **Rejected**: Admin-rejected property
- **Inactive**: Temporarily disabled

### 4. Image Processing
- Automatic conversion to WebP format
- Configurable width and quality
- Sharp library for efficient processing
- Multiple upload support

### 5. Foreign Key Management
- Soft delete handling with CASCADE/SET NULL
- RESTRICT on categories to prevent deletion with associated properties
- Proper foreign key constraints throughout

### 6. Search & Filtering
- Property filtering by category, price range, location, market type
- Client search by name, email, phone
- Blog search by title and description

### 7. Analytics
- Property view tracking
- Lead generation metrics
- Client dashboard with comprehensive statistics
- Monthly lead reports

## Database Relations

- Property → Client (Many-to-One)
- Property → Category (Many-to-One)
- Property → Address (One-to-One)
- Property → PropertyProfile (One-to-One)
- Property → Leads (One-to-Many)

## Error Handling

All endpoints return consistent error responses:
```json
{
  "error": "Error message description"
}
```

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token validation
- Role-based middleware protection
- File upload validation and limits
- SQL injection prevention (Sequelize parameterization)

## File Upload Configuration

- Max file size: 10MB (configurable)
- Allowed formats: JPEG, PNG, WebP, MP4, MPEG, PDF, DOC, DOCX
- Images automatically processed to WebP
- Organized folder structure: uploads/images, uploads/documents, uploads/videos

## Starting the Application

```bash
# Development
npm start

# The server will:
# 1. Connect to MySQL database
# 2. Create/sync all tables
# 3. Start listening on configured PORT
```

## Important Notes

1. **First Time Setup**: Create an admin user manually in the database after first sync
2. **Post Limits**: Clients can only add properties within their post limit
3. **Image Processing**: All uploaded images are converted to WebP format
4. **Cascading Deletes**: Deleting a property also deletes its address and associated leads
5. **Category Protection**: Categories with properties cannot be deleted
6. **JWT Expiry**: Tokens are valid for 3 years by default

## API Testing

You can use tools like Postman, Insomnia, or cURL to test the API endpoints. Import the endpoint documentation for quick testing.

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT_SECRET
3. Configure MySQL for production
4. Set up proper file storage (consider S3/CloudStorage)
5. Enable HTTPS
6. Configure CORS for specific origins
7. Set up database backups
8. Monitor server logs

## License

MIT
