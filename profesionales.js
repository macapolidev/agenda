/* =========================================================
   MACA POLICHINO STUDIO — PROFESIONALES
========================================================= */

const STORAGE_KEY = "macaStudioAgenda";

let data = loadData();
let editingProfessionalId = null;


/* =========================================================
   DOM
========================================================= */

const professionalsList =
    document.getElementById(
        "professionalsList"
    );

const professionalCount =
    document.getElementById(
        "professionalCount"
    );

const createProfessionalButton =
    document.getElementById(
        "createProfessionalButton"
    );

const professionalModal =
    document.getElementById(
        "professionalModal"
    );

const professionalModalTitle =
    document.getElementById(
        "professionalModalTitle"
    );

const professionalForm =
    document.getElementById(
        "professionalForm"
    );

const professionalSubmitButton =
    document.getElementById(
        "professionalSubmitButton"
    );

const professionalName =
    document.getElementById(
        "professionalName"
    );

const professionalSpecialty =
    document.getElementById(
        "professionalSpecialty"
    );

const professionalColor =
    document.getElementById(
        "professionalColor"
    );

const toast =
    document.getElementById("toast");


/* =========================================================
   INICIALIZACIÓN
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderProfessionals();

        setupEvents();

        setupModalClosing();

    }
);


/* =========================================================
   STORAGE
========================================================= */

