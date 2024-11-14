<template>
  <div class="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
    <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-96">
      <h2 class="text-2xl font-bold mb-4 text-center">Login</h2>
      <form @submit.prevent="login">
        <div class="mb-4">
          <label for="username" class="block text-gray-700 dark:text-gray-200">Usuário</label>
          <input
            type="text"
            id="username"
            v-model="username"
            class="w-full p-2 mt-1 border rounded"
            required
          />
        </div>
        <div class="mb-6">
          <label for="password" class="block text-gray-700 dark:text-gray-200">Senha</label>
          <input
            type="password"
            id="password"
            v-model="password"
            class="w-full p-2 mt-1 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          class="w-full bg-teal-500 text-white py-2 rounded hover:bg-teal-600 transition"
        >
          Entrar
        </button>
      </form>
      <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import instance from '../utils/axios';

export default {
  data() {
    return {
      username: '',
      password: '',
      error: '',
    };
  },
  methods: {
    async login() {
      try {
        // Requisição de login com axios e credenciais incluídas
        const response = await instance.post(
          '/restaurante/login/',
          { username: this.username, password: this.password },
          { withCredentials: true}
        );

        if (response.status === 200) {
          // Emitir o evento de autenticação bem-sucedida para o componente pai
          this.$emit('login-success');
        } else {
          this.error = 'Usuário ou senha incorretos';
        }
      } catch (error) {
        this.error = 'Erro ao fazer login';
      }
    },
  },
};
</script>

<style scoped>
/* Estilos opcionais para o login */
</style>
