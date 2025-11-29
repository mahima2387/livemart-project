# 🛒 Live MART - Online Delivery System

A comprehensive e-commerce platform for groceries and daily needs with multi-role support, real-time order tracking, and integrated payment gateway.

## 🌟 Features

### Multi-Role System
- **Admin**: Manage users, view analytics, oversee platform
- **Wholesaler**: List products for bulk sale, manage B2B orders
- **Retailer**: Purchase wholesale products, sell to customers
- **Customer**: Browse products, place orders, track deliveries

### Core Functionality
- ✅ Email OTP verification with real Gmail integration
- 🛍️ Product catalog with categories and filtering
- 🛒 Shopping cart with quantity management
- 💳 Multiple payment methods (Cash on Delivery, Credit/Debit Card, UPI, Net Banking)
- 📦 Order management with status tracking
- 🚚 Delivery date selection
- 📧 Real-time email notifications
- 🔔 In-app notification system
- 💰 Demo payment gateway for testing
- 🏪 B2B Marketplace for wholesaler-retailer transactions
- 📊 Stock management with low-stock alerts
- 🌍 Manufacturing country tracking

## 🚀 Technologies Used

- **Backend**: Spring Boot 3.1.5, Java 17
- **Security**: Spring Security 6
- **Database**: H2 (file-based)
- **Email**: Spring Mail (Gmail SMTP)
- **Frontend**: Thymeleaf, HTML5, CSS3, JavaScript
- **Build Tool**: Maven

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6+
- Gmail account with App Password enabled

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/mahima2387/livemart-project.git
cd livemart-project
```

### 2. Configure Email Settings

1. Copy the example configuration file:
```bash
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

2. Edit `application.properties` and update email settings:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable **2-Step Verification**
   - Generate an **App Password**: [App Passwords](https://myaccount.google.com/apppasswords)
   - Update these lines:
```properties
     spring.mail.username=your.email@gmail.com
     spring.mail.password=your-16-char-app-password
```

### 3. Build the Project
```bash
mvn clean install -DskipTests
```

### 4. Run the Application
```bash
mvn spring-boot:run
```

The application will start at: **http://localhost:8080**

## 👥 Default Users

After first run, you can register new users. Each role has different capabilities:

- **Admin**: Full system access
- **Wholesaler**: Can list products for bulk sale
- **Retailer**: Can purchase from wholesalers and sell to customers
- **Customer**: Can browse and purchase products

## 📁 Project Structure
```
livemart-project/
├── src/
│   ├── main/
│   │   ├── java/com/livemart/
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── model/           # Entity classes
│   │   │   ├── repository/      # Data access layer
│   │   │   ├── service/         # Business logic
│   │   │   └── config/          # Configuration classes
│   │   └── resources/
│   │       ├── templates/       # Thymeleaf templates
│   │       ├── static/          # CSS, JS, images
│   │       └── application.properties.example
├── data/                        # H2 database files (auto-created)
├── pom.xml
└── README.md
```

## 🎯 Key Features Explained

### Email OTP Verification
- Real Gmail SMTP integration
- Professional HTML email templates
- 10-minute OTP validity
- Automatic welcome email after verification

### Payment Gateway
- Demo payment interface for testing
- Multiple payment methods support
- Credit/Debit card simulation
- UPI payment interface
- Net banking simulation
- Secure payment verification flow

### Product Management
- Category-based organization
- Stock quantity tracking
- Low-stock notifications
- Manufacturing country tracking
- Product image support
- Price management

### Order Management
- Multiple order statuses (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled)
- Delivery date selection
- Special instructions support
- Real-time notifications to sellers
- Order tracking for customers

### B2B Marketplace
- Wholesalers can list products
- Retailers can purchase in bulk
- Separate order processing for B2B
- Delivery date management

## 🔒 Security Features

- Password encryption (BCrypt)
- Role-based access control
- CSRF protection
- Email verification
- Secure session management

## 🗄️ Database

The application uses H2 database (file-based) which:
- Stores data in `./data/livemart.mv.db`
- Persists data between restarts
- Can be accessed via H2 Console at `/h2-console`
- Credentials: `admin` / `admin123`

## 📧 Email Configuration Troubleshooting

If emails are not sending:

1. **Verify Gmail Settings**:
   - 2-Step Verification is enabled
   - App Password is correctly generated
   - Using the App Password (not regular password)

2. **Check Application Logs**:
```bash
   # Look for email-related errors in console
```

3. **Test SMTP Connection**:
   - Ensure port 587 is not blocked
   - Check firewall settings

## 🐛 Common Issues

### Application won't start
- Check if port 8080 is available
- Verify Java 17 is installed: `java -version`
- Check Maven installation: `mvn -version`

### Emails not sending
- Verify Gmail App Password is correct
- Ensure 2-Step Verification is enabled
- Check application.properties configuration

### Database issues
- Delete `data/` folder and restart
- Check file permissions in project directory

## 📝 API Endpoints

### Public Endpoints
- `GET /` - Home page
- `GET /login` - Login page
- `GET /register` - Registration page
- `POST /register` - Submit registration
- `POST /verify-otp` - Verify OTP

### Customer Endpoints
- `GET /customer/products` - Browse products
- `GET /customer/cart` - View cart
- `POST /customer/cart/add` - Add to cart
- `GET /customer/checkout` - Checkout page
- `POST /customer/order/place` - Place order
- `GET /customer/orders` - View orders

### Retailer/Wholesaler Endpoints
- `GET /{role}/products` - Manage products
- `POST /{role}/product/add` - Add product
- `GET /{role}/orders` - View orders
- `POST /{role}/order/update-status` - Update order status

### Admin Endpoints
- `GET /admin/users` - Manage users
- `GET /admin/dashboard` - Admin dashboard

## 👨‍💻 Author

**Mahima**
- GitHub: [@mahima2387](https://github.com/mahima2387)


