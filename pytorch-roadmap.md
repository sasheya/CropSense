# CropSense AI - Complete 7-Day Development Roadmap (PyTorch)
## College Project Sprint Guide

---

## ⚠️ Pre-requisites Checklist

Before starting Day 1, ensure you have:

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ and npm installed
- [ ] Git installed and configured
- [ ] VS Code or PyCharm installed
- [ ] 8-10 hours/day time commitment
- [ ] Stable internet connection
- [ ] At least 20GB free disk space

**System Requirements:**
- RAM: 8GB minimum (16GB recommended)
- Storage: 20GB free space
- GPU: Optional but recommended (CUDA-compatible for faster training)

---

## 📅 DAY 1: Project Setup & Model Training (Monday)

### Morning Session (8:00 AM - 12:00 PM): Environment Setup

#### Step 1: Create Project Structure (30 minutes)

```bash
# Create main directory
mkdir cropsense-project
cd cropsense-project

# Create folder structure
mkdir -p backend/detection/ml_model
mkdir -p backend/accounts
mkdir -p backend/community
mkdir -p ml_models/dataset
mkdir frontend

# Initialize Git
git init
echo "venv/" >> .gitignore
echo "*.pyc" >> .gitignore
echo "__pycache__/" >> .gitignore
echo "*.pth" >> .gitignore
echo "media/" >> .gitignore
echo "node_modules/" >> .gitignore
```

#### Step 2: Backend Environment Setup (30 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip
```

#### Step 3: Install Python Packages (45 minutes)

Create `requirements.txt`:
```txt
# Django Framework
Django==4.2.0
djangorestframework==3.14.0
django-cors-headers==4.0.0

# Image Processing
Pillow==10.0.0

# PyTorch (CPU version - faster installation)
torch==2.1.0
torchvision==0.16.0

# Data Science
numpy==1.24.0
pandas==2.0.0

# Visualization
matplotlib==3.7.0
seaborn==0.12.0

# Machine Learning Utils
scikit-learn==1.3.0
tqdm==4.66.0

# Database
psycopg2-binary==2.9.6

# Utilities
python-decouple==3.8
```

Install packages:
```bash
pip install -r requirements.txt

# If you have NVIDIA GPU, install CUDA version instead:
# pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

#### Step 4: Create Django Project (45 minutes)

```bash
# Create Django project
django-admin startproject cropsense .

# Create Django apps
python manage.py startapp accounts
python manage.py startapp detection
python manage.py startapp community

# Create initial migrations
python manage.py migrate
```

#### Step 5: Configure Django Settings (30 minutes)

Edit `backend/cropsense/settings.py`:

```python
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'your-secret-key-here-change-in-production'

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'corsheaders',
    
    # Local apps
    'accounts',
    'detection',
    'community',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be at top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'cropsense.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# CORS settings (Development only)
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
```

### Afternoon Session (1:00 PM - 5:00 PM): Dataset & Model Training

#### Step 6: Download Dataset (1 hour)

```bash
# Install Kaggle CLI
pip install kaggle

# Setup Kaggle credentials
# 1. Go to kaggle.com/account
# 2. Create new API token
# 3. Download kaggle.json
# 4. Place in ~/.kaggle/ (Linux/Mac) or C:\Users\<YourUser>\.kaggle\ (Windows)

# Download PlantVillage dataset
cd ../ml_models
kaggle datasets download -d abdallahalidev/plantvillage-dataset

# Unzip dataset
unzip plantvillage-dataset.zip -d dataset/

# Organize dataset structure
# Should have: dataset/train/, dataset/validation/, dataset/test/
```

**Alternative if Kaggle doesn't work:**
- Download manually from: https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset
- Extract to `ml_models/dataset/`

#### Step 7: Create Training Script (30 minutes)

Create `ml_models/train_model.py`:

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
import json
import os
from tqdm import tqdm
import time

print("=" * 50)
print("CropSense AI - Model Training")
print("=" * 50)

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 15
LEARNING_RATE = 0.001
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

print(f"\nDevice: {DEVICE}")
print(f"Batch Size: {BATCH_SIZE}")
print(f"Epochs: {EPOCHS}")
print(f"Image Size: {IMG_SIZE}x{IMG_SIZE}")

# Data augmentation for training
train_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomRotation(20),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(p=0.2),
    transforms.RandomResizedCrop(IMG_SIZE, scale=(0.8, 1.0)),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# Simple transform for validation
val_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

print("\nLoading datasets...")

