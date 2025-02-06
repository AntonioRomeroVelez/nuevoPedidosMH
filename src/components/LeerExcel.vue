<template>
    <div>
        <!-- Input para cargar el archivo Excel -->
        <input type="file" @change="handleFileUpload" />

        <!-- Campo de búsqueda -->
        <div>
            <input type="text" v-model="searchQuery" placeholder="Buscar por nombre" @input="filterRows" />
        </div>

        <!-- Mostrar los datos de las filas en una tabla -->
        <table v-if="filteredRows.length > 0" border="1">
            <thead>
                <tr>
                    <th>Acción</th>
                    <th>Cantidad</th>
                    <th v-for="(header, idx) in headers" :key="idx">{{ header }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in filteredRows" :key="rowIndex">
                    <td><button @click="agregarProducto(row, rowIndex)">Agregar</button></td>
                    <td>
                        <input class="inputCantidad" type="number" v-model="cantidadPorFila[rowIndex]"
                            placeholder="Cantidad" />
                    </td>
                    <td v-for="(cell, colIndex) in row" :key="colIndex">{{ cell }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Tabla para mostrar los productos agregados -->
        <!-- Tabla para mostrar los productos agregados -->
        <div v-if="productos.length > 0">
            <h3>Productos Agregados</h3>
            <table border="1">
                <thead>
                    <tr>
                        <th>Acción</th>
                        <th>Cantidad</th>
                        <!-- Mostrar solo las columnas específicas que quieres -->
                        <th v-for="(header, idx) in selectedHeaders" :key="'header-' + idx">{{ header }}</th>
                        <th>Lote</th>
                        <th>F. Vencimiento</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(producto, productoIndex) in productos" :key="productoIndex">
                        <td><button @click="eliminarProducto(productoIndex)">Eliminar</button></td>
                        <td>{{ producto.cantidad }}</td>
                        <!-- Mostrar solo las celdas correspondientes a las columnas seleccionadas -->
                        <td v-for="(colIndex, index) in selectedColumnIndices" :key="'product-cell-' + index">
                            {{ producto.row[colIndex] }}
                        </td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>

            <!-- Botón para exportar a Excel -->
            <button @click="showForm = true">Exportar a Excel</button>
        </div>

        <!-- Formulario oculto hasta que se haga clic en "Exportar a Excel" -->
        <div v-if="showForm" class="form-container">
            <label for="razonSocial">Razón Social:</label>
            <input type="text" id="razonSocial" v-model="razonSocial" placeholder="Ingresa la razón social" />

            <label for="vendedor">Vendedor:</label>
            <input type="text" id="vendedor" v-model="vendedor" placeholder="Ingresa el nombre del vendedor" />

            <label for="direccion">Dirección:</label>
            <input type="text" id="direccion" v-model="direccion" placeholder="Ingresa la dirección" />

            <!-- Botón para generar el Excel -->
            <button @click="exportToExcel">Generar Excel</button>
        </div>
    </div>
</template>

<script setup>
// Importar la librería xlsx
import * as XLSX from 'xlsx';
import { ref, computed } from 'vue';


// Variables de ejemplo para seleccionar las columnas a mostrar
const selectedHeaders = ref([
    'NombreProducto', // Este es un ejemplo, remplaza por los nombres reales de las columnas
    'Promocion',
    // Añadir más nombres de encabezados que desees mostrar
]);

// Definir los índices de las columnas seleccionadas
const selectedColumnIndices = ref([0, 6]); // Los índices de las columnas de la fila (0, 1, etc.)


// Estado para almacenar las filas, los encabezados, los productos agregados y las cantidades por fila
const rows = ref([]);
const headers = ref([]);
const cantidadPorFila = ref([]); // Un array para almacenar las cantidades por cada fila
const productos = ref([]);
const searchQuery = ref(''); // Variable reactiva para la búsqueda

// Variables para la razón social, vendedor y dirección
const razonSocial = ref('');
const vendedor = ref('');
const direccion = ref('');

// Control de visibilidad para mostrar u ocultar el formulario
const showForm = ref(false);

// Computed para filtrar las filas según el término de búsqueda
const filteredRows = computed(() => {
    if (!searchQuery.value) {
        return rows.value; // Si no hay búsqueda, mostramos todas las filas
    }
    // Filtramos las filas donde al menos una celda contiene el término de búsqueda
    return rows.value.filter(row =>
        row.some(cell =>
            String(cell).toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    );
});

// Manejar la carga del archivo Excel
const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });

            // Obtener la primera hoja del archivo
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Convertir la hoja a un formato de JSON (array de arrays)
            const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Asignar los encabezados (la primera fila) y las filas (resto de los datos)
            if (sheetData.length > 0) {
                headers.value = sheetData[0]; // La primera fila será la cabecera
                rows.value = sheetData.slice(1); // El resto son las filas de datos
                cantidadPorFila.value = new Array(rows.value.length).fill(''); // Inicializamos las cantidades como un array vacío
            }
        };

        // Leer el archivo como binario
        reader.readAsBinaryString(file);
    }
};

