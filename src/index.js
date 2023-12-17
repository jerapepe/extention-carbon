const form = document.querySelector('.form-data');
const region = document.querySelector('.region-name');
const apiKey = document.querySelector('.api-key');
const errors = document.querySelector('.errors');
const loading = document.querySelector('.loading');
const results = document.querySelector('.result-container');
const usage = document.querySelector('.carbon-usage');
const fossilfuel = document.querySelector('.fossil-fuel');
const myregion = document.querySelector('.my-region');
const clearBtn = document.querySelector('.clear-btn');

form.addEventListener('submit', (e) => handleSubmit(e));
clearBtn.addEventListener('click', (e) => reset(e));

import axios from '../node_modules/axios';
async function displayCarbonUsage(apiKey, region) {
    try {
        await axios.get('https://api.co2signal.com/v1/latest',
            { params: { countryCode: region, }, headers: { 'auth-token': apiKey, }, }).then((response) => {
                let CO2 = Math.floor(response.data.data.carbonIntensity);//
                calculateColor(CO2);
                loading.style.display = 'none';
                form.style.display = 'none';
                myregion.textContent = region;
                usage.textContent = Math.round(response.data.data.carbonIntensity) + '   grams (grams C02 emitted per kilowatt hour)';
                fossilfuel.textContent = response.data.data.fossilFuelPercentage.toFixed(2) +
                    '%  (percentage  of  fossil  fuels  used  to generate electricity)';
                results.style.display = 'block';
            });
    } catch (error) {
        console.log(error);
        loading.style.display = 'none';
        results.style.display = 'none';
        errors.textContent = 'Sorry,  we  have  no  data  for  the region you have requested.';
    }
}

function init() {
    const storedApiKey = localStorage.getItem('apiKey');
    const storedRegion = localStorage.getItem('regionName');
    if (storedApiKey === null || storedRegion === null) {
        form.style.display = 'block';
        results.style.display = 'none';
        loading.style.display = 'none';
        clearBtn.style.display = 'none';
        errors.textContent = '';
    } else {
        displayCarbonUsage(storedApiKey, storedRegion);
        results.style.display = 'none';
        form.style.display = 'none';
        clearBtn.style.display = 'block';
    }
    chrome.runtime.sendMessage({action: 'updateIcon',value: {color: 'green',},
});
};

function calculateColor(value) { 
    let co2Scale = [0, 150, 600, 750, 800]; 
    let colors = ['#2AA364', '#F5EB4D', '#9E4229', '#381D02', '#381D02']; 
    let closestNum = co2Scale.sort((a, b) => { 
        return Math.abs(a - value) - Math.abs(b - value); })[0]; 
        console.log(value + ' is closest to ' + closestNum); 
        let num = (element) => element > closestNum; 
        let scaleIndex = co2Scale.findIndex(num); 
        let closestColor = colors[scaleIndex]; 
        console.log(scaleIndex, closestColor); 
        chrome.runtime.sendMessage({ action: 'updateIcon', value: { color: closestColor } 
    }); 
}

function reset(e) {
    e.preventDefault();
    localStorage.removeItem('regionName');
    init();
}
function handleSubmit(e) {
    e.preventDefault();
    setUpUser(apiKey.value, region.value);
}

function setUpUser(apiKey, regionName) {
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('regionName', regionName);
    loading.style.display = 'block';
    errors.textContent = '';
    clearBtn.style.display = 'block';
    console.log(apiKey, regionName);
    displayCarbonUsage(apiKey, regionName);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getIconData') {
        const iconData = drawIcon();
        sendResponse({ iconData: iconData });
    }
});

function drawIcon(value) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.beginPath();
    context.fillStyle = value.color;
    context.arc(100, 100, 50, 0, 2 * Math.PI);
    context.fill();
    return context.getImageData(0, 0, canvas.width, canvas.height);
}
init();