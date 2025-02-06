<template>
    <div>
        <div>
            <h3>Añadir profesor</h3>
            <div>
                <div>
                    <label for="">Nombre</label>
                    <input type="text" v-model="profesor.nombre" />
                </div>
                <div>
                    <label for="">Apellidos</label>
                    <input type="text" v-model="profesor.apellido" />
                </div>
                <div>
                    <label for="">Cedula</label>
                    <input type="text" v-model="profesor.cedula" />
                </div>
                <div>
                    <label for="">Materias</label>
                    <input type="text" v-model="subject" />
                    <button @click="addMateria">Agregar materia</button>
                    <div>
                        <ul>
                            <li v-for="(materia, index) in profesor.materias" :key="index">{{ materia }} <button
                                    @click="eliminarMateria(index)">Elimnar materia</button></li>
                        </ul>
                    </div>
                </div>
                <input type="checkbox" v-model="profesor.documentacion">
                <label for="">Documentación entregada</label>
                <button @click="addProfesor">Agregar Profesor</button>
            </div>
        </div>
        <div>
            <h3>Listado de profesores</h3>
            <table class="table table-striped table-inverse table-responsive">
                <thead class="thead-inverse">
                    <tr>
                        <th>Nombre</th>
                        <th>Apellidos</th>
                        <th>Cedula</th>
                        <th>Materias</th>
                        <th>Documentacion entregada</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="elemento in profesores" :key="elemento.cedula">
                        <td>{{ elemento.nombre }}</td>
                        <td>{{ elemento.apellido }}</td>
                        <td>{{ elemento.cedula }}</td>
                        <td>
                            <ul>
                                <li v-for="(materia, index) in elemento.materias" :key="index">{{ materia }}</li>
                            </ul>
                        </td>
                        <td v-if="elemento.documentacion">Entregada</td>
                        <td v-else>No entregada</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>


<script setup>
import { ref } from 'vue';

let profesor = ref({
    nombre: '',
    apellido: '',
    cedula: '',
    materias: [],
    documentacion: false,
})

let profesores = ref([])
let subject = ref([])

const addMateria = () => {
    profesor.value.materias.push(subject)
    subject = "";
}

const eliminarMateria = (index) => {
    console.log(index)
    profesor.value.materias.splice(index, 1);
}

const addProfesor = () => {
    profesores.value.push(
        {
            nombre: profesor.value.nombre,
            apellido: profesor.value.apellido,
            cedula: profesor.value.cedula,
            materias: profesor.value.materias,
            documentacion: profesor.value.documentacion,
        }
    )
    profesor.value.nombre = ""
    profesor.value.apellido = ""
    profesor.value.cedula = ""
    profesor.value.materias = []
    profesor.value.documentacion = false
}
</script>


<style scoped></style>