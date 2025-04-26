# Delicious Discoveries

A web application that helps users discover new recipes from around the world with various search methods and interactive features.

## 🍲 Features

### 🏠 Home Page
- Browse featured recipes
- Search recipes by name
- Real-time search suggestions with Firebase integration
- Navigation to featured functionalities

### 🌎 Recipe Exploration
- **View All Recipes**: Browse complete recipe collection alphabetically
- **Country-based Search**: Find recipes from specific regions/countries
- **Ingredient-based Search**: Enter ingredients you have to find matching recipes
- **Reverse Image Search**: Upload a food image to find similar recipes

### 🤖 AI-Powered Features
- **AI Recipe Assistant**: Get recipe suggestions and instructions by entering a dish name
- Generate downloadable PDF recipes from AI suggestions

### 📱 Recipe Details
- Comprehensive recipe view with ingredients, steps, and additional details
- Download recipes as PDF for offline use
- Responsive design for all device sizes

### 🔠 Language Support
- Google Translate integration for multilingual access

### 🛠️ Admin Panel
- Secure admin login
- Add new recipes to the database
- Delete existing recipes
- View all recipes in alphabetical order

### 📝 About Page
- Team information
- Project background and purpose

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- Firebase account (for database and storage)
- OpenAI API key (for AI recipe functionality)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/delicious-discoveries.git
   cd delicious-discoveries
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create environment file
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file with your credentials (see Configuration section below)

5. Start the development server
   ```bash
   npm run dev
   ```

   For production:
   ```bash
   npm start
   ```

6. Access the application at `http://localhost:3000`

### Configuration

The `.env.example` file provides a template for required environment variables. Create a `.env` file with the following:

#### Firebase Configuration
```
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_auth_domain_here
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
FIREBASE_APP_ID=your_app_id_here
FIREBASE_DATABASE_URL=your_database_url_here
```

#### OpenAI Configuration
```
OPENAI_API_KEY=your_openai_api_key_here
```

#### Server Configuration
```
PORT=3000
```

## 📦 Project Structure

- `server.js` - Express server entry point
- `vercel.json` - Vercel deployment configuration
- HTML files - Page templates
- JavaScript files - Client-side logic and Firebase integration
- CSS files - Styling for each page
- `translate.js` - Google Translate setup
- `include-navbar.js` - Reusable navbar component

## 💾 NPM Scripts

The project includes the following NPM scripts in `package.json`:

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reloading using nodemon

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🛡️ Security

- Secure Firebase database rules
- Admin authentication
- Protected API keys with server-side handling

## 🌐 Deployment

The project is configured for deployment to Vercel with the included `vercel.json` file.

## 👥 Contributors

- Ganesh Suryawanshi
- Vrishab Shenvi
- Sushant Navle

Special thanks to Armaan Nakhuda.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
