const calendarEl = document.getElementById("calendar");
const timesEl = document.getElementById("times");
const availabilityBar = document.getElementById("availability-bar");
const clientInfoEl = document.getElementById("client-info");
let selectedDay = "";
let selectedTime = "";

const hours = ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

function getStoredReservations() {
    return JSON.parse(localStorage.getItem("reservations")) || {};
}

function updateAvailabilityBar(day, totalHours) {
    const booked = getStoredReservations()[day]?.length || 0;
    const available = totalHours - booked;
    const widthPercentage = (available / totalHours) * 100;
    availabilityBar.innerHTML = `<div class="bar" style="width: ${widthPercentage}%"></div>`;
}

function createCalendar() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const monthDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    calendarEl.innerHTML = "";
    daysOfWeek.forEach(day => {
        const headerEl = document.createElement("div");
        headerEl.className = "calendar-day-header";
        headerEl.innerText = day;
        calendarEl.appendChild(headerEl);
    });

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const todayISO = today.toISOString().split("T")[0];

    for (let i = 0; i < firstDay; i++) {
        const emptyEl = document.createElement("div");
        emptyEl.className = "calendar-day empty";
        calendarEl.appendChild(emptyEl);
    }

    for (let i = 1; i <= monthDays; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const dayKey = date.toISOString().split("T")[0];

        const dayEl = document.createElement("div");
        dayEl.className = "calendar-day";
        dayEl.innerText = i;

        if (dayKey < todayISO) {
            dayEl.classList.add("disabled");
        } else {
            dayEl.onclick = () => showTimes(dayKey);
        }

        calendarEl.appendChild(dayEl);
    }
}

function showTimes(day) {
    selectedDay = day;
    timesEl.innerHTML = "";
    clientInfoEl.style.display = "none";
    document.getElementById("anamnese").style.display = "none";
    const reservations = getStoredReservations();
    const bookedTimes = reservations[day] || [];

    const today = new Date();
    const selectedDate = new Date(day);
    const currentTime = today.getHours();

    hours.forEach(hour => {
        const timeEl = document.createElement("div");
        timeEl.className = "time";
        timeEl.innerText = hour;

        const [hourNum] = hour.split(":").map(Number);
        if (selectedDate.toISOString().split("T")[0] === today.toISOString().split("T")[0] && hourNum < currentTime) {
            timeEl.classList.add("disabled");
        }

        if (bookedTimes.includes(hour)) {
            timeEl.classList.add("disabled");
        } else {
            timeEl.onclick = () => selectTime(day, hour);
        }

        timesEl.appendChild(timeEl);
    });

    updateAvailabilityBar(day, hours.length);
}

function selectTime(day, hour) {
    selectedTime = hour;
    clientInfoEl.style.display = "block";
    document.getElementById("anamnese").style.display = "block";
}

document.getElementById("anamneseForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const assinatura = document.getElementById("assinatura").value.trim();
    const aceite = document.getElementById("aceiteTermos").checked;

    if (!assinatura || !aceite) {
        alert("Por favor, preencha seu nome completo e aceite os termos da LGPD.");
        return;
    }

    alert("Ficha de anamnese preenchida com sucesso! Agora finalize o envio no botão do WhatsApp.");
});

function sendWhatsApp() {
    const name = document.getElementById("clientName").value;
    const phone = document.getElementById("clientPhone").value;
    const assinatura = document.getElementById("assinatura").value.trim();
    const aceite = document.getElementById("aceiteTermos").checked;

    if (!name || !phone || !assinatura || !aceite) {
        alert("Por favor, preencha todos os dados e aceite os termos.");
        return;
    }

    let reservations = getStoredReservations();
    if (!reservations[selectedDay]) {
        reservations[selectedDay] = [];
    }

    if (!reservations[selectedDay].includes(selectedTime)) {
        reservations[selectedDay].push(selectedTime);
        localStorage.setItem("reservations", JSON.stringify(reservations));
    }

    const message = `Olá, meu nome é ${name}. Agendei um horário no dia ${selectedDay} às ${selectedTime}.\n\nAssinei a ficha de anamnese como: ${assinatura}.`;
    const whatsappURL = `https://wa.me/5511997572290?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
}

createCalendar();
