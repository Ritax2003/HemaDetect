const uploadContainer = document.getElementById('uploadContainer');
const fileInput = document.getElementById('imageUpload');
const numericalForm = document.getElementById('numericalForm');
const submitButton = document.getElementById('submitButton');
const outputDiv = document.getElementById('output');
const errorMessage = document.getElementById('errorMessage');
const loadingGif = document.getElementById('loadingGif');

let uploadedFile = null;
let numericalValues = [];

// Handle image file selection or drag-and-drop
function handleFiles(files) {
  const file = files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = function() {
    uploadContainer.innerHTML = '<p class="message">Photo uploaded successfully!</p>';
    uploadedFile = file;
    errorMessage.style.display = 'none';
  };
  img.onerror = function() {
    alert('Invalid image file.');
  };
}

// Event listeners for image upload
uploadContainer.addEventListener('click', () => fileInput.click());
uploadContainer.addEventListener('dragover', (event) => {
  event.preventDefault();
  uploadContainer.classList.add('dragover');
});
uploadContainer.addEventListener('dragleave', () => {
  uploadContainer.classList.remove('dragover');
});
uploadContainer.addEventListener('drop', (event) => {
  event.preventDefault();
  uploadContainer.classList.remove('dragover');
  const files = event.dataTransfer.files;
  handleFiles(files);
});
fileInput.addEventListener('change', () => {
  const files = fileInput.files;
  handleFiles(files);
});

// Retrieve numerical values from the form and format them as a JSON array of strings
function getNumericalValues() {
  const inputs = numericalForm.querySelectorAll('input[type="number"]');
  numericalValues = []; // Reset the array
  inputs.forEach(input => {
    numericalValues.push(input.value); // Collect values as strings
  });
}

// Submit form data and make API call
submitButton.addEventListener('click', () => {
  getNumericalValues(); // Ensure numerical values are up-to-date

  if (uploadedFile && numericalValues.length === 8) {
    if (numericalValues.some(value => value === '')) {
      alert('Please ensure all numerical values are entered.');
      return;
    }

    // Show the loading GIF
    loadingGif.style.display = 'inline-block';

    // Convert the numerical values array to a JSON string
    const numericalData = JSON.stringify(numericalValues);

    // Prepare form data for image file
    const formData = new FormData();
    formData.append('image', uploadedFile);
    formData.append('data', numericalData); // Append numerical data as a string

    // Make the API call to upload the image and numerical data
    fetch('https://pulsardetection.pythonanywhere.com/api/merged-predict/', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(result => {
      // Hide the loading GIF
      loadingGif.style.display = 'none';

      // Display the uploaded image and numerical values
      const img = new Image();
      img.src = URL.createObjectURL(uploadedFile);

      const predictionMessage = result.merged_prediction === 1 ? "Pulsar" : "Non-Pulsar";
      let probability = result.merged_probability;
      if(result.merged_prediction === 0){
        probability = 1 - probability;
      }
      const annpredictionMessage = result.ann_prediction === 1 ? "Pulsar" : "Non-Pulsar";
      let annprobability = result.ann_probability;
      if(result.ann_prediction === 0){
        annprobability = 1 - annprobability;
      }
      const cnnpredictionMessage = result.cnn_prediction === 1 ? "Pulsar" : "Non-Pulsar";
      let cnnprobability = result.cnn_probability;
      if(result.cnn_prediction === 0){
        cnnprobability = 1 - cnnprobability;
      }

      let inputHtml = `
        <div class="output-wrapper">
          <div class="out-img">
            <h2 style="font-size: 1.7em;">Uploaded Image:</h2>
            <img src="${img.src}" alt="Uploaded Image" style="width: 200px;"/>
          </div>
          <div class="out-txt">
            <h2 style="font-size: 1.7em;">Numerical Values:</h2>
            <p style="font-size: 0.9em;">Mean of the Integrated Profile: ${numericalValues[0]}</p>
            <p style="font-size: 0.9em;">Standard deviation of the Integrated Profile: ${numericalValues[1]}</p>
            <p style="font-size: 0.9em;">Excess kurtosis of the Integrated Profile: ${numericalValues[2]}</p>
            <p style="font-size: 0.9em;">Skewness of the Integrated Profile: ${numericalValues[3]}</p>
            <p style="font-size: 0.9em;">Mean of the DM-SNR Curve: ${numericalValues[4]}</p>
            <p style="font-size: 0.9em;">Standard deviation of the DM-SNR Curve: ${numericalValues[5]}</p>
            <p style="font-size: 0.9em;">Excess kurtosis of the DM-SNR Curve: ${numericalValues[6]}</p>
            <p style="font-size: 0.9em;">Skewness of the DM-SNR Curve: ${numericalValues[7]}</p>
          </div>
        </div>
        <div class="output-details">
          <h2 style="font-size: 1.3em; padding-top:10px">Individual Predictions:</h2>
          <p style="font-size: 1em;">Prediction from Numerical Values: <b style="color: #ff9001">${annpredictionMessage}</b> (Probability: <b style="color: #ff9001">${annprobability}</b>)</p>
          <p style="font-size: 1em;">Prediction from Image: <b style="color: #ff9001">${cnnpredictionMessage}</b> (Probability: <b style="color: #ff9001">${cnnprobability}</b>)</p>
          <h2 style="font-size: 1.7em;">Output:</h2>
          <p style="font-size: 1.3em;">Prediction: <b style="color: #ff9001">${predictionMessage}</b></p>
          <p style="font-size: 1.3em;">Probability: <b style="color: #ff9001">${probability}</b></p>
        </div>
        `;

      outputDiv.innerHTML = inputHtml;
      document.getElementById('section2').style.display = 'block';
      window.scrollTo({
        top: outputDiv.offsetTop,
        behavior: 'smooth'
      });
    })
    .catch(error => {
      console.error('Error:', error);
      loadingGif.style.display = 'none'; // Hide the loading GIF
      outputDiv.innerHTML = `<p style="color: red;">An error occurred: ${error.message}</p>`;
      document.getElementById('section2').style.display = 'block';
      window.scrollTo({
        top: outputDiv.offsetTop,
        behavior: 'smooth'
      });
    });
  } else {
    alert('Please ensure both image and all numerical values are entered.');
  }
});

// Update numerical values on input change
numericalForm.addEventListener('input', getNumericalValues);
