let db;

let borrarBd = false;
let borrarDatos = false;

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
        const tx = db.transaction("clients", "readwrite");
        const store = tx.objectStore("clients");

        store.clear();
        
        tx.oncomplete = () => {
            const lista = document.querySelector("#client-list");
            lista.innerHTML = "";

            console.log("todos los datos borrados");
            borrarDatos = false;
        };
        tx.onerror = () => console.log("error al borrar datos");

        
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
// TODO: Implementad validaciones usando expresiones regulares y eventos 'onblur'
// Elimina el código de validación y manejo de clases visuales para que ellos lo desarrollen
const form = document.getElementById('client-form');
const addBtn = document.getElementById('add-btn');
const inputs = form.querySelectorAll('input');

// --- Validaciones y activación botón ---
// Dejar el botón siempre deshabilitado. Que alumnos lo activen cuando validen campos
// addBtn.disabled = true; 

inputs.forEach(input => {
    // Quitar manejo de eventos 'blur' para validación (alumnos deben hacerlo)
    input.addEventListener('blur', e => { 
        const value = e.target.value.trim();
        const isValid = value.length > 0; // Validación simple: campo no vacío
     });
});

// --- AGREGAR CLIENTE ---
// TODO: Implementar la función que capture los datos y los agregue a IndexedDB
form.addEventListener('submit', e => {
    e.preventDefault();
    
    if(!db) {
        console.error("La base de datos no está lista");
        return;
    }
    
    let nombre = form.querySelector("#name").value; 
    let email = form.querySelector("#email").value;
    let telef = form.querySelector("#phone").value;

    console.log("Añadiendo cliente:", nombre, email, telef);

    const tx = db.transaction("clients", "readwrite");
    const store = tx.objectStore("clients");
    store.add({ name: nombre, email: email, phone: telef});
    
    tx.oncomplete = () => {
        console.log("Cliente añadido correctamente");
        fetchClients();
    };
    
    tx.onerror = () => console.error("Error al añadir cliente");
});

// --- LISTADO DINÁMICO ---
function fetchClients() {
    const tx = db.transaction("clients", "readonly");
    const store = tx.objectStore("clients");
    const request = store.getAll();
    
    request.onsuccess = () => {
        const clientes = request.result;
        const lista = document.querySelector("#client-list");
        lista.innerHTML = "";
        
        clientes.forEach(cliente => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div><strong>ID: ${cliente.id}</strong> | Nombre: ${cliente.name} — Email: ${cliente.email} — Teléfono: ${cliente.phone}</div>
                <div>
                    <button class="editar-btn">Editar</button>
                    <button class="eliminar-btn">Eliminar</button>
                </div>
            `;
            lista.appendChild(li);
            
            
            const editarBtn = li.querySelector(".editar-btn");
            editarBtn.addEventListener("click", () => {
                window.editClient(cliente.id);
            });
            
            const eliminarBtn = li.querySelector(".eliminar-btn");
            eliminarBtn.addEventListener("click", () => {
                window.deleteClient(cliente.id);
            });
        });
    };
}

// --- EDITAR CLIENTE ---
window.editClient = function(id) {
    const tx = db.transaction("clients", "readwrite");
    const store = tx.objectStore("clients");
    store.put({ id: id, name: "Nombre", email: "example@correo.es", phone: "000000000"}); 
    fetchClients();
};

// --- ELIMINAR CLIENTE ---
window.deleteClient = function(id) {
    const tx = db.transaction("clients", "readwrite");
    const store = tx.objectStore("clients");
    store.delete(id);
    fetchClients();
};

