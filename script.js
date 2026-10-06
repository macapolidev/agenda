/* =========================================================
   MACA POLICHINO STUDIO — AGENDA
   ========================================================= */

const STORAGE_KEY = "macaStudioAgenda";

/* =========================================================
   DATOS INICIALES
   ========================================================= */

const defaultData = {
    professionals: [
        {
            id: "prof-maca",
            name: "Maca",
            specialty: "Manicuría",
            color: "#ef668b"
        },
        {
            id: "prof-marce",
            name: "Marce",
            specialty: "Estética",
            color: "#9b7ede"
        }
    ],

    services: [
        {
            id: "service-esmaltado",
            name: "Esmaltado semipermanente",
            category: "Manos",
            price: 12000,
            duration: 60,
            professionalId: "prof-maca"
        },
        {
            id: "service-capping",
            name: "Capping",
            category: "Manos",
            price: 15000,
            duration: 90,
            professionalId: "prof-maca"
        },
        {
            id: "service-limpieza",
            name: "Limpieza facial profunda",
            category: "Faciales",
            price: 18000,
            duration: 60,
            professionalId: "prof-marce"
        },
        {
            id: "service-dermaplaning",
            name: "Dermaplaning",
            category: "Faciales",
            price: 22000,
            duration: 60,
            professionalId: "prof-marce"
        },
        {
            id: "service-cejas",
            name: "Perfilado de cejas",
            category: "Cejas",
            price: 8000,
            duration: 30,
            professionalId: "prof-marce"
        },
        {
            id: "service-lifting",
            name: "Lifting de pestañas",
            category: "Pestañas",
            price: 16000,
            duration: 60,
            professionalId: "prof-marce"
        },
        {
            id: "service-radiofrecuencia",
            name: "Radiofrecuencia",
            category: "Corporales",
            price: 15000,
            duration: 60,
            professionalId: "prof-marce"
        }
    ],

    appointments: []
};

/* =========================================================
   ESTADO
   ========================================================= */

let data = loadData();

let currentCalendarDate = new Date();
let selectedDate = null;

/*
 * "all" = todos los profesionales
 * o el ID de un profesional específico.
 */
let selectedProfessionalFilter = "all";

/*
 * null = creando turno
 * ID = editando turno existente
 */
let editingAppointmentId = null;

/* =========================================================
   DOM
   ========================================================= */

const calendarDays = document.getElementById("calendarDays");

const currentMonth = document.getElementById("currentMonth");
const currentYear = document.getElementById("currentYear");

const appointmentsList = document.getElementById("appointmentsList");

const totalAppointments = document.getElementById("totalAppointments");
const confirmedAppointments = document.getElementById("confirmedAppointments");
const availableAppointments = document.getElementById("availableAppointments");

const selectedDateTitle = document.getElementById("selectedDateTitle");
const selectedDateSubtitle = document.getElementById("selectedDateSubtitle");

const professionalTabs = document.getElementById("professionalTabs");
const statusFilter = document.getElementById("statusFilter");

const appointmentModal = document.getElementById("appointmentModal");
const appointmentForm = document.getElementById("appointmentForm");

const appointmentClient = document.getElementById("appointmentClient");
const appointmentWhatsapp = document.getElementById("appointmentWhatsapp");
const appointmentProfessional = document.getElementById("appointmentProfessional");
const appointmentService = document.getElementById("appointmentService");
const appointmentDate = document.getElementById("appointmentDate");
const appointmentTime = document.getElementById("appointmentTime");
const appointmentDuration = document.getElementById("appointmentDuration");
const appointmentStatus = document.getElementById("appointmentStatus");
const appointmentNotes = document.getElementById("appointmentNotes");

const serviceModal = document.getElementById("serviceModal");
const serviceForm = document.getElementById("serviceForm");

const serviceName = document.getElementById("serviceName");
const serviceCategory = document.getElementById("serviceCategory");
const servicePrice = document.getElementById("servicePrice");
const serviceDuration = document.getElementById("serviceDuration");
const serviceProfessional = document.getElementById("serviceProfessional");

const professionalModal = document.getElementById("professionalModal");
const professionalForm = document.getElementById("professionalForm");

const professionalName = document.getElementById("professionalName");
const professionalSpecialty = document.getElementById("professionalSpecialty");
const professionalColor = document.getElementById("professionalColor");

const toast = document.getElementById("toast");

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

function initialize() {
    populateProfessionalFilters();
    populateAppointmentForm();
    populateServiceProfessionalSelect();

    determineInitialDate();

    renderCalendar();
    renderAppointments();

    setupEvents();
}

/* =========================================================
   STORAGE
   ========================================================= */

function loadData() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored) {
            const initialData = createInitialData();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
            return initialData;
        }

        const parsed = JSON.parse(stored);
        const migrated = migrateData(parsed);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));

        return migrated;
    } catch (error) {
        console.error("Error cargando datos:", error);

        const fallback = createInitialData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));

        return fallback;
    }
}