// Función para agregar el producto con la cantidad a la lista de productos
const agregarProducto = (row, rowIndex) => {
    const cantidad = cantidadPorFila.value[rowIndex]; // Obtenemos la cantidad correspondiente a esta fila
    if (cantidad && cantidad > 0) {
        productos.value.push({
            row: row,
            cantidad: cantidad,
        });
        cantidadPorFila.value[rowIndex] = ''; // Limpiar el input de cantidad después de agregar
    } else {
        alert("Por favor, ingresa una cantidad válida");
    }
};

// Función para eliminar un producto de la lista
const eliminarProducto = (index) => {
    productos.value.splice(index, 1);
};



import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const exportToExcel = async () => {
    if (productos.value.length === 0) {
        alert("No hay productos para exportar.");
        return;
    }

    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();

    // Crear una nueva hoja
    const worksheet = workbook.addWorksheet('Productos');

    // Establecer los encabezados visibles
    const headersWithExtras = [
        ...selectedHeaders.value,
        'Cantidad',
        'Lote',
        'F. Vencimiento',
    ];

    // Añadir los encabezados a la hoja
    worksheet.addRow(["RAZON SOCIAL:", razonSocial.value]);
    worksheet.addRow(["VENDEDOR:", vendedor.value]);
    worksheet.addRow(["DIRECCION:", direccion.value]);
    worksheet.addRow([]); // Fila vacía
    worksheet.addRow(headersWithExtras);

    // Añadir los datos de los productos
    productos.value.forEach(producto => {
        const visibleData = selectedColumnIndices.value.map(index => producto.row[index]);
        worksheet.addRow([...visibleData, producto.cantidad || '', '', '']);
    });

    // Aplicar estilos a las celdas, incluyendo bordes
    worksheet.eachRow((row, rowIndex) => {
        row.eachCell((cell, colIndex) => {
            // Aplicar bordes a cada celda
            cell.border = {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } },
            };

            // Alineación centrada y ajuste de texto
            cell.alignment = {
                horizontal: 'center',
                vertical: 'middle',
                wrapText: true,
            };

            // Resaltar los encabezados
            if (rowIndex === 5) {
                cell.font = { bold: true };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFCCFFCC' }, // Color verde claro
                };
            }
        });
    });

    // Ajustar el ancho de las columnas automáticamente
    worksheet.columns.forEach(column => {
        let maxLength = 10; // Ancho mínimo
        column.eachCell({ includeEmpty: true }, cell => {
            if (cell.value) {
                const cellLength = String(cell.value).length;
                maxLength = Math.max(maxLength, cellLength + 2); // Ajustar ancho con un margen
            }
        });
        column.width = maxLength;
    });

    // Exportar el archivo como .xlsx
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'productos_agregados.xlsx');
};


</script>

<style scoped>
/* Estilos para el contenedor de los formularios */
.form-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.form-container label {
    font-weight: bold;
}

.form-container input {
    padding: 8px;
    margin-top: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

button {
    background-color: #4CAF50;
    color: white;
    padding: 10px;
    border: none;
    cursor: pointer;
    border-radius: 5px;
}

button:hover {
    background-color: #45a049;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

table th,
table td {
    padding: 8px;
    text-align: left;
    border: 1px solid black;
    /* Bordes negros en todas las celdas */
}

table th {
    background-color: #1e2f4e;
}

.inputCantidad {
    width: 70px;
    height: 40px;
    text-align: center;
}
</style>
