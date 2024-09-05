const uploadContainer = document.getElementById('uploadContainer');
const fileInput = document.getElementById('fileUpload');
const uploadForm = document.getElementById('uploadForm');
const outputDiv = document.getElementById('output');
const errorMessage = document.getElementById('errorMessage');
const uploadButton = document.getElementById('uploadButton');
const loadingGif = document.getElementById('loading');
let uploadedFile = null;

function handleFiles(files) {
  const file = files[0];
  if (file.name.endsWith('.phcx')) {
      uploadContainer.innerHTML = '<p class="message">.phcx file uploaded successfully!</p>';
      uploadedFile = file;
      errorMessage.style.display = 'none';
  } else {
      alert('Please upload a valid .phcx file.');
  }
}

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

uploadForm.addEventListener('submit', function(event) {
  event.preventDefault();
  if (!uploadedFile) {
      errorMessage.style.display = 'block';
  } else {
      errorMessage.style.display = 'none';
      loadingGif.style.display = 'inline-block'; // Show the loading GIF

      // Prepare form data for submission
      const formData = new FormData();
      formData.append('file', uploadedFile);

      // Make the API call to upload the .phcx file
      fetch('https://pulsardetection.pythonanywhere.com/api/phcx-predict/', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(result => {
        // Hide the loading GIF
        loadingGif.style.display = 'none';

        const outputDiv1 = document.getElementById('output');
        const outputDiv2 = document.getElementById('output1');
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
        
        // Create an image element if base64 image is present in response
        let imgHtml = '';
        if (result.image_base64) {
          const imgSrc = `data:image/png;base64,${result.image_base64}`;
          imgHtml = `
            <div class="out-img">
              <h2 style="font-size: 1.7em;">Generated Image:</h2>
              <img id="generatedImage" src="${imgSrc}" alt="Generated Image" style="width: 200px;"/>
              <br>
              <button onclick="downloadImage('${imgSrc}')" class="button-style">Download Image</button>
            </div>
          `;
        }

        outputDiv1.innerHTML = `
          <div class="out-txt">
            <h2 style="font-size: 1.7em;">Generated Data:</h2>
            <p style="font-size: 0.9em;">Mean of the Integrated Profile: <b style="color: #ff9001">${result.generated_data[0][0]}</b></p>
            <p style="font-size: 0.9em;">Standard deviation of the Integrated Profile: <b style="color: #ff9001">${result.generated_data[0][1]}</b></p>
            <p style="font-size: 0.9em;">Excess kurtosis of the Integrated Profile: <b style="color: #ff9001">${result.generated_data[0][2]}</b></p>
            <p style="font-size: 0.9em;">Skewness of the Integrated Profile: <b style="color: #ff9001">${result.generated_data[0][3]}</b></p>
            <p style="font-size: 0.9em;">Mean of the DM-SNR Curve: <b style="color: #ff9001">${result.generated_data[0][4]}</b></p>
            <p style="font-size: 0.9em;">Standard deviation of the DM-SNR Curve: <b style="color: #ff9001">${result.generated_data[0][5]}</b></p>
            <p style="font-size: 0.9em;">Excess kurtosis of the DM-SNR Curve: <b style="color: #ff9001">${result.generated_data[0][6]}</b></p>
            <p style="font-size: 0.9em;">Skewness of the DM-SNR Curve: <b style="color: #ff9001">${result.generated_data[0][7]}</b></p>
          </div>
          ${imgHtml}
        `;

        let predictionHtml = `
        <h2 style="font-size: 1.7em;">Output:</h2>
        <p style="font-size: 1.3em;">Prediction: <b style="color: #ff9001">${predictionMessage}</b></p>
        <p style="font-size: 1.3em;">Probability: <b style="color: #ff9001">${probability}</b></p>
        `;

        let annpredictionHtml = `
        <h2 style="font-size: 1.3em; padding-top:20px">Individual Predictions:</h2>
        <p style="font-size: 1em;">Prediction from Numerical Values: <b style="color: #ff9001">${annpredictionMessage}</b> (Probability: <b style="color: #ff9001">${annprobability}</b>)</p>
        `;

        let cnnpredictionHtml = `
        <p style="font-size: 1em;">Prediction from Image: <b style="color: #ff9001">${cnnpredictionMessage}</b> (Probability: <b style="color: #ff9001">${cnnprobability}</b>)</p>
        `;

        outputDiv2.innerHTML = predictionHtml + annpredictionHtml + cnnpredictionHtml; // Adjust as needed
        document.getElementById('section2').style.display = 'block';
        window.scrollTo({
          top: outputDiv1.offsetTop,
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
  }
});

// Define the downloadImage function
function downloadImage(imgSrc) {
  const link = document.createElement('a');
  link.href = imgSrc;
  link.download = 'generated_image.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function validateForm() {
  if (!uploadedFile) {
    alert('Please upload a document first.');
    return false;
  }
  return true;
}

uploadButton.addEventListener('click', (event) => {
  if (!validateForm()) {
    event.preventDefault();
  }
});


function validateForm() {
  if (!uploadedFile) {
    alert('Please upload a document first.');
    return false;
  }
  return true;
}

uploadButton.addEventListener('click', (event) => {
  if (!validateForm()) {
    event.preventDefault();
  }
});
