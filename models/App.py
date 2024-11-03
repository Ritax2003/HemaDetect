import streamlit as st
import numpy as np
import cv2
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array

model = load_model('FinalQ_efficientnet_model.keras', compile=False)

def preprocess_image(img, target_size=(224, 224)):
    img = cv2.resize(img, target_size)
    img = img_to_array(img)
    img = np.expand_dims(img, axis=0)
    img = img / 255.0
    return img

def predict_image(img):
    img = preprocess_image(img)
    prediction = model.predict(img)
    class_label = 'Normal' if prediction[0][0] > 0.5 else 'Cancerous'
    confidence = prediction[0][0] * 100 if class_label == 'Normal' else (1 - prediction[0][0]) * 100
    return class_label, confidence

st.title("Cancer Cell Classification")
st.write("Upload an image of a cell to predict whether it's cancerous or normal.")
uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    image = cv2.imdecode(np.frombuffer(uploaded_file.read(), np.uint8), 1)
    st.image(image, caption='Uploaded Image', use_column_width=True)
    class_label, confidence = predict_image(image)
    st.write(f"Prediction: **{class_label}** (Confidence: {confidence:.2f}%)")