# Load datasets
try:
    train_dataset = datasets.ImageFolder('dataset/train', transform=train_transform)
    val_dataset = datasets.ImageFolder('dataset/validation', transform=val_transform)
except FileNotFoundError:
    print("ERROR: Dataset not found!")
    print("Please ensure dataset is in ml_models/dataset/ directory")
    print("Expected structure:")
    print("  ml_models/dataset/train/")
    print("  ml_models/dataset/validation/")
    exit(1)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=4, pin_memory=True)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=4, pin_memory=True)

num_classes = len(train_dataset.classes)
print(f"\nDataset Information:")
print(f"  Classes: {num_classes}")
print(f"  Training samples: {len(train_dataset)}")
print(f"  Validation samples: {len(val_dataset)}")
print(f"  Training batches: {len(train_loader)}")
print(f"  Validation batches: {len(val_loader)}")

# Create model using pretrained MobileNetV2
print("\nCreating model...")
model = models.mobilenet_v2(pretrained=True)

# Freeze base layers (transfer learning)
for param in model.features.parameters():
    param.requires_grad = False

# Replace classifier with custom head
model.classifier = nn.Sequential(
    nn.Dropout(0.5),
    nn.Linear(model.last_channel, 512),
    nn.ReLU(),
    nn.Dropout(0.3),
    nn.Linear(512, 256),
    nn.ReLU(),
    nn.Dropout(0.2),
    nn.Linear(256, num_classes)
)

model = model.to(DEVICE)
print(f"Model created: MobileNetV2 with {num_classes} output classes")

# Loss function and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.classifier.parameters(), lr=LEARNING_RATE)
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='max', patience=3, factor=0.5, verbose=True)

# Training function
def train_epoch(model, loader, criterion, optimizer, epoch):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    progress_bar = tqdm(loader, desc=f"Epoch {epoch+1}/{EPOCHS} [Train]")
    
    for images, labels in progress_bar:
        images, labels = images.to(DEVICE), labels.to(DEVICE)
        
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()
        
        # Update progress bar
        progress_bar.set_postfix({
            'loss': f'{running_loss/(progress_bar.n+1):.4f}',
            'acc': f'{100.*correct/total:.2f}%'
        })
    
    accuracy = 100. * correct / total
    avg_loss = running_loss / len(loader)
    return avg_loss, accuracy

# Validation function
def validate(model, loader, criterion, epoch):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    
    progress_bar = tqdm(loader, desc=f"Epoch {epoch+1}/{EPOCHS} [Val]  ")
    
    with torch.no_grad():
        for images, labels in progress_bar:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
            progress_bar.set_postfix({
                'loss': f'{running_loss/(progress_bar.n+1):.4f}',
                'acc': f'{100.*correct/total:.2f}%'
            })
    
    accuracy = 100. * correct / total
    avg_loss = running_loss / len(loader)
    return avg_loss, accuracy

# Training loop
print("\n" + "=" * 50)
print("Starting Training")
print("=" * 50 + "\n")

best_accuracy = 0.0
best_epoch = 0
history = {
    'train_loss': [],
    'train_acc': [],
    'val_loss': [],
    'val_acc': []
}

start_time = time.time()

for epoch in range(EPOCHS):
    print(f"\n{'='*50}")
    print(f"Epoch {epoch+1}/{EPOCHS}")
    print('='*50)
    
    train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, epoch)
    val_loss, val_acc = validate(model, val_loader, criterion, epoch)
    
    history['train_loss'].append(train_loss)
    history['train_acc'].append(train_acc)
    history['val_loss'].append(val_loss)
    history['val_acc'].append(val_acc)
    
    print(f"\nResults:")
    print(f"  Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}%")
    print(f"  Val Loss:   {val_loss:.4f} | Val Acc:   {val_acc:.2f}%")
    
    # Save best model
    if val_acc > best_accuracy:
        best_accuracy = val_acc
        best_epoch = epoch + 1
        torch.save({
            'epoch': epoch,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'accuracy': val_acc,
            'loss': val_loss,
        }, 'best_model.pth')
        print(f"  ✓ Best model saved! (Accuracy: {val_acc:.2f}%)")
    
    scheduler.step(val_acc)
    
    # Early stopping if accuracy plateaus
    if epoch - best_epoch >= 5:
        print(f"\nEarly stopping triggered. No improvement for 5 epochs.")
        break

training_time = time.time() - start_time

# Save final model
torch.save(model.state_dict(), 'crop_disease_model.pth')
print(f"\n✓ Final model saved as: crop_disease_model.pth")

