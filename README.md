# 🛍️ E-Commerce Platform for Home-Based Women Sellers

## 📌 Project Overview

This project is a full-stack e-commerce platform designed to empower home-based women entrepreneurs to sell their products online. The platform includes a web application and a mobile application, built with modern technologies and scalable architecture.

The system allows users to browse products, place orders, manage stores, and track deliveries, while providing sellers with tools to manage their inventory and sales.

---

## 🚀 Features

### 👤 User (Guest / Buyer)

* Browse products and categories
* View product details
* Add products to cart
* Register and login
* Place orders
* Track order status
* Add products to favorites
* Rate products

### 🛒 Seller

* Create and manage store
* Add, update, and delete products
* Manage inventory (stock)
* View and manage orders
* Update delivery status

### 🛠️ Admin

* Manage users
* Validate and manage stores
* Monitor platform activity

---

## 🏗️ Tech Stack

### 🌐 Web Application

* **Frontend:** React.js (Vite)
* **Backend:** Laravel (REST API)
* **API Communication:** Axios

### 📱 Mobile Application

* **Language:** Kotlin (Android)

### 🗄️ Database

* **MongoDB** → Main database (products, users, orders)
* **SQLite** → Local/mobile storage or lightweight operations

### ⚙️ Other Tools

* Git & GitHub (version control)
* VS Code (development)
* Postman / Thunder Client (API testing)

---

## 📂 Project Structure

```
project-root/
│
├── backend/              # Laravel API
│   ├── app/
│   ├── routes/
│   └── controllers/
│
├── frontend/             # React Web App
│   ├── src/
│   ├── components/
│   └── pages/
│
├── mobile/               # Kotlin Android App
│
└── README.md
```

---

## 🔌 API Overview

### 🔐 Authentication

* `POST /api/auth/register` → Create new account
* `POST /api/auth/login` → Login user

### 🛍️ Products

* `GET /api/products` → Get all products
* `GET /api/products/{id}` → Get product details
* `POST /api/products` → Create product (Seller)
* `PUT /api/products/{id}` → Update product
* `DELETE /api/products/{id}` → Delete product

### 🛒 Orders

* `POST /api/orders` → Create order
* `GET /api/orders` → Get user orders
* `PUT /api/orders/{id}` → Update order status

### ❤️ Favorites

* `POST /api/favorites`
* `GET /api/favorites`

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

---

### 2️⃣ Backend Setup (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan serve
```

---

### 3️⃣ Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

---

### 4️⃣ Mobile Setup (Android)

* Open project in Android Studio
* Sync Gradle
* Run on emulator or device

---

## 🌍 Deployment

You can deploy the project using:

* **Frontend:** Render / Vercel / Netlify
* **Backend:** Render / Railway
* **Database:** MongoDB Atlas

---

## 🤝 Collaboration

To collaborate on this project:

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

## 📊 Future Improvements

* Gamification system
* Payment gateway integration
* Real-time notifications
* Advanced analytics dashboard

---

## 🧠 Architecture Notes

* RESTful API design
* Separation of concerns (Frontend / Backend / Mobile)
* Scalable NoSQL database (MongoDB)

---

## 📄 License

This project is for educational purposes.

---

## 👨‍💻 Authors

* Development Team (3 members)

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