function createInitialData() {
    const initialData = JSON.parse(JSON.stringify(defaultData));

    createDemoAppointments(initialData);

    return initialData;
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function migrateData(dataObject) {
    if (!dataObject || typeof dataObject !== "object") {
        return JSON.parse(JSON.stringify(defaultData));
    }

    if (!Array.isArray(dataObject.professionals)) {
        dataObject.professionals = [];
    }

    if (!Array.isArray(dataObject.services)) {
        dataObject.services = [];
    }

    if (!Array.isArray(dataObject.appointments)) {
        dataObject.appointments = [];
    }

    /*
     * Compatibilidad con servicios creados antes
     * de implementar la relación profesional-servicio.
     */
    dataObject.services.forEach(service => {
        if (!Object.prototype.hasOwnProperty.call(service, "professionalId")) {
            service.professionalId = null;
        }
    });

    assignDefaultServiceProfessionals(dataObject);

    return dataObject;
}

function assignDefaultServiceProfessionals(dataObject) {
    const maca = dataObject.professionals.find(
        professional =>
            professional.name.toLowerCase() === "maca"
    );

    const marce = dataObject.professionals.find(
        professional =>
            professional.name.toLowerCase() === "marce"
    );

    dataObject.services.forEach(service => {
        if (service.professionalId) {
            return;
        }

        const name = service.name.toLowerCase();

        if (
            maca &&
            (
                name.includes("esmaltado") ||
                name.includes("capping")
            )
        ) {
            service.professionalId = maca.id;
        } else if (marce) {
            service.professionalId = marce.id;
        }
    });
}

/* =========================================================
   DEMO
   ========================================================= */

function createDemoAppointments(targetData) {
    const today = new Date();

    function formatDate(date) {
        return formatDateISO(date);
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const afterTomorrow = new Date(today);
    afterTomorrow.setDate(today.getDate() + 2);

    targetData.appointments = [
        {
            id: generateId("appointment"),
            clientName: "Sofía Martínez",
            whatsapp: "2615551234",
            professionalId: "prof-maca",
            serviceId: "service-esmaltado",
            date: formatDate(today),
            time: "10:00",
            duration: 60,
            status: "confirmed",
            notes: ""
        },
        {
            id: generateId("appointment"),
            clientName: "Lucía Fernández",
            whatsapp: "2615554567",
            professionalId: "prof-marce",
            serviceId: "service-limpieza",
            date: formatDate(today),
            time: "11:30",
            duration: 60,
            status: "confirmed",
            notes: ""
        },
        {
            id: generateId("appointment"),
            clientName: "Camila Rodríguez",
            whatsapp: "2615557890",
            professionalId: "prof-maca",
            serviceId: "service-capping",
            date: formatDate(tomorrow),
            time: "15:00",
            duration: 90,
            status: "pending",
            notes: ""
        },
        {
            id: generateId("appointment"),
            clientName: "Valentina Gómez",
            whatsapp: "2615559876",
            professionalId: "prof-marce",
            serviceId: "service-lifting",
            date: formatDate(afterTomorrow),
            time: "17:00",
            duration: 60,
            status: "confirmed",
            notes: ""
        }
    ];
}

/* =========================================================
   EVENTOS
   ========================================================= */

function setupEvents() {

    /* Navegación calendario */

    const previousMonthButton =
        document.getElementById("previousMonth");

    const nextMonthButton =
        document.getElementById("nextMonth");

    const todayButton =
        document.getElementById("todayButton");

    if (previousMonthButton) {
        previousMonthButton.addEventListener("click", () => {
            currentCalendarDate.setMonth(
                currentCalendarDate.getMonth() - 1
            );

            renderCalendar();
        });
    }

    if (nextMonthButton) {
        nextMonthButton.addEventListener("click", () => {
            currentCalendarDate.setMonth(
                currentCalendarDate.getMonth() + 1
            );

            renderCalendar();
        });
    }

    if (todayButton) {
        todayButton.addEventListener("click", () => {
            const today = new Date();

            currentCalendarDate = new Date(
                today.getFullYear(),
                today.getMonth(),
                1
            );

            selectedDate = formatDateISO(today);

            renderCalendar();
            renderAppointments();
        });
    }

    /* Filtro de estado */

    if (statusFilter) {
        statusFilter.addEventListener("change", () => {
            renderAppointments();
            renderCalendar();
        });
    }

    /* Formulario turno */

    if (appointmentForm) {
        appointmentForm.addEventListener(
            "submit",
            handleAppointmentSubmit
        );
    }

    /* Profesional del turno */

    if (appointmentProfessional) {
        appointmentProfessional.addEventListener(
            "change",
            () => {
                populateAppointmentServices(
                    appointmentProfessional.value
                );
            }
        );
    }

    /* Servicio del turno */

    if (appointmentService) {
        appointmentService.addEventListener(
            "change",
            () => {
                updateAppointmentDuration();
            }
        );
    }

    /* Formulario servicio */

    if (serviceForm) {
        serviceForm.addEventListener(
            "submit",
            createService
        );
    }

    if (serviceProfessional) {
        serviceProfessional.addEventListener(
            "change",
            () => {
                /* No hace falta ninguna acción adicional. */
            }
        );
    }

    /* Formulario profesional */

    if (professionalForm) {
        professionalForm.addEventListener(
            "submit",
            createProfessional
        );
    }
}

/* =========================================================
   TABS DE PROFESIONALES
   ========================================================= */

function populateProfessionalFilters() {

    if (!professionalTabs) {
        return;
    }

    const currentSelection = selectedProfessionalFilter;

    const professionalExists =
        currentSelection === "all" ||
        data.professionals.some(
            professional =>
                professional.id === currentSelection
        );

    if (!professionalExists) {
        selectedProfessionalFilter = "all";
    }

    professionalTabs.innerHTML = "";

    /* Tab TODOS */

    const allTab = document.createElement("button");

    allTab.type = "button";
    allTab.className = "professional-tab";

    if (selectedProfessionalFilter === "all") {
        allTab.classList.add("active");
    }

    allTab.setAttribute(
        "role",
        "tab"
    );

    allTab.setAttribute(
        "aria-selected",
        selectedProfessionalFilter === "all"
            ? "true"
            : "false"
    );

    allTab.textContent = "Todos";

    allTab.addEventListener("click", () => {
        selectedProfessionalFilter = "all";

        populateProfessionalFilters();
        renderCalendar();
        renderAppointments();
    });

    professionalTabs.appendChild(allTab);

    /* Tabs profesionales */

    data.professionals.forEach(professional => {

        const tab = document.createElement("button");

        tab.type = "button";
        tab.className = "professional-tab";

        if (
            selectedProfessionalFilter ===
            professional.id
        ) {
            tab.classList.add("active");
        }

        tab.setAttribute(
            "role",
            "tab"
        );

        tab.setAttribute(
            "aria-selected",
            selectedProfessionalFilter ===
            professional.id
                ? "true"
                : "false"
        );

        const dot =
            document.createElement("span");

        dot.className =
            "professional-tab-dot";

        dot.style.backgroundColor =
            professional.color || "#ef668b";

        const name =
            document.createElement("span");

        name.textContent =
            professional.name;

        tab.appendChild(dot);
        tab.appendChild(name);

        tab.addEventListener("click", () => {

            selectedProfessionalFilter =
                professional.id;

            populateProfessionalFilters();

            renderCalendar();
            renderAppointments();
        });

        professionalTabs.appendChild(tab);
    });
}

/* =========================================================
   PROFESIONALES
   ========================================================= */

function populateProfessionalSelect(
    selectedId = null
) {
    if (!appointmentProfessional) {
        return;
    }

    const previousValue =
        selectedId ||
        appointmentProfessional.value;

    appointmentProfessional.innerHTML = "";

    data.professionals.forEach(professional => {

        const option =
            document.createElement("option");

        option.value =
            professional.id;

        option.textContent =
            professional.name;

        appointmentProfessional.appendChild(
            option
        );
    });

    if (
        previousValue &&
        data.professionals.some(
            professional =>
                professional.id === previousValue
        )
    ) {
        appointmentProfessional.value =
            previousValue;
    } else if (data.professionals.length > 0) {
        appointmentProfessional.value =
            data.professionals[0].id;
    }
}

function populateAppointmentForm(
    selectedProfessionalId = null
) {
    populateProfessionalSelect(
        selectedProfessionalId
    );

    if (!appointmentProfessional) {
        return;
    }

    let professionalId =
        appointmentProfessional.value;

    if (
        selectedProfessionalId &&
        data.professionals.some(
            professional =>
                professional.id ===
                selectedProfessionalId
        )
    ) {
        professionalId =
            selectedProfessionalId;

        appointmentProfessional.value =
            selectedProfessionalId;
    } else if (
        selectedProfessionalFilter !== "all" &&
        data.professionals.some(
            professional =>
                professional.id ===
                selectedProfessionalFilter
        )
    ) {
        professionalId =
            selectedProfessionalFilter;

        appointmentProfessional.value =
            selectedProfessionalFilter;
    }

    populateAppointmentServices(
        professionalId
    );
}

function populateAppointmentServices(
    professionalId,
    selectedServiceId = null
) {
    if (!appointmentService) {
        return;
    }

    const previousValue =
        selectedServiceId ||
        appointmentService.value;

    appointmentService.innerHTML = "";

    const services =
        data.services.filter(
            service =>
                service.professionalId ===
                professionalId
        );

    if (services.length === 0) {

        const option =
            document.createElement("option");

        option.value = "";
        option.textContent =
            "Sin servicios asignados";

        appointmentService.appendChild(
            option
        );

        if (appointmentDuration) {
            appointmentDuration.value = "";
        }

        return;
    }

    services.forEach(service => {

        const option =
            document.createElement("option");

        option.value =
            service.id;

        option.textContent =
            `${service.name} — ${formatCurrency(service.price)}`;

        appointmentService.appendChild(
            option
        );
    });

    if (
        previousValue &&
        services.some(
            service =>
                service.id === previousValue
        )
    ) {
        appointmentService.value =
            previousValue;
    } else {
        appointmentService.value =
            services[0].id;
    }

    updateAppointmentDuration();
}

function updateAppointmentDuration() {

    if (
        !appointmentService ||
        !appointmentDuration
    ) {
        return;
    }

    const service =
        data.services.find(
            item =>
                item.id ===
                appointmentService.value
        );

    if (!service) {
        appointmentDuration.value = "";
        return;
    }

    appointmentDuration.value =
        service.duration;
}

/* =========================================================
   SELECT PROFESIONAL DEL SERVICIO
   ========================================================= */

function populateServiceProfessionalSelect(
    selectedId = null
) {
    if (!serviceProfessional) {
        return;
    }

    const previousValue =
        selectedId ||
        serviceProfessional.value;

    serviceProfessional.innerHTML = "";

    data.professionals.forEach(professional => {

        const option =
            document.createElement("option");

        option.value =
            professional.id;

        option.textContent =
            professional.name;

        serviceProfessional.appendChild(
            option
        );
    });

    if (
        previousValue &&
        data.professionals.some(
            professional =>
                professional.id === previousValue
        )
    ) {
        serviceProfessional.value =
            previousValue;
    }
}

/* =========================================================
   CALENDARIO
   ========================================================= */

function renderCalendar() {

    if (!calendarDays) {
        return;
    }

    calendarDays.innerHTML = "";

    const year =
        currentCalendarDate.getFullYear();

    const month =
        currentCalendarDate.getMonth();

    if (currentMonth) {
        currentMonth.textContent =
            capitalize(
                currentCalendarDate.toLocaleDateString(
                    "es-AR",
                    {
                        month: "long"
                    }
                )
            );
    }

    if (currentYear) {
        currentYear.textContent =
            year;
    }

    const firstDay =
        new Date(year, month, 1);

    const lastDay =
        new Date(year, month + 1, 0);

    /*
     * JavaScript:
     * domingo = 0
     * lunes = 1
     *
     * Queremos lunes como primer día.
     */
    let startingDay =
        firstDay.getDay() - 1;

    if (startingDay < 0) {
        startingDay = 6;
    }

    const daysInMonth =
        lastDay.getDate();

    const previousMonthLastDay =
        new Date(
            year,
            month,
            0
        ).getDate();

    const totalCells =
        startingDay + daysInMonth > 35
            ? 42
            : 35;

    for (
        let index = 0;
        index < totalCells;
        index++
    ) {

        let dayNumber;
        let cellDate;
        let isCurrentMonth = true;

        if (index < startingDay) {

            dayNumber =
                previousMonthLastDay -
                startingDay +
                index +
                1;

            cellDate =
                new Date(
                    year,
                    month - 1,
                    dayNumber
                );

            isCurrentMonth = false;

        } else if (
            index <
            startingDay + daysInMonth
        ) {

            dayNumber =
                index -
                startingDay +
                1;

            cellDate =
                new Date(
                    year,
                    month,
                    dayNumber
                );

        } else {

            dayNumber =
                index -
                startingDay -
                daysInMonth +
                1;

            cellDate =
                new Date(
                    year,
                    month + 1,
                    dayNumber
                );

            isCurrentMonth = false;
        }

        const cell =
            createCalendarDay(
                cellDate,
                dayNumber,
                isCurrentMonth
            );

        calendarDays.appendChild(cell);
    }
}

function createCalendarDay(
    date,
    dayNumber,
    isCurrentMonth
) {
    const cell =
        document.createElement("button");

    cell.type = "button";
    cell.className = "calendar-day";

    if (!isCurrentMonth) {
        cell.classList.add("other-month");
    }

    const dateString =
        formatDateISO(date);

    if (
        dateString ===
        formatDateISO(new Date())
    ) {
        cell.classList.add("today");
    }

    if (
        selectedDate === dateString
    ) {
        cell.classList.add("selected");
    }

    const appointments =
        getAppointmentsForDate(
            dateString
        );

    if (appointments.length > 0) {
        cell.classList.add(
            "has-appointments"
        );
    }

    const number =
        document.createElement("span");

    number.className =
        "calendar-day-number";

    number.textContent =
        dayNumber;

    cell.appendChild(number);

    cell.addEventListener("click", () => {

        selectedDate =
            dateString;

        currentCalendarDate =
            new Date(
                date.getFullYear(),
                date.getMonth(),
                1
            );

        renderCalendar();
        renderAppointments();
    });

    return cell;
}

/* =========================================================
   FECHA INICIAL
   ========================================================= */

function determineInitialDate() {

    const today =
        formatDateISO(new Date());

    const todayAppointments =
        getAppointmentsForDate(today);

    if (todayAppointments.length > 0) {
        selectedDate = today;

        currentCalendarDate =
            new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
            );

        return;
    }

    const futureAppointments =
        data.appointments
            .filter(
                appointment =>
                    appointment.date >= today &&
                    appointment.status !==
                        "cancelled" &&
                    matchesProfessionalFilter(
                        appointment
                    )
            )
            .sort(
                (a, b) =>
                    `${a.date} ${a.time}`
                        .localeCompare(
                            `${b.date} ${b.time}`
                        )
            );

    if (futureAppointments.length > 0) {

        selectedDate =
            futureAppointments[0].date;

        const date =
            parseDateISO(
                selectedDate
            );

        currentCalendarDate =
            new Date(
                date.getFullYear(),
                date.getMonth(),
                1
            );

        return;
    }

    selectedDate = today;

    currentCalendarDate =
        new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
        );
}

