/* =========================================================
   MACA POLICHINO STUDIO — SERVICIOS
========================================================= */

const STORAGE_KEY = "macaStudioAgenda";

let data = loadData();
let editingServiceId = null;


/* =========================================================
   DOM
========================================================= */

const servicesList =
    document.getElementById("servicesList");

const serviceCount =
    document.getElementById("serviceCount");

const createServiceButton =
    document.getElementById("createServiceButton");

const serviceModal =
    document.getElementById("serviceModal");

const serviceModalTitle =
    document.getElementById("serviceModalTitle");

const serviceForm =
    document.getElementById("serviceForm");

const serviceSubmitButton =
    document.getElementById("serviceSubmitButton");

const serviceName =
    document.getElementById("serviceName");

const serviceProfessional =
    document.getElementById("serviceProfessional");

const serviceCategory =
    document.getElementById("serviceCategory");

const servicePrice =
    document.getElementById("servicePrice");

const serviceDuration =
    document.getElementById("serviceDuration");

const toast =
    document.getElementById("toast");


/* =========================================================
   INICIALIZACIÓN
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    renderServices();

    populateProfessionalSelect();

    setupEvents();

    setupModalClosing();

});


/* =========================================================
   STORAGE
========================================================= */

function loadData() {

    try {

        const stored =
            localStorage.getItem(STORAGE_KEY);

        if (!stored) {

            return {
                professionals: [],
                services: [],
                appointments: []
            };

        }

        const parsed =
            JSON.parse(stored);

        if (!Array.isArray(parsed.professionals)) {
            parsed.professionals = [];
        }

        if (!Array.isArray(parsed.services)) {
            parsed.services = [];
        }

        if (!Array.isArray(parsed.appointments)) {
            parsed.appointments = [];
        }

        return parsed;

    } catch (error) {

        console.error(
            "Error cargando datos:",
            error
        );

        return {
            professionals: [],
            services: [],
            appointments: []
        };

    }

}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


/* =========================================================
   EVENTOS
========================================================= */

function setupEvents() {

    if (createServiceButton) {

        createServiceButton.addEventListener(
            "click",
            openCreateServiceModal
        );

    }


    if (serviceForm) {

        serviceForm.addEventListener(
            "submit",
            handleServiceSubmit
        );

    }

}


/* =========================================================
   LISTADO
========================================================= */

function renderServices() {

    if (!servicesList) {
        return;
    }

    servicesList.innerHTML = "";

    if (serviceCount) {

        serviceCount.textContent =
            data.services.length;

    }


    if (data.services.length === 0) {

        servicesList.innerHTML = `
            <div class="management-empty">
                <div class="empty-icon">✦</div>

                <h3>
                    No hay servicios
                </h3>

                <p>
                    Todavía no agregaste ningún servicio.
                </p>

                <button
                    type="button"
                    class="button primary"
                    id="emptyCreateServiceButton"
                >
                    Crear servicio
                </button>
            </div>
        `;

        const emptyButton =
            document.getElementById(
                "emptyCreateServiceButton"
            );

        if (emptyButton) {

            emptyButton.addEventListener(
                "click",
                openCreateServiceModal
            );

        }

        return;
    }


    const groupedServices =
        groupServicesByCategory();


    Object.keys(groupedServices)
        .sort()
        .forEach(category => {

            const categoryBlock =
                document.createElement("div");

            categoryBlock.className =
                "service-category-block";


            categoryBlock.innerHTML = `
                <div class="service-category-title">
                    ${escapeHtml(category)}
                </div>
            `;


            const categoryServices =
                groupedServices[category];


            categoryServices.forEach(service => {

                categoryBlock.appendChild(
                    createServiceCard(service)
                );

            });


            servicesList.appendChild(
                categoryBlock
            );

        });

}


function groupServicesByCategory() {

    return data.services.reduce(
        (groups, service) => {

            const category =
                service.category ||
                "Otros";

            if (!groups[category]) {
                groups[category] = [];
            }

            groups[category].push(service);

            return groups;

        },
        {}
    );

}


