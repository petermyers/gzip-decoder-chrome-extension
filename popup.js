document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  document.getElementById('clearBtn').addEventListener('click', clearData);
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && (changes.decodedText || changes.status)) {
      loadStoredData();
    }
  });
});

function loadStoredData() {
  chrome.storage.local.get(['decodedText', 'status', 'error', 'timestamp'], (result) => {
    const output = document.getElementById('output');
    const statusDiv = document.getElementById('status');
    const timestampDiv = document.getElementById('timestamp');
    
    if (result.status === 'success') {
      output.textContent = result.decodedText;
      statusDiv.textContent = 'Successfully decoded!';
      statusDiv.className = 'success';
      statusDiv.classList.remove('hidden');
      
      if (result.timestamp) {
        timestampDiv.textContent = `Decoded at: ${new Date(result.timestamp).toLocaleString()}`;
      }
    } else if (result.status === 'failed') {
      output.textContent = '';
      statusDiv.textContent = `Decoding failed: ${result.error || 'Unknown error'}`;
      statusDiv.className = 'error';
      statusDiv.classList.remove('hidden');
      
      if (result.timestamp) {
        timestampDiv.textContent = `Failed at: ${new Date(result.timestamp).toLocaleString()}`;
      }
    } else {
      output.textContent = '';
      statusDiv.classList.add('hidden');
      timestampDiv.textContent = '';
    }
  });
}

function clearData() {
  chrome.storage.local.clear(() => {
    document.getElementById('output').textContent = '';
    document.getElementById('status').classList.add('hidden');
    document.getElementById('timestamp').textContent = '';
  });
}