function loadData() {

    try {

        const stored =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!stored) {

            return {
                professionals: [],
                services: [],
                appointments: []
            };

        }


        const parsed =
            JSON.parse(stored);


        if (
            !Array.isArray(
                parsed.professionals
            )
        ) {
            parsed.professionals = [];
        }


        if (
            !Array.isArray(
                parsed.services
            )
        ) {
            parsed.services = [];
        }


        if (
            !Array.isArray(
                parsed.appointments
            )
        ) {
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

    if (
        createProfessionalButton
    ) {

        createProfessionalButton.addEventListener(
            "click",
            openCreateProfessionalModal
        );

    }


    if (professionalForm) {

        professionalForm.addEventListener(
            "submit",
            handleProfessionalSubmit
        );

    }

}


/* =========================================================
   LISTADO
========================================================= */

function renderProfessionals() {

    if (!professionalsList) {
        return;
    }


    professionalsList.innerHTML = "";


    if (professionalCount) {

        professionalCount.textContent =
            data.professionals.length;

    }


    if (
        data.professionals.length === 0
    ) {

        professionalsList.innerHTML = `

            <div class="management-empty">

                <div class="empty-icon">
                    ♟
                </div>

                <h3>
                    No hay profesionales
                </h3>

                <p>
                    Todavía no agregaste ningún profesional.
                </p>

                <button
                    type="button"
                    class="button primary"
                    id="emptyCreateProfessionalButton"
                >
                    Crear profesional
                </button>

            </div>

        `;


        const emptyButton =
            document.getElementById(
                "emptyCreateProfessionalButton"
            );


        if (emptyButton) {

            emptyButton.addEventListener(
                "click",
                openCreateProfessionalModal
            );

        }


        return;

    }


    data.professionals.forEach(
        professional => {

            professionalsList.appendChild(
                createProfessionalCard(
                    professional
                )
            );

        }
    );

}


/* =========================================================
   TARJETA
========================================================= */

function createProfessionalCard(
    professional
) {

    const card =
        document.createElement("article");


    card.className =
        "management-card professional-card";


    const services =
        data.services.filter(
            service =>
                service.professionalId ===
                professional.id
        );


    const appointments =
        data.appointments.filter(
            appointment =>
                appointment.professionalId ===
                professional.id
        );


    const color =
        professional.color ||
        "#ef668b";


    card.innerHTML = `

        <div class="professional-main">

            <div
                class="professional-avatar"
                style="
                    background:${escapeHtml(
                        hexToRgba(
                            color,
                            0.12
                        )
                    )};
                    color:${escapeHtml(
                        color
                    )};
                "
            >
                ${escapeHtml(
                    getInitials(
                        professional.name
                    )
                )}
            </div>


            <div class="management-card-info">

                <h3>
                    ${escapeHtml(
                        professional.name
                    )}
                </h3>

                <div class="professional-specialty">

                    ${escapeHtml(
                        professional.specialty ||
                        "Sin especialidad"
                    )}

                </div>


                <div class="management-card-meta">

                    <span>
                        ${services.length}
                        ${
                            services.length === 1
                                ? "servicio"
                                : "servicios"
                        }
                    </span>

                    <span>
                        ${appointments.length}
                        ${
                            appointments.length === 1
                                ? "turno"
                                : "turnos"
                        }
                    </span>

                </div>

            </div>

        </div>


        <div class="professional-color">

            <span
                class="professional-color-dot"
                style="
                    background:${escapeHtml(
                        color
                    )};
                "
            ></span>

            <span>
                Color
            </span>

        </div>


        <div class="management-card-actions">

            <button
                type="button"
                class="icon-button"
                data-action="edit"
                title="Editar profesional"
                aria-label="Editar profesional"
            >
                ✎
            </button>

            <button
                type="button"
                class="icon-button danger"
                data-action="delete"
                title="Eliminar profesional"
                aria-label="Eliminar profesional"
            >
                ×
            </button>

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
            () =>
                editProfessional(
                    professional.id
                )
        );

    }


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            () =>
                deleteProfessional(
                    professional.id
                )
        );

    }


    return card;

}


/* =========================================================
   CREAR
========================================================= */

function openCreateProfessionalModal() {

    editingProfessionalId = null;


    if (professionalForm) {
        professionalForm.reset();
    }


    if (professionalColor) {

        professionalColor.value =
            "#ef668b";

    }


    if (professionalModalTitle) {

        professionalModalTitle.textContent =
            "Nuevo profesional";

    }


    if (professionalSubmitButton) {

        professionalSubmitButton.textContent =
            "Crear profesional";

    }


    openModal(
        "professionalModal"
    );

}


/* =========================================================
   EDITAR
========================================================= */

function editProfessional(id) {

    const professional =
        data.professionals.find(
            item =>
                item.id === id
        );


    if (!professional) {
        return;
    }


    editingProfessionalId =
        id;


    if (professionalName) {

        professionalName.value =
            professional.name || "";

    }


    if (professionalSpecialty) {

        professionalSpecialty.value =
            professional.specialty || "";

    }


    if (professionalColor) {

        professionalColor.value =
            professional.color ||
            "#ef668b";

    }


    if (professionalModalTitle) {

        professionalModalTitle.textContent =
            "Editar profesional";

    }


    if (professionalSubmitButton) {

        professionalSubmitButton.textContent =
            "Guardar cambios";

    }


    openModal(
        "professionalModal"
    );

}


/* =========================================================
   SUBMIT
========================================================= */

function handleProfessionalSubmit(
    event
) {

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


    if (editingProfessionalId) {

        updateProfessional({
            name,
            specialty,
            color
        });

    } else {

        createProfessional({
            name,
            specialty,
            color
        });

    }

}


/* =========================================================
   CREAR PROFESIONAL
========================================================= */

function createProfessional(
    professionalData
) {

    const professional = {

        id:
            generateId("professional"),

        name:
            professionalData.name,

        specialty:
            professionalData.specialty,

        color:
            professionalData.color

    };


    data.professionals.push(
        professional
    );


    saveData();

    closeModal(
        "professionalModal"
    );

    renderProfessionals();


    showToast(
        "Profesional creada correctamente.",
        "success"
    );

}


/* =========================================================
   ACTUALIZAR PROFESIONAL
========================================================= */

function updateProfessional(
    professionalData
) {

    const professional =
        data.professionals.find(
            item =>
                item.id ===
                editingProfessionalId
        );


    if (!professional) {
        return;
    }


    professional.name =
        professionalData.name;

    professional.specialty =
        professionalData.specialty;

    professional.color =
        professionalData.color;


    saveData();


    editingProfessionalId = null;


    closeModal(
        "professionalModal"
    );


    renderProfessionals();


    showToast(
        "Profesional actualizada correctamente.",
        "success"
    );

}


/* =========================================================
   ELIMINAR PROFESIONAL
========================================================= */

function deleteProfessional(id) {

    const professional =
        data.professionals.find(
            item =>
                item.id === id
        );


    if (!professional) {
        return;
    }


    const serviceCount =
        data.services.filter(
            service =>
                service.professionalId === id
        ).length;


    const appointmentCount =
        data.appointments.filter(
            appointment =>
                appointment.professionalId === id
        ).length;


    let message =
        `¿Querés eliminar a ${professional.name}?`;


    if (
        serviceCount > 0 ||
        appointmentCount > 0
    ) {

        message += "\n\n";


        if (serviceCount > 0) {

            message +=
                `Tiene ${serviceCount} servicio${
                    serviceCount === 1
                        ? ""
                        : "s"
                } asignado${
                    serviceCount === 1
                        ? ""
                        : "s"
                }. `;

        }


        if (appointmentCount > 0) {

            message +=
                `Tiene ${appointmentCount} turno${
                    appointmentCount === 1
                        ? ""
                        : "s"
                } asociado${
                    appointmentCount === 1
                        ? ""
                        : "s"
                }. `;

        }


        message +=
            "\n\nLos datos históricos se conservarán, pero los servicios quedarán sin profesional asignado.";

    }


    const confirmed =
        window.confirm(message);


    if (!confirmed) {
        return;
    }


    /*
     * Desvinculamos los servicios,
     * pero NO los eliminamos.
     */

    data.services.forEach(
        service => {

            if (
                service.professionalId === id
            ) {

                service.professionalId =
                    null;

            }

        }
    );


    /*
     * Mantenemos los turnos existentes.
     * Simplemente eliminamos la referencia
     * al profesional.
     */

    data.appointments.forEach(
        appointment => {

            if (
                appointment.professionalId === id
            ) {

                appointment.professionalId =
                    null;

            }

        }
    );


    data.professionals =
        data.professionals.filter(
            item =>
                item.id !== id
        );


    saveData();

    renderProfessionals();


    showToast(
        "Profesional eliminada.",
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


    modal.classList.remove(
        "active"
    );


    document.body.classList.remove(
        "modal-open"
    );


    if (
        id ===
        "professionalModal"
    ) {

        editingProfessionalId =
            null;

    }

}


function setupModalClosing() {

    document
        .querySelectorAll(
            "[data-close]"
        )
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
        .querySelectorAll(
            ".modal-overlay"
        )
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


function getInitials(name) {

    const parts =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (parts.length === 0) {
        return "?";
    }


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


function hexToRgba(
    hex,
    alpha
) {

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