/* =========================================================
   TARJETA DE SERVICIO
========================================================= */

function createServiceCard(service) {

    const card =
        document.createElement("article");

    card.className =
        "management-card service-card";


    const professional =
        data.professionals.find(
            professional =>
                professional.id ===
                service.professionalId
        );


    const professionalName =
        professional
            ? professional.name
            : "Sin profesional";


    const professionalColor =
        professional?.color ||
        "#ef668b";


    card.innerHTML = `

        <div class="management-card-main">

            <div class="management-card-icon">
                ✦
            </div>

            <div class="management-card-info">

                <h3>
                    ${escapeHtml(service.name)}
                </h3>

                <div class="management-card-meta">

                    <span>
                        ${escapeHtml(
                            professionalName
                        )}
                    </span>

                    <span>
                        ${formatDuration(
                            service.duration
                        )}
                    </span>

                </div>

            </div>

        </div>


        <div class="service-price">

            ${formatCurrency(service.price)}

        </div>


        <div class="management-card-actions">

            <button
                type="button"
                class="icon-button"
                data-action="edit"
                title="Editar servicio"
                aria-label="Editar servicio"
            >
                ✎
            </button>

            <button
                type="button"
                class="icon-button danger"
                data-action="delete"
                title="Eliminar servicio"
                aria-label="Eliminar servicio"
            >
                ×
            </button>

        </div>

    `;


    const icon =
        card.querySelector(
            ".management-card-icon"
        );

    if (icon) {

        icon.style.color =
            professionalColor;

        icon.style.backgroundColor =
            hexToRgba(
                professionalColor,
                0.10
            );

    }


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
            () => editService(service.id)
        );

    }


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            () => deleteService(service.id)
        );

    }


    return card;

}


/* =========================================================
   SELECT DE PROFESIONALES
========================================================= */

function populateProfessionalSelect(
    selectedId = null
) {

    if (!serviceProfessional) {
        return;
    }

    serviceProfessional.innerHTML = "";


    if (data.professionals.length === 0) {

        const option =
            document.createElement("option");

        option.value = "";
        option.textContent =
            "No hay profesionales";

        serviceProfessional.appendChild(
            option
        );

        return;

    }


    data.professionals.forEach(
        professional => {

            const option =
                document.createElement("option");

            option.value =
                professional.id;

            option.textContent =
                professional.name;

            serviceProfessional.appendChild(
                option
            );

        }
    );


    if (
        selectedId &&
        data.professionals.some(
            professional =>
                professional.id === selectedId
        )
    ) {

        serviceProfessional.value =
            selectedId;

    } else {

        serviceProfessional.value =
            data.professionals[0].id;

    }

}


/* =========================================================
   CREAR SERVICIO
========================================================= */

function openCreateServiceModal() {

    editingServiceId = null;

    if (serviceForm) {
        serviceForm.reset();
    }

    populateProfessionalSelect();


    if (serviceModalTitle) {

        serviceModalTitle.textContent =
            "Nuevo servicio";

    }


    if (serviceSubmitButton) {

        serviceSubmitButton.textContent =
            "Crear servicio";

    }


    if (serviceDuration) {
        serviceDuration.value = "60";
    }


    openModal("serviceModal");

}


/* =========================================================
   EDITAR SERVICIO
========================================================= */

function editService(id) {

    const service =
        data.services.find(
            item =>
                item.id === id
        );

    if (!service) {
        return;
    }


    editingServiceId = id;


    if (serviceName) {
        serviceName.value =
            service.name || "";
    }


    if (serviceCategory) {
        serviceCategory.value =
            service.category || "Otros";
    }


    if (servicePrice) {
        servicePrice.value =
            service.price ?? "";
    }


    if (serviceDuration) {
        serviceDuration.value =
            service.duration || 60;
    }


    populateProfessionalSelect(
        service.professionalId
    );


    if (serviceModalTitle) {

        serviceModalTitle.textContent =
            "Editar servicio";

    }


    if (serviceSubmitButton) {

        serviceSubmitButton.textContent =
            "Guardar cambios";

    }


    openModal("serviceModal");

}


