<template>
  <div>
    <div class="div-contenedor">
      <!-- Input para cargar el archivo Excel -->
      <input class="inputPegarExcel" type="file" @change="handleFileUpload" />

      <!-- Campo de búsqueda -->

      <div v-if="btnProducto">
        <!-- Botón para alternar entre la tabla de productos y productos seleccionados -->
        <button @click="toggleTables" class="btn btn-primary">
          {{
            showProductosTable
              ? "Mostrar Productos Seleccionados"
              : "Mostrar Productos"
          }}
        </button>
      </div>
    </div>

    <div>
      <input
        type="text"
        class="inputBuscador form-control"
        v-model="searchQuery"
        placeholder="Buscar por nombre"
        @input="filterRows"
      />
    </div>

    <!-- Mostrar los datos de las filas en una tabla -->
    <table
      v-if="showProductosTable && filteredRows.length > 0"
      border="1"
      class="table table-striped"
    >
      <thead>
        <tr>
          <th>Acción</th>
          <th>Cantidad</th>
          <th v-for="(header, idx) in headers" :key="idx">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in filteredRows" :key="rowIndex">
          <td>
            <button
              class="btn btn-success"
              @click="agregarProducto(row, rowIndex)"
            >
              Agregar
            </button>
          </td>
          <td>
            <input
              class="inputCantidad form-control"
              placeholder="0"
              v-model="cantidadPorFila[rowIndex]"
            />
          </td>
          <td v-for="(cell, colIndex) in row" :key="colIndex">{{ cell }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Tabla para mostrar los productos seleccionados -->
    <div v-if="!showProductosTable && productos.length > 0">
      <h3>Productos Agregados</h3>
      <table border="1" class="table table-striped">
        <thead>
          <tr>
            <th>Acción</th>
            <th>Cantidad</th>
            <th v-for="(header, idx) in selectedHeaders" :key="'header-' + idx">
              {{ header }}
            </th>
            <th>Lote</th>
            <th>F. Vencimiento</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(producto, productoIndex) in productos"
            :key="productoIndex"
          >
            <td>
              <button
                class="btn btn-danger"
                @click="eliminarProducto(productoIndex)"
              >
                X
              </button>
            </td>
            <td>{{ producto.cantidad }}</td>
            <td
              v-for="(colIndex, index) in selectedColumnIndices"
              :key="'product-cell-' + index"
            >
              {{ producto.row[colIndex] }}
            </td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <!-- Botón para exportar a Excel -->
      <button class="btn btn-warning" @click="showForm = true">
        Exportar a Excel
      </button>
    </div>

    <!-- Formulario oculto hasta que se haga clic en "Exportar a Excel" -->
    <div v-if="showForm" class="form-container">
      <label for="razonSocial">Razón Social:</label>
      <input
        type="text"
        class="form-control"
        id="razonSocial"
        v-model="razonSocial"
        placeholder="Ingresa la razón social"
      />

      <label for="vendedor">Vendedor:</label>
      <input
        type="text"
        class="form-control"
        id="vendedor"
        v-model="vendedor"
        placeholder="Ingresa el nombre del vendedor"
      />

      <label for="direccion">Dirección:</label>
      <input
        type="text"
        class="form-control"
        id="direccion"
        v-model="direccion"
        placeholder="Ingresa la dirección"
      />

      <!-- Botón para generar el Excel -->
      <div style="display: inline-flex; gap: 10px">
        <button class="btn btn-primary" @click="exportToExcel">
          Exportar Pedido
        </button>
        <button class="btn btn-success" @click="exportarProforma">
          Exportar Proforma
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { ref, computed } from "vue";
import { saveAs } from "file-saver";

// Variables de ejemplo para seleccionar las columnas a mostrar
const selectedHeaders = ref(["NombreProducto", "Promocion"]);
const selectedColumnIndices = ref([0, 6]);

const rows = ref([]);
const headers = ref([]);
const cantidadPorFila = ref([]);
const productos = ref([]);
const searchQuery = ref("");
const razonSocial = ref("");
const vendedor = ref("");
const direccion = ref("");
const showForm = ref(false);
const showProductosTable = ref(true); // Control de visibilidad de las tablas

// varialbe para mostrar boton
const btnProducto = ref(false);

const filteredRows = computed(() => {
  if (!searchQuery.value) {
    return rows.value;
  }
  return rows.value.filter((row) =>
    row.some((cell) =>
      String(cell).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  );
});

// Manejar la carga del archivo Excel
// const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     console.log('object')
//     btnProducto.value = true

//     if (file) {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//             const data = e.target.result;
//             const workbook = XLSX.read(data, { type: 'binary' });

//             const sheetName = workbook.SheetNames[0];
//             const sheet = workbook.Sheets[sheetName];

//             const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

//             if (sheetData.length > 0) {
//                 headers.value = sheetData[0];
//                 rows.value = sheetData.slice(1);
//                 cantidadPorFila.value = new Array(rows.value.length).fill('');
//             }
//         };
//         reader.readAsBinaryString(file);
//     }
// };

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  btnProducto.value = true;

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (sheetData.length > 0) {
        headers.value = sheetData[0];
        rows.value = sheetData.slice(1).map((row) => {
          // Asegúrate de que cualquier valor que contenga '%' se mantenga como string
          return row.map((cell, index) => {
            if (typeof cell === "string" && cell.includes("%")) {
              // console.log(cell)
              // console.log("index:" + index)
              return cell; // Mantener como texto
            }

            if (
              (typeof cell === "number" && index == 7) ||
              index == 8 ||
              index == 9 ||
              index == 10
            ) {
              let newCell = (cell * 100).toFixed(0) + "%";
              // console.log("tipo number: " + (cell * 100).toFixed(0) + "%")
              // console.log("index:" + index)
              return newCell; // Mantener como texto
            }
            return cell;
          });
        });
        cantidadPorFila.value = new Array(rows.value.length).fill("");
      }
    };
    reader.readAsBinaryString(file);
  }
};

