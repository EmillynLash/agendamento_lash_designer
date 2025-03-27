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

    // Cabeçalhos dos dias da semana
    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    daysOfWeek.forEach(day => {
        const headerEl = document.createElement("div");
        headerEl.className = "calendar-day-header";
        headerEl.innerText = day;
        calendarEl.appendChild(headerEl);
    });

    const todayISO = today.toISOString().split("T")[0]; 

    for (let i = 1; i <= monthDays; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const dayKey = date.toISOString().split("T")[0];

        const dayEl = document.createElement("div");
        dayEl.className = "calendar-day";
        dayEl.innerText = i;

        // Desabilitar dias anteriores à data atual
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
    clientInfoEl.style.display = "none";  // Esconde o formulário de cliente até a seleção do horário
    const reservations = getStoredReservations();
    const bookedTimes = reservations[day] || [];

    const today = new Date();
    const selectedDate = new Date(day);
    const currentTime = today.getHours();

    hours.forEach(hour => {
        const timeEl = document.createElement("div");
        timeEl.className = "time";
        timeEl.innerText = hour;

        // Verifica se o horário já passou no dia
        const [hourNum, minute] = hour.split(":").map(Number);
        if (selectedDate.toISOString().split("T")[0] === today.toISOString().split("T")[0] && hourNum < currentTime) {
            timeEl.classList.add("disabled");
        }

        if (bookedTimes.includes(hour)) {
            timeEl.classList.add("disabled");
        } else {
            timeEl.onclick = () => selectTime(day, hour);  // Marcar o horário selecionado
        }

        timesEl.appendChild(timeEl);
    });

    updateAvailabilityBar(day, hours.length);
}

function selectTime(day, hour) {
    selectedTime = hour;
    // Exibe o formulário de cliente para preencher dados antes de confirmar o agendamento
    clientInfoEl.style.display = "block";
}

function sendWhatsApp() {
    const name = document.getElementById("clientName").value;
    const phone = document.getElementById("clientPhone").value;
    if (!name || !phone) {
        alert("Por favor, preencha seu nome e número de WhatsApp.");
        return;
    }

    // Agora, só reserva o horário após o cliente confirmar
    let reservations = getStoredReservations();
    if (!reservations[selectedDay]) {
        reservations[selectedDay] = [];
    }

    if (!reservations[selectedDay].includes(selectedTime)) {
        reservations[selectedDay].push(selectedTime);
        localStorage.setItem("reservations", JSON.stringify(reservations));
    }

    const message = `Olá, meu nome é ${name}. Agendei um horário no dia ${selectedDay} às ${selectedTime}.`;
    const whatsappURL = `https://wa.me/5511997572290?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
}

createCalendar();