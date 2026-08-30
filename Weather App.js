//Bringing DOM Elements
const unitButton=document.querySelector('.unit-button button');
const searchResultDropdown=document.querySelector('.search-result-dropdown');
const weekdayDropdown=document.querySelector('.weekday-dropdown div');
const searchButton=document.getElementById('search-button');
const feelsLike=document.getElementById('feels-like');
const humidity=document.getElementById('humidity');
const wind=document.getElementById('wind');
const precipitation=document.getElementById('precipitation');
const countryName=document.getElementById('country-name');
const currentDate=document.getElementById('date');
const dailyForcastTemps=document.querySelectorAll('.minmax-temp');
const weekWeatherIcon=document.querySelectorAll('.week-weather-icon');
const hourlyWeatherIcon=document.querySelectorAll('.hourly-weather-icon');
const hour=document.querySelectorAll('.hour');
const hourlyTemp=document.querySelectorAll('.hourly-temp');
const weekButton=document.getElementById('week-button');
const searchInput=document.getElementById('search-input');
const tempAtTheMomentImg=document.querySelector('.temp-at-the-moment img');
const tempAtTheMomentH=document.querySelector('.temp-at-the-moment h1');
const unitDropdownMenu=document.querySelector('.unit-dropdown-menu');
const unitOptions=document.querySelectorAll('.unit-dropdown-menu li');
const searchOptions=document.querySelector('.search-result-dropdown ul');
const weekdayList=document.querySelectorAll('.weekday-list li');
const inputSpinner=document.querySelector('.input-spinner');
const unitHolder=document.getElementById('unit-holder');
const weatherDataDiv=document.querySelector('.weather-data')

//Variables
const weatherIcon=[
    {
        code: [0],
        icon: ['./Weather Icons/clear-day.svg', './Weather Icons/clear-night.svg']
    },{
        code: [1],
        icon: ['./Weather Icons/mostly-clear-day.svg', './Weather Icons/mostly-clear-night.svg']
    },{
        code: [2],
        icon: ['./Weather Icons/partly-cloudy-day.svg', './Weather Icons/partly-cloudy-night.svg']
    },{
        code: [3],
        icon: ['./Weather Icons/overcast.svg']
    },{
        code: [45, 48],
        icon: ['./Weather Icons/overcast-day-fog.svg', './Weather Icons/overcast-night-fog.svg']
    },{
        code: [51, 53, 55],
        icon: ['./Weather Icons/extreme-drizzle.svg']
    },{
        code: [56, 57],
        icon: ['./Weather Icons/extreme-sleet.svg']
    },{
        code: [61, 63, 65],
        icon: ['./Weather Icons/extreme-rain.svg']
    },{
        code: [66, 67],
        icon: ['./Weather Icons/extreme-sleet.svg']
    },{
        code: [71, 73, 75, 77],
        icon: ['./Weather Icons/extreme-snow.svg']
    },{
        code: [80, 81, 82],
        icon: ['./Weather Icons/extreme-rain.svg']
    },{
        code: [85, 86],
        icon: ['./Weather Icons/extreme-snow.svg']
    },{
        code: [95],
        icon: ['./Weather Icons/thunderstorms.svg']
    },{
        code: [96, 99],
        icon: ['./Weather Icons/extreme-thunderstorms.svg']
    }
];
const locationDetails=[];
const fahrenheitOrCelsius=unitButton.dataset.unit
let eightHourValues={}
let weatherData;
let locationLatLong;
let html='';
let buttonLat;
let buttonLong;
let buttonInnerTextTimer;
let todayFormatter;
let selectedDay;
let unitOptionLat;
let unitOptionLong;
let errorHandlerTimer;

//Adding Event Listener
unitButton.addEventListener('click',()=>{
    dropdownMenuDisplay(unitButton);
});
weekButton.addEventListener('click', ()=>{
    dropdownMenuDisplay(weekButton);
})
searchInput.addEventListener('input',()=>{
    inputSpinner.style.setProperty('--display-i', 'block');
    dropdownMenuDisplay(searchInput);
    renderFoundLocation();   
})
searchButton.addEventListener('click', async ()=>{
    if(buttonLat && buttonLong){
        searchButton.innerHTML='<i id="button-spinner" class="fa-solid fa-circle-notch"></i>'
        weatherData= await getWeatherDetails(buttonLat, buttonLong, unitButton.dataset.unit)
        buttonLat=''
        buttonLong=''
        searchButton.innerHTML='Search'
        searchInput.value=''
        if(weatherData){
            renderBanner()
            renderSummary()
            renderDailyForcast()
            renderEightHour(renderCurrentDate('banner').split(',')[0])
            weatherDataDiv.style.display='grid'
            unitHolder.textContent=`Units are in ${unitButton.dataset.unit}`
        } 
    }else{
        clearTimeout(buttonInnerTextTimer)
        searchButton.innerHTML='<p id="invalid">Please select valid location</p>'
        buttonInnerTextTimer=setTimeout(()=>{
            searchButton.innerHTML='Search'
        },3000)
    }
})

