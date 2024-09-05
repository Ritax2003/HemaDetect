document.getElementById('pulsarForm').addEventListener('submit', function(event) {
  event.preventDefault();

  // Show the loading GIF
  document.getElementById('loading').style.display = 'inline-block';

  const data = [
    document.getElementById('meanIntegrated').value,
    document.getElementById('stdIntegrated').value,
    document.getElementById('kurtIntegrated').value,
    document.getElementById('skewIntegrated').value,
    document.getElementById('meanDMSNR').value,
    document.getElementById('stdDMSNR').value,
    document.getElementById('kurtDMSNR').value,
    document.getElementById('skewDMSNR').value
  ];

  fetch('https://pulsardetection.pythonanywhere.com/api/ann-predict/?', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data: JSON.stringify(data) })
  })
  .then(response => response.json())
  .then(result => {
    const outputDiv = document.getElementById('output');
    const predictionMessage = result.prediction === 1 ? "Pulsar" : "Non-Pulsar";
    const probability = (result.probability * 100).toFixed(2) + "%";

    let inputDataHtml = `
      <h2 style="font-size: 1.7em;">Input Data:</h2>
      <p style="font-size: 0.9em;">Mean of the Integrated Profile: ${document.getElementById('meanIntegrated').value}</p>
      <p style="font-size: 0.9em;">Standard deviation of the Integrated Profile: ${document.getElementById('stdIntegrated').value}</p>
      <p style="font-size: 0.9em;">Excess kurtosis of the Integrated Profile: ${document.getElementById('kurtIntegrated').value}</p>
      <p style="font-size: 0.9em;">Skewness of the Integrated Profile: ${document.getElementById('skewIntegrated').value}</p>
      <p style="font-size: 0.9em;">Mean of the DM-SNR Curve: ${document.getElementById('meanDMSNR').value}</p>
      <p style="font-size: 0.9em;">Standard deviation of the DM-SNR Curve: ${document.getElementById('stdDMSNR').value}</p>
      <p style="font-size: 0.9em;">Excess kurtosis of the DM-SNR Curve: ${document.getElementById('kurtDMSNR').value}</p>
      <p style="font-size: 0.9em;">Skewness of the DM-SNR Curve: ${document.getElementById('skewDMSNR').value}</p>
    `;

    let predictionHtml = `
      <h2 style="font-size: 1.7em;">Output:</h2>
      <p style="font-size: 1.3em;">Prediction: <b style="color: #ff9001">${predictionMessage}</b></p>
    `;

    if (result.prediction === 1) {
      predictionHtml += `<p style="font-size: 1.3em;">Probability: <b style="color: #ff9001">${result.probability}</b></p>`;
    }
    else if(result.prediction === 0) {
      predictionHtml += `<p style="font-size: 1.3em;">Probability: <b style="color: #ff9001">${1-result.probability}</b></p>`;
    }

    outputDiv.innerHTML = inputDataHtml + predictionHtml;
    document.getElementById('section2').style.display = 'block';
    document.querySelector('.section2').scrollIntoView({ behavior: 'smooth' });

    // Hide the loading GIF
    document.getElementById('loading').style.display = 'none';
  })
  .catch(error => {
    console.error('Error:', error);
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = `<p style="color: red;">An error occurred: ${error.message}</p>`;
    document.getElementById('section2').style.display = 'block';
    document.querySelector('.section2').scrollIntoView({ behavior: 'smooth' });

    // Hide the loading GIF
    document.getElementById('loading').style.display = 'none';
  });
});
