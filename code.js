document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.app-section');
    const mainContent = document.getElementById('app-main');
    const loader = document.getElementById('loader');
    
    const alertList = document.getElementById('alert-list');
    const serviceList = document.getElementById('service-list');
    const regionSelect = document.getElementById('region-select');
    const serviceTypeSelect = document.getElementById('service-type-select');

    const aidForm = document.getElementById('aid-form');
    const donationForm = document.getElementById('donation-form');
    const donationTotalSpan = document.getElementById('donation-total');

    let appData = {}; // To hold all data from JSON

    // --- NAVIGATION ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;

            // Update button active state
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Show target section
            sections.forEach(section => {
                section.classList.toggle('active', section.id === targetId);
            });
        });
    });

    // --- DATA HANDLING & RENDERING ---

    /**
     * OFFLINE-FIRST DATA FETCHING
     * 1. Try to load data from localStorage (instant).
     * 2. In the background, fetch fresh data from the server.
     * 3. If fresh data is fetched, update the UI and localStorage cache.
     * 4. If fetch fails (offline), the app continues to work with cached data.
     */
    async function initializeApp() {
        showLoader(true);

        // 1. Try to load from cache
        const cachedData = localStorage.getItem('aidConnectData');
        if (cachedData) {
            appData = JSON.parse(cachedData);
            renderAll();
        }

        // 2. Fetch fresh data
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error('Network response was not ok.');
            
            const freshData = await response.json();
            appData = freshData;
            
            // 3. Update UI and cache
            renderAll();
            localStorage.setItem('aidConnectData', JSON.stringify(freshData));
            console.log("Data refreshed from server.");

        } catch (error) {
            console.error('Fetch error (user might be offline):', error);
            if (!cachedData) {
                alertList.innerHTML = `<p>Could not load data. Please check your internet connection.</p>`;
            }
        } finally {
            showLoader(false);
        }
    }

    function renderAll() {
        renderAlerts(appData.alerts || []);
        renderServices(appData.services || []);
        populateRegionFilter(appData.services || []);
        updateDonationTotal();
    }
    
    function renderAlerts(alerts) {
        alertList.innerHTML = ''; // Clear existing
        if (!alerts.length) {
            alertList.innerHTML = '<p>No current alerts.</p>';
            return;
        }
        alerts.forEach(alert => {
            const alertCard = document.createElement('div');
            alertCard.className = `card ${alert.severity}`; // e.g., 'card critical'
            alertCard.innerHTML = `
                <h3 class="card-title">${alert.title}</h3>
                <p>${alert.details}</p>
                <div class="card-meta">
                    <span>${new Date(alert.timestamp).toLocaleString()}</span>
                </div>
            `;
            alertList.appendChild(alertCard);
        });
    }

    function renderServices(services) {
        serviceList.innerHTML = '';
        const selectedRegion = regionSelect.value;
        const selectedType = serviceTypeSelect.value;

        const filteredServices = services.filter(service => 
            (selectedRegion === 'all' || service.region === selectedRegion) &&
            (selectedType === 'all' || service.type === selectedType)
        );

        if (!filteredServices.length) {
            serviceList.innerHTML = '<p>No services match your criteria. Try different filters.</p>';
            return;
        }

        filteredServices.forEach(service => {
            const serviceCard = document.createElement('div');
            serviceCard.className = 'card';
            serviceCard.innerHTML = `
                <h3 class="card-title">${getIconForService(service.type)} ${service.name}</h3>
                <div class="card-meta">
                    <span><strong>Location:</strong> ${service.location}</span>
                    <span><strong>Region:</strong> ${service.region}</span>
                </div>
            `;
            serviceList.appendChild(serviceCard);
        });
    }

    function populateRegionFilter(services) {
        const regions = [...new Set(services.map(s => s.region))];
        // Keep the "All Regions" option, but clear the rest
        regionSelect.innerHTML = '<option value="all">All Regions</option>';
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        });
    }

    // --- FORMS & ACTIONS ---

    aidForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const request = {
            need: document.getElementById('aid-need-type').value,
            location: document.getElementById('aid-location').value,
            details: document.getElementById('aid-details').value,
            timestamp: new Date().toISOString()
        };
        
        // In a real app, this would be sent to a server. Here, we save to localStorage.
        const requests = JSON.parse(localStorage.getItem('aidRequests') || '[]');
        requests.push(request);
        localStorage.setItem('aidRequests', JSON.stringify(requests));
        
        showToast('✅ Your request has been sent securely.', 'success');
        aidForm.reset();
    });

    donationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('donation-amount').value);
        if (isNaN(amount) || amount <= 0) return;

        let currentTotal = parseFloat(localStorage.getItem('donationTotal') || 0);
        currentTotal += amount;
        localStorage.setItem('donationTotal', currentTotal);
        
        updateDonationTotal();
        showToast(`🙏 Thank you for your generous $${amount.toFixed(2)} donation!`, 'success');
    });

    function updateDonationTotal() {
        const total = parseFloat(localStorage.getItem('donationTotal') || 0);
        donationTotalSpan.textContent = `$${total.toFixed(2)}`;
    }
    
    // --- UTILITY FUNCTIONS ---
    
    function showLoader(isLoading) {
        loader.style.display = isLoading ? 'block' : 'none';
        mainContent.style.display = isLoading ? 'none' : 'block';
    }

    function getIconForService(type) {
        const icons = { food: '📦', health: '🏥', shelter: '⛺', water: '💧' };
        return icons[type] || 'ℹ️';
    }

    function showToast(message) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastContainer.appendChild(toast);
        
        // Trigger the animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove the toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }
    
    // Add filter listeners
    regionSelect.addEventListener('change', () => renderServices(appData.services || []));
    serviceTypeSelect.addEventListener('change', () => renderServices(appData.services || []));

    // --- INITIALIZE THE APP ---
    initializeApp();
});