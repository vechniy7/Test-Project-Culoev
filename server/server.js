const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const opn = require('opn');

app.use(express.static(path.join(__dirname, 'client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

const carData = {
  bmw: [
    { 
      name: "Логотип BMW", 
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/1015px-BMW.svg.png" 
    },
    { 
      name: "BMW M5", 
      imageUrl: "https://carmaps.ru/work/photo/gallery/minify/bmw-m5-5-mini.jpg" 
    }
  ],
  mercedes: [
    { 
      name: "Логотип Mercedes", 
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/1200px-Mercedes-Logo.svg.png" 
    },
    { 
      name: "Mercedes AMG", 
      imageUrl: "https://mb-lukavto.ru/image/data/17117219455864749.jpg" 
    }
  ],
  audi: [
    { 
      name: "Логотип Audi", 
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Logo_audi.jpg/1280px-Logo_audi.jpg" 
    },
    { 
      name: "Audi e-tron", 
      imageUrl: "https://carmaps.ru/work/photo/gallery/minify/audi-e-tron-1-mini.jpg" 
    }
  ]
};

app.get('/api/cars', (req, res) => {
  const brand = req.query.brand?.toLowerCase();
  
  if (!brand || !carData[brand]) {
    return res.status(400).json({
      error: true,
      message: "Пожалуйста, используйте: bmw, mercedes или audi"
    });
  }
  
  res.json({
    error: false,
    data: carData[brand]
  });
});

app.get('/api/download', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    const response = await fetch(imageUrl);
    
    if (!response.ok) throw new Error('Не удалось загрузить изображение');
    
    res.setHeader('Content-Type', response.headers.get('content-type'));
    response.body.pipe(res);
  } catch (error) {
    res.status(500).send('Ошибка загрузки изображения');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  opn(`http://localhost:${PORT}`);
});