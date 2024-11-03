import onnxruntime as ort
import numpy as np
import cv2
import yaml
from yaml.loader import SafeLoader

#def load_model(model_path):
#    try:
#        ort_session = ort.InferenceSession(model_path)
 #       return ort_session
 #   except Exception as e:
  #      raise FileNotFoundError(f"Model not found at {model_path}: {str(e)}")
yolo = ort.InferenceSession('./models/best.onnx')
def predict_image(image_data):
    try:
        with open('./models/data.yaml',mode='r') as f:
            data_yaml = yaml.load(f,Loader=SafeLoader)
        labels = data_yaml['names']
    except FileNotFoundError:
        raise FileNotFoundError("YAML file not found in ./models directory.")
    #print(labels)
    image_data = image_data.copy()
    row,col,d = image_data.shape

    max_rc = max(row,col)
    input_image = np.zeros((max_rc,max_rc,3),dtype=np.uint8)
    input_image[0:row,0:col]=image_data
     # Prepare the image blob
    INPUT_WH_YOLO = 640
    blob = cv2.dnn.blobFromImage(input_image, 1/255.0, (INPUT_WH_YOLO, INPUT_WH_YOLO), swapRB=True, crop=False)

    # Perform inference using the ONNX model
    yolo.set_providers(['CPUExecutionProvider'])
    yolo_input_name = yolo.get_inputs()[0].name
    yolo_output_name = yolo.get_outputs()[0].name
    preds = yolo.run([yolo_output_name], {yolo_input_name: blob})[0]

    detections = preds[0]
    boxes = []
    confidences = []
    classes = []

    # widht and height of the image (input_image)
    image_w, image_h = input_image.shape[:2]
    x_factor = image_w/INPUT_WH_YOLO
    y_factor = image_h/INPUT_WH_YOLO

    for i in range(len(detections)):
        row = detections[i]
        confidence = row[4] # confidence of detection an object
        if confidence > 0.4:
            class_score = row[5:].max() # maximum probability from 20 objects
            class_id = row[5:].argmax() # get the index position at which max probabilty occur
        
            if class_score > 0.25:
                cx, cy, w, h = row[0:4]
                # construct bounding from four values
                # left, top, width and height
                left = int((cx - 0.5*w)*x_factor)
                top = int((cy - 0.5*h)*y_factor)
                width = int(w*x_factor)
                height = int(h*y_factor)
            
                box = np.array([left,top,width,height])
            
                # append values into the list
                confidences.append(confidence)
                boxes.append(box)
                classes.append(class_id)
            
    # clean
    boxes_np = np.array(boxes).tolist()
    confidences_np = np.array(confidences).tolist()

    # NMS
    index = cv2.dnn.NMSBoxes(boxes_np,confidences_np,0.25,0.45).flatten()
    if len(index) == 0:
        return image_data  # Return original image if no detections
    for ind in index:
        # extract bounding box
        x,y,w,h = boxes_np[ind]
        bb_conf = int(confidences_np[ind]*100)
        classes_id = classes[ind]
        class_name = labels[classes_id]
    
        text = f'{class_name}: {bb_conf}%'
    
        cv2.rectangle(image_data,(x,y),(x+w,y+h),(0,255,0),2)
        cv2.rectangle(image_data,(x,y-30),(x+w,y),(255,255,255),-1)
    
        cv2.putText(image_data,text,(x,y-5),cv2.FONT_HERSHEY_PLAIN,1.5,(0,0,0),2,cv2.LINE_AA)
        

    return image_data