// Función para agregar el producto con la cantidad a la lista de productos
const agregarProducto = (row, rowIndex) => {
  const cantidad = cantidadPorFila.value[rowIndex];
  if (cantidad && cantidad > 0) {
    productos.value.push({ row, cantidad });
    cantidadPorFila.value[rowIndex] = "";
  } else {
    alert("Por favor, ingresa una cantidad válida");
  }
};

// Función para eliminar un producto de la lista
const eliminarProducto = (index) => {
  productos.value.splice(index, 1);
};

// Alternar entre las tablas
const toggleTables = () => {
  showProductosTable.value = !showProductosTable.value;
};

// Exportar a Excel
const exportToExcel = async () => {
  if (productos.value.length === 0) {
    alert("No hay productos para exportar.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Hoja 1");
  const headersWithExtras = [
    ...selectedHeaders.value,
    "Cantidad",
    "Lote",
    "F. Vencimiento",
  ];

  worksheet.addRow(["RAZON SOCIAL:", razonSocial.value]);
  worksheet.addRow(["VENDEDOR:", vendedor.value]);
  worksheet.addRow(["DIRECCION:", direccion.value]);
  worksheet.addRow([]);
  worksheet.addRow(headersWithExtras);

  productos.value.forEach((producto) => {
    const visibleData = selectedColumnIndices.value.map(
      (index) => producto.row[index]
    );
    worksheet.addRow([...visibleData, producto.cantidad || "", "", ""]);
  });

  worksheet.eachRow((row, rowIndex) => {
    row.eachCell((cell, colIndex) => {
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

      if (rowIndex === 5) {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFCCFFCC" },
        };
      }
    });
  });

  worksheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      if (cell.value) {
        const cellLength = String(cell.value).length;
        maxLength = Math.max(maxLength, cellLength + 2);
      }
    });
    column.width = maxLength;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "Proforma.xlsx");
};

// Exportar a Excel
const exportarProforma = async () => {
  if (productos.value.length === 0) {
    alert("No hay productos para exportar.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Hoja 1");
  const headersWithExtras = [
    ...selectedHeaders.value,
    "Cantidad",
    "Lote",
    "F. Vencimiento",
  ];

  worksheet.addRow(["RAZON SOCIAL:", razonSocial.value]);
  worksheet.addRow(["VENDEDOR:", vendedor.value]);
  worksheet.addRow(["DIRECCION:", direccion.value]);
  worksheet.addRow([]);
  worksheet.addRow(headersWithExtras);

  productos.value.forEach((producto) => {
    const visibleData = selectedColumnIndices.value.map(
      (index) => producto.row[index]
    );
    worksheet.addRow([...visibleData, producto.cantidad || "", "", ""]);
  });

  worksheet.eachRow((row, rowIndex) => {
    row.eachCell((cell, colIndex) => {
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

      if (rowIndex === 5) {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFCCFFCC" },
        };
      }
    });
  });

  worksheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      if (cell.value) {
        const cellLength = String(cell.value).length;
        maxLength = Math.max(maxLength, cellLength + 2);
      }
    });
    column.width = maxLength;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "Pedido.xlsx");
};
</script>

<style scoped>
* {
  font-size: 0.8rem;
}

.form-container {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.inputCantidad {
  width: 60px;
  height: 40px;
  text-align: center;
}

.inputPegarExcel {
  background-color: #d1cfbd;
  /* Amarillo claro con un toque suave */
  color: #3c3c3c;
  /* Gris oscuro para texto */
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.inputPegarExcel:hover {
  background-color: #d1e68d;
  /* Amarillo más suave cuando se pasa el mouse */
}

.inputPegarExcel {
  background-color: #f0e68c;
  /* Amarillo claro con un toque suave */
  color: #3c3c3c;
  /* Gris oscuro para texto */
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.inputPegarExcel:hover {
  background-color: #d1e68d;
  /* Amarillo más suave cuando se pasa el mouse */
}

.div-contenedor {
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 5px 0px;
}
</style>
