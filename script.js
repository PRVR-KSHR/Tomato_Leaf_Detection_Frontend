// API Configuration
const API_URL = 'http://localhost:5000';

// Disease information database
const diseaseInfo = {
    'Healthy': {
        description: 'The tomato leaf appears healthy with no signs of disease.',
        symptoms: [
            'Vibrant green color',
            'No spots or discoloration',
            'Normal leaf structure',
            'Good turgor pressure'
        ],
        recommendations: [
            'Continue regular watering and fertilization',
            'Monitor plants regularly for any changes',
            'Maintain good air circulation',
            'Keep practicing preventive measures'
        ]
    },
    'Early Blight': {
        description: 'Early blight is a common fungal disease caused by Alternaria solani. It typically appears as dark brown spots with concentric rings on older leaves.',
        symptoms: [
            'Dark brown spots with target-like rings',
            'Yellowing around spots',
            'Affects older leaves first',
            'Can spread to stems and fruits'
        ],
        recommendations: [
            'Remove and destroy infected leaves',
            'Apply fungicide (copper-based or organic)',
            'Improve air circulation by proper spacing',
            'Avoid overhead watering',
            'Mulch around plants to prevent soil splash',
            'Rotate crops annually'
        ]
    },
    'Late Blight': {
        description: 'Late blight is a serious disease caused by Phytophthora infestans. It can rapidly destroy entire crops in favorable conditions.',
        symptoms: [
            'Water-soaked spots on leaves',
            'White fuzzy growth on undersides',
            'Rapid spread in humid conditions',
            'Brown lesions on stems',
            'Can affect fruits causing rot'
        ],
        recommendations: [
            'Remove infected plants immediately',
            'Apply fungicide preventively in humid weather',
            'Ensure good drainage',
            'Space plants for air circulation',
            'Avoid working with plants when wet',
            'Use resistant varieties when possible',
            'Consider destroying severely infected plants'
        ]
    },
    'Septoria': {
        description: 'Septoria leaf spot is caused by Septoria lycopersici. It creates numerous small spots on leaves, primarily affecting lower foliage.',
        symptoms: [
            'Small circular spots with dark borders',
            'Gray or tan centers with tiny black dots',
            'Starts on lower leaves',
            'Leaves may yellow and drop',
            'Can cause significant defoliation'
        ],
        recommendations: [
            'Remove affected lower leaves',
            'Apply appropriate fungicide',
            'Mulch to prevent soil splash',
            'Water at the base of plants',
            'Improve air circulation',
            'Clean up plant debris',
            'Practice crop rotation'
        ]
    }
};

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeBtn = document.getElementById('removeBtn');
const predictBtn = document.getElementById('predictBtn');
const resultsSection = document.getElementById('resultsSection');
const diseaseName = document.getElementById('diseaseName');
const confidence = document.getElementById('confidence');
const probabilityBars = document.getElementById('probabilityBars');
const diseaseInfoDiv = document.getElementById('diseaseInfo');

let selectedFile = null;

// Upload area click
uploadArea.addEventListener('click', () => {
    imageInput.click();
});

// Drag and drop functionality
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// File input change
imageInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// Handle file selection
function handleFile(file) {
    if (!file.type.match('image.*')) {
        alert('Please select an image file');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert('File size should not exceed 10MB');
        return;
    }

    selectedFile = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        uploadArea.style.display = 'none';
        imagePreview.style.display = 'block';
        predictBtn.disabled = false;
        resultsSection.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// Remove image
removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedFile = null;
    imageInput.value = '';
    previewImg.src = '';
    imagePreview.style.display = 'none';
    uploadArea.style.display = 'block';
    predictBtn.disabled = true;
    resultsSection.style.display = 'none';
});

// Predict button
predictBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    // Show loading state
    predictBtn.classList.add('loading');
    predictBtn.querySelector('.btn-text').textContent = 'Analyzing...';
    predictBtn.querySelector('.loader').style.display = 'inline-block';
    predictBtn.disabled = true;

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Prediction failed');
        }

        const result = await response.json();
        displayResults(result);
    } catch (error) {
        console.error('Error:', error);
        alert('Error analyzing image. Please make sure the backend server is running.');
    } finally {
        // Reset button state
        predictBtn.classList.remove('loading');
        predictBtn.querySelector('.btn-text').textContent = 'Analyze Image';
        predictBtn.querySelector('.loader').style.display = 'none';
        predictBtn.disabled = false;
    }
});

// Display results
function displayResults(result) {
    // Show results section
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Display prediction
    diseaseName.textContent = result.prediction;
    diseaseName.className = 'disease-name ' + (result.prediction === 'Healthy' ? 'healthy' : 'disease');
    confidence.textContent = `Confidence: ${result.confidence.toFixed(2)}%`;

    // Display probability bars
    probabilityBars.innerHTML = '';
    const sortedProbs = Object.entries(result.all_probabilities)
        .sort((a, b) => b[1] - a[1]);

    sortedProbs.forEach(([className, prob]) => {
        const barDiv = document.createElement('div');
        barDiv.className = 'probability-bar';
        barDiv.innerHTML = `
            <div class="probability-label">
                <span>${className}</span>
                <span>${prob.toFixed(2)}%</span>
            </div>
            <div class="bar-container">
                <div class="bar-fill" style="width: ${prob}%">
                    ${prob > 15 ? prob.toFixed(1) + '%' : ''}
                </div>
            </div>
        `;
        probabilityBars.appendChild(barDiv);
    });

    // Display disease information
    const info = diseaseInfo[result.prediction];
    if (info) {
        diseaseInfoDiv.innerHTML = `
            <p><strong>${info.description}</strong></p>
            
            <h4>Symptoms:</h4>
            <ul>
                ${info.symptoms.map(s => `<li>${s}</li>`).join('')}
            </ul>
            
            <h4>Recommendations:</h4>
            <ul>
                ${info.recommendations.map(r => `<li>${r}</li>`).join('')}
            </ul>
        `;
    }
}

// Check if backend is running on page load
async function checkBackend() {
    try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
            console.log('Backend is running');
        }
    } catch (error) {
        console.warn('Backend is not running. Please start the Flask server.');
    }
}

checkBackend();