document.addEventListener('click',(e)=>{
    if(!searchInput.contains(e.target) && !searchResultDropdown.contains(e.target)){
        searchResultDropdown.classList.remove('visibility');
    }
    if(!weekdayDropdown.contains(e.target) && !weekButton.contains(e.target)){
       weekdayDropdown.classList.remove('visibility')
       const arrow=weekButton.querySelector('.fa-chevron-down')
       arrow.classList.remove('rotate')

    }
    if(!unitDropdownMenu.contains(e.target) && !unitButton.contains(e.target)){
        unitDropdownMenu.classList.remove('visibility')
        const arrow=unitButton.querySelector('.fa-chevron-down')
        arrow.classList.remove('rotate')
    }
});

//Loops
unitOptions.forEach((unitOption)=>{
    unitOption.addEventListener('click',()=>{
        changeButtonText(unitOption, unitButton)
    })
    
});

weekdayList.forEach((weekdayLists)=>{
    weekdayLists.addEventListener('click', ()=>{
        changeButtonText(weekdayLists, weekButton)   
    })         
})

//Functions
async function getLatLong(name) {
    console.count('location details fetched')
    try{
        const response=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5&language=en&format=json`);
        if(!response.ok){
            throw new Error(`HTTPS ${response.status}`)
        }
        const data= await response.json();
        return data
    }catch(error){
        searchButton.innerHTML=`<p id="invalid">${error}</p>`
        handleError()
        return null
    }
}

async function getWeatherDetails (lat, long, unit){
    console.count('weather details fetched')
    try{
        const response= await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day&timezone=auto&temperature_unit=${unit.toLowerCase()}`);
        if(!response.ok){
            throw new Error(`HTTPS ${response.status}`)
        }
        const data=await response.json();
    return data
    }catch(error){
        searchButton.innerHTML=`<p id="invalid">${error}</p>`
        handleError()
        return null
    }
    
}

function dropdownMenuDisplay(buttonName){
    if(buttonName===searchInput){
        const dropDown=buttonName.nextElementSibling
        if(searchInput.value){
            dropDown.classList.add('visibility')
        }else{
            dropDown.classList.remove('visibility')
        }
    }else{
        const arrow=buttonName.querySelector('.fa-chevron-down');
        const dropDown=buttonName.nextElementSibling
        arrow.classList.toggle('rotate')
        dropDown.classList.toggle('visibility')
    }
}

async function changeButtonText(options,button){
    const nodeText=[...button.childNodes].find((node)=>node.nodeType===Node.TEXT_NODE)
    if(button===weekButton){
        nodeText.textContent=options.dataset.day  
        renderEightHour(options.dataset.day)
    }else if(button===unitButton){
        nodeText.textContent=options.dataset.unit
        const unit=options.dataset.unit
        unitButton.dataset.unit=unit
        if(unitOptionLat && unitOptionLong){ 
            inputSpinner.style.setProperty('--display-i', 'block');
            weatherData=await getWeatherDetails(unitOptionLat, unitOptionLong, unit)
            unitHolder.textContent=`Units are in ${unitButton.dataset.unit}`
            inputSpinner.style.setProperty('--display-i', 'none');
            if(weatherData){
                renderBanner()
                renderSummary()
                renderDailyForcast()
                renderEightHour(renderCurrentDate('banner').split(',')[0])
            }
            nodeText.textContent=unit
        }
    }
    dropdownMenuDisplay(button)
}

