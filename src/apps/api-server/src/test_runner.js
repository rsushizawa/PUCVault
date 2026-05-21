const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// --- CONFIGURAÇÕES DE AMBIENTE ---
const envPath = path.resolve(__dirname, '../src/.env');
require('dotenv').config({ path: envPath });

const BASE_URL = "http://localhost:8000";
const TOKEN_FILE = path.join(__dirname, '.token_cache');
const passAccess = process.env.JWT_SECRET || "fallback_secret";

let globalToken = fs.existsSync(TOKEN_FILE) ? fs.readFileSync(TOKEN_FILE, 'utf8') : "";
const rl = readline.createInterface({ input, output });

// --- CORES ANSI ---
const RESET = "\x1b[0m";
const VERDE = "\x1b[32m";    // Sucesso real (2xx)
const LARANJA = "\x1b[33m";  // Regras de Negócio / Erros do Cliente (400)
const VERMELHO = "\x1b[31m"; // Erros Críticos do Servidor (5xx)
const CIANO = "\x1b[36m";    // Informativos

// --- FUNÇÕES AUXILIARES ---
const ask = async (question) => {
  const answer = await rl.question(`   ${CIANO}${question}${RESET}`);
  return answer.trim();
};

// --- ENGINE CENTRAL DE TESTE FORMATADO ---
const executeTest = async (funcName, urlPath, method = 'GET', body = null, useAuth = false) => {
  console.log(`\ntestando ${funcName}....`);

  const start = Date.now();
  let headers = { 'Content-Type': 'application/json' };

  if (useAuth) {
    headers['Authorization'] = `Bearer ${globalToken}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${urlPath}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });

    const duration = Date.now() - start;
    const data = await res.json().catch(() => ({}));

    let statusExibido = res.status;
    let msg = data.message || data.error || JSON.stringify(data);
    let cor = VERDE;

    // 🕵️ DETECÇÃO DA ESTRUTURA ENVELOPADA DO HELPER 'PAGINATED' (Status 400 dentro de HTTP 200)
    const ehErroEnvelopado = (res.status === 200 && data && (data.status === 400 || data.data === 400));

    if (ehErroEnvelopado) {
      statusExibido = 400; // Altera virtualmente no log do terminal para 400
      msg = data.total || data.message || "Erro de validação de regra de negócio";
      cor = LARANJA;
    } else if (res.status >= 400 && res.status < 500) {
      cor = LARANJA;
    } else if (res.status >= 500) {
      cor = VERMELHO;
    }

    if (data.token) {
      globalToken = data.token;
      fs.writeFileSync(TOKEN_FILE, globalToken);
    }

    // Truncagem inteligente para listagens limpas e sem poluição visual no terminal
    if (!ehErroEnvelopado && msg.length > 120) {
      if (Array.isArray(data.rows) || Array.isArray(data.data) || Array.isArray(data)) {
        const totalItens = (data.rows || data.data || data).length;
        msg = `Listagem realizada com sucesso [${totalItens} itens retornados]`;
      } else {
        msg = msg.substring(0, 110) + "... [Dados Omitidos]";
      }
    }

    console.log(`${cor}teste ${funcName} concluída (${duration}ms): [${statusExibido}] [mensagem: '${msg}']${RESET}`);
    return { status: statusExibido, data };

  } catch (err) {
    const duration = Date.now() - start;
    console.log(`${VERMELHO}teste ${funcName} concluída (${duration}ms): [500] [mensagem: 'Erro de Conexão: ${err.message}']${RESET}`);
    return { status: 500, data: { error: err.message } };
  }
};

// --- DUMP DE DADOS (PRE-FETCH PARA PARÂMETROS) ---
const fetchListings = async (endpoint) => {
  try {
    const headers = globalToken ? { 'Authorization': `Bearer ${globalToken}` } : {};
    const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
    const data = await res.json();

    if (res.status !== 200) return [];

    if (Array.isArray(data)) return data;
    if (data.rows && Array.isArray(data.rows)) return data.rows;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.foruns && Array.isArray(data.foruns)) return data.foruns;
    if (data.usuarios && Array.isArray(data.usuarios)) return data.usuarios;

    return [];
  } catch {
    return [];
  }
};

// --- INTERAÇÃO E RESUMO DE DADOS DISPONÍVEIS ---
const interagirParametros = async (tipo, extraParam = null) => {
  console.log(`\n🔍 Coletando dados existentes no banco para configurar os parâmetros...`);

  if (tipo === 'forum_id') {
    const foruns = await fetchListings('/forums/print/forums');
    console.log(`\n📋 FÓRUNS DISPONÍVEIS NO SISTEMA:`);
    if (foruns.length === 0) console.log("   Nenhum fórum cadastrado.");
    foruns.forEach(f => {
      const nomeForum = f.name || f.nome || f.titulo || f.titulo_forum || "Sem Nome";
      console.log(`   🔹 ID: [${f.id}] | Nome Fórum: "${nomeForum}"`);
    });
    return await ask("Selecione e digite o ID do Fórum desejado: ");
  }

  if (tipo === 'user_id') {
    const usuarios = await fetchListings('/auth/print/logins');
    console.log(`\n📋 USUÁRIOS DISPONÍVEIS NO SISTEMA:`);
    if (usuarios.length === 0) console.log("   Nenhum usuário encontrado.");
    usuarios.forEach(u => {
      const identificador = u.nome_usuario || u.username || u.email || u.userEmail || u.nome || "Sem Nome";
      console.log(`   🔹 ID: [${u.id}] | Usuário: "${identificador}" | Cargo: [${u.cargo || 'N/A'}]`);
    });
    return await ask("Selecione e digite o ID do Usuário desejado: ");
  }

  if (tipo === 'denuncia_id') {
    const denuncias = await fetchListings('/denuncias/');
    console.log(`\n📋 DENÚNCIAS ABERTAS NO SISTEMA:`);
    if (denuncias.length === 0) console.log("   Nenhuma denúncia aberta encontrada.");
    denuncias.forEach(d => console.log(`   🔹 ID Denúncia: [${d.id}] | Tipo: ${d.tipo} | Status: ${d.status}`));
    return await ask("Selecione e digite o ID da Denúncia para resolver: ");
  }

  if (tipo === 'year') {
    const anos = await fetchListings(`/forums/${extraParam}/files/year`);
    console.log(`\n🗓️ ANOS COM ARQUIVOS CADASTRADOS NESSE FÓRUM:`);
    if (anos.length === 0) return "2026";
    anos.forEach(a => console.log(`   🔹 Ano disponível: [${a.ano || a.year || JSON.stringify(a)}]`));
    return await ask("Digite o ano escolhido com base na lista acima: ");
  }

  if (tipo === 'tag') {
    const tags = await fetchListings(`/forums/${extraParam.forum_id}/files/year/${extraParam.year}`);
    console.log(`\n🏷️ TAGS ENCONTRADAS PARA O ANO DE ${extraParam.year}:`);
    if (tags.length === 0) return "1";
    tags.forEach(t => {
      const nomeTag = t.tag_nome || t.nome || t.tag || JSON.stringify(t);
      const idTag = t.id || t.tag_id || "";
      console.log(`   🔹 Tag: "${nomeTag}" ${idTag ? `| ID: [${idTag}]` : ""}`);
    });
    return await ask("Digite o ID ou Nome da tag escolhida: ");
  }
};

// --- EXECUÇÃO CENTRAL ---
async function runRunner() {
  while (true) {
    console.clear();
    console.log("==================================================");
    console.log("      PUC-VAULT AUTOMATED SUITE RUNNER v6         ");
    console.log("==================================================");

    let infoUser = "🔒 DESLOGADO";
    if (globalToken) {
      try {
        const payload = jwt.verify(globalToken, passAccess);
        infoUser = `🔑 ID: ${payload.id} | CARGO: ${payload.cargo}`;
      } catch { infoUser = "❌ TOKEN INVÁLIDO/EXPIRADO"; }
    }
    console.log(`STATUS ATUAL: ${infoUser}`);
    console.log("==================================================");
    console.log(" 1. Suíte: Criar Nova Conta Completa (Sign-in + PIN + Login)");
    console.log(" 2. Suíte: Usuários (Perfil, Escolha de Roles & Follow)");
    console.log(" 3. Suíte: Fóruns & Indexação de Arquivos (Anos & Tags)");
    console.log(" 4. Suíte: Posts, Comentários & Votos em Lote");
    console.log(" 5. Suíte: Sistema de Moderação & Denúncias");
    console.log(" 6. Suíte: Logar em Conta Existente (Direto)");
    console.log(" 0. Encerrar Runner e Sair");
    console.log("==================================================");

    const suite = await ask("Escolha a suíte de testes que deseja disparar: ");
    if (suite === '0') break;

    if (suite === '1') {
      console.log("\n--- CONFIGURAÇÃO DO FLUXO DE AUTENTICAÇÃO ---");
      let emailInput = await ask("Digite o E-mail para o teste de cadastro (ou ENTER para gerar aleatório): ");

      if (!emailInput) {
        emailInput = `auto_test_${Date.now()}@puc.com`;
        console.log(`   📌 Nenhum e-mail inserido. Utilizando gerado: ${emailInput}`);
      }

      const userTest = `user_${Math.floor(Math.random() * 100000)}`;

      // 1. Sign-in
      const r1 = await executeTest("auth_signin", "/auth/sign-in", "POST", {
        email: emailInput, name: "Automated Tester", username: userTest, password: "securePassword123", twofacauth: false
      });

      // 2. Verify Sign-in
      if (r1.status === 200 || r1.status === 201) {
        console.log(`\n📬 Verifique o console do seu servidor backend para copiar o PIN gerado.`);
        const pin = await ask("Digite o PIN de 6 dígitos recebido: ");
        await executeTest("auth_verify_signin", "/auth/verify-sign-in", "POST", { signupToken: r1.data.signupToken, pin_input: pin });
      }

      // 3. Login
      await executeTest("auth_login", "/auth/login", "POST", { userEmail: emailInput, password: "securePassword123" });

      // 4. Debug list logins
      await executeTest("auth_print_logins", "/auth/print/logins", "GET");
    }

    else if (suite === '2') {
      await executeTest("user_me", "/user/me", "GET", null, true);
      const targetUserId = await interagirParametros('user_id');

      if (targetUserId) {
        await executeTest("user_get_by_id", `/user/${targetUserId}`, "GET", null, true);
        await executeTest("user_toggle_follow", `/user/${targetUserId}/follow`, "PATCH", null, true);

        console.log(`\n📋 SELEÇÃO DE CARGO PARA O USUÁRIO [ID ${targetUserId}]:`);
        console.log(" 1. USUÁRIO COMUM (Role Num: 1)");
        console.log(" 2. VALIDADOR / MODERADOR (Role Num: 2)");
        console.log(" 3. ADMINISTRADOR DO SISTEMA (Role Num: 3)");
        const escolhaRole = await ask("Escolha o nível do cargo (1, 2 ou 3): ");

        let roleNum = parseInt(escolhaRole, 10);
        if (![1, 2, 3].includes(roleNum)) {
          console.log("   ❌ Opção inválida! Aplicando padrão: 1 (USUARIO)");
          roleNum = 1;
        }

        await executeTest("user_change_role", `/user/${targetUserId}/change_role`, "PATCH", { roleNum }, true);
        await executeTest("user_change_description", `/user/${targetUserId}/description`, "PATCH", { description: "Biografia dinâmica" }, true);
        await executeTest("user_toggle_2fa", `/user/toggle-2fa`, "PATCH", null, true);
      }
    }

    else if (suite === '3') {
      await executeTest("forums_print", "/forums/print/forums", "GET");

      const forumNome = `Fórum_${Math.floor(Math.random() * 100000)}`;
      await executeTest("forums_create", "/forums/create", "POST", { name: forumNome, description: "Descrição de teste automatizado estruturado" }, true);

      const forumId = await interagirParametros('forum_id');
      if (forumId) {
        await executeTest("forums_get_single", `/forums/${forumId}`, "GET", null, true);
        await executeTest("forums_get_by_name", `/forums/by-name/${encodeURIComponent(forumNome)}`, "GET");
        await executeTest("forums_toggle_follow", `/forums/${forumId}/follow`, "POST", null, true);
        await executeTest("forums_list_followers", `/forums/${forumId}/list`, "GET");
        await executeTest("forums_list_files_paginated", `/forums/${forumId}/files/page/1`, "GET");

        await executeTest("forums_list_files_year", `/forums/${forumId}/files/year`, "GET");
        const anoEscolhido = await interagirParametros('year', forumId);

        await executeTest("forums_list_tags_year", `/forums/${forumId}/files/year/${anoEscolhido}`, "GET");
        const tagEscolhida = await interagirParametros('tag', { forum_id: forumId, year: anoEscolhido });

        await executeTest("forums_list_posts_year_tag", `/forums/${forumId}/files/year/${anoEscolhido}/tag/${encodeURIComponent(tagEscolhida)}`, "GET");
      }
    }

    else if (suite === '4') {
      const forumId = await interagirParametros('forum_id');
      if (forumId) {
        await executeTest("posts_create", `/posts/${forumId}/create`, "POST", {
          title: "Post Automatizado",
          content: "Conteúdo sem anexo físico para estresse de rotas.",
          tags: [1]
        }, true);

        await executeTest("posts_list_paginated", `/posts/${forumId}/page/1`, "GET");

        const targetPost = await ask("Digite o ID de um Post ativo para interagir (veja a lista acima): ");
        if (targetPost) {
          await executeTest("posts_get_single", `/posts/${targetPost}`, "GET");
          await executeTest("posts_create_comment", `/posts/${targetPost}/comments/create`, "POST", { content: "Comentário automático" }, true);
          await executeTest("posts_list_comments", `/posts/${targetPost}/comments`, "GET");

          const rateVector = [[parseInt(targetPost, 10)], [1]];
          await executeTest("posts_rate_batch", "/posts/rate-content", "PATCH", { rate_vector: rateVector }, true);
        }
      }
    }

    else if (suite === '5') {
      const targetUserId = await interagirParametros('user_id');
      if (targetUserId) {
        await executeTest("denuncia_create_user", "/denuncias/usuario", "POST", { tipo: "SPAM", usuario_denunciado_id: parseInt(targetUserId, 10) }, true);
      }

      await executeTest("denuncia_list_open", "/denuncias/", "GET", null, true);

      const denunciaId = await interagirParametros('denuncia_id');
      if (denunciaId) {
        console.log(`\nConfiguração de Fechamento da Denúncia:`);
        console.log(` 1. RESOLVIDA (Aplica punição imediata)`);
        console.log(` 2. IGNORADA (Ajustado para validação Zod)`);
        const opStatus = await ask("Escolha o status desejado (1 ou 2): ");

        let payload = { novo_status: opStatus === '1' ? "RESOLVIDA" : "IGNORADA" };
        if (payload.novo_status === "RESOLVIDA") {
          payload.punicao = 0;
          payload.tempo_silencio = "";
        }

        await executeTest("denuncia_resolve_patch", `/denuncias/${denunciaId}/resolver`, "PATCH", payload, true);
      }
    }

    else if (suite === '6') {
      console.log("\n--- SUÍTE: LOGIN EM CONTA EXISTENTE ---");
      const userEmail = await ask("Digite o Email ou Username da conta: ");
      const password = await ask("Digite a Senha da conta: ");

      if (!userEmail || !password) {
        console.log("   ❌ Erro: Email e Senha são obrigatórios para efetuar o login.");
      } else {
        await executeTest("auth_login_direto", "/auth/login", "POST", { userEmail, password });
      }
    }

    await ask("\nSuíte de testes concluída. Pressione ENTER para retornar ao menu...");
  }
  rl.close();
}

runRunner();
