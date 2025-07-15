import { parse } from 'rss-parser';

document.addEventListener('DOMContentLoaded', () => {
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
    const newsList = document.getElementById('news-list');

    let appData = {};

    async function initializeApp() {
        showLoader(true);

        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`Network error: ${response.status} - Could not load data.`);
            }

            appData = await response.json();
            renderAll();
            localStorage.setItem('aidConnectData', JSON.stringify(appData));
            console.log("Data refreshed from server.");

        } catch (error) {
            console.error('Fetch error:', error);
            showErrorToast("Failed to load data. Using cached data if available.");
            if (!localStorage.getItem('aidConnectData')) {
                alertList.innerHTML = `<p>Could not load data. Please check your internet connection.</p>`;
            } else {
                appData = JSON.parse(localStorage.getItem('aidConnectData'));
                renderAll();
            }
        } finally {
            showLoader(false);
        }
    }

    function renderAll() {
        renderAlerts(appData.alerts || []);
        renderServices(appData.services || []);
        populateRegionFilter(appData.services || []);
        renderNews(await fetchNews());
        updateDonationTotal();
    }

    function renderAlerts(alerts) {
        // ... (Existing renderAlerts code) ...
    }

    function renderServices(services) {
        // ... (Existing renderServices code) ...
    }

    function populateRegionFilter(services) {
        // ... (Existing populateRegionFilter code) ...
    }

    async function fetchNews() {
        try {
            const response = await fetch('https://radiotamazuj.org/en/rss');
            const xml = await response.text();
            const feed = await parse(xml);

            const newsItems = feed.items.slice(0, 5);
            return newsItems;

        } catch (error) {
            console.error('Error fetching news:', error);
            return [];
        }
    }

    function renderNews(newsItems) {
        newsList.innerHTML = '';

        newsItems.forEach(item => {
            const newsItemDiv = document.createElement('div');
            newsItemDiv.className = 'card';
            newsItemDiv.innerHTML = `
                <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
                <p>${item.contentSnippet}</p>
            `;
            newsList.appendChild(newsItemDiv);
        });
    }

    aidForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const need = document.getElementById('aid-need-type').value;
        const location = document.getElementById('aid-location').value;
        const details = document.getElementById('aid-details').value;

        if (!location || !details) {
            showErrorToast("Please provide both a location and details for your request.");
            return;
        }
        // ... (Rest of the aid request submission code) ...
    });

    donationForm.addEventListener('submit', (e) => {
        // ... (Existing donation form code) ...
    });

    function updateDonationTotal() {
        // ... (Existing updateDonationTotal code) ...
    }

    function showLoader(isLoading) {
        // ... (Existing showLoader code) ...
    }

    function showErrorToast(message) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span style="color: red;">⚠️ ${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // ... (Existing navigation code) ...
        });
    });

    regionSelect.addEventListener('change', () => renderServices(appData.services || []));
    serviceTypeSelect.addEventListener('change', () => renderServices(appData.services || []));

    initializeApp();
});