import numpy as np
import cv2
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array

# Load the model
model = load_model(r'Backend\models\FinalQ_efficientnet_model.keras')

def preprocess_image(img_path, target_size=(224, 224)):
  
    # Load the image using OpenCV
    img = cv2.imread(img_path)
    img = cv2.resize(img, target_size)
    img = img_to_array(img)
    img = np.expand_dims(img, axis=0)
    img = img / 255.0  # Rescale to [0, 1]

    return img

def predict_image(img_path):
    """
    Predicts whether the input image is 'Cancerous' or 'Normal'.
    
    Args:
    img_path (str): Path to the input image.
    """
    # Preprocess the image
    img = preprocess_image(img_path)
    
    # Get model predictions
    prediction = model.predict(img)
    class_label = 'Normal' if prediction[0][0] > 0.50 else 'Cancerous'
    confidence = prediction[0][0] * 100 if class_label == 'Normal' else (1 - prediction[0][0]) * 100
    
    # Print prediction and confidence
    print(f"Prediction: {class_label} (Confidence: {confidence:.2f}%)")

# Example usage
predict_image(r'Backend\cancer\test\sample_c3.jfif')