/* =========================================================
   GUARDAR SERVICIO
========================================================= */

function handleServiceSubmit(event) {

    event.preventDefault();


    const name =
        serviceName?.value.trim();

    const professionalId =
        serviceProfessional?.value;

    const category =
        serviceCategory?.value;

    const price =
        Number(servicePrice?.value);

    const duration =
        Number(serviceDuration?.value);


    if (
        !name ||
        !professionalId ||
        !category ||
        Number.isNaN(price) ||
        price < 0 ||
        !duration
    ) {

        showToast(
            "Completá correctamente los datos del servicio.",
            "error"
        );

        return;

    }


    if (editingServiceId) {

        updateService({
            name,
            professionalId,
            category,
            price,
            duration
        });

    } else {

        createService({
            name,
            professionalId,
            category,
            price,
            duration
        });

    }

}


/* =========================================================
   CREAR
========================================================= */

function createService(serviceData) {

    const service = {

        id:
            generateId("service"),

        name:
            serviceData.name,

        category:
            serviceData.category,

        price:
            serviceData.price,

        duration:
            serviceData.duration,

        professionalId:
            serviceData.professionalId

    };


    data.services.push(service);

    saveData();

    closeModal("serviceModal");

    renderServices();

    showToast(
        "Servicio creado correctamente.",
        "success"
    );

}


/* =========================================================
   ACTUALIZAR
========================================================= */

function updateService(serviceData) {

    const service =
        data.services.find(
            item =>
                item.id ===
                editingServiceId
        );


    if (!service) {
        return;
    }


    service.name =
        serviceData.name;

    service.category =
        serviceData.category;

    service.price =
        serviceData.price;

    service.duration =
        serviceData.duration;

    service.professionalId =
        serviceData.professionalId;


    saveData();

    editingServiceId = null;

    closeModal("serviceModal");

    renderServices();

    showToast(
        "Servicio actualizado correctamente.",
        "success"
    );

}


/* =========================================================
   ELIMINAR
========================================================= */

function deleteService(id) {

    const service =
        data.services.find(
            item =>
                item.id === id
        );


    if (!service) {
        return;
    }


    const hasAppointments =
        data.appointments.some(
            appointment =>
                appointment.serviceId === id
        );


    let message =
        `¿Querés eliminar el servicio "${service.name}"?`;


    if (hasAppointments) {

        message +=
            "\n\nEste servicio tiene turnos asociados. Los turnos existentes conservarán la referencia al servicio eliminado.";

    }


    const confirmed =
        window.confirm(message);


    if (!confirmed) {
        return;
    }


    data.services =
        data.services.filter(
            item =>
                item.id !== id
        );


    saveData();

    renderServices();


    showToast(
        "Servicio eliminado.",
        "success"
    );

}


/* =========================================================
   MODALES
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


    if (id === "serviceModal") {

        editingServiceId = null;

    }

}


function setupModalClosing() {

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


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

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

        }
    );

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


    toast.textContent =
        message;

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

function generateId(prefix) {

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


function formatCurrency(value) {

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


function formatDuration(minutes) {

    const value =
        Number(minutes) || 0;


    if (value < 60) {
        return `${value} min`;
    }


    const hours =
        Math.floor(value / 60);

    const remaining =
        value % 60;


    if (remaining === 0) {

        return hours === 1
            ? "1 hora"
            : `${hours} horas`;

    }


    return `${hours} h ${remaining} min`;

}


function hexToRgba(hex, alpha) {

    const clean =
        String(hex)
            .replace("#", "");


    if (clean.length !== 6) {
        return `rgba(239,102,139,${alpha})`;
    }


    const r =
        parseInt(
            clean.substring(0, 2),
            16
        );

    const g =
        parseInt(
            clean.substring(2, 4),
            16
        );

    const b =
        parseInt(
            clean.substring(4, 6),
            16
        );


    return `rgba(${r}, ${g}, ${b}, ${alpha})`;

}


function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}