/* =========================================================
   TURNOS
   ========================================================= */

function getAppointmentsForDate(
    date
) {
    return data.appointments.filter(
        appointment =>
            appointment.date === date &&
            appointment.status !==
                "cancelled" &&
            matchesProfessionalFilter(
                appointment
            )
    );
}

function getFilteredAppointmentsForDate(
    date
) {
    let appointments =
        data.appointments.filter(
            appointment =>
                appointment.date === date
        );

    if (
        selectedProfessionalFilter !==
        "all"
    ) {
        appointments =
            appointments.filter(
                appointment =>
                    appointment.professionalId ===
                    selectedProfessionalFilter
            );
    }

    if (
        statusFilter &&
        statusFilter.value &&
        statusFilter.value !== "all"
    ) {
        appointments =
            appointments.filter(
                appointment =>
                    appointment.status ===
                    statusFilter.value
            );
    }

    return appointments;
}

function matchesProfessionalFilter(
    appointment
) {
    if (
        selectedProfessionalFilter ===
        "all"
    ) {
        return true;
    }

    return (
        appointment.professionalId ===
        selectedProfessionalFilter
    );
}

/* =========================================================
   RENDER TURNOS
   ========================================================= */

function renderAppointments() {

    if (!appointmentsList) {
        return;
    }

    const date =
        selectedDate ||
        formatDateISO(new Date());

    const appointments =
        getFilteredAppointmentsForDate(
            date
        ).sort(
            (a, b) =>
                a.time.localeCompare(
                    b.time
                )
        );

    updateDateHeader(date);
    updateSummary(appointments);

    appointmentsList.innerHTML = "";

    if (appointments.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty-state";

        empty.innerHTML = `
            <div class="empty-state-icon">♡</div>
            <h3>No hay turnos</h3>
            <p>No hay turnos para esta fecha y filtro.</p>
        `;

        appointmentsList.appendChild(
            empty
        );

        return;
    }

    appointments.forEach(
        appointment => {

            const card =
                createAppointmentCard(
                    appointment
                );

            appointmentsList.appendChild(
                card
            );
        }
    );
}

