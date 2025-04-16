// FarmEye - Agricultural Monitoring System
// main.js - Core application functionality

// Global configuration
const config = {
    apiEndpoint: 'https://api.farmeye.com/v1',
    refreshInterval: 60000, // Data refresh interval in milliseconds (1 minute)
    mapSettings: {
      initialZoom: 12,
      center: { lat: 38.9072, lng: -77.0369 }, // Default location (update as needed)
      tileProvider: 'openstreetmap'
    }
  };
  
  // App state
  let state = {
    farms: [],
    sensors: [],
    currentFarmId: null,
    weatherData: null,
    soilData: {},
    lastUpdated: null,
    isLoading: false,
    user: null
  };
  
  // DOM Elements
  const elements = {
    farmSelector: document.getElementById('farm-selector'),
    soilMoistureChart: document.getElementById('soil-moisture-chart'),
    temperatureChart: document.getElementById('temperature-chart'),
    weatherWidget: document.getElementById('weather-widget'),
    mapContainer: document.getElementById('map-container'),
    alertsPanel: document.getElementById('alerts-panel'),
    loadingIndicator: document.getElementById('loading-indicator'),
    refreshButton: document.getElementById('refresh-data-btn'),
    settingsButton: document.getElementById('settings-btn'),
    loginForm: document.getElementById('login-form')
  };
  
  // Initialize the application
  function initApp() {
    console.log('Initializing FarmEye application...');
    
    // Set up event listeners
    setupEventListeners();
    
    // Check authentication
    checkAuth()
      .then(() => {
        // Load initial data
        loadFarms();
        initMap();
        startDataRefreshCycle();
      })
      .catch(error => {
        console.error('Authentication error:', error);
        showLoginScreen();
      });
  }
  
  // Authentication check
  async function checkAuth() {
    try {
      const token = localStorage.getItem('farmEyeToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Validate token with API
      const response = await fetch(`${config.apiEndpoint}/auth/validate`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Invalid authentication token');
      }
      
      const userData = await response.json();
      state.user = userData;
      
      return userData;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }
  
  // User login
  async function login(username, password) {
    try {
      state.isLoading = true;
      updateUI();
      
      const response = await fetch(`${config.apiEndpoint}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      localStorage.setItem('farmEyeToken', data.token);
      state.user = data.user;
      
      // Load app after successful login
      loadFarms();
      initMap();
      startDataRefreshCycle();
      hideLoginScreen();
    } catch (error) {
      console.error('Login error:', error);
      showError('Login failed. Please check your credentials and try again.');
    } finally {
      state.isLoading = false;
      updateUI();
    }
  }
  
  // Load farms data
  async function loadFarms() {
    try {
      state.isLoading = true;
      updateUI();
      
      const token = localStorage.getItem('farmEyeToken');
      const response = await fetch(`${config.apiEndpoint}/farms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load farms data');
      }
      
      state.farms = await response.json();
      
      if (state.farms.length > 0 && !state.currentFarmId) {
        state.currentFarmId = state.farms[0].id;
        loadFarmData(state.currentFarmId);
      }
      
      populateFarmSelector();
    } catch (error) {
      console.error('Error loading farms:', error);
      showError('Failed to load farm data. Please try again later.');
    } finally {
      state.isLoading = false;
      updateUI();
    }
  }
  
  // Load specific farm data
  async function loadFarmData(farmId) {
    try {
      state.isLoading = true;
      updateUI();
      
      const token = localStorage.getItem('farmEyeToken');
      
      // Load sensors data
      const sensorsResponse = await fetch(`${config.apiEndpoint}/farms/${farmId}/sensors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!sensorsResponse.ok) {
        throw new Error('Failed to load sensors data');
      }
      
      state.sensors = await sensorsResponse.ok ? await sensorsResponse.json() : [];
      
      // Load soil data
      const soilResponse = await fetch(`${config.apiEndpoint}/farms/${farmId}/soil`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      state.soilData = await soilResponse.ok ? await soilResponse.json() : {};
      
      // Load weather data
      const weatherResponse = await fetch(`${config.apiEndpoint}/farms/${farmId}/weather`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      state.weatherData = await weatherResponse.ok ? await weatherResponse.json() : null;
      
      // Update last updated timestamp
      state.lastUpdated = new Date();
      
      // Check for alerts
      checkAlerts();
      
      // Update the UI with new data
      updateChartsAndWidgets();
      updateMap();
    } catch (error) {
      console.error('Error loading farm data:', error);
      showError('Failed to load detailed farm data. Please try again later.');
    } finally {
      state.isLoading = false;
      updateUI();
    }
  }
  
  // Initialize map
  function initMap() {
    // Implementation will depend on the mapping library you're using
    // (e.g., Leaflet, Google Maps, etc.)
    console.log('Initializing map with settings:', config.mapSettings);
    
    // Example using a hypothetical map library
    const map = new FarmMap(elements.mapContainer, {
      zoom: config.mapSettings.initialZoom,
      center: config.mapSettings.center,
      tileProvider: config.mapSettings.tileProvider
    });
    
    // Store map instance for later use
    state.map = map;
  }
  
  // Update map with current farm data
  function updateMap() {
    if (!state.map || !state.currentFarmId) return;
    
    const currentFarm = state.farms.find(farm => farm.id === state.currentFarmId);
    if (!currentFarm) return;
    
    // Center map on current farm
    state.map.setCenter({
      lat: currentFarm.location.latitude,
      lng: currentFarm.location.longitude
    });
    
    // Clear existing markers
    state.map.clearMarkers();
    
    // Add farm boundary
    if (currentFarm.boundary) {
      state.map.addBoundary(currentFarm.boundary);
    }
    
    // Add sensor markers
    state.sensors.forEach(sensor => {
      state.map.addMarker({
        lat: sensor.location.latitude,
        lng: sensor.location.longitude,
        type: sensor.type,
        id: sensor.id,
        status: sensor.status
      });
    });
  }
  
  // Check for alerts based on sensor data
  function checkAlerts() {
    const alerts = [];
    
    // Check soil moisture alerts
    if (state.soilData.moisture) {
      state.soilData.moisture.forEach(reading => {
        if (reading.value < 20) {
          alerts.push({
            type: 'warning',
            message: `Low soil moisture (${reading.value}%) at sensor ${reading.sensorId}`,
            timestamp: new Date(),
            location: reading.location
          });
        }
      });
    }
    
    // Check weather alerts
    if (state.weatherData && state.weatherData.forecast) {
      const forecast = state.weatherData.forecast;
      if (forecast.precipitation > 80) {
        alerts.push({
          type: 'info',
          message: `High precipitation chance (${forecast.precipitation}%) forecasted in the next 24 hours`,
          timestamp: new Date()
        });
      }
      
      if (forecast.temperature.max > 95) {
        alerts.push({
          type: 'warning',
          message: `Extreme heat warning: ${forecast.temperature.max}°F expected`,
          timestamp: new Date()
        });
      }
    }
    
    // Check sensor health
    state.sensors.forEach(sensor => {
      if (sensor.status === 'offline' || sensor.battery < 10) {
        alerts.push({
          type: 'error',
          message: `Sensor ${sensor.id} offline or low battery (${sensor.battery}%)`,
          timestamp: new Date(),
          sensorId: sensor.id
        });
      }
    });
    
    // Update alerts in state
    state.alerts = alerts;
    
    // Display alerts in UI
    displayAlerts(alerts);
  }
  
  // Display alerts in the UI
  function displayAlerts(alerts) {
    if (!elements.alertsPanel) return;
    
    elements.alertsPanel.innerHTML = '';
    
    if (alerts.length === 0) {
      elements.alertsPanel.innerHTML = '<div class="no-alerts">No active alerts</div>';
      return;
    }
    
    alerts.forEach(alert => {
      const alertElement = document.createElement('div');
      alertElement.className = `alert alert-${alert.type}`;
      alertElement.innerHTML = `
        <div class="alert-time">${formatTime(alert.timestamp)}</div>
        <div class="alert-message">${alert.message}</div>
        <button class="alert-dismiss" data-id="${Math.random().toString(36).substr(2, 9)}">×</button>
      `;
      elements.alertsPanel.appendChild(alertElement);
    });
    
    // Add event listeners to dismiss buttons
    document.querySelectorAll('.alert-dismiss').forEach(button => {
      button.addEventListener('click', (e) => {
        e.target.parentElement.remove();
      });
    });
  }
  
  // Update charts and widgets with new data
  function updateChartsAndWidgets() {
    // Update soil moisture chart
    if (elements.soilMoistureChart && state.soilData.moisture) {
      updateSoilMoistureChart(state.soilData.moisture);
    }
    
    // Update temperature chart
    if (elements.temperatureChart && state.soilData.temperature) {
      updateTemperatureChart(state.soilData.temperature);
    }
    
    // Update weather widget
    if (elements.weatherWidget && state.weatherData) {
      updateWeatherWidget(state.weatherData);
    }
  }
  
  // Update soil moisture chart
  function updateSoilMoistureChart(moistureData) {
    // Implementation depends on the charting library you're using
    // (e.g., Chart.js, D3.js, etc.)
    console.log('Updating soil moisture chart with data:', moistureData);
    
    // Example implementation
    const labels = moistureData.map(d => formatTime(d.timestamp));
    const values = moistureData.map(d => d.value);
    
    // Create or update chart
    if (!state.charts) state.charts = {};
    
    if (!state.charts.soilMoisture) {
      state.charts.soilMoisture = new FarmChart(elements.soilMoistureChart, {
        type: 'line',
        title: 'Soil Moisture',
        yAxisLabel: 'Moisture (%)',
        xAxisLabel: 'Time'
      });
    }
    
    state.charts.soilMoisture.updateData({
      labels: labels,
      datasets: [{
        label: 'Moisture %',
        data: values,
        color: '#1E88E5'
      }]
    });
  }
  
  // Update temperature chart
  function updateTemperatureChart(temperatureData) {
    console.log('Updating temperature chart with data:', temperatureData);
    
    const labels = temperatureData.map(d => formatTime(d.timestamp));
    const values = temperatureData.map(d => d.value);
    
    if (!state.charts) state.charts = {};
    
    if (!state.charts.temperature) {
      state.charts.temperature = new FarmChart(elements.temperatureChart, {
        type: 'line',
        title: 'Soil Temperature',
        yAxisLabel: 'Temperature (°F)',
        xAxisLabel: 'Time'
      });
    }
    
    state.charts.temperature.updateData({
      labels: labels,
      datasets: [{
        label: 'Temperature °F',
        data: values,
        color: '#FF5722'
      }]
    });
  }
  
  // Update weather widget
  function updateWeatherWidget(weatherData) {
    if (!elements.weatherWidget) return;
    
    const current = weatherData.current;
    const forecast = weatherData.forecast;
    
    elements.weatherWidget.innerHTML = `
      <div class="weather-current">
        <div class="weather-temp">${current.temperature}°F</div>
        <div class="weather-condition">${current.condition}</div>
        <div class="weather-details">
          <div>Humidity: ${current.humidity}%</div>
          <div>Wind: ${current.windSpeed} mph ${current.windDirection}</div>
        </div>
      </div>
      <div class="weather-forecast">
        <h4>Forecast</h4>
        <div class="forecast-items">
          ${forecast.daily.slice(0, 3).map(day => `
            <div class="forecast-item">
              <div class="forecast-day">${formatDay(day.date)}</div>
              <div class="forecast-temp">${day.temperature.min}° - ${day.temperature.max}°</div>
              <div class="forecast-condition">${day.condition}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // Format timestamp for display
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Format day for weather forecast
  function formatDay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  
  // Populate farm selector dropdown
  function populateFarmSelector() {
    if (!elements.farmSelector || !state.farms) return;
    
    elements.farmSelector.innerHTML = '';
    
    state.farms.forEach(farm => {
      const option = document.createElement('option');
      option.value = farm.id;
      option.textContent = farm.name;
      option.selected = farm.id === state.currentFarmId;
      elements.farmSelector.appendChild(option);
    });
  }
  
  // Set up event listeners
  function setupEventListeners() {
    // Farm selector change
    if (elements.farmSelector) {
      elements.farmSelector.addEventListener('change', (e) => {
        const farmId = e.target.value;
        state.currentFarmId = farmId;
        loadFarmData(farmId);
      });
    }
    
    // Refresh button
    if (elements.refreshButton) {
      elements.refreshButton.addEventListener('click', () => {
        if (state.currentFarmId) {
          loadFarmData(state.currentFarmId);
        }
      });
    }
    
    // Settings button
    if (elements.settingsButton) {
      elements.settingsButton.addEventListener('click', () => {
        showSettingsPanel();
      });
    }
    
    // Login form
    if (elements.loginForm) {
      elements.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        login(username, password);
      });
    }
  }
  
  // Show login screen
  function showLoginScreen() {
    document.querySelector('.login-container').classList.remove('hidden');
    document.querySelector('.app-container').classList.add('hidden');
  }
  
  // Hide login screen
  function hideLoginScreen() {
    document.querySelector('.login-container').classList.add('hidden');
    document.querySelector('.app-container').classList.remove('hidden');
  }
  
  // Show settings panel
  function showSettingsPanel() {
    // Implementation will depend on your UI structure
    console.log('Showing settings panel');
  }
  
  // Show error message
  function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        errorElement.classList.add('hidden');
      }, 5000);
    }
  }
  
  // Update UI based on state
  function updateUI() {
    // Update loading indicator
    if (elements.loadingIndicator) {
      if (state.isLoading) {
        elements.loadingIndicator.classList.remove('hidden');
      } else {
        elements.loadingIndicator.classList.add('hidden');
      }
    }
    
    // Update last updated timestamp
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement && state.lastUpdated) {
      lastUpdatedElement.textContent = `Last updated: ${state.lastUpdated.toLocaleTimeString()}`;
    }
  }
  
  // Start data refresh cycle
  function startDataRefreshCycle() {
    // Set up periodic data refresh
    setInterval(() => {
      if (state.currentFarmId) {
        loadFarmData(state.currentFarmId);
      }
    }, config.refreshInterval);
  }
  
  // Logout function
  function logout() {
    localStorage.removeItem('farmEyeToken');
    state = {
      farms: [],
      sensors: [],
      currentFarmId: null,
      weatherData: null,
      soilData: {},
      lastUpdated: null,
      isLoading: false,
      user: null
    };
    showLoginScreen();
  }
  
  // Initialize the application when the document is ready
  document.addEventListener('DOMContentLoaded', initApp);
  
  // Export public methods for external use
  window.FarmEye = {
    refreshData: () => {
      if (state.currentFarmId) {
        loadFarmData(state.currentFarmId);
      }
    },
    logout: logout,
    showSettings: showSettingsPanel
  };