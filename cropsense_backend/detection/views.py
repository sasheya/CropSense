from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from .models import DetectionRecord as Detection, Disease
from .serializers import DetectionRecordSerializer, DiseaseSerializer
from .ml_model.predictor import predictor


class DiseaseDetectionView(APIView):
    """POST: Detect disease from uploaded image"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if 'image' not in request.FILES:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        if predictor is None:
            return Response({'error': 'ML model not loaded'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        image_file = request.FILES['image']
        
        # Validate image size (max 5MB)
        if image_file.size > 5 * 1024 * 1024:
            return Response({'error': 'Image too large (max 5MB)'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create detection record
        detection = Detection.objects.create(user=request.user, image=image_file)
        
        try:
            # Run ML prediction
            result = predictor.predict(detection.image.path)
            
            # Get or create disease record
            disease, _ = Disease.objects.get_or_create(
                name=result['disease'],
                defaults={
                    'crop_type': result['disease'].split('_')[0] if '_' in result['disease'] else 'Unknown',
                    'description': f"Disease: {result['disease'].replace('_', ' ')}",
                    'symptoms': 'Visual symptoms detected. Consult expert for detailed diagnosis.',
                    'treatment': 'Apply appropriate treatment. Consult agricultural office for recommendations.',
                    'prevention': 'Regular monitoring, proper spacing, good drainage, and crop rotation.'
                }
            )
            
            # Update detection with results
            detection.disease = disease
            detection.confidence = result['confidence']
            detection.save()
            
            return Response({
                'detection_id': detection.id,
                'disease': result['disease'],
                'confidence': result['confidence'],
                'confidence_percentage': f"{result['confidence'] * 100:.2f}%",
                'top_predictions': result['top_predictions'],
                'disease_info': {
                    'crop_type': disease.crop_type,
                    'description': disease.description,
                    'symptoms': disease.symptoms,
                    'treatment': disease.treatment,
                    'prevention': disease.prevention
                },
                'detected_at': detection.detected_at.isoformat(),
                'image_url': request.build_absolute_uri(detection.image.url)
            })
            
        except Exception as e:
            detection.delete()
            return Response({'error': f'Prediction failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DetectionHistoryView(generics.ListAPIView):
    """GET: List user's detection history"""
    serializer_class = DetectionRecordSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Detection.objects.filter(user=self.request.user).select_related('disease')


class DetectionDetailView(generics.RetrieveDestroyAPIView):
    """GET/DELETE: Retrieve or delete detection"""
    serializer_class = DetectionRecordSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Detection.objects.filter(user=self.request.user)


class DiseaseListView(generics.ListAPIView):
    """GET: List all diseases"""
    queryset = Disease.objects.all()
    serializer_class = DiseaseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class DiseaseDetailView(generics.RetrieveAPIView):
    """GET: Retrieve disease details"""
    queryset = Disease.objects.all()
    serializer_class = DiseaseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class DetectionStatisticsView(APIView):
    """GET: User detection statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        detections = Detection.objects.filter(user=request.user)
        total = detections.count()
        
        if total == 0:
            return Response({
                'total_detections': 0,
                'most_common_diseases': [],
                'average_confidence': 0
            })
        
        # Count diseases
        disease_counts = {}
        for d in detections:
            if d.disease:
                disease_counts[d.disease.name] = disease_counts.get(d.disease.name, 0) + 1
        
        most_common = sorted(disease_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Calculate average confidence
        avg_confidence = sum(d.confidence for d in detections) / total
        
        return Response({
            'total_detections': total,
            'most_common_diseases': [{'disease': name, 'count': count} for name, count in most_common],
            'average_confidence': avg_confidence,
            'average_confidence_percentage': f"{avg_confidence * 100:.2f}%"
        })