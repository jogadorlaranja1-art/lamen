function filtrarItensCustom() {
    const input = document.getElementById('campoBuscaCustom');
    const termo = input.value.toLowerCase().trim();
    const lista = document.getElementById('listaResultadosCustom');
    const itens = lista.getElementsByTagName('li');

    // Se não houver nada digitado, esconde a lista imediatamente
    if (termo === '') {
      lista.style.setProperty('display', 'none', 'important');
      return;
    }

    let temResultado = false;

    for (let i = 0; i < itens.length; i++) {
      const textoItem = itens[i].textContent.toLowerCase();
      if (textoItem.includes(termo)) {
        itens[i].style.setProperty('display', 'block', 'important');
        temResultado = true;
      } else {
        itens[i].style.setProperty('display', 'none', 'important');
      }
    }

    // Só exibe a caixa branca se encontrar algum item correspondente
    if (temResultado) {
      lista.style.setProperty('display', 'block', 'important');
    } else {
      lista.style.setProperty('display', 'none', 'important');
    }
  }

  const dadosPedido = {
    usuario: {
      idUsuario: 1,
      nome: "Rafael Oliveira",
      email: "rafael@email.com"
    },
    enderecoEntrega: {
      cep: "30140-071",
      rua: "Rua Santa Rita Durão",
      numero: "1300",
      bairro: "Savassi",
      cidade: "Belo Horizonte"
    },
    pedido: {
      idPedido: 101,
      idUsuario: 1,
      status: "Recebido",
      itens: [
        { id: 1, produto: "Lámen Tradicional", quantidade: 1, preco: 29.90 },
        { id: 4, produto: "Bebidas Refrescantes", quantidade: 2, preco: 6.90 }
      ],
      valorTotal: 43.70
    }
  };
  
  // 2. Função para transformar em arquivo JSON e enviar para o C#
  async function enviarArquivoPedidoParaCSharp() {
    // Converte o objeto JS para texto JSON formatado
    const jsonString = JSON.stringify(dadosPedido, null, 2);
  
    // Cria um arquivo virtual (.json) na memória do navegador
    const arquivoJson = new Blob([jsonString], { type: "application/json" });
  
    // Empacota o arquivo em um FormData (como se fosse um <input type="file">)
    const formData = new FormData();
    formData.append("arquivoPedido", arquivoJson, `pedido_${dadosPedido.pedido.idPedido}.json`);
  
    try {
      // Envia para a sua rota no C# (ajuste a URL conforme o seu projeto)
      const resposta = await fetch("https://localhost:7001/api/pedido/upload", {
        method: "POST",
        body: formData
      });
  
      if (resposta.ok) {
        const resultado = await resposta.json();
        console.log("Sucesso:", resultado);
        alert("Pedido enviado com sucesso!");
      } else {
        console.error("Erro no servidor C#:", resposta.statusText);
      }
    } catch (erro) {
      console.error("Falha na requisição:", erro);
    }
  }

  const CHAVE_CARRINHO = 'pedidosLamen';

  document.addEventListener('DOMContentLoaded', () => {
    atualizarContadorTopo();
    carregarPedidosNaTela();
  });
  
  // Chame esta função nos botões da sua OUTRA página (ex: produtos.html)
  function selecionarProduto(nome, preco) {
    let carrinho = JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
  
    const itemExistente = carrinho.find(item => item.nome === nome);
  
    if (itemExistente) {
      itemExistente.quantidade += 1;
    } else {
      carrinho.push({ nome: nome, preco: preco, quantidade: 1 });
    }
  
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
    atualizarContadorTopo();
    alert(`${nome} selecionado!`);
  }
  
  function atualizarContadorTopo() {
    const contador = document.getElementById('contador-topo');
    if (!contador) return;
  
    const carrinho = JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
    const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
    contador.innerText = totalItens;
  }
  
  function carregarPedidosNaTela() {
    const container = document.getElementById('lista-pedidos-feitos');
    const areaTotal = document.getElementById('area-total');
    const totalSpan = document.getElementById('valor-total');
  
    if (!container) return;
  
    const pedidosSalvos = JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
  
    // Se ninguém selecionou nada na outra página, não mostra nenhum card
    if (pedidosSalvos.length === 0) {
      container.innerHTML = '<p style="color: #666;">Nenhum pedido selecionado ainda.</p>';
      if (areaTotal) areaTotal.style.display = 'none';
      return;
    }
  
    // Se houver itens selecionados, cria os cards apenas para eles
    container.innerHTML = '';
    if (areaTotal) areaTotal.style.display = 'block';
    let somaTotal = 0;
  
    pedidosSalvos.forEach((pedido, index) => {
      const subtotal = pedido.preco * pedido.quantidade;
      somaTotal += subtotal;
  
      container.innerHTML += `
        <div class="card-pedido">
          <h3>${pedido.nome}</h3>
          <p>Quantidade: <strong>${pedido.quantidade}x</strong></p>
          <p class="preco">R$ ${subtotal.toFixed(2).replace('.', ',')}</p>
          <button class="btn-remover" onclick="removerItem(${index})">Remover</button>
        </div>
      `;
    });
  
    if (totalSpan) {
      totalSpan.innerText = somaTotal.toFixed(2).replace('.', ',');
    }
  }
  
  function removerItem(index) {
    let carrinho = JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
    carrinho.splice(index, 1);
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
    
    atualizarContadorTopo();
    carregarPedidosNaTela();
  }
  
  function limparCarrinho() {
    localStorage.removeItem(CHAVE_CARRINHO);
    atualizarContadorTopo();
    carregarPedidosNaTela();
  }
  
  function finalizarPedido() {
    alert('Pedido finalizado com sucesso!');
    limparCarrinho();
  }

  async function finalizarPedido() {
    const carrinho = JSON.parse(localStorage.getItem('pedidosLamen')) || [];
  
    if (carrinho.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }
  
    // Substitua 5045 pela porta que aparece no seu launchSettings.json
    const urlApiCSharp = 'http://localhost:5045/api/pedidos';
  
    try {
      const resposta = await fetch(urlApiCSharp, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(carrinho) // Envia o JSON automaticamente
      });
  
      if (resposta.ok) {
        const dados = await resposta.json();
        alert(dados.mensagem); // Mostra "Pedido recebido com sucesso no C#!"
        limparCarrinho();
      } else {
        alert('O C# recusou o pedido. Verifique o console.');
      }
    } catch (erro) {
      console.error('Erro de conexão:', erro);
      alert('Não foi possível conectar ao C#. Verifique se o projeto C# está rodando.');
    }
  }