async function renderFoundLocation(){
    locationLatLong=await getLatLong(searchInput.value);
    inputSpinner.style.setProperty('--display-i', 'none');
    html=''
    if(!locationLatLong){return}
    if(locationLatLong.results){ 
        locationLatLong.results.forEach((result)=>{
            html+=`
                <li class="location" data-lat="${result.latitude}" data-long="${result.longitude}">
                    <div class="country-name-short">
                        <h3>${result.country}</h3>
                        ${result.admin1? `<h4>${result.admin1}</h4>`:""}
                    </div>
                    <p>${result.name}</p>
                </li>
            `
        })
        searchOptions.classList.remove('nomatch')
        searchOptions.innerHTML=''
        searchOptions.insertAdjacentHTML('beforeend', html)
        const matchLocations=document.querySelectorAll('.location')
        matchLocations.forEach((matchLocation)=>{
            matchLocation.addEventListener('click', ()=>{
                const city=matchLocation.querySelector('p').textContent
                const country=matchLocation.querySelector('h3').textContent
            
                locationDetails.city=city;
                locationDetails.country=country;
                searchInput.value=city
                searchResultDropdown.classList.remove('visibility')
                buttonLat=matchLocation.dataset.lat
                buttonLong=matchLocation.dataset.long
                unitOptionLat=matchLocation.dataset.lat
                unitOptionLong=matchLocation.dataset.long
            })  
        })
    }else{
        searchOptions.classList.add('nomatch')
        searchOptions.innerHTML='No match'
    }
}
function renderBanner(){
    countryName.textContent=`${locationDetails.country}, ${locationDetails.city}`
    currentDate.textContent=renderCurrentDate('banner')
    tempAtTheMomentH.textContent=`${weatherData.current.temperature_2m.toFixed(0)} ${weatherData.current_units.temperature_2m}`
    tempAtTheMomentImg.src=renderIcon('banner')
    weekButton.firstChild.textContent=renderCurrentDate('banner').split(',')[0]
}
function renderSummary(){
    feelsLike.innerHTML=`${weatherData.current.apparent_temperature.toFixed(0)} ${weatherData.current_units.apparent_temperature}`
    humidity.innerHTML=`${weatherData.current.relative_humidity_2m} ${weatherData.current_units.relative_humidity_2m}`
    wind.innerHTML=`${weatherData.current.wind_speed_10m} ${weatherData.current_units.wind_speed_10m}`
    precipitation.innerHTML=`${weatherData.current.precipitation} ${weatherData.current_units.precipitation}`
}
function renderDailyForcast(){
    dailyForcastTemps.forEach((div, index)=>{
        const minTemp=div.querySelector('p:nth-child(1)');
        const maxTemp=div.querySelector('p:nth-child(2)');
        minTemp.textContent=weatherData.daily.temperature_2m_min[index].toFixed(0) +'°'
        maxTemp.textContent=weatherData.daily.temperature_2m_max[index].toFixed(0) + '°'
    })
    weekWeatherIcon.forEach((weekIcon, i)=>{
        weekIcon.src=renderIcon('daily', i)
    })
}
function renderHourlyForcast(){
    hourlyWeatherIcon.forEach((hourlyWeatherIcons, index)=>{
        hourlyWeatherIcons.src=renderIcon('hourly', index)
        hourlyTemp[index].textContent=`${eightHourValues.temp[index].toFixed(0)} ${weatherData.hourly_units.temperature_2m}`
        const day=new Date(eightHourValues.hour[index]) 
        const dayFormatter=Intl.DateTimeFormat('en-US', {
            hour12: true,
            hour:'numeric',
            weekday: 'long'
        }).format(day)
        const weekDay=dayFormatter.split(' ')
        hour[index].innerHTML=`${weekDay[1].trim()} ${weekDay[2]}`
    })
}
function renderIcon(section, index){   
    const matchIcon=weatherIcon.find((icon)=>
        icon.code.some((matchCode)=>{
            if(section==='banner'){
                return matchCode===weatherData.current.weather_code
            }else if(section==='daily'){
                return matchCode===weatherData.daily.weather_code[index]
            }else{
                if(eightHourValues.weatherCode){
                    return matchCode===eightHourValues.weatherCode[index]
                }
            }
        })
    )
    if(matchIcon.icon.length===1){
        return matchIcon.icon[0]
    }else{
        return weatherData.current.is_day===0?matchIcon.icon[1]:matchIcon.icon[0]
    }
    
}
function renderEightHour(data){
    const today=renderCurrentDate('banner');
    if(data===today.split(',')[0]){
        selectedDay=weatherData.hourly.time.findIndex((time)=>{ 
            return time===weatherData.current.time
        })
    }else{
        selectedDay=weatherData.hourly.time.findIndex((time)=>{
            const date=new Date(time)
            const formated=date.toLocaleString('en-US',{
                weekday:'long',
            })
            return data===formated;
        })
    }
    eightHourValues.hour=weatherData.hourly.time.slice(selectedDay+1,selectedDay+9)
    eightHourValues.temp=weatherData.hourly.temperature_2m.slice(selectedDay+1,selectedDay+9)
    eightHourValues.weatherCode=weatherData.hourly.weather_code.slice(selectedDay+1,selectedDay+9)
    renderHourlyForcast()
}
function renderCurrentDate(recieved){
    const today=new Date(weatherData.current.time)
    if(recieved==='banner'){
        todayFormatter=today.toLocaleString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }else{
        todayFormatter=today.toLocaleString('en-US', {
            hour: 'numeric',
            hour12: true
        })
    }
    return todayFormatter
}
function handleError(){
    clearTimeout(errorHandlerTimer)
    errorHandlerTimer=setTimeout(()=>{
        searchButton.textContent='Search'
    }, 3000)
}