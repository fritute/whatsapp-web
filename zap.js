document.addEventListener('DOMContentLoaded', function() {
    const listaConversas = document.getElementById('conversationList')
    const areaMensagens = document.getElementById('messages')
    const cabecalhoChat = document.getElementById('currentChat')
    
    const URL_BASE = 'https://giovanna-whatsapp.onrender.com/v1/whatsapp'
    const MEU_NUMERO = '11987876567'
    
    function criarElemento(tipo, classe = '') {
        const elemento = document.createElement(tipo)
        if (classe) elemento.className = classe
        return elemento
    }
    
    async function carregarContatos() {
        try {
            const resposta = await fetch(`${URL_BASE}/contatos/${MEU_NUMERO}`)
            
            if (!resposta.ok) {
                throw new Error(`Erro HTTP: ${resposta.status}`)
            }
            
            const dados = await resposta.json()
            
            if (!dados.dados_contato || !Array.isArray(dados.dados_contato)) {
                throw new Error('Formato de dados inválido')
            }
            
            exibirContatos(dados.dados_contato)
        } catch (erro) {
            const elementoErro = criarElemento('div', 'error')
            listaConversas.appendChild(elementoErro)
        }
    }
    
    function exibirContatos(contatos) {
        while (listaConversas.firstChild) {
            listaConversas.removeChild(listaConversas.firstChild)
        }
        
        contatos.forEach(contato => {
            const itemContato = criarElemento('div', 'conversation-item')
            
            const containerContato = criarElemento('div', 'contact-container')
            
            if (contato.profile) {
                const imagem = criarElemento('img', 'contact-img')
                imagem.src = contato.profile
                imagem.alt = contato.name
                containerContato.appendChild(imagem)
            }
            
            const containerTexto = criarElemento('div', 'contact-text')
            
            const nomeContato = criarElemento('div', 'contact-name')
            nomeContato.textContent = contato.name
            containerTexto.appendChild(nomeContato)
            
            if (contato.description) {
                const descricao = criarElemento('div', 'contact-desc')
                descricao.textContent = contato.description
                containerTexto.appendChild(descricao)
            }
            
            containerContato.appendChild(containerTexto)
            itemContato.appendChild(containerContato)
            
            itemContato.addEventListener('click', () => selecionarContato(contato))
            listaConversas.appendChild(itemContato)
        })
    }
    
    async function selecionarContato(contato) {
        try {
            contatoAtual = contato
            cabecalhoChat.textContent = contato.name
            
            const resposta = await fetch(`${URL_BASE}/conversas?numero=${MEU_NUMERO}&contato=${encodeURIComponent(contato.name)}`)
            
            if (!resposta.ok) {
                throw new Error(`Erro HTTP: ${resposta.status}`)
            }
            
            const dados = await resposta.json()
            
            if (!dados.conversas || dados.conversas.length === 0) {
                exibirMensagens([])
                return
            }
            
            const conversa = dados.conversas.find(c => c.name === contato.name)
            exibirMensagens(conversa ? conversa.conversas : [])
        } catch (erro) {
            console.error('Erro ao carregar mensagens:', erro)
            const elementoErro = criarElemento('div', 'error')
            elementoErro.textContent = 'Erro ao carregar mensagens. Verifique o console.'
            areaMensagens.appendChild(elementoErro)
        }
    }
    
    function exibirMensagens(mensagens) {
        while (areaMensagens.firstChild) {
            areaMensagens.removeChild(areaMensagens.firstChild)
        }
        
        if (!mensagens || mensagens.length === 0) {
            const mensagemVazia = criarElemento('div', 'empty-message')
            mensagemVazia.textContent = 'Nenhuma mensagem ainda'
            areaMensagens.appendChild(mensagemVazia)
            return
        }
        
        mensagens.forEach(msg => {
            const enviada = msg.sender === 'me' || msg.sender === MEU_NUMERO
            const elementoMensagem = criarElemento('div', `message ${enviada ? 'sent' : 'received'}`)
            
            const conteudoMensagem = criarElemento('div', 'message-content')
            conteudoMensagem.textContent = msg.content
            
            const horarioMensagem = criarElemento('div', 'message-time')
            horarioMensagem.textContent = msg.time
            
            elementoMensagem.append(conteudoMensagem, horarioMensagem)
            areaMensagens.appendChild(elementoMensagem)
        })
        
        areaMensagens.scrollTop = areaMensagens.scrollHeight
    }
    
    
    carregarContatos()
})