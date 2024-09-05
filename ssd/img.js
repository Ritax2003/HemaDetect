const uploadContainer = document.getElementById('uploadContainer');
const fileInput = document.getElementById('imageUpload');
const uploadForm = document.getElementById('uploadForm');
const outputDiv = document.getElementById('output');
const errorMessage = document.getElementById('errorMessage');
const uploadButton = document.getElementById('uploadButton');
const loadingGif = document.getElementById('loading');
let uploadedFile = null;

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
    formData.append('image', uploadedFile);

    // Make the API call to upload the image
    fetch('https://pulsardetection.pythonanywhere.com/api/cnn-predict/', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(result => {
      // Hide the loading GIF
      loadingGif.style.display = 'none';

      // Display the uploaded image
      const img = new Image();
      img.src = URL.createObjectURL(uploadedFile);
      const predictionMessage = result.prediction === 1 ? "Pulsar" : "Non-Pulsar";
      const probability = (result.probability * 100).toFixed(2) + "%";
      let inputHtml = `
        <h2 style="font-size: 1.7em;">Uploaded Image:</h2>
        <img src="${img.src}" alt="Uploaded Image" style="width: 300px;"/>
      `;
      let predictionHtml = `
        <h2 style="font-size: 1.7em;">Output:</h2>
        <p style="font-size: 1.3em;">Prediction: <b style="color: #ff9001">${predictionMessage}</b></p>
      `;

      if (result.prediction === 1) {
        predictionHtml += `<p style="font-size: 1.3em;">Probability: <b style="color: #ff9001">${result.probability}</b></p>`;
      }
      else if(result.prediction === 0){
        predictionHtml += `<p style="font-size: 1.3em;">Probability: <b style="color: #ff9001">${1-result.probability}</b></p>`;
      }
      outputDiv.innerHTML = inputHtml + predictionHtml;

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
  }
});

function validateForm() {
  if (!uploadedFile) {
    alert('Please upload an image first.');
    return false;
  }
  return true;
}

uploadButton.addEventListener('click', (event) => {
  if (!validateForm()) {
    event.preventDefault();
  }
});