function createAppointmentCard(
    appointment
) {
    const card =
        document.createElement("article");

    card.className =
        "appointment-card";

    const professional =
        data.professionals.find(
            item =>
                item.id ===
                appointment.professionalId
        );

    const service =
        data.services.find(
            item =>
                item.id ===
                appointment.serviceId
        );

    const statusLabel =
        getStatusLabel(
            appointment.status
        );

    const professionalName =
        professional
            ? professional.name
            : "Sin profesional";

    const serviceName =
        service
            ? service.name
            : "Sin servicio";

    const color =
        professional?.color ||
        "#ef668b";

    card.innerHTML = `
        <div class="appointment-time">
            ${escapeHtml(appointment.time)}
        </div>

        <div class="appointment-main">
            <div class="appointment-client">
                ${escapeHtml(
                    appointment.clientName
                )}
            </div>

            <div class="appointment-service">
                ${escapeHtml(serviceName)}
            </div>

            <div class="appointment-professional">
                <span
                    class="professional-dot"
                    style="background:${escapeHtml(color)}"
                ></span>
                ${escapeHtml(professionalName)}
            </div>
        </div>

        <div class="appointment-side">
            <span class="status-badge status-${escapeHtml(
                appointment.status
            )}">
                ${escapeHtml(statusLabel)}
            </span>

            <div class="appointment-actions">
                <button
                    type="button"
                    class="appointment-action"
                    data-action="edit"
                    title="Editar"
                >
                    ✎
                </button>

                <button
                    type="button"
                    class="appointment-action"
                    data-action="delete"
                    title="Eliminar"
                >
                    ×
                </button>
            </div>
        </div>
    `;

    const editButton =
        card.querySelector(
            '[data-action="edit"]'
        );

    const deleteButton =
        card.querySelector(
            '[data-action="delete"]'
        );

    if (editButton) {
        editButton.addEventListener(
            "click",
            () => {
                editAppointment(
                    appointment.id
                );
            }
        );
    }

    if (deleteButton) {
        deleteButton.addEventListener(
            "click",
            () => {
                deleteAppointment(
                    appointment.id
                );
            }
        );
    }

    return card;
}

