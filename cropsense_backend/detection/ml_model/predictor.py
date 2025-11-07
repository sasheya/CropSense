import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import json
import os


class PlantDiseaseModel(nn.Module):
    """
    Plant Disease Detection Model using MobileNetV2 with Transfer Learning
    Same architecture as used in training
    """
    def __init__(self, num_classes):
        super(PlantDiseaseModel, self).__init__()
        
        # Load MobileNetV2 base
        self.base_model = models.mobilenet_v2(weights=None)
        
        # Custom classifier (must match training architecture)
        self.base_model.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(self.base_model.last_channel, 512),
            nn.ReLU(),
            nn.BatchNorm1d(512),
            nn.Dropout(0.4),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.BatchNorm1d(256),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )
    
    def forward(self, x):
        return self.base_model(x)


class DiseasePredictor:
    """
    Singleton class for disease prediction
    Loads model once and reuses for all predictions
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize model, load weights and labels"""
        print("=" * 60)
        print("Initializing CropSense AI Disease Predictor...")
        print("=" * 60)
        
        # Set device
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {self.device}")
        
        # Get file paths
        base_dir = os.path.dirname(__file__)
        model_path = os.path.join(base_dir, 'crop_disease_model.pth')
        labels_path = os.path.join(base_dir, 'class_labels.json')
        
        # Check if files exist
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model file not found: {model_path}\n"
                "Please copy 'crop_disease_model.pth' to backend/detection/ml_model/"
            )
        
        if not os.path.exists(labels_path):
            raise FileNotFoundError(
                f"Labels file not found: {labels_path}\n"
                "Please copy 'class_labels.json' to backend/detection/ml_model/"
            )
        
        # Load class labels
        print(f"Loading class labels from: {labels_path}")
        with open(labels_path, 'r') as f:
            self.labels = json.load(f)
        
        num_classes = len(self.labels)
        print(f"Number of classes: {num_classes}")
        
        # Initialize model
        print(f"Loading model from: {model_path}")
        self.model = PlantDiseaseModel(num_classes=num_classes)
        
        # Load trained weights
        self.model.load_state_dict(
            torch.load(model_path, map_location=self.device)
        )
        
        # Move model to device and set to evaluation mode
        self.model = self.model.to(self.device)
        self.model.eval()
        
        # Define image transformation (same as validation transform in training)
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        
        print("✓ Model loaded successfully!")
        print("✓ Predictor ready for inference")
        print("=" * 60)
    
    def predict(self, image_path, top_k=3):
        """
        Predict disease from image path
        
        Args:
            image_path (str): Path to the image file
            top_k (int): Number of top predictions to return
        
        Returns:
            dict: Prediction results with disease name, confidence, and top predictions
        """
        try:
            # Load and preprocess image
            image = Image.open(image_path).convert('RGB')
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Make prediction
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = torch.softmax(outputs, dim=1)
                
                # Get top prediction
                confidence, predicted_class = torch.max(probabilities, 1)
                predicted_class = predicted_class.item()
                confidence = confidence.item()
                
                # Get top-k predictions
                top_k = min(top_k, len(self.labels))
                top_probs, top_indices = torch.topk(probabilities, k=top_k)
                
                top_predictions = []
                for prob, idx in zip(top_probs[0], top_indices[0]):
                    top_predictions.append({
                        'disease': self.labels[str(idx.item())],
                        'confidence': prob.item()
                    })
            
            # Prepare result
            result = {
                'disease': self.labels[str(predicted_class)],
                'confidence': confidence,
                'top_predictions': top_predictions
            }
            
            return result
            
        except Exception as e:
            raise Exception(f"Prediction error: {str(e)}")
    
    def predict_from_pil(self, pil_image, top_k=3):
        """
        Predict disease from PIL Image object
        
        Args:
            pil_image (PIL.Image): PIL Image object
            top_k (int): Number of top predictions to return
        
        Returns:
            dict: Prediction results
        """
        try:
            # Ensure RGB mode
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
            
            # Preprocess image
            image_tensor = self.transform(pil_image).unsqueeze(0).to(self.device)
            
            # Make prediction
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = torch.softmax(outputs, dim=1)
                
                # Get top prediction
                confidence, predicted_class = torch.max(probabilities, 1)
                predicted_class = predicted_class.item()
                confidence = confidence.item()
                
                # Get top-k predictions
                top_k = min(top_k, len(self.labels))
                top_probs, top_indices = torch.topk(probabilities, k=top_k)
                
                top_predictions = []
                for prob, idx in zip(top_probs[0], top_indices[0]):
                    top_predictions.append({
                        'disease': self.labels[str(idx.item())],
                        'confidence': prob.item()
                    })
            
            result = {
                'disease': self.labels[str(predicted_class)],
                'confidence': confidence,
                'top_predictions': top_predictions
            }
            
            return result
            
        except Exception as e:
            raise Exception(f"Prediction error: {str(e)}")
    
    def get_disease_list(self):
        """Get list of all diseases the model can detect"""
        return list(self.labels.values())
    
    def get_model_info(self):
        """Get model information"""
        return {
            'num_classes': len(self.labels),
            'device': str(self.device),
            'model_type': 'MobileNetV2 with Transfer Learning',
            'input_size': '224x224',
            'diseases': self.get_disease_list()
        }


# Create singleton instance
try:
    predictor = DiseasePredictor()
    print("\n✅ Disease Predictor initialized successfully!\n")
except Exception as e:
    print(f"\n❌ ERROR: Failed to initialize predictor: {e}\n")
    predictor = None