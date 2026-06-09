import {ref} from "vue";
import {api} from "../service/api";

export function useMedicos(){

    const medicos = ref([]);
    const loading = ref(false);
    const error = ref(null)

    const fetchMedicos = async() =>{
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

    const createMedico = async(medico) =>{
        loading.value = true;
        error.value = null 
        try{
            const response = await api.post('/medicos', medico);
            medicos.value.push(response.data);
        }catch(err){
            error.value = err.response?.data?.message || err.message || 'Error desconocido';
        }finally{
            loading.value = false
        }
        
    }

    const updateMedico = async(medico) => {
        loading.value = true;
        error.value = null
        try{
            const response = await api.put(`/medicos/${medico._id}`, medico);
            medicos.value[medicos.value.findIndex(m => m._id === medico._id)] = response.data;
        }catch(err){
            error.value = err.response?.data?.message || err.message || 'Error desconocido';
        }finally{
            loading.value = false
        }
    }

    const deleeMedico = async(medico) => {
        loading.value = true;
        error.value = null
        try{
            await api.delete(`/medicos/${medico._id}`);
            medicos.value = medicos.value.filter(m => m._id !== medico._id);
        }catch(err){
            error.value = err.response?.data?.message || err.message || 'Error desconocido';
        }finally{
            loading.value = false
        }
    }

    return {medicos, loading, error, fetchMedicos, createMedico, updateMedicos: updateMedico, deleteMedico: deleeMedico};
}