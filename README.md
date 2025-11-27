# CropSense AI: Intelligent Crop Disease Detection System

## Overview

CropSense AI is a full-stack agricultural platform leveraging artificial intelligence to provide Indian farmers with accurate crop disease detection, real-time weather intelligence, and community-driven support. The system addresses the critical challenge of crop diseases, which account for 20-30% of annual agricultural losses in India, by combining PyTorch-powered disease detection achieving 98%+ accuracy with comprehensive farm management tools.

## Key Features

### AI-Powered Disease Detection
- Identifies 30+ major crop diseases with 98%+ accuracy using PyTorch MobileNetV2
- Trained on 54,000+ images from PlantVillage dataset
- Delivers results within 3 seconds with confidence scores
- Provides detailed symptoms, treatment recommendations, and preventive measures

### Real-Time Weather Intelligence
- Integration with OpenWeatherMap API for current conditions and 5-day forecasts
- Displays temperature, humidity, wind speed, and precipitation data
- Enables informed decisions for irrigation, spraying, and harvesting

### Smart Farming Calendar
- Interactive 7-day calendar with weather-integrated task suggestions
- Automated scheduling for sowing, fertilizing, pest control, and harvesting
- Optimizes timing based on climatic conditions

### Community Forum
- Knowledge exchange platform for farmers, experts, and researchers
- Post creation, commenting, and discussion capabilities
- Search and filter functionality for relevant topics

### Analytics Dashboard
- Comprehensive detection history tracking
- Statistics visualization for total detections and common diseases
- Data-driven insights for crop health management

## Technology Stack

### Backend
- **Framework:** Django 4.2, Django REST Framework
- **Authentication:** JWT-based (djangorestframework-simplejwt)
- **Machine Learning:** PyTorch 2.1, MobileNetV2 architecture
- **Database:** SQLite (development), PostgreSQL (production)
- **APIs:** OpenWeatherMap for weather data

### Frontend
- **Framework:** React.js 18.2
- **UI Library:** Tailwind CSS, shadcn/ui components
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Routing:** React Router

### Architecture
Three-tier client-server architecture implementing MVC pattern with clear separation between presentation (React), application (Django REST), and data (PostgreSQL/SQLite) layers.

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+, npm 8+
- Git
- Modern web browser

### Backend Setup
```bash
# Clone repository
git clone <repository-url>
cd cropsense_backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Unix/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment variables in .env
# DJANGO_SECRET_KEY, DATABASE_URL, OPENWEATHER_API_KEY, CORS_ALLOWED_ORIGINS

# Run migrations and create superuser
python manage.py migrate
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure API base URL in environment file

# Start development server
npm run dev
```

### Machine Learning Model
Place `crop_disease_model.pth`, `class_labels.json`, and `disease_info.json` in `detection/ml_model/` directory. Model loads automatically on Django startup.

## Usage

**Registration & Authentication:** Create account with username, email, and password. JWT tokens authenticate subsequent API requests.

**Disease Detection:** Upload clear plant leaf image (JPEG/PNG, max 5MB). System returns top three disease predictions with confidence scores, symptoms, and treatment recommendations. Detection saved to history automatically.

**Weather Monitoring:** View current conditions and 5-day forecast for registered location. Access weather-based recommendations for agricultural operations.

**Community Engagement:** Create posts, comment on discussions, search relevant topics. Edit or delete own contributions.

**Calendar Management:** Review 7-day task suggestions based on season, crop type, and weather. Identify optimal days for specific farming operations.

## API Endpoints

### Authentication
- `POST /api/accounts/register/` - User registration
- `POST /api/accounts/login/` - Login (returns JWT tokens)
- `POST /api/accounts/token/refresh/` - Refresh access token
- `GET/PUT/PATCH /api/accounts/profile/` - Profile management

### Disease Detection
- `POST /api/detection/detect/` - Upload image for disease prediction
- `GET /api/detection/history/` - Retrieve detection history

### Weather
- `GET /api/weather/current/?city={city_name}` - Current weather
- `GET /api/weather/forecast/?city={city_name}` - 5-day forecast

### Community
- `GET/POST /api/community/posts/` - List/create posts
- `GET /api/community/posts/{id}/` - Post details
- `GET/POST /api/community/posts/{id}/comments/` - Comments

## Deployment

**Recommended Platforms:** AWS EC2, Heroku, or Railway for backend. Vercel or Netlify for frontend.

**Production Configuration:**
- Replace SQLite with PostgreSQL
- Configure secure secret keys and CORS settings
- Store API keys in environment variables
- Enforce HTTPS for all communications

**Performance Optimization:**
- Implement Redis caching for frequent queries
- Serve static assets through CDN
- Optimize database indexes
- Consider model quantization for faster inference

## Limitations

**Technical:** Model trained only on PlantVillage dataset diseases. Requires clear, well-lit images. Web-only application without offline capabilities. City-level weather granularity. English language only.

**Performance:** Single server deployment. Limited to 1000 concurrent users. No CDN for image delivery. ML inference 2-3 seconds on CPU.

## Future Enhancements

**Short-term (3-6 months):** Native mobile apps with offline detection. Expand to 100+ diseases across multiple crops. Multi-language support with voice input. Hyperlocal weather integration.

**Medium-term (6-12 months):** IoT sensor integration for soil and environmental monitoring. Disease outbreak prediction and yield forecasting. Marketplace for inputs and produce. Two-factor authentication.

**Long-term (1-3 years):** Generative AI for personalized advice. GPS-based precision agriculture. Blockchain supply chain traceability. Financial services integration.
