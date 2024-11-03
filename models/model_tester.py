from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array, ImageDataGenerator
import numpy as np
import tensorflow as tf
import os
import contextlib

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
tf.get_logger().setLevel('ERROR')
# Load the model
model = load_model(r'Backend\models\FinalQ_efficientnet_model.keras')
print("Model loaded successfully!")

# Load and resize the image
img_path = r'Backend\cancer\test\sample_nc.jpeg'  # Replace with the path to your image
img = load_img(img_path, target_size=(224, 224))  # Resize to (224, 224)

# Convert the image to an array and normalize it
img_array = img_to_array(img) / 255.0  # Scale pixel values to [0, 1]
img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension

print(f"Image shape: {img_array.shape}")

# Predict the class (binary classification)
#prediction = model.predict(img_array)

# Interpret the result
#predicted_class = 'Positive' if prediction >= 0.5 else 'Negative'
#confidence = prediction[0][0] * 100  # Convert to percentage

#print(f"Prediction: {predicted_class} ({confidence:.2f}% confidence)")
#print(f"Prediction: {prediction}")

# Create an ImageDataGenerator with augmentations
datagen = ImageDataGenerator(
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    shear_range=0.1,
    zoom_range=0.1,
    horizontal_flip=True,
    fill_mode='nearest',
    rescale=1./255  
)
datagen = ImageDataGenerator(rescale=1./255)
# Apply augmentations
augmented_images = datagen.flow(img_array, batch_size=1)
# Get the augmented image
augmented_image = next(augmented_images)[0]
# Predict the class (binary classification)

prediction = model.predict(np.expand_dims(augmented_image, axis=0))

# Interpret the result
predicted_class = 'cancerous' if prediction >= 0.5 else 'Normal'
confidence = prediction[0][0] * 100  # Convert to percentage

print(f"Prediction: {predicted_class} ({confidence:.2f}% confidence)")
print(f"Prediction: {prediction}")