<template>
    <div>
        <button @click="exportToExcel">Exportar a Excel</button>
    </div>
</template>

<script>
import ExcelJS from "exceljs";
import { saveAs } from "file-saver"; // Para guardar el archivo

export default {
    data() {
        return {
            datos: [
                { nombre: "Camila", edad: 30, ciudad: "Bogotá" },
                { nombre: "Pedro", edad: 25, ciudad: "Lima" },
                { nombre: "Sofía", edad: 28, ciudad: "Santiago" },
            ],
        };
    },
    methods: {
        async exportToExcel() {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Tabla con Bordes");

            // Agregar encabezados
            worksheet.columns = [
                { header: "Nombre", key: "nombre", width: 20 },
                { header: "Edad", key: "edad", width: 10 },
                { header: "Ciudad", key: "ciudad", width: 20 },
            ];

            // Agregar datos
            this.datos.forEach((dato) => {
                worksheet.addRow(dato);
            });

            // Aplicar bordes a todas las celdas
            worksheet.eachRow((row) => {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: "thin", color: { argb: "000000" } },
                        bottom: { style: "thin", color: { argb: "000000" } },
                        left: { style: "thin", color: { argb: "000000" } },
                        right: { style: "thin", color: { argb: "000000" } },
                    };
                });
            });

            // Generar archivo Excel
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), "tabla_con_bordes.xlsx");
        },
    },
};
</script>
