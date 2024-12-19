from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

import torch
from torchvision import transforms
from torchvision.models import googlenet, GoogLeNet_Weights
import torch.nn as nn

from PIL import Image
import gc


# Load the model
# Create an instance of the model
model = googlenet(weights=GoogLeNet_Weights.IMAGENET1K_V1)

# Modify the fully connected layer to match the saved model
model.fc = nn.Sequential(
	nn.Linear(in_features=1024, out_features=512),
	nn.ReLU(),
	nn.Dropout(0.2),
	nn.Linear(in_features=512, out_features=128),
	nn.ReLU(),
	nn.Dropout(0.2),
	nn.Linear(in_features=128, out_features=64),
	nn.ReLU(),
	nn.Dropout(0.2),
	nn.Linear(in_features=64, out_features=4)
)

# Load the model's state dictionary
model.load_state_dict(torch.load(r'./models/blood_cancer_model.pth', map_location=torch.device('cpu')))
model.eval()  # Set the model to evaluation mode

# Define the transformation
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
])

def preprocess_image(img_path):
    img = Image.open(img_path)
    img = transform(img)
    img = img.unsqueeze(0)  # Add batch dimension
    return img

@api_view(['GET','POST'])
def cnn_predict(request):
    global model  # Declare model as global to access the global model variable
    if request.method == 'GET':
        return Response({"message": "This endpoint accepts images in a POST request for prediction. Created By Patrika, Titli, Sumit, Ritabrata as part of BTech CSE final year Project."})
    if request.method == 'POST':
        if 'image' not in request.FILES:
            return Response({"error": "No image provided"}, status=400)
        print(request.data)
        image = request.FILES['image']

        # Preprocess the image
        img_tensor = preprocess_image(image) 

        # Move the image tensor to the same device as the model
        device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        img_tensor = img_tensor.to(device)
        model = model.to(device)

        # Make a prediction
        with torch.no_grad():
            output = model(img_tensor)
            probabilities = torch.nn.functional.softmax(output, dim=1)
            confidence, predicted_class = torch.max(probabilities, 1)

        # Assuming labels_map is a dictionary that maps numeric labels to string class names
        labels_map = {0: 'Benign', 1: 'Early_Pre_B', 2: 'Pre_B', 3: 'Pro_B'}
        predicted_class_name = labels_map[predicted_class.item()]
        confidence_score = confidence.item()

        # Perform garbage collection
        del img_tensor
        gc.collect()

        return Response({
            'Prediction': predicted_class_name,
            'Confidence': f"{confidence_score:.4f}%",
        })