# Save class labels
class_to_idx = train_dataset.class_to_idx
idx_to_class = {v: k for k, v in class_to_idx.items()}
with open('class_labels.json', 'w') as f:
    json.dump(idx_to_class, f, indent=4)
print(f"✓ Class labels saved as: class_labels.json")

# Save training history
with open('training_history.json', 'w') as f:
    json.dump(history, f, indent=4)
print(f"✓ Training history saved as: training_history.json")

# Summary
print("\n" + "=" * 50)
print("Training Complete!")
print("=" * 50)
print(f"\nBest Validation Accuracy: {best_accuracy:.2f}% (Epoch {best_epoch})")
print(f"Training Time: {training_time/60:.2f} minutes")
print(f"Number of Classes: {num_classes}")
print(f"\nModel files created:")
print(f"  - crop_disease_model.pth (final model)")
print(f"  - best_model.pth (best validation accuracy)")
print(f"  - class_labels.json (class mappings)")
print(f"  - training_history.json (training metrics)")
```

#### Step 8: Train Model (2-3 hours - run and take breaks)

```bash
cd ml_models
python train_model.py
```

**What to expect:**
- Training will take 2-3 hours depending on your hardware
- You should see progress bars for each epoch
- Validation accuracy should reach 85-92%
- Model will be saved automatically

**While training runs:**
- Take lunch break
- Review Django documentation
- Plan frontend components
- DON'T close the terminal!

### Evening Session (6:00 PM - 8:00 PM): Create Django Models

#### Step 9: Create Database Models (1 hour)

Create `backend/detection/models.py`:

```python
from django.db import models
from django.contrib.auth.models import User

class Disease(models.Model):
    """Model for storing disease information"""
    name = models.CharField(max_length=200, unique=True)
    crop_type = models.CharField(max_length=100)
    description = models.TextField()
    symptoms = models.TextField()
    treatment = models.TextField()
    prevention = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.crop_type} - {self.name}"

class Detection(models.Model):
    """Model for storing user detection history"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='detections')
    image = models.ImageField(upload_to='detections/%Y/%m/%d/')
    disease = models.ForeignKey(Disease, on_delete=models.SET_NULL, null=True, blank=True)
    confidence = models.FloatField(default=0.0)
    detected_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-detected_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.disease.name if self.disease else 'Unknown'} ({self.detected_at.strftime('%Y-%m-%d %H:%M')})"
```

Create `backend/community/models.py`:

```python
from django.db import models
from django.contrib.auth.models import User

class Post(models.Model):
    """Community forum posts"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} by {self.user.username}"

class Comment(models.Model):
    """Comments on posts"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.post.title}"
```

Create `backend/accounts/models.py`:

```python
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class FarmerProfile(models.Model):
    """Extended user profile for farmers"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=15, blank=True)
    location = models.CharField(max_length=100, blank=True)
    farm_size = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Farm size in acres")
    primary_crops = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Profile of {self.user.username}"

# Signal to create profile automatically
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        FarmerProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
```

#### Step 10: Run Migrations (15 minutes)

```bash
cd backend
python manage.py makemigrations accounts
python manage.py makemigrations detection
python manage.py makemigrations community
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser
# Enter username, email, and password
```

#### Step 11: Register Models in Admin (15 minutes)

Create `backend/detection/admin.py`:

```python
from django.contrib import admin
from .models import Disease, Detection

@admin.register(Disease)
class DiseaseAdmin(admin.ModelAdmin):
    list_display = ['name', 'crop_type', 'created_at']
    search_fields = ['name', 'crop_type']
    list_filter = ['crop_type']

@admin.register(Detection)
class DetectionAdmin(admin.ModelAdmin):
    list_display = ['user', 'disease', 'confidence', 'detected_at']
    list_filter = ['detected_at', 'disease']
    search_fields = ['user__username', 'disease__name']
```

Create `backend/community/admin.py`:

```python
from django.contrib import admin
from .models import Post, Comment

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'created_at']
    search_fields = ['title', 'content']

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'created_at']
    list_filter = ['created_at']
```

Create `backend/accounts/admin.py`:

```python
from django.contrib import admin
from .models import FarmerProfile

@admin.register(FarmerProfile)
class FarmerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'location', 'farm_size', 'created_at']
    search_fields = ['user__username', 'location']
