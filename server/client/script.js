const brandInput = document.getElementById('brandInput');
const searchBtn = document.getElementById('searchBtn');
const errorDiv = document.getElementById('error');
const resultsDiv = document.getElementById('results');
const carList = document.getElementById('carList');
const carImage = document.getElementById('carImage');
const imageContainer = document.getElementById('imageContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const saveBtn = document.getElementById('saveBtn');
const savedContainer = document.getElementById('savedContainer');
const savedList = document.getElementById('savedList');

let currentImageUrl = '';
let currentImageBlob = null;

searchBtn.addEventListener('click', () => {
  const brand = brandInput.value.trim();
  
  if (!brand) {
    showError('Пожалуйста, введите марку автомобиля');
    return;
  }
  
  fetch(`/api/cars?brand=${brand}`)
    .then(response => {
      if (!response.ok) throw new Error('Марка не найдена');
      return response.json();
    })
    .then(data => {
      if (data.error) throw new Error(data.message);
      displayCars(data.data);
    })
    .catch(err => showError(err.message));
});

saveBtn.addEventListener('click', () => {
  if (!currentImageBlob) return;
  
  const reader = new FileReader();
  reader.onload = () => {
    const savedImages = JSON.parse(localStorage.getItem('savedCarImages') || '[]');
    const imageName = currentImageUrl.split('/').pop() || `car_${Date.now()}`;
    
    savedImages.push({
      name: imageName,
      data: reader.result,
      date: new Date().toISOString()
    });
    
    localStorage.setItem('savedCarImages', JSON.stringify(savedImages));
    updateSavedList();
    showError('Изображение успешно сохранено!', false);
  };
  reader.readAsDataURL(currentImageBlob);
});

function displayCars(cars) {
  hideError();
  carList.innerHTML = '';
  
  cars.forEach(car => {
    const li = document.createElement('li');
    li.textContent = car.name;
    li.addEventListener('click', () => downloadCarImage(car.imageUrl));
    carList.appendChild(li);
  });
  
  resultsDiv.classList.remove('hidden');
  imageContainer.classList.add('hidden');
  savedContainer.classList.add('hidden');
}

function downloadCarImage(imageUrl) {
  currentImageUrl = imageUrl;
  loadingIndicator.classList.remove('hidden');
  imageContainer.classList.remove('hidden');
  saveBtn.classList.add('hidden');
  carImage.src = '';
  progressBar.style.width = '0%';
  progressText.textContent = '0%';
  
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `/api/download?url=${encodeURIComponent(imageUrl)}`, true);
  xhr.responseType = 'blob';
  
  xhr.onprogress = (event) => {
    if (event.lengthComputable) {
      const percent = Math.round((event.loaded / event.total) * 100);
      progressBar.style.width = `${percent}%`;
      progressText.textContent = `${percent}%`;
    }
  };
  
  xhr.onload = () => {
    if (xhr.status === 200) {
      currentImageBlob = xhr.response;
      const url = URL.createObjectURL(xhr.response);
      carImage.src = url;
      saveBtn.classList.remove('hidden');
    } else {
      showError('Ошибка загрузки изображения');
    }
    loadingIndicator.classList.add('hidden');
  };
  
  xhr.onerror = () => {
    showError('Ошибка при загрузке изображения');
    loadingIndicator.classList.add('hidden');
  };
  
  xhr.send();
}

function updateSavedList() {
  const savedImages = JSON.parse(localStorage.getItem('savedCarImages') || '[]');
  savedList.innerHTML = '';
  
  if (savedImages.length === 0) {
    savedContainer.classList.add('hidden');
    return;
  }
  
  savedImages.forEach((img, index) => {
    const li = document.createElement('li');
    li.textContent = `${img.name} (${new Date(img.date).toLocaleString()})`;
    li.addEventListener('click', () => {
      carImage.src = img.data;
      imageContainer.classList.remove('hidden');
      saveBtn.classList.add('hidden');
    });
    savedList.appendChild(li);
  });
  
  savedContainer.classList.remove('hidden');
}

function showError(message, isError = true) {
  errorDiv.textContent = message;
  errorDiv.style.backgroundColor = isError ? '#ffebee' : '#e8f5e9';
  errorDiv.style.color = isError ? '#d32f2f' : '#2e7d32';
  errorDiv.style.borderColor = isError ? '#ef9a9a' : '#a5d6a7';
  errorDiv.classList.remove('hidden');
}

function hideError() {
  errorDiv.classList.add('hidden');
}

updateSavedList();