/* =========================================================
   RESUMEN
   ========================================================= */

function updateSummary(
    appointments
) {
    if (totalAppointments) {
        totalAppointments.textContent =
            appointments.length;
    }

    if (confirmedAppointments) {
        confirmedAppointments.textContent =
            appointments.filter(
                appointment =>
                    appointment.status ===
                    "confirmed"
            ).length;
    }

    if (availableAppointments) {
        availableAppointments.textContent =
            calculateAvailableSlots(
                selectedDate
            );
    }
}

function calculateAvailableSlots(
    date
) {
    if (!date) {
        return 0;
    }

    /*
     * Cantidad aproximada de espacios libres.
     * Se toman bloques de 30 minutos entre 09:00 y 20:00.
     */
    const startMinutes = 9 * 60;
    const endMinutes = 20 * 60;
    const slotDuration = 30;

    let totalSlots =
        Math.floor(
            (endMinutes - startMinutes) /
            slotDuration
        );

    const appointments =
        data.appointments.filter(
            appointment =>
                appointment.date === date &&
                appointment.status !==
                    "cancelled" &&
                matchesProfessionalFilter(
                    appointment
                )
        );

    appointments.forEach(
        appointment => {

            const duration =
                Number(
                    appointment.duration
                ) || 60;

            const occupied =
                Math.ceil(
                    duration /
                    slotDuration
                );

            totalSlots -= occupied;
        }
    );

    return Math.max(
        0,
        totalSlots
    );
}