```

#### Step 12: Test Django Admin (15 minutes)

```bash
python manage.py runserver
```

Open browser: http://localhost:8000/admin
- Login with superuser credentials
- Verify all models appear in admin
- Add a test disease entry manually

### Day 1 Summary Checklist

- [✅] Django project created and configured
- [✅] PyTorch installed and working
- [✅] Dataset downloaded and organized
- [✅] Model trained successfully (85%+ accuracy)
- [✅] Database models created and migrated
- [✅] Admin panel configured
- [✅] All files organized in proper structure

**Files you should have:**
- `ml_models/crop_disease_model.pth`
- `ml_models/best_model.pth`
- `ml_models/class_labels.json`
- `ml_models/training_history.json`
- `backend/db.sqlite3`

---

## 📅 DAY 2: Backend API Development (Tuesday)

### Morning Session (8:00 AM - 12:00 PM): ML Integration

#### Step 13: Copy Model Files to Django (15 minutes)

```bash
# From project root
cd cropsense-project

# Copy model files
cp ml_models/crop_disease_model.pth backend/detection/ml_model/
cp ml_models/class_labels.json backend/detection/ml_model/

# Create __init__.py
touch backend/detection/ml_model/__init__.py
```

#### Step 14: Create Predictor Module (1 hour)

Create `backend/detection/ml_model/predictor.py`:

```python
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import json
import os

class DiseasePredictor:
    """Singleton class for disease prediction"""
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize model and preprocessing"""
        print("Initializing Disease Predictor...")
        
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {self.device}")
        
        # Get file paths
        base_dir = os.path.dirname(__file__)
        model_path = os.path.join(base_dir, 'crop_disease_model.pth')
        labels_path = os.path.join(base_dir, 'class_labels.json')
        
        # Load class labels
        with open(labels_path, 'r') as f:
            self.labels = json.load(f)
        
        num_classes = len(self.labels)
        print(f"Number of classes: {num_classes}")
        
        # Create model architecture (must match training)
        self.model = models.mobilenet_v2(pretrained=False)
        self.model.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(self.model.last_channel, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, num_classes)
        )
        
        # Load trained weights
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model = self.model.to(self.device)
        self.model.eval()
        
        # Preprocessing pipeline (same as training validation)
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        
        print("✓ Model loaded successfully!")
    
    def predict(self, image_path):
        """
        Predict disease from image file
        
        Args:
            image_path (str): Path to image file
            
        Returns:
            dict: Prediction results with disease name, confidence, and top 3 predictions
        """
        try:
            # Load and preprocess image
            image = Image.open(image_path).convert('RGB')
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Predict
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = torch.softmax(outputs, dim=1)
                
                # Get top prediction
                confidence, predicted_class = torch.max(probabilities, 1)
                predicted_class = predicted_class.item()
                confidence = confidence.item()
                
                # Get top 3 predictions
                top3_prob, top3_idx = torch.topk(probabilities, min(3, len(self.labels)))
                top3_predictions = [
                    {
                        'disease': self.labels[str(idx.item())],
                        'confidence': prob.item()
                    }
                    for prob, idx in zip(top3_prob[0], top3_idx[0])
                ]
            
            return {
                'disease': self.labels[str(predicted_class)],
                'confidence': confidence,
                'top_predictions': top3_predictions
            }
        
        except Exception as e:
            raise Exception(f"Prediction error: {str(e)}")

# Create singleton instance (loaded once when Django starts)
try:
    predictor = DiseasePredictor()
except Exception as e:
    print(f"ERROR: Failed to initialize predictor: {e}")
    predictor = None
```

#### Step 15: Create Serializers (45 minutes)

Create `backend/detection/serializers.py`:

```python
from rest_framework import serializers
from .models import Disease, Detection

class DiseaseSerializer(serializers.ModelSerializer):
    """Serializer for Disease model"""
    class Meta:
        model = Disease
        fields = ['id', 'name', 'crop_type', 'description', 'symptoms', 'treatment', 'prevention', 'created_at']
        read_only_fields = ['id', 'created_at']

class DetectionSerializer(serializers.ModelSerializer):
    """Serializer for Detection model"""
    disease_details = DiseaseSerializer(source='disease', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Detection
        fields = ['id', 'image', 'disease', 'disease_details', 'username', 'confidence', 'detected_at']
        read_only_fields = ['id', 'user', 'disease', 'confidence', 'detected_at']

class DetectionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating detection"""
    class Meta:
        model = Detection
        fields = ['image']
```

Create `backend/community/serializers.py`:

```python
from rest_framework import serializers
from .models import Post, Comment
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class