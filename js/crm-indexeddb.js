let db;

let borrarBd = false;
let borrarDatos = false;

/**
 * Borra la base de datos completa o solo los datos según las valores de borrarBd y borrarDatos.
 */
function borrarBaseDatos(){
    
    if(borrarBd){
        let deleteRequest = indexedDB.deleteDatabase("CRM_Database");
        deleteRequest.onsuccess = function() {
            console.log("Base de datos borrada correctamente");
        };
        deleteRequest.onerror = function(event) {
            console.error("Error al borrar la base de datos");
        }
        borrarBd = false;     
    }

    if(borrarDatos && db) {
        const transaccion = db.transaction("clients", "readwrite");
        const storeClientes = transaccion.objectStore("clients");

        storeClientes.clear();
        
        transaccion.oncomplete = () => {
            const tbody = document.querySelector("#client-table tbody");
            if (tbody) tbody.innerHTML = "";

            console.log("todos los datos borrados");
            borrarDatos = false;
        };
        transaccion.onerror = () => console.log("error al borrar datos");

        
        borrarDatos = false;
    }

}

borrarBaseDatos(); 
const request = indexedDB.open("CRM_Database", 1);

request.onerror = function(event) {
    console.error("Error abriendo IndexedDB", event);
};

request.onsuccess = function(event) {
    db = event.target.result;
    //borrarBaseDatos();
    fetchClients(); // Cargar clientes almacenados
};

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if(!db.objectStoreNames.contains('clients')) {
        const objectStore = db.createObjectStore('clients', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('email', 'email', { unique: true });
        objectStore.createIndex('phone', 'phone', { unique: false });
    }
};



// --- VALIDACIONES ---
const form = document.getElementById('client-form');
const addBtn = document.getElementById('add-btn');
const inputs = form.querySelectorAll('input');
let inputNombre = form.querySelector("#name"); 
let inputEmail = form.querySelector("#email");
let inputTelefono = form.querySelector("#phone");

// --- Validaciones y activación botón ---

inputs.forEach(input => {
    input.addEventListener('blur', async (e) => { 
        try {
            await inputBien(e.target);
        } catch (err) {
            console.error('Error en validación:', err);
        } finally {
            activarDesactivarBtn();
        }
     });
});

// --- AGREGAR CLIENTE ---
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if(!db) {
        console.error("La base de datos no está lista");
        return;
    }
    
    let nombre = inputNombre.value.trim();
    let email = inputEmail.value.trim();
    let telef = inputTelefono.value.trim(); 

    try {
        const transaccion = db.transaction("clients", "readwrite");
        const storeClientes = transaccion.objectStore("clients");
        storeClientes.add({ name: nombre, email: email, phone: telef});
        transaccion.oncomplete = () => {
            console.log("Cliente añadido correctamente");
            fetchClients();
            inputs.forEach(input => {
                input.classList.remove("input-bien", "input-mal");
            });
            activarDesactivarBtn();
        };
        transaccion.onerror = (event) => {
            console.error("Error al intentar añadir el cliente:", event);
        };
    } catch (error) {
        console.error("Error al intentar añadir el cliente:", error);
    }
});

// --- LISTADO DINÁMICO ---
/**
 * Coge todos los clientes de la base de datos y los muestra en la lista HTML.
 * Y crea los botones de editar y eliminar para cada cliente.
 */
