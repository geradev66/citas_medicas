import {defineStore} from "pinia";
import {ref} from "vue";
import {api} from "../service/api";

export const useAreasStore = defineStore('areas', () => {
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

    return {areas, loading, error, fetchAreas}
})

