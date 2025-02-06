<template>
  <div>
    <div v-if="mostrarFormulario">
      <h3>Datos del Pedido/Proforma</h3>
      <div class="form-group">
        <label for="razonSocial">Razón Social</label>
        <input
          type="text"
          id="razonSocial"
          v-model="razonSocial"
          class="form-control"
          required
        />
      </div>
      <div class="form-group">
        <label for="vendedor">Vendedor</label>
        <input
          type="text"
          id="vendedor"
          v-model="vendedor"
          class="form-control"
          required
        />
      </div>
      <div class="form-group">
        <label for="sector">Sector</label>
        <input
          type="text"
          id="sector"
          v-model="sector"
          class="form-control"
          required
        />
      </div>
      <button @click="submitFormulario" class="btn btn-primary">
        Confirmar Datos
      </button>
    </div>
    <div style="display: flex; gap: 10px; margin: 10px">
      <!-- Botones de exportación -->
      <button @click="generarExcel('pedido')" class="btn btn-success">
        Exportar Pedido
      </button>
      <button @click="generarExcel('proforma')" class="btn btn-primary">
        Exportar Proforma
      </button>

      <!-- Botón para reactivar el formulario -->
      <button
        v-if="!mostrarFormulario"
        @click="resetFormulario"
        class="btn btn-secondary"
      >
        Editar Datos
      </button>
    </div>

    <h2>Productos Disponibles</h2>

    <!-- Filtro por nombre -->
    <div>
      <input
        type="text"
        v-model="filtroNombre"
        placeholder="Filtrar por nombre"
        class="form-control"
      />
    </div>

    <!-- Tabla paginada de productos -->
    <table v-if="productosPaginados.length" class="table table-striped">
      <thead class="thead-dark">
        <tr>
          <th>Cantidad</th>
          <th>Acción</th>
          <th v-for="header in encabezados" :key="header">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(producto, index) in productosPaginados" :key="index">
          <td>
            <input
              type="number"
              v-model="cantidades[productosFiltrados.indexOf(producto)]"
              placeholder="0"
              class="form-control"
              style="width: 70px; text-align: center"
            />
          </td>
          <td>
            <button
              @click="agregarProducto(productosFiltrados.indexOf(producto))"
              class="btn btn-warning"
            >
              Agregar
            </button>
          </td>
          <td v-for="header in encabezados" :key="header">
            {{ producto[header] }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else>
      <p>No hay productos disponibles.</p>
    </div>

    <!-- Controles de paginación -->
    <div class="pagination">
      <button
        :disabled="paginaActual === 1"
        @click="paginaActual--"
        class="btn btn-secondary"
      >
        Anterior
      </button>
      <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>
      <button
        :disabled="paginaActual === totalPaginas"
        @click="paginaActual++"
        class="btn btn-secondary"
      >
        Siguiente
      </button>
    </div>

    <h2>Productos Seleccionados</h2>
    <table v-if="productosSeleccionados.length" class="table table-bordered">
      <thead>
        <tr>
          <th>Cantidad</th>
          <th>Acción</th>
          <th v-for="header in encabezados" :key="header">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(producto, index) in productosSeleccionados" :key="index">
          <td>{{ producto.cantidad }}</td>
          <td>
            <button @click="eliminarProducto(index)" class="btn btn-danger">
              Eliminar
            </button>
          </td>
          <td v-for="header in encabezados" :key="header">
            {{ producto[header] }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else>
      <p>No hay productos seleccionados aún.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import ExcelJS from "exceljs";

// Datos iniciales
const productos = ref([]);
const encabezados = ref([]);
const cantidades = ref([]); // Para almacenar las cantidades ingresadas
const productosSeleccionados = ref([]); // Para almacenar los productos seleccionados
const filtroNombre = ref(""); // Para almacenar el valor del filtro por nombre

const elementosPorPagina = ref(5); // Número de elementos por página
const paginaActual = ref(1); // Página actual

// Datos del formulario
const razonSocial = ref("");
const vendedor = ref("");
const sector = ref("");
const mostrarFormulario = ref(true); // Para mostrar el formulario antes de generar el Excel

// Total de páginas calculado dinámicamente
const totalPaginas = computed(() => {
  return Math.ceil(productosFiltrados.value.length / elementosPorPagina.value);
});

// Productos que se muestran en la página actual
const productosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * elementosPorPagina.value;
  const fin = inicio + elementosPorPagina.value;
  return productosFiltrados.value.slice(inicio, fin);
});

