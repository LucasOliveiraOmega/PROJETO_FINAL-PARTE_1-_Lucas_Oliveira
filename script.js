
const API_USUARIOS = 'https://jsonplaceholder.typicode.com/users';

const CHAVE_SESSAO = 'fatec_usuario_sessao';

const el = {

  telaLogin: document.getElementById('telaLogin'),
  telaGaleria: document.getElementById('telaGaleria'),

  formLogin: document.getElementById('formLogin'),
  loginUsuario: document.getElementById('loginUsuario'),
  loginSenha: document.getElementById('loginSenha'),
  botaoEntrar: document.getElementById('botaoEntrar'),
  textoBotaoEntrar: document.getElementById('textoBotaoEntrar'),
  spinnerEntrar: document.getElementById('spinnerEntrar'),
  mensagemLogin: document.getElementById('mensagemLogin'),
  btnToggleSenha: document.getElementById('btnToggleSenha'),
  iconeOlho: document.getElementById('iconeOlho'),
  btnPreencherTeste: document.getElementById('btnPreencherTeste'),

  nomeUsuarioLogado: document.getElementById('nomeUsuarioLogado'),
  infoNome: document.getElementById('infoNome'),
  infoUsername: document.getElementById('infoUsername'),
  infoEmail: document.getElementById('infoEmail'),
  botaoSair: document.getElementById('botaoSair'),
  btnVoltarLogin: document.getElementById('btnVoltarLogin')
};

/**
 * 
 * @param {string} texto 
 * @param {'danger'|'warning'|'success'|'info'} tipo
 */
function exibirMensagem(texto, tipo = 'danger') {
  if (!texto) {
    el.mensagemLogin.className = 'alert d-none';
    el.mensagemLogin.textContent = '';
    return;
  }
  el.mensagemLogin.textContent = texto;
  el.mensagemLogin.className = `alert alert-${tipo} show shadow-sm`;
}

/**
 * 
 * @param {boolean} carregando 
 */
function definirCarregando(carregando) {
  el.botaoEntrar.disabled = carregando;
  el.loginUsuario.disabled = carregando;
  el.loginSenha.disabled = carregando;

  if (carregando) {
    el.textoBotaoEntrar.textContent = 'Verificando...';
    el.spinnerEntrar.classList.remove('d-none');
  } else {
    el.textoBotaoEntrar.textContent = 'Entrar';
    el.spinnerEntrar.classList.add('d-none');
  }
}

/**
 * 
 * @param {Event} evento 
 * 
 */
async function validarLogin(evento) {
  evento.preventDefault();
  exibirMensagem(''); 

  const usuarioDigitado = el.loginUsuario.value.trim();
  const senhaDigitada = el.loginSenha.value.trim();

  // 
  if (!usuarioDigitado || !senhaDigitada) {
    exibirMensagem('Por favor, preencha os campos de usuário e senha.', 'warning');
    if (!usuarioDigitado) {
      el.loginUsuario.focus();
    } else {
      el.loginSenha.focus();
    }
    return;
  }

  definirCarregando(true);

  try {
 
      const resposta = await fetch(API_USUARIOS, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!resposta.ok) {
      throw new Error(`Erro na resposta da API (HTTP ${resposta.status})`);
    }

    const usuarios = await resposta.json();

     const usuarioEncontrado = usuarios.find((u) => 
      u.username && u.username.trim().toLowerCase() === usuarioDigitado.toLowerCase()
    );

    const credenciaisValidas = usuarioEncontrado && 
      usuarioEncontrado.email && 
      usuarioEncontrado.email.trim().toLowerCase() === senhaDigitada.toLowerCase();

    if (credenciaisValidas) {
     
      permitirAcessoGaleria(usuarioEncontrado);
    } else {
 
      exibirMensagem('Usuário ou senha incorretos. Verifique suas credenciais e tente novamente.', 'danger');
      el.loginSenha.value = '';
      el.loginSenha.focus();
    }

  } catch (erro) {
  
    console.error('Erro na autenticação:', erro);
    exibirMensagem('Não foi possível conectar à API de validação. Verifique sua conexão com a internet.', 'danger');
  } finally {
    definirCarregando(false);
  }
}

/**
 * 
 * @param {Object} usuario 
 */
function permitirAcessoGaleria(usuario) {
  
  sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario));

  el.nomeUsuarioLogado.textContent = usuario.username;
  el.infoNome.textContent = usuario.name || 'Não informado';
  el.infoUsername.textContent = usuario.username;
  el.infoEmail.textContent = usuario.email;

  el.telaLogin.classList.add('d-none');
  el.telaGaleria.classList.remove('d-none');

  el.formLogin.reset();
  exibirMensagem('');
}

function sairEVoltarAoLogin() {
  sessionStorage.removeItem(CHAVE_SESSAO);

  
  el.telaGaleria.classList.add('d-none');
  el.telaLogin.classList.remove('d-none');

  el.formLogin.reset();
  exibirMensagem('Você saiu com sucesso. Faça login novamente para acessar.', 'info');
  el.loginUsuario.focus();
}

function alternarSenha() {
  const tipoAtual = el.loginSenha.getAttribute('type');
  if (tipoAtual === 'password') {
    el.loginSenha.setAttribute('type', 'text');
    el.iconeOlho.className = 'bi bi-eye-slash';
    el.btnToggleSenha.setAttribute('title', 'Ocultar senha');
  } else {
    el.loginSenha.setAttribute('type', 'password');
    el.iconeOlho.className = 'bi bi-eye';
    el.btnToggleSenha.setAttribute('title', 'Mostrar senha');
  }
}

function preencherDadosTeste() {
  el.loginUsuario.value = 'Bret';
  el.loginSenha.value = 'Sincere@april.biz';
  exibirMensagem('');
  el.botaoEntrar.focus();
}

function verificarSessao() {
  const dados = sessionStorage.getItem(CHAVE_SESSAO);
  if (dados) {
    try {
      const usuario = JSON.parse(dados);
      if (usuario && usuario.username) {
        permitirAcessoGaleria(usuario);
        return;
      }
    } catch (e) {
      sessionStorage.removeItem(CHAVE_SESSAO);
    }
  }
 
  el.telaLogin.classList.remove('d-none');
  el.telaGaleria.classList.add('d-none');
}

document.addEventListener('DOMContentLoaded', () => {
  
  el.formLogin.addEventListener('submit', validarLogin);

  el.btnToggleSenha.addEventListener('click', alternarSenha);

  el.btnPreencherTeste.addEventListener('click', preencherDadosTeste);

  el.botaoSair.addEventListener('click', sairEVoltarAoLogin);

  el.btnVoltarLogin.addEventListener('click', sairEVoltarAoLogin);

  verificarSessao();
});
