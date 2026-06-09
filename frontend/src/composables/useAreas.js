import {ref} from "vue";
import {api} from "../service/api";

export function useAreas(){

    const areas = ref([]);
    const loading = ref(false);
    const error = ref(null)

    const fetchAreas = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.get('/areas');
            areas.value = response.data;
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Error desconocido';
        } finally {
            loading.value = false;
        }
    }

    const createArea = async (area) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.post('/areas', area);
            areas.value.push(response.data);
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Error desconocido';
        } finally {
            loading.value = false;
        }
    }

    const updateAreas = async (area) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.put(`/areas/${area._id}`, area);
            areas.value[areas.value.findIndex(a => a._id === area._id)] = response.data;
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Error desconocido';
        } finally {
            loading.value = false;
        }
    }


    const deleteArea = async (area) => {
        loading.value = true;
        error.value = null;
        try {
            await api.delete(`/areas/${area._id}`);
            areas.value = areas.value.filter(a => a._id !== area._id);
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Error desconocido';
        } finally {
            loading.value = false;
        }
    }

    return {areas, loading, error, fetchAreas, createArea, updateAreas, deleteArea};

}