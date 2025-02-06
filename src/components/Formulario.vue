<template>
    <input type="text" v-model="campoTexto">
    <input type="checkbox" name="" id="" v-model="agree"> Acepto los términos y condiciones
    {{ campoTexto }} <br>
    {{ agree }} <br>
    {{ fruta }}
    <select v-model="fruta">
        <option value="Mango">Mango</option>
        <option value="Manzana">Manzana</option>
        <option value="Pera">Pera</option>
        <option value="Sandia">Sandia</option>
        <option value="Maracuyá">Maracuyá</option>
    </select>


</template>


<script setup>
import { ref } from 'vue';

let campoTexto = ref('')
let agree = ref(true)
let fruta = ref(Mango)


</script>



<style scoped>
input {
    display: block;
    border-radius: 5px;
}
</style>
