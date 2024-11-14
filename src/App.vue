<template>
  <div v-if="isAuthenticated" id="app" class="flex h-screen" :class="{'dark-mode': config.modoDark}">
    <!-- ASIDE com sanfona -->
    <aside
      :class="[
        config.isAsideCollapsed ? 'w-20' : 'w-64',
        'bg-gray-900 text-white transition-all duration-300 flex flex-col fixed h-screen'
      ]"
    >
      <div class="flex items-center justify-between p-4">
        <h1 v-if="!config.isAsideCollapsed" class="text-2xl font-bold">Pedidos</h1>
        <button
          @click="toggleAside"
          class="p-2 bg-teal-500 rounded-full hover:bg-teal-400 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="config.isAsideCollapsed ? 'M19 12H5' : 'M12 5v14m7-7H5'"
            />
          </svg>
        </button>
      </div>

      <div class="flex-grow p-4 space-y-4">
        <button
          @click="setTelaAtiva('cozinha')"
          :class="{'bg-teal-500': config.telaAtiva === 'cozinha'}"
          class="w-full p-3 rounded-lg hover:bg-teal-400 transition flex items-center space-x-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 10h11M9 21V3m0 0l-6 6m6-6l6 6"
            />
          </svg>
          <span v-if="!config.isAsideCollapsed">Cozinha</span>
        </button>

        <button
          @click="setTelaAtiva('entregador')"
          :class="{'bg-teal-500': config.telaAtiva === 'entregador'}"
          class="w-full p-3 rounded-lg hover:bg-teal-400 transition flex items-center space-x-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m0-4h.01M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2h-2m-4 0H7a2 2 0 01-2-2v-8a2 2 0 012-2h2m4-4v16"
            />
          </svg>
          <span v-if="!config.isAsideCollapsed">Entregador</span>
        </button>
      </div>

      <div class="p-4 flex justify-center">
  <button
    @click="handleLogout"
    class="px-6 py-3 bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold rounded-full shadow-lg transform hover:scale-105 hover:from-teal-400 hover:to-green-400 transition duration-300 ease-in-out active:scale-95"
  >
    Sair
  </button>
</div>

    </aside>

      <main
      :class="[
        'flex-grow flex flex-col transition-colors duration-300',
        config.isAsideCollapsed ? 'ml-20' : 'ml-64',
        config.modoDark ? 'bg-black' : 'bg-gray-100'
      ]"
    >
    <div class="flex-1 flex justify-center items-start overflow-auto">
      <PedidosCozinha v-if="config.telaAtiva === 'cozinha'" />
      <PedidosEntregador v-else-if="config.telaAtiva === 'entregador'" />
    </div>
    </main>
  </div>
  <div v-else class="flex items-center justify-center h-screen">
    <LoginComponent @login-success="handleLoginSuccess" />
  </div>
</template>

<script>
import instance from './utils/axios';
import PedidosCozinha from './components/PedidosCozinha.vue';
import PedidosEntregador from './components/PedidosEntregador.vue';
import LoginComponent from './components/Login.vue';

export default {
  components: {
    PedidosCozinha,
    PedidosEntregador,
    LoginComponent,
  },
  data() {
    return {
      config: this.loadConfig(),
      isAuthenticated: false,
      // isAuthenticated: this.checkAuth(),
    };
  },
  mounted() {
    // Verifica a presença do cookie 'sessionid' ao montar o componente
    this.validadeLogin()
  },
  methods: {
    async validadeLogin() {
      try {
        // Requisição de login com axios e credenciais incluídas
      const response = await instance.get(
        '/restaurante/validate-session/',
        // { withCredentials: true}
      );
      if (response.status === 200) {
        console.log(response.data)
        // Emitir o evento de autenticação bem-sucedida para o componente pai
        this.isAuthenticated = true;
      } else {
        this.isAuthenticated = false;
      }
    } catch (error) {
      this.error = 'Erro ao fazer login';
    }
    },
    checkAuth() {
      // Verifica se o cookie 'sessionid' está presente
      return document.cookie.split(';').some((item) => item.trim().startsWith('sessionid'));
    },
    handleLoginSuccess() {
      // Atualiza a autenticação após o login bem-sucedido
      this.isAuthenticated = true;
      localStorage.setItem("isAuthenticated", this.isAuthenticated)
    },
    setTelaAtiva(tela) {
      this.config.telaAtiva = tela;
      this.saveConfig();
    },
    toggleAside() {
      this.config.isAsideCollapsed = !this.config.isAsideCollapsed;
      this.saveConfig();
    },
    async handleLogout() {
      try {
        // Requisição de login com axios e credenciais incluídas
        const response = await instance.get(
          '/restaurante/logout/',
          { withCredentials: true}
        );
        if (response.status === 200) {
          this.isAuthenticated = false;
      } else {
        this.isAuthenticated = true;
      }
    } catch (error) {
      this.isAuthenticated = false;
      this.error = 'Erro ao fazer logout';
    }
    },
    loadConfig() {
      const savedConfig = localStorage.getItem('appConfig');
      return savedConfig
        ? JSON.parse(savedConfig)
        : { isAsideCollapsed: false, modoDark: false, telaAtiva: 'cozinha' };
    },
    saveConfig() {
      localStorage.setItem('appConfig', JSON.stringify(this.config));
    },
  },
  // watch: {
    // isAuthenticated(newValue) {
    //   if (!newValue) {
    //     // Redireciona para a tela de login se não estiver autenticado
    //     this.$router.push({ name: 'login' });
    //   }
    // },
  // },
  created() {
    this.isAuthenticated = this.checkAuth();
  },
};
</script>
