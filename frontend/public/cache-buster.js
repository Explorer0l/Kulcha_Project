// Cache Buster Script
(function() {
  // Добавляем timestamp ко всем JS и CSS файлам при загрузке
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && (url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.json'))) {
      url = url.includes('?') ? `${url}&t=${new Date().getTime()}` : `${url}?t=${new Date().getTime()}`;
    }
    return originalFetch.call(this, url, options);
  };

  // Добавляем timestamp к изображениям при загрузке
  const originalImage = window.Image;
  window.Image = function() {
    const img = new originalImage();
    const originalSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    
    Object.defineProperty(img, 'src', {
      get: function() { 
        return originalSrc.get.call(this);
      },
      set: function(value) {
        if (value && typeof value === 'string') {
          value = value.includes('?') ? `${value}&t=${new Date().getTime()}` : `${value}?t=${new Date().getTime()}`;
        }
        originalSrc.set.call(this, value);
      }
    });
    
    return img;
  };
  window.Image.prototype = originalImage.prototype;

  // Очистка localStorage если версия приложения изменилась
  try {
    const buildTime = document.querySelector('meta[name="build-time"]')?.getAttribute('content');
    const storedBuildTime = localStorage.getItem('app-build-time');
    
    if (buildTime && (!storedBuildTime || buildTime !== storedBuildTime)) {
      console.log('New app version detected, clearing cache...');
      
      // Очищаем только наш кэш, сохраняя необходимые данные
      const userToken = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');
      
      localStorage.clear();
      
      // Восстанавливаем важные данные
      if (userToken) localStorage.setItem('userToken', userToken);
      if (userData) localStorage.setItem('userData', userData);
      
      // Сохраняем новое время сборки
      localStorage.setItem('app-build-time', buildTime);
    }
  } catch (e) {
    console.error('Cache clearing error:', e);
  }
})(); 