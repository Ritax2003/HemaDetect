from django.shortcuts import render
import cv2
from rest_framework.decorators import api_view
from rest_framework.response import Response
import base64
import numpy as np
import os
import io
from PIL import Image,ImageDraw
import cv2
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array

# Load the model
model = load_model(r'.\models\FinalQ_efficientnet_model.keras')

@api_view(['POST'])
def cnn_predict(request):
    if 'image' not in request.FILES:
        return Response({"error": "No image provided"}, status=400)
    print(request.data)
    image = request.FILES['image']
    image_data = cv2.imdecode(np.frombuffer(image.read(), np.uint8), cv2.IMREAD_COLOR)
    _, original_img_encoded = cv2.imencode('.jpg', image_data)
    image_base64 = base64.b64encode(original_img_encoded).decode('utf-8')
    
    # Preprocess the image
    img = preprocess_image(image_data)
    
    # Get model predictions
    prediction = model.predict(img)
    class_label = 'Normal' if prediction[0][0] > 0.50 else 'Cancerous'
    confidence = prediction[0][0] * 100 if class_label == 'Normal' else (1 - prediction[0][0]) * 100
    
    # Print prediction and confidence
    #print(f"Prediction: {class_label} (Confidence: {confidence:.2f}%)")
 

    return Response({
        'Prediction': class_label,
        'Confidence': f"{confidence:.2f}%",
        'Image': f'data:image/jpeg;base64,{image_base64}'
    })

def preprocess_image(image_data, target_size=(224, 224)):
    img = cv2.resize(image_data, target_size)  # Resize using OpenCV
    img = img_to_array(img)
    img = np.expand_dims(img, axis=0)
    img = img / 255.0  # Rescale to [0, 1]
    return img