// Cargar productos desde un archivo JSON
const fetchProductos = async () => {
  try {
    const response = await fetch("/listaGeneralPrueba.json");
    if (!response.ok) {
      throw new Error(
        `Error al cargar el archivo JSON: ${response.statusText}`
      );
    }
    const data = await response.json();

    // Establecer encabezados
    if (data.length > 0) {
      encabezados.value = Object.keys(data[0]); // Claves del primer objeto como encabezados
    }

    productos.value = data;
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
};

// Computed para filtrar productos por nombre
const productosFiltrados = computed(() => {
  if (!filtroNombre.value) {
    return productos.value;
  }

  return productos.value.filter((producto) =>
    producto.NombreProducto.toLowerCase().includes(
      filtroNombre.value.toLowerCase()
    )
  );
});

// Agregar producto a la tabla de seleccionados
const agregarProducto = (index) => {
  const cantidad = cantidades.value[index];
  const producto = productos.value[index];

  if (!cantidad) {
    alert("Por favor, ingrese una cantidad.");
    return;
  }

  const productoSeleccionado = {
    ...producto,
    cantidad, // Agregar la cantidad ingresada
  };

  productosSeleccionados.value.push(productoSeleccionado); // Agregar a la nueva tabla
  cantidades.value[index] = ""; // Limpiar el campo de cantidad
};

// Eliminar producto de la tabla de productos seleccionados
const eliminarProducto = (index) => {
  productosSeleccionados.value.splice(index, 1); // Eliminar el producto seleccionado
};

// Captura el envío del formulario
const submitFormulario = () => {
  // Después de llenar el formulario, ocultamos el formulario
  mostrarFormulario.value = false;
};

// Restablecer los valores del formulario
const resetFormulario = () => {
  razonSocial.value = "";
  vendedor.value = "";
  sector.value = "";
  mostrarFormulario.value = true;
};

// Función para exportar pedido a Excel
const generarExcel = async (tipo) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(
    tipo === "pedido" ? "Pedido" : "Proforma"
  );

  worksheet.addRow([]);

  // Configuración manual de tamaño de página A4
  worksheet.pageSetup.paperSize = 9; // 9 corresponde a A4 en ExcelJS
  worksheet.pageSetup.orientation = "portrait"; // Establecer orientación vertical
  worksheet.pageSetup.fitToPage = true; // Ajustar el contenido a la página
  worksheet.pageSetup.fitToWidth = 1; // Ajustar el contenido al ancho de la página
  worksheet.pageSetup.fitToHeight = 1; // Ajustar el contenido a una sola página en altura

  // Agregar los datos del formulario en las filas 1, 2, 3
  worksheet.addRow([`Razón Social: ${razonSocial.value}`]);
  worksheet.mergeCells(
    worksheet.lastRow.number,
    1,
    worksheet.lastRow.number,
    2
  ); // Fusionar celdas

  worksheet.addRow([`Vendedor: ${vendedor.value}`]);
  worksheet.mergeCells(
    worksheet.lastRow.number,
    1,
    worksheet.lastRow.number,
    2
  ); // Fusionar celdas

  worksheet.addRow([`Sector: ${sector.value}`]);
  worksheet.mergeCells(
    worksheet.lastRow.number,
    1,
    worksheet.lastRow.number,
    2
  ); // Fusionar celdas

  // Dejar una fila vacía antes de los productos
  worksheet.addRow([]);

  // Definir las columnas (encabezados de la tabla Excel)
  let columnas;
  let productos = productosSeleccionados.value;

  if (tipo === "pedido") {
    columnas = [
      { header: "Nombre Producto", key: "NombreProducto" },
      { header: "Presentación", key: "Presentacion" },
      { header: "Cantidad", key: "cantidad" },
      { header: "Promoción", key: "PROMOCION" },
      { header: "Lote", key: "Lote" },
      { header: "Fecha de Vencimiento", key: "FechaVencimiento" },
    ];
    productos = productos.map((producto) => ({
      ...producto,
      Lote: "", // Valor vacío por defecto
      FechaVencimiento: " ", // Valor vacío por defecto
    }));
  } else if (tipo === "proforma") {
    columnas = [
      { header: "Nombre Producto", key: "NombreProducto" },
      { header: "Precio Farmacia", key: "PrecioFarmacia" },
      { header: "Promoción", key: "PROMOCION" },
      { header: "Laboratorio", key: "LABORATORIO" },
      { header: "Presentación", key: "Presentacion" },
    ];
  }

  // Establecer las columnas de la hoja
  worksheet.columns = columnas;

  // Establecer los encabezados en la fila 5
  worksheet.addRow(columnas.map((col) => col.header)); // Encabezados de la tabla
  worksheet.getRow(5).font = { bold: true }; // Negrita en los encabezados

  // Agregar los productos seleccionados a las filas, comenzando en la fila 6
  productos.forEach((producto) => {
    worksheet.addRow(producto);
  });

  // Eliminar el contenido de la primera fila
  worksheet.getRow(1).values = [];

  worksheet.eachRow((row, rowIndex) => {
    row.eachCell((cell, colIndex) => {
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };

      cell.alignment = {
        horizontal: "left",
        vertical: "middle",
        wrapText: true,
      };

      if (rowIndex === 6) {
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

  // Descargar archivo Excel
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${tipo}.xlsx`;
  link.click();
};

onMounted(fetchProductos);
</script>

<style scoped>
.table {
  width: 100%;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.pagination button {
  margin: 0 5px;
}
</style>
