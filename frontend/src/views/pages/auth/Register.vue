<script setup>
import { ref } from 'vue'
import { useAuth } from '../../../composables/useAuth'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const { register, error, loading } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')

const handleRegister = async () => {
  if (!name.value || !email.value || !password.value) return
  await register(name.value, email.value, password.value)
}
</script>

<template>
  <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
    <div class="flex flex-col items-center justify-center">
      <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
        <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
          <div class="text-center mb-8">
            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Crear Cuenta</div>
            <span class="text-muted-color font-medium">Regístrate para acceder</span>
          </div>

          <p v-if="error" class="text-red-500 text-center mb-4">{{ error }}</p>

          <div>
            <label class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Nombre</label>
            <InputText v-model="name" type="text" placeholder="Nombre completo" class="w-full md:w-[30rem] mb-8" />

            <label class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
            <InputText v-model="email" type="email" placeholder="Email" class="w-full md:w-[30rem] mb-8" />

            <label class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
            <Password v-model="password" placeholder="Contraseña" :toggleMask="true" class="mb-4" fluid :feedback="false" @keyup.enter="handleRegister" />

            <Button label="Registrarse" class="w-full mb-3" @click="handleRegister" :loading="loading" />
            <Button label="Ya tengo cuenta" class="w-full" severity="secondary" as="router-link" to="/" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