function fetchClients() {
    const transaccion = db.transaction("clients", "readonly");
    const storeClientes = transaccion.objectStore("clients");
    const request = storeClientes.getAll();

    request.onsuccess = () => {
        const clientes = request.result;
        const tbody = document.querySelector("#client-table tbody");
        if (!tbody) return;
        tbody.innerHTML = "";

        clientes.forEach(cliente => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td data-label="ID"><strong>${cliente.id}</strong></td>
                <td data-label="Nombre">${cliente.name}</td>
                <td data-label="Email">${cliente.email}</td>
                <td data-label="Teléfono">${cliente.phone || ''}</td>
                <td class="actions" data-label="Acciones">
                    <button class="editar-btn">Editar</button>
                    <button class="eliminar-btn">Eliminar</button>
                </td>
            `;

            tbody.appendChild(tr);

            const editarBtn = tr.querySelector(".editar-btn");
            editarBtn.addEventListener("click", () => {
                window.editClient(cliente);
            });

            const eliminarBtn = tr.querySelector(".eliminar-btn");
            eliminarBtn.addEventListener("click", () => {
                window.deleteClient(cliente.id);
            });
        });
    };
}

// --- EDITAR CLIENTE ---
/**
 * Muestra el formulario para editar un cliente existente.
 */
window.editClient = function(cliente) {
    mostrarForm(cliente);
    
};

// --- ELIMINAR CLIENTE ---
/**
 * Elimina un cliente de la base de datos por su ID.
 */
window.deleteClient = function(id) {
    const transaccion = db.transaction("clients", "readwrite");
    const storeClientes = transaccion.objectStore("clients");
    storeClientes.delete(id);
    
    transaccion.oncomplete = () => {
        console.log("Cliente eliminado correctamente");
        fetchClients();
    };
    
    transaccion.onerror = () => {
        console.error("Error al eliminar cliente");
    };
};


// --- FUNCIONES DE VALIDACIÓN ---

/**
 * Valida que el nombre contenga solo letras y espacios.
 */
function comprobarNombre(nombre){
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    return regex.test(nombre);
}

/**
 * Valida que el email tenga formato correcto.
 */
function comprobarEmail(email){
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

/**
 * Comprueba de forma asíncrona si un email ya existe en la base de datos.
 * @param {string} email - Email a verificar
 * @param {number|null} excluirClienteId - ID del cliente a excluir de la búsqueda (útil al editar)
 * @returns {Promise<boolean>} - true si el email ya existe (en otro cliente), false si está disponible
 */
function comprobarEmailYaExiste(email, excluirClienteId = null){

    return new Promise((resolve, reject) => {
        const transaccion = db.transaction("clients", "readonly");
        const storeClientes = transaccion.objectStore("clients");
        const request = storeClientes.getAll();

        request.onsuccess = () => {
            resolve(request.result.some(cliente => 
                cliente.email.toLowerCase() === email.toLowerCase() && cliente.id !== excluirClienteId
            )) 
        }

        request.onerror = () => reject(request.error)
    })
}

/**
 * Valida que el teléfono tenga exactamente 9 dígitos.
 */
function comprobarTelefono(telef){
    const regex = /^[0-9]{9}$/;
    return regex.test(telef)
}

/**
 * Comprueba de forma asíncrona si un teléfono ya existe en la base de datos.
 * @param {string} telef - Teléfono a verificar
 * @param {number|null} excluirClienteId - ID del cliente a excluir de la búsqueda (útil al editar)
 * @returns {Promise<boolean>} - true si el teléfono ya existe (en otro cliente), false si está disponible
 */
function comprobarTelefonoYaExiste(telef, excluirClienteId = null){
    return new Promise((resolve, reject) => {
        const transaccion = db.transaction("clients", "readonly");
        const storeClientes = transaccion.objectStore("clients");
        const request = storeClientes.getAll();

        request.onsuccess = () => {
            resolve(request.result.some(cliente => 
                cliente.phone === telef && cliente.id !== excluirClienteId
            )) 
        }

        request.onerror = () => reject(request.error)
    })
}

/**
 * Muestra un mensaje de error debajo del input y aplica estilos visuales de error.
 * Si ya existe un error, actualiza el mensaje en lugar de crear uno nuevo.
 */
function generarErrorInput(input, mensaje){
    if (input.classList.contains("input-mal")) {
        const mensajeAnterior = input.parentNode.querySelector(".mensaje-error");
        if (mensajeAnterior) {
            mensajeAnterior.textContent = mensaje;
        }
        return;
    }

    if (input.classList.contains("input-bien")) {
        input.classList.remove("input-bien");
    }

    const p = document.createElement("p");
    p.textContent = mensaje;
    p.style.margin = "0";
    p.classList.add("mensaje-error");

    input.classList.add("input-mal");
    input.insertAdjacentElement('afterend', p);
}

/**
 * Marca el input como válido, elimina mensajes de error y aplica estilos visuales de éxito.
 */
function generarBienInput(input){
    input.classList.remove("input-mal");
    input.classList.add("input-bien");
    const p = input.parentNode.querySelector("p")
    if (p != null) p.remove();
}

/**
 * Valida un input de forma completa: formato y unicidad en BD.
 * Detecta automáticamente el tipo de campo según su ID y aplica las validaciones correspondientes.
 * @param {HTMLInputElement} inputElement - Elemento input a validar
 * @param {number|null} clienteId - ID del cliente actual (para excluirlo al editar)
 * @returns {Promise<boolean>} - true si el input es válido, false si hay errores
 */
async function validarInput(inputElement, clienteId = null) {
    let bien = true;
    const valor = inputElement.value.trim();
    const inputId = inputElement.id;
    
    // Validación de nombre
    if (inputId === 'name' || inputId === 'edit-name') {
        if (!comprobarNombre(valor)) {
            const msj = "Nombre no válido";
            generarErrorInput(inputElement, msj);
            console.error(msj);
            bien = false;
        }
    }
    
    // Validación de email
    if (inputId === 'email' || inputId === 'edit-email') {
        if (!comprobarEmail(valor)) {
            const msj = "Email no válido";
            generarErrorInput(inputElement, msj);
            console.error(msj);
            bien = false;
        } else {
            try {
                const existe = await comprobarEmailYaExiste(valor, clienteId);
                if (existe) {
                    generarErrorInput(inputElement, "Ya existe un cliente con ese email");
                    bien = false;
                }
            } catch (err) {
                console.error('Error comprobando email:', err);
                generarErrorInput(inputElement, "No se pudo verificar el email");
                bien = false;
            }
        }
    }
    
    // Validación de teléfono
    if (inputId === 'phone' || inputId === 'edit-phone') {
        if (!comprobarTelefono(valor)) {
            const msj = "El número de teléfono no es válido";
            generarErrorInput(inputElement, msj);
            console.error(msj);
            bien = false;
        } else {
            try {
                const existe = await comprobarTelefonoYaExiste(valor, clienteId);
                if (existe) {
                    generarErrorInput(inputElement, "Ya existe un cliente con ese teléfono");
                    bien = false;
                }
            } catch (err) {
                console.error('Error comprobando teléfono:', err);
                generarErrorInput(inputElement, "No se pudo verificar el teléfono");
                bien = false;
            }
        }
    }

    if (bien) {
        inputElement.classList.remove("input-mal");
        generarBienInput(inputElement);
    } else {
        inputElement.classList.remove("input-bien");
    }
    return bien;
}

/**
 * Funciona para la compatibilidad con la validación del formulario principal
 */
async function inputBien(input){
    return await validarInput(input);
}

/**
 * Habilita o deshabilita un botón según el estado de validación de los inputs.
 * El botón se habilita solo si todos los inputs tienen la clase 'input-bien' y no están vacíos.
 * @param {HTMLButtonElement} boton - Botón a activar/desactivar (por defecto addBtn)
 * @param {NodeList} inputsArray - Lista de inputs a verificar (por defecto inputs del form principal)
 */
function activarDesactivarBtn(boton = addBtn, inputsArray = inputs){
    let todosBien = true;
    inputsArray.forEach(input => {
        if (!input.classList.contains("input-bien") || input.value.trim() === "") {
            todosBien = false;
        }
    });

    boton.disabled = !todosBien;
}

// ---FORMULARIO EDITAR CLIENTE---
/**
 * Crea y muestra un formulario para editar los datos de un cliente.
 * Valida automáticamente los campos al cargar y configura las validaciones en tiempo real.
 * @param {Object} cliente - Objeto cliente con propiedades id, name, email y phone
 */
function mostrarForm(cliente) {
    const ventana = document.createElement('div');
    ventana.className = 'edit-ventana';
    
    const contenedorForm = document.createElement('div');
    contenedorForm.className = 'edit-contenedor';

    const formularioHTML = `
        <h2>Editar Cliente</h2>
        <form id="edit-form" autocomplete="off">
            <div>
                <label>Nombre completo:</label>
                <input id="edit-name" name="name" type="text" placeholder="Nombre completo" value="${cliente.name}" required>
            </div>
            <div>
                <label>Email:</label>
                <input id="edit-email" name="email" type="email" placeholder="ejemplo@dominio.com" value="${cliente.email}" required>
            </div>
            <div>
                <label>Teléfono:</label>
                <input id="edit-phone" name="phone" type="text" placeholder="123456789" value="${cliente.phone}" required>
            </div>
            <div class="edit-buttons">
                <button id="edit-cancel-btn" type="button">Cancelar</button>
                <button id="edit-submit-btn" type="submit" disabled>Guardar Cambios</button>
            </div>
        </form>
    `;
    
    contenedorForm.innerHTML = formularioHTML;
    
    
    ventana.appendChild(contenedorForm);
    document.body.appendChild(ventana);

    const editForm = contenedorForm.querySelector('#edit-form');
    const btnCancelar = contenedorForm.querySelector('#edit-cancel-btn');
    const btnSubmit = contenedorForm.querySelector('#edit-submit-btn');
    const editInputs = editForm.querySelectorAll('input');
    
    // Validar todos los inputs al cargar el formulario
    (async () => {
        try {
            for (const input of editInputs) {
                await validarInput(input, cliente.id);
            }
        } catch (error) {
            console.error('Error en la validación inicial:', error);
        } finally {
            activarDesactivarBtn(btnSubmit, editInputs);
        }
    })();
    
    // Configurar validaciones en blur para el formulario de edición
    editInputs.forEach(input => {
        input.addEventListener('blur', async (e) => {
            try {
                await validarInput(e.target, cliente.id);
            } catch (error) {
                console.error('Error en la validación:', error);
            } finally {
                activarDesactivarBtn(btnSubmit, editInputs);
            }
        });
    });
    
    btnCancelar.addEventListener('click', () => {
        ventana.remove();
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        actualizarCliente(cliente, ventana);
    });
}

/**
 * Actualiza los datos de un cliente en IndexedDB y cierra el formulario modal.
 * @param {Object} cliente - Objeto cliente con el ID del cliente a actualizar
 * @param {HTMLElement} ventana - Elemento DOM del modal a cerrar tras la actualización
 */
function actualizarCliente(cliente, ventana) {
    const nombre = document.querySelector('#edit-name').value.trim();
    const email = document.querySelector('#edit-email').value.trim();
    const phone = document.querySelector('#edit-phone').value.trim();
    
    const transaccion = db.transaction("clients", "readwrite");
    const storeClientes = transaccion.objectStore("clients");
    storeClientes.put({ id: cliente.id, name: nombre, email: email, phone: phone });
    
    transaccion.oncomplete = () => {
        console.log("Cliente actualizado correctamente");
        fetchClients();
        ventana.remove();
    };
    
    transaccion.onerror = () => {
        console.error("Error al actualizar el cliente");
    };
}