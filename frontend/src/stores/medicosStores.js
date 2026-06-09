import {defineStore} from 'pinia'
import {ref} from 'vue'
import {api} from '../service/api'

export const useMedicosStore = defineStore('medicos', () => {
    const medicos = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchMedicos = async() => {
        loading.value = true;
        error.value = null
        try{
            const response = await api.get('/medicos');
            medicos.value = response.data;
        }catch(err){
            error.value = err.response?.data?.message || err.message || 'Error desconocido';
        }finally{
            loading.value = false
        }
    }

    return{medicos, loading, error, fetchMedicos}
})