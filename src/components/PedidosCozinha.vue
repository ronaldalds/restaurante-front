<template>
  <div class="min-h-screen flex flex-col">
    <h1 class="text-4xl font-bold mb-4 text-center mt-4">-----------</h1>

    <div class="flex-1 flex flex-col justify-center items-center">
      <div v-if="filteredPedidos.length === 0" class="flex items-center justify-center flex-grow">
        <p class="text-gray-500 text-4xl">Nenhum pedido encontrado.</p>
      </div>

      <div 
        v-else 
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-7xl p-6"
      >
        <div 
          v-for="pedido in filteredPedidos" 
          :key="pedido.id" 
          class="border rounded-lg p-4 flex flex-col justify-between shadow-lg transition duration-300" 
          :class="{
            'bg-red-100 shadow-red-400': pedido.status === 'fila',
            'bg-yellow-100 shadow-yellow-400': pedido.status === 'preparando',
            'bg-green-100 shadow-green-400': pedido.status === 'pronto'
          }"
        >
          <h2 class="text-lg font-semibold">Pedido ID: {{ pedido.id }}</h2>
          <p><strong>Nome:</strong> {{ pedido.nome }}</p>
          <p><strong>Observação:</strong> {{ pedido.observacao }}</p>
          <p><strong>Status:</strong> {{ pedido.status }}</p>

          <h3 class="mt-4 font-semibold">Itens do Pedido:</h3>
          <ul class="list-disc ml-6">
            <li v-if="!pedido.pedido || pedido.pedido.length === 0">
              Nenhum item no pedido.
            </li>
            <li v-for="item in pedido.pedido" :key="item.produto" class="text-gray-700">
              {{ item.produto }} - Quantidade: {{ item.quantidade }}
            </li>
          </ul>

          <div class="mt-4 flex flex-wrap gap-2">
            <button 
              class="flex-1 min-w-[120px] bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition duration-200" 
              @click="atualizarStatus(pedido.id, 'preparando')"
            >
              Preparar
            </button>
            <button 
              class="flex-1 min-w-[120px] bg-green-500 text-white px-4 py-2 rounded shadow-md hover:bg-green-600 transition duration-200" 
              @click="atualizarStatus(pedido.id, 'pronto')"
            >
              Pronto
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import instance from '../utils/axios';
import { globalEnv } from '../core/config';
export default {
  data() {
    return {
      pedidos: [], // Inicializa como um array vazio
      audio: null,
    };
  },
  computed: {
    filteredPedidos() {
      return this.pedidos.filter(pedido => 
        ['fila', 'preparando'].includes(pedido.status) // Exclui "pronto" da exibição
      );
    }
  },
  methods: {
    async loadPedidos() {
      try {
        // Requisição de login com axios e credenciais incluídas
        console.log(instance)
        const response = await instance.get(
          '/restaurante/atualizar/status/',
          { withCredentials: true}
        );
        if (response.status === 200) {
          console.log(response.data)
          this.pedidos = response.data;
          localStorage.setItem('pedidos', JSON.stringify(this.pedidos));
          // Emitir o evento de autenticação bem-sucedida para o componente pai
        }
      } catch (error) {
        this.error = 'Erro ao carregada pedidos';
      }
    },
    connectWebSocket() {

    const ws = new WebSocket(`${globalEnv.wsUrl}/ws/novos_pedidos/`);

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        const oldPedidosCount = this.pedidos.length;
        const newPedidos = response.message;
        this.pedidos = newPedidos;
        
        // Tocar som se houver novos pedidos
        if (newPedidos.length > oldPedidosCount) {
          this.playNotificationSound();
          this.showNotification('Novo pedido recebido!');
        }
        
        localStorage.setItem('pedidos', JSON.stringify(this.pedidos));
      };

      ws.onopen = () => {
        console.log('Conectado ao WebSocket');
      };

      ws.onclose = () => {
        console.log('WebSocket desconectado, tentando reconectar...');
        setTimeout(() => this.connectWebSocket(), 1000);
      };

      ws.onerror = (error) => {
        console.error('Erro no WebSocket', error);
      };
    },
    async atualizarStatus(pedidoId, status_pedido) {
      try {
        const response = await instance.post('/restaurante/atualizar/status/', {
          id: pedidoId,
          status: status_pedido,
        }
      );

        console.log('Status atualizado:', response.data);

        // Remove o pedido do array se o status for "pronto"
        if (status_pedido === 'pronto') {
          this.pedidos = this.pedidos.filter(pedido => pedido.id !== pedidoId);
        }
      } catch (error) {
        console.error('Erro ao atualizar o status:', error);
      }
    },
    playNotificationSound() {
      if (this.audio) {
        this.audio.play();
      }
    },
    handleWebSocketMessage(event) {
      try {
        const response = JSON.parse(event.data);
        const oldPedidosCount = this.pedidos.length;
        this.pedidos = response.message;
        
        // Tocar som se houver novos pedidos
        if (this.pedidos.length > oldPedidosCount) {
          this.playNotificationSound();
          this.showNotification('Novo pedido recebido!');
        }
        
        localStorage.setItem('pedidos', JSON.stringify(this.pedidos));
        this.isLoading = false;
      } catch (error) {
        this.handleWebSocketError(error);
      }
    },
    showNotification(message) {
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Cozinha', {
              body: message,
              icon: '/icon.png' // Adicione um ícone apropriado
            });
          }
        });
      }
    },
  },
  mounted() {
    // Carrega os pedidos do localStorage ao montar o componente
    const storedPedidos = JSON.parse(localStorage.getItem('pedidos'));
    if (storedPedidos) {
      this.pedidos = storedPedidos;
    }
    this.loadPedidos();
    this.connectWebSocket();
    this.audio = new Audio('/notification-sound.mp3'); // Adicione um som apropriado
  },
};
</script>

<style scoped>
/* Adicione seu estilo aqui, se necessário */
</style>