/* =========================================================
   CABECERA DE FECHA
   ========================================================= */

function updateDateHeader(
    dateString
) {
    const date =
        parseDateISO(dateString);

    if (!date) {
        return;
    }

    if (selectedDateTitle) {
        selectedDateTitle.textContent =
            capitalize(
                date.toLocaleDateString(
                    "es-AR",
                    {
                        weekday: "long",
                        day: "numeric",
                        month: "long"
                    }
                )
            );
    }

    if (selectedDateSubtitle) {

        let text =
            "Todos los profesionales";

        if (
            selectedProfessionalFilter !==
            "all"
        ) {
            const professional =
                data.professionals.find(
                    item =>
                        item.id ===
                        selectedProfessionalFilter
                );

            if (professional) {
                text =
                    `Turnos de ${professional.name}`;
            }
        }

        selectedDateSubtitle.textContent =
            text;
    }
}

/* =========================================================
   MODAL — TURNOS
   ========================================================= */

function prepareAppointmentModal() {

    editingAppointmentId = null;

    if (appointmentForm) {
        appointmentForm.reset();
    }

    const professionalId =
        selectedProfessionalFilter !==
        "all"
            ? selectedProfessionalFilter
            : data.professionals[0]?.id;

    populateAppointmentForm(
        professionalId
    );

    if (appointmentDate) {
        appointmentDate.value =
            selectedDate ||
            formatDateISO(new Date());
    }

    if (appointmentTime) {
        appointmentTime.value =
            "09:00";
    }

    if (appointmentStatus) {
        appointmentStatus.value =
            "pending";
    }

    updateAppointmentDuration();

    updateAppointmentModalTitle(false);
}

function updateAppointmentModalTitle(
    editing
) {
    const title =
        appointmentModal?.querySelector(
            ".modal-title"
        );

    if (title) {
        title.textContent =
            editing
                ? "Editar turno"
                : "Crear turno";
    }

    const submitButton =
        appointmentForm?.querySelector(
            'button[type="submit"]'
        );

    if (submitButton) {
        submitButton.textContent =
            editing
                ? "Guardar cambios"
                : "Crear turno";
    }
}

function openAppointmentModal() {
    prepareAppointmentModal();

    openModal(
        "appointmentModal"
    );
}

function handleAppointmentSubmit(
    event
) {
    event.preventDefault();

    if (editingAppointmentId) {
        saveEditedAppointment();
    } else {
        createAppointment();
    }
}

function createAppointment() {

    const clientName =
        appointmentClient?.value.trim();

    const whatsapp =
        appointmentWhatsapp?.value.trim();

    const professionalId =
        appointmentProfessional?.value;

    const serviceId =
        appointmentService?.value;

    const date =
        appointmentDate?.value;

    const time =
        appointmentTime?.value;

    const duration =
        Number(
            appointmentDuration?.value
        );

    const status =
        appointmentStatus?.value ||
        "pending";

    const notes =
        appointmentNotes?.value.trim();

    if (
        !clientName ||
        !professionalId ||
        !serviceId ||
        !date ||
        !time
    ) {
        showToast(
            "Completá los campos obligatorios.",
            "error"
        );

        return;
    }

    if (
        appointmentExistsAtTime(
            date,
            time,
            professionalId
        )
    ) {
        showToast(
            "Ese profesional ya tiene un turno en ese horario.",
            "error"
        );

        return;
    }

    const appointment = {
        id: generateId("appointment"),
        clientName,
        whatsapp,
        professionalId,
        serviceId,
        date,
        time,
        duration,
        status,
        notes
    };

    data.appointments.push(
        appointment
    );

    saveData();

    selectedDate = date;

    const parsedDate =
        parseDateISO(date);

    currentCalendarDate =
        new Date(
            parsedDate.getFullYear(),
            parsedDate.getMonth(),
            1
        );

    closeModal(
        "appointmentModal"
    );

    renderCalendar();
    renderAppointments();

    showToast(
        "Turno creado correctamente.",
        "success"
    );
}

