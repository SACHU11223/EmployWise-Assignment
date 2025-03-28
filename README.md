# 🚀 EmployWise - User Management System

EmployWise is a **React.js-based user management system** that allows users to **log in, view, edit, delete, search, and filter users** from the Reqres API.  
The project includes **authentication, beautiful UI animations, and advanced filtering options** for a great user experience.

---

## 🌟 Features
✅ **Authentication System** (Login with API)  
✅ **User List Display with Pagination & Lazy Loading**  
✅ **Edit & Delete User with API Integration**  
✅ **Client-Side Search & Filtering** (by Name & Email)  
✅ **Dark Mode & Beautiful Animations** (Framer Motion)  
✅ **Protected Routes (Only Logged-in Users Can Access)**  
✅ **Secure Token Storage in Local Storage**  
✅ **Smooth User Interface with Tailwind CSS & Responsive Design**  

---

## 🔧 Technologies Used
| Technology | Purpose |
|------------|---------|
| **React.js** | Frontend Development |
| **Tailwind CSS** | UI Styling & Responsive Design |
| **Framer Motion** | Animations & Transitions |
| **Axios** | API Calls |
| **React Router** | Navigation & Protected Routes |
| **Reqres API** | User Data Management |
| **Netlify** | Deployment |

---

## 🚀 Live Demo
🔗 **[View Live Project](#)**

📂 **GitHub Repo:** 
    (https://github.com/SACHU11223/EmployWise-Assignment) 

---

## 📌 Installation & Setup
Follow these steps to run the project locally:

1- npm install
2- npm start
* The app will start at http://localhost:3000 


### 1️⃣ **Clone the Repository**


###🔑 **API Endpoints Used**
Action	Method	Endpoint
Login	POST	-          /api/login
Fetch Users	GET -	     /api/users?page=1
Update User	PUT	 -     /api/users/{id}
Delete User	DELETE - 	 /api/users/{id}



**Folder Structure**
employwise/
│── src/
│   │── components/
│   │   ├── Login.js
│   │   ├── UsersList.js
│   │   ├── EditUser.js
│   │── pages/
│   │   ├── Home.js
│   │── App.js
│   │── index.js
│── public/
│── package.json