function editAppointment(id) {

    const appointment =
        data.appointments.find(
            item =>
                item.id === id
        );

    if (!appointment) {
        return;
    }

    editingAppointmentId = id;

    populateAppointmentForm(
        appointment.professionalId
    );

    if (appointmentClient) {
        appointmentClient.value =
            appointment.clientName || "";
    }

    if (appointmentWhatsapp) {
        appointmentWhatsapp.value =
            appointment.whatsapp || "";
    }

    if (appointmentProfessional) {
        appointmentProfessional.value =
            appointment.professionalId;
    }

    populateAppointmentServices(
        appointment.professionalId,
        appointment.serviceId
    );

    if (appointmentDate) {
        appointmentDate.value =
            appointment.date;
    }

    if (appointmentTime) {
        appointmentTime.value =
            appointment.time;
    }

    if (appointmentDuration) {
        appointmentDuration.value =
            appointment.duration;
    }

    if (appointmentStatus) {
        appointmentStatus.value =
            appointment.status;
    }

    if (appointmentNotes) {
        appointmentNotes.value =
            appointment.notes || "";
    }

    updateAppointmentModalTitle(true);

    openModal(
        "appointmentModal"
    );
}

function saveEditedAppointment() {

    const index =
        data.appointments.findIndex(
            appointment =>
                appointment.id ===
                editingAppointmentId
        );

    if (index === -1) {
        editingAppointmentId = null;
        return;
    }

    const clientName =
        appointmentClient?.value.trim();

    const whatsapp =
        appointmentWhatsapp?.value.trim();

    const professionalId =
        appointmentProfessional?.value;

    const serviceId =
        appointmentService?.value;

    const date =
        appointmentDate?.value;

    const time =
        appointmentTime?.value;

    const duration =
        Number(
            appointmentDuration?.value
        );

    const status =
        appointmentStatus?.value ||
        "pending";

    const notes =
        appointmentNotes?.value.trim();

    if (
        !clientName ||
        !professionalId ||
        !serviceId ||
        !date ||
        !time
    ) {
        showToast(
            "Completá los campos obligatorios.",
            "error"
        );

        return;
    }

    if (
        appointmentExistsAtTime(
            date,
            time,
            professionalId,
            editingAppointmentId
        )
    ) {
        showToast(
            "Ese profesional ya tiene un turno en ese horario.",
            "error"
        );

        return;
    }

    data.appointments[index] = {
        ...data.appointments[index],
        clientName,
        whatsapp,
        professionalId,
        serviceId,
        date,
        time,
        duration,
        status,
        notes
    };

    saveData();

    selectedDate = date;

    const parsedDate =
        parseDateISO(date);

    currentCalendarDate =
        new Date(
            parsedDate.getFullYear(),
            parsedDate.getMonth(),
            1
        );

    editingAppointmentId = null;

    closeModal(
        "appointmentModal"
    );

    renderCalendar();
    renderAppointments();

    showToast(
        "Turno actualizado correctamente.",
        "success"
    );
}

function deleteAppointment(id) {

    const appointment =
        data.appointments.find(
            item =>
                item.id === id
        );

    if (!appointment) {
        return;
    }

    const confirmed =
        window.confirm(
            `¿Eliminar el turno de ${appointment.clientName}?`
        );

    if (!confirmed) {
        return;
    }

    data.appointments =
        data.appointments.filter(
            item =>
                item.id !== id
        );

    saveData();

    renderCalendar();
    renderAppointments();

    showToast(
        "Turno eliminado.",
        "success"
    );
}

function appointmentExistsAtTime(
    date,
    time,
    professionalId,
    excludedId = null
) {
    return data.appointments.some(
        appointment =>
            appointment.id !== excludedId &&
            appointment.date === date &&
            appointment.time === time &&
            appointment.professionalId ===
                professionalId &&
            appointment.status !==
                "cancelled"
    );
}

/* =========================================================
   MODAL — SERVICIOS
   ========================================================= */

function prepareServiceModal() {

    if (serviceForm) {
        serviceForm.reset();
    }

    populateServiceProfessionalSelect();

    if (
        serviceProfessional &&
        selectedProfessionalFilter !==
            "all"
    ) {
        const exists =
            data.professionals.some(
                professional =>
                    professional.id ===
                    selectedProfessionalFilter
            );

        if (exists) {
            serviceProfessional.value =
                selectedProfessionalFilter;
        }
    }
}

function openServiceModal() {

    prepareServiceModal();

    openModal(
        "serviceModal"
    );
}

function createService(event) {

    event.preventDefault();

    const name =
        serviceName?.value.trim();

    const category =
        serviceCategory?.value.trim();

    const price =
        Number(
            servicePrice?.value
        );

    const duration =
        Number(
            serviceDuration?.value
        );

    const professionalId =
        serviceProfessional?.value;

    if (
        !name ||
        !category ||
        !price ||
        !duration ||
        !professionalId
    ) {
        showToast(
            "Completá todos los campos del servicio.",
            "error"
        );

        return;
    }

    const service = {
        id: generateId("service"),
        name,
        category,
        price,
        duration,
        professionalId
    };

    data.services.push(
        service
    );

    saveData();

    populateServiceProfessionalSelect();

    if (
        appointmentProfessional?.value ===
        professionalId
    ) {
        populateAppointmentServices(
            professionalId
        );
    }

    closeModal(
        "serviceModal"
    );

    showToast(
        "Servicio creado correctamente.",
        "success"
    );
}

/* =========================================================
   MODAL — PROFESIONALES
   ========================================================= */

function prepareProfessionalModal() {

    if (professionalForm) {
        professionalForm.reset();
    }

    if (professionalColor) {
        professionalColor.value =
            "#ef668b";
    }
}

function openProfessionalModal() {

    prepareProfessionalModal();

    openModal(
        "professionalModal"
    );
}

function createProfessional(event) {

    event.preventDefault();

    const name =
        professionalName?.value.trim();

    const specialty =
        professionalSpecialty?.value.trim();

    const color =
        professionalColor?.value ||
        "#ef668b";

    if (!name || !specialty) {
        showToast(
            "Completá todos los campos del profesional.",
            "error"
        );

        return;
    }

    const professional = {
        id: generateId("professional"),
        name,
        specialty,
        color
    };

    data.professionals.push(
        professional
    );

    saveData();

    /*
     * Automáticamente aparece una nueva tab.
     * Además la seleccionamos.
     */
    selectedProfessionalFilter =
        professional.id;

    populateProfessionalFilters();

    populateAppointmentForm(
        professional.id
    );

    populateServiceProfessionalSelect(
        professional.id
    );

    closeModal(
        "professionalModal"
    );

    renderCalendar();
    renderAppointments();

    showToast(
        `${name} fue agregada correctamente.`,
        "success"
    );
}

/* =========================================================
   MODALES GENERALES
   ========================================================= */

function openModal(id) {

    const modal =
        document.getElementById(id);

    if (!modal) {
        return;
    }

    modal.classList.add("active");

    document.body.classList.add(
        "modal-open"
    );
}

function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (!modal) {
        return;
    }

    modal.classList.remove("active");

    document.body.classList.remove(
        "modal-open"
    );

    if (
        id === "appointmentModal"
    ) {
        editingAppointmentId = null;
        updateAppointmentModalTitle(false);
    }
}

/* =========================================================
   BOTONES GLOBALES
   ========================================================= */

function createAppointmentButtonHandler() {
    openAppointmentModal();
}

function setupActionButtons() {

    const createAppointmentButton =
        document.getElementById(
            "createAppointmentButton"
        );

    const createServiceButton =
        document.getElementById(
            "createServiceButton"
        );

    const createProfessionalButton =
        document.getElementById(
            "createProfessionalButton"
        );

    if (createAppointmentButton) {
        createAppointmentButton.addEventListener(
            "click",
            createAppointmentButtonHandler
        );
    }

    if (createServiceButton) {
        createServiceButton.addEventListener(
            "click",
            openServiceModal
        );
    }

    if (createProfessionalButton) {
        createProfessionalButton.addEventListener(
            "click",
            openProfessionalModal
        );
    }
}

/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message,
    type = "success"
) {
    if (!toast) {
        return;
    }

    toast.textContent = message;

    toast.className =
        "toast";

    toast.classList.add(type);
    toast.classList.add("show");

    clearTimeout(
        showToast.timeout
    );

    showToast.timeout =
        setTimeout(() => {
            toast.classList.remove(
                "show"
            );
        }, 3000);
}

/* =========================================================
   UTILIDADES
   ========================================================= */

function generateId(
    prefix
) {
    return (
        prefix +
        "-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );
}

function formatDateISO(
    date
) {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function parseDateISO(
    dateString
) {
    if (!dateString) {
        return null;
    }

    const parts =
        dateString.split("-");

    if (parts.length !== 3) {
        return null;
    }

    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );
}

function formatCurrency(
    value
) {
    return new Intl.NumberFormat(
        "es-AR",
        {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0
        }
    ).format(
        Number(value) || 0
    );
}

function capitalize(
    value
) {
    if (!value) {
        return "";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}

function getStatusLabel(
    status
) {
    const labels = {
        confirmed: "Confirmado",
        pending: "Pendiente",
        cancelled: "Cancelado",
        completed: "Completado"
    };

    return (
        labels[status] ||
        status ||
        "Pendiente"
    );
}

function escapeHtml(
    value
) {
    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}

/* =========================================================
   CERRAR MODALES
========================================================= */

function setupModalClosing() {

    /*
     * Botones con data-close
     *
     * Ejemplo:
     *
     * <button data-close="serviceModal">×</button>
     *
     * <button data-close="serviceModal">
     *     Cancelar
     * </button>
     */
    document
        .querySelectorAll("[data-close]")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const modalId =
                        button.getAttribute(
                            "data-close"
                        );

                    if (modalId) {
                        closeModal(
                            modalId
                        );
                    }
                }
            );
        });


    /*
     * Cerrar haciendo click fuera
     * del contenido del modal.
     *
     * El overlay es .modal-overlay,
     * no .modal.
     */
    document
        .querySelectorAll(".modal-overlay")
        .forEach(overlay => {

            overlay.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        overlay
                    ) {
                        closeModal(
                            overlay.id
                        );
                    }
                }
            );
        });


    /*
     * Cerrar con ESC
     */
    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }

            document
                .querySelectorAll(
                    ".modal-overlay.active"
                )
                .forEach(overlay => {

                    closeModal(
                        overlay.id
                    );

                });
        }
    );
}
/* =========================================================
   INICIALIZACIÓN DE BOTONES Y MODALES
   ========================================================= */

setupActionButtons();
setupModalClosing();
initialize();