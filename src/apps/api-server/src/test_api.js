const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../src/.env');
const BASE_URL = "http://localhost:8000";
const TOKEN_FILE = path.join(__dirname, '.token_cache');
let globalToken = "";
require('dotenv').config({ path: envPath });

const passAccess = process.env.JWT_SECRET;
// Caches temporários em memória para facilitar os testes das rotas stateless de PIN
let lastSignupToken = "";
let lastTwoFacToken = "";
let lastPinToken = "";

// Carrega o token da sessão anterior
if (fs.existsSync(TOKEN_FILE)) {
  globalToken = fs.readFileSync(TOKEN_FILE, 'utf8');
}


const rl = readline.createInterface({ input, output });

const ask = async (question) => {
  const answer = await rl.question(`   ${question}`);
  return answer.trim();
};

const pause = async () => {
  await ask("\nPressione ENTER para voltar ao menu...");
};

// --- FUNÇÃO CENTRAL DE REQUISIÇÃO ---
const testRoute = async (desc, urlPath, method = 'GET', body = null, useAuth = false, filePath = null) => {
  const start = Date.now();
  console.log(`\n🚀 [${method}] ${desc} -> ${urlPath}`);

  try {
    let headers = {};
    let requestBody;

    if (useAuth) {
      if (!globalToken) console.log("   ⚠️ AVISO: Token não encontrado. Faça login em Auth.");
      headers['Authorization'] = `Bearer ${globalToken}`;
    }

    if (filePath && fs.existsSync(filePath)) {
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(filePath);

      const ext = path.extname(filePath).toLowerCase();
      let mimeType = 'application/octet-stream';
      if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.webp') mimeType = 'image/webp';
      else if (ext === '.gif') mimeType = 'image/gif';

      const blob = new Blob([fileBuffer], { type: mimeType });
      formData.append('file', blob, path.basename(filePath));

      if (body) {
        for (const key in body) {
          formData.append(key, body[key]);
        }
      }
      requestBody = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      requestBody = body ? JSON.stringify(body) : null;
    }

    const res = await fetch(`${BASE_URL}${urlPath}`, {
      method,
      headers,
      body: requestBody
    });

    const duration = Date.now() - start;
    const data = await res.json().catch(() => ({}));

    const icon = res.status >= 200 && res.status < 300 ? '✅' : '❌';
    console.log(`${icon} Status: ${res.status} (${duration}ms)`);

    if (res.status >= 400) {
      console.log("   Motivo:", JSON.stringify(data, null, 2));
    } else {
      console.log("   Resposta:", JSON.stringify(data).substring(0, 700) + "...");

      // --- CAPTURA SEGURA DE TOKEN DE ACESSO ---
      if (data.token) {
        globalToken = data.token;
        fs.writeFileSync(TOKEN_FILE, globalToken);
        console.log("   💾 Token de acesso final salvo localmente.");
      }
    }

    // --- CAPTURA AUTOMÁTICA DE TOKENS TEMPORÁRIOS ---
    if (data.signupToken) {
      lastSignupToken = data.signupToken;
      console.log("   💾 signupToken temporário interceptado e guardado na memória.");
    }
    if (data.twoFacToken) {
      lastTwoFacToken = data.twoFacToken;
      console.log("   💾 twoFacToken temporário interceptado e guardado na memória.");
    }
    if (data.pinToken) {
      lastPinToken = data.pinToken;
      console.log("   💾 pinToken de recuperação interceptado e guardado na memória.");
    }

    return { status: res.status, data };

  } catch (err) {
    console.log(`❌ Erro na conexão: ${err.message}`);
    return { status: 500, data: { error: err.message } };
  }
};

// --- SUBMENUS ---

async function menuAuth() {
  while (true) {
    console.log("\n--- [1] AUTH & SEGURANÇA (PIN STATELESS) ---");
    console.log(" 1. Sign-in (Solicitar Cadastro via PIN)");
    console.log(" 2. Confirmar Cadastro (Validar PIN do E-mail)");
    console.log(" 3. Login (Gera Token Direto ou Exige 2FA)");
    console.log(" 4. Confirmar Login (Validar PIN de 2FA)");
    console.log(" 5. Mudar Senha (Logado)");
    console.log(" 6. Recuperar Senha (Solicitar PIN por E-mail)");
    console.log(" 7. Confirmar Recuperação (Alterar Senha com PIN)");
    console.log(" 8. Logout");
    console.log(" 0. Voltar");

    const opt = await ask("Escolha: ");
    if (opt === '0') break;

    if (opt === '1') {
      const email = await ask("Email: ");
      const name = await ask("Nome: ");
      const username = await ask("Username: ");
      const password = await ask("Senha: ");
      const check2FA = await ask("Ativar Verificação de Duas Etapas (2FA)? (s/n): ");
      const twofacauth = check2FA.toLowerCase() === 's';

      await testRoute("Sign-in", "/auth/sign-in", "POST", { email, name, username, password, twofacauth });
    }
    else if (opt === '2') {
      let tokenToUse = lastSignupToken;
      if (tokenToUse) {
        const useCache = await ask("Encontrei um signupToken na memória. Deseja usá-lo? (S/n): ");
        if (useCache.toLowerCase() === 'n') {
          tokenToUse = await ask("Cole o seu signupToken completo: ");
        }
      } else {
        tokenToUse = await ask("Cole o seu signupToken completo: ");
      }
      const pin_input = await ask("Digite o PIN de 6 dígitos recebido por e-mail: ");
      await testRoute("Confirmar Cadastro", "/auth/verify-sign-in", "POST", { signupToken: tokenToUse, pin_input });
    }
    else if (opt === '3') {
      const userEmail = await ask("Email/User: ");
      const password = await ask("Senha: ");
      await testRoute("Login", "/auth/login", "POST", { userEmail, password });
    }
    else if (opt === '4') {
      let tokenToUse = lastTwoFacToken;
      if (tokenToUse) {
        const useCache = await ask("Encontrei um twoFacToken na memória. Deseja usá-lo? (S/n): ");
        if (useCache.toLowerCase() === 'n') {
          tokenToUse = await ask("Cole o seu twoFacToken completo: ");
        }
      } else {
        tokenToUse = await ask("Cole o seu twoFacToken completo: ");
      }
      const pin_input = await ask("Digite o PIN de 2FA recebido por e-mail: ");
      await testRoute("Confirmar Login 2FA", "/auth/verify-login", "POST", { twoFacToken: tokenToUse, pin_input });
    }
    else if (opt === '5') {
      const password = await ask("Senha Atual: ");
      const new_password = await ask("Nova Senha: ");
      const confirm = await ask("Confirmação: ");
      await testRoute("Troca Senha", "/auth/change-password", "POST", { password, new_password, confirm }, true);
    }
    else if (opt === '6') {
      const email = await ask("Email: ");
      await testRoute("Recuperar Senha", "/auth/forgot-send-email", "POST", { email });
    }
    else if (opt === '7') {
      let tokenToUse = lastPinToken;
      if (tokenToUse) {
        const useCache = await ask("Encontrei um pinToken na memória. Deseja usá-lo? (S/n): ");
        if (useCache.toLowerCase() === 'n') {
          tokenToUse = await ask("Cole o seu pinToken completo: ");
        }
      } else {
        tokenToUse = await ask("Cole o seu pinToken completo: ");
      }
      const pin = await ask("Digite o PIN de recuperação recebido: ");
      const new_password = await ask("Nova Senha: ");
      const confirm = await ask("Confirme a Nova Senha: ");

      await testRoute("Confirmar Recuperação", "/auth/forgot-password", "PATCH", {
        pinToken: tokenToUse,
        pin,
        new_password,
        confirm
      });
    }
    else if (opt === '8') {
      console.log("\n🔄 Solicitando logout ao servidor...");

      // 1. Dispara o POST para o servidor invalidar o token lá
      const resultado = await testRoute("Logout no Servidor", "/auth/logout", "POST", null, true);

      // 2. Se o servidor respondeu com sucesso (status entre 200 e 299)
      if (resultado && resultado.status >= 200 && resultado.status < 300) {
        console.log("🧹 Limpando credenciais locais do cache...");

        // Apaga a variável na memória do terminal
        globalToken = "";

        // Limpa o arquivo físico de cache para deslogar definitivamente
        if (fs.existsSync(TOKEN_FILE)) {
          fs.writeFileSync(TOKEN_FILE, "");
        }

        console.log("✅ Perfeito! Você foi deslogado do Servidor e do Cliente.");
      } else {
        console.log("❌ O servidor rejeitou o logout ou ocorreu um erro.");
      }
    }

    await pause();
  }
}

async function menuUser() {
  while (true) {
    console.log("\n--- [2] USUÁRIOS ---");
    console.log(" 1. Meu Perfil (Get Me)");
    console.log(" 2. Informações de Usuário (Por ID)");
    console.log(" 3. Seguir Usuário");
    console.log(" 4. Mudar Cargo (Role)");
    console.log(" 5. Alterar Descrição");
    console.log(" 6. Alternar 2FA (Ativar/Desativar)");
    console.log(" 0. Voltar");

    const opt = await ask("Escolha: ");
    if (opt === '0') break;

    if (opt === '1') {
      await testRoute("Meu Perfil", "/user/me", "GET", null, true);
    } else if (opt === '2') {
      const id = await ask("User ID: ");
      await testRoute("User Info", `/user/${id}`, "GET", null, true);
    } else if (opt === '3') {
      const id = await ask("Target ID para seguir: ");
      await testRoute("Follow User", `/user/${id}/follow`, "PATCH", null, true);
    } else if (opt === '4') {
      const id = await ask("User ID: ");
      const roleNum = await ask("Role Num (1=User, 2=Validador, 3=Admin): ");
      await testRoute("Change Role", `/user/${id}/change_role`, "PATCH", { roleNum: parseInt(roleNum) }, true);
    } else if (opt === '5') {
      const id = await ask("Seu User ID: ");
      const description = await ask("Nova Descrição: ");
      await testRoute("Change Description", `/user/${id}/description`, "PATCH", { description }, true);
    } else if (opt === '6') {
      const id = await ask("User ID para alternar 2FA: ");
      await testRoute("Alternar 2FA", `/user/${id}/toggle-2fa`, "PATCH", null, true);
    } else if (opt === '7') {
      await testRoute("Deletar Conta", `/user/delete`, "DELETE", null, true);
    }
    await pause();
  }
}

async function menuForum() {
  while (true) {
    console.log("\n--- [3] FÓRUNS ---");
    console.log(" 1. Criar Fórum");
    console.log(" 2. Imprimir Fóruns");
    console.log(" 3. Ver Fórum Único (Por ID)");
    console.log(" 4. Buscar Fórum por Nome");
    console.log(" 5. Seguir Fórum");
    console.log(" 6. Listar Seguidores do Fórum");
    console.log(" 7. Listar Arquivos do Fórum (Paginado)");
    console.log(" 8. Listar Anos com Arquivos no Fórum");
    console.log(" 9. Listar Tags de Arquivos por Ano");
    console.log(" 10. Listar Posts com Arquivos por Ano e Tag");
    console.log(" 0. Voltar");

    const opt = await ask("Escolha: ");
    if (opt === '0') break;

    if (opt === '1') {
      const name = await ask("Nome do Fórum: ");
      const description = await ask("Descrição: ");
      await testRoute("Criar Fórum", "/forums/create", "POST", { name, description }, true);
    }
    else if (opt === '2') {
      await testRoute("Imprimir Fóruns", "/forums/print/forums");
    }
    else if (opt === '3') {
      const id = parseInt(await ask("ID do Fórum: "), 10);
      await testRoute("Ver Fórum", `/forums/${id}`, "GET", null, true);
    }
    else if (opt === '4') {
      const name = await ask("Digite o nome exato do Fórum: ");
      await testRoute("Buscar Fórum por Nome", `/forums/by-name/${encodeURIComponent(name)}`, "GET");
    }
    else if (opt === '5') {
      const id = parseInt(await ask("Forum ID para seguir: "), 10);
      await testRoute("Seguir Fórum", `/forums/${id}/follow`, "POST", null, true);
    }
    else if (opt === '6') {
      const id = parseInt(await ask("Forum ID para listar seguidores: "), 10);
      await testRoute("Listar Seguidores do Fórum", `/forums/${id}/list`, "GET");
    }
    else if (opt === '7') {
      const id = parseInt(await ask("Forum ID: "), 10);
      const pageNum = parseInt(await ask("Número da Página de arquivos: "), 10);
      await testRoute("Listar Arquivos Paginados", `/forums/${id}/files/page/${pageNum}`, "GET");
    }
    else if (opt === '8') {
      const id = parseInt(await ask("Forum ID: "), 10);
      await testRoute("Listar Anos com Arquivos", `/forums/${id}/files/year`, "GET");
    }
    else if (opt === '9') {
      const id = parseInt(await ask("Forum ID: "), 10);
      const year = await ask("Digite o ano (ex: 2026): ");
      await testRoute("Listar Tags por Ano", `/forums/${id}/files/year/${year}`, "GET");
    }
    else if (opt === '10') {
      const id = parseInt(await ask("Forum ID: "), 10);
      const year = await ask("Digite o ano (ex: 2026): ");
      const tag = await ask("Digite a tag do arquivo: ");
      await testRoute("Listar Posts por Ano e Tag", `/forums/${id}/files/year/${year}/tag/${encodeURIComponent(tag)}`, "GET");
    }
    else {
      console.log("   ❌ Opção inválida.");
    }
    await pause();
  }
}

async function menuPosts() {
  while (true) {
    console.log("\n--- [4] POSTS & COMENTÁRIOS ---");
    console.log(" 1. Criar Post (Upload de Anexo)");
    console.log(" 2. Listar Posts (Paginado)");
    console.log(" 3. Ver Single Post");
    console.log(" 4. Deletar Post");
    console.log(" 5. Criar Comentário");
    console.log(" 6. Listar Comentários do Post");
    console.log(" 7. Avaliar Conteúdo (Matriz em Lote)");
    console.log(" 0. Voltar");

    const opt = await ask("Escolha: ");
    if (opt === '0') break;

    if (opt === '1') {
      const fId = await ask("Forum ID: ");
      const title = await ask("Título: ");
      const content = await ask("Conteúdo: ");

      const tagsInput = await ask("IDs das Tags do post (Separados por vírgula, ex: 1,2 ou deixe vazio): ");

      const tags = tagsInput
        ? tagsInput.split(',').map(t => parseInt(t.trim(), 10)).filter(t => !isNaN(t))
        : [];

      const fileP = await ask("Caminho do anexo (Deixe vazio para nenhum): ");

      await testRoute(
        "Criar Post",
        `/posts/${fId}/create`,
        "POST",
        { title, content, tags },
        true,
        fileP || null
      );
    } else if (opt === '2') {
      const fId = await ask("Forum ID: ");
      const page = await ask("Página (ex: 1): ");
      await testRoute("Listar Posts", `/posts/${fId}/page/${page}`, "GET");
    } else if (opt === '3') {
      const pId = await ask("Post ID: ");
      await testRoute("Ver Post", `/posts/${pId}`, "GET");
    } else if (opt === '4') {
      const pId = await ask("Post ID para deletar: ");
      await testRoute("Deletar Post", `/posts/${pId}/delete`, "DELETE", null, true);
    } else if (opt === '5') {
      const pId = await ask("ID do Post Pai: ");
      const content = await ask("Conteúdo do comentário: ");
      await testRoute("Criar Comentário", `/posts/${pId}/comments/create`, "POST", { content }, true);
    } else if (opt === '6') {
      const pId = await ask("Post ID: ");
      await testRoute("Listar Comentários", `/posts/${pId}/comments`, "GET");
    } else if (opt === '7') {
      console.log("\n--- AVALIAR CONTEÚDO EM LOTE ---");

      const idsRow = [];
      const ratingsRow = [];

      while (true) {
        const cIdInput = await ask("Content ID (ou digite 'fim' para encerrar e enviar): ");
        if (cIdInput.toLowerCase() === 'fim') break;

        const cId = parseInt(cIdInput, 10);
        if (isNaN(cId)) {
          console.log("   ❌ ID Inválido. Digite um número inteiro.");
          continue;
        }

        console.log("     1) Like (Upvote = 1)");
        console.log("     0) Tirar voto");
        console.log("     -1) Dislike (Downvote = -1)");
        const voto = await ask("Escolha a avaliação: ");

        let valorRating = 0;
        if (voto === '1') valorRating = 1;
        else if (voto === '-1') valorRating = -1;
        else if (voto === '0') valorRating = 0;
        else {
          console.log("   ❌ Opção de voto inválida. Este item não foi adicionado.");
          continue;
        }

        idsRow.push(cId);
        ratingsRow.push(valorRating);
        console.log(`   📌 Adicionado à matriz: ID ${cId} com peso [${valorRating}]`);
        console.log("---------------------------------------------------------");
      }

      if (idsRow.length === 0) {
        console.log("   ⚠️ Nenhuma avaliação foi inserida. Operação cancelada.");
      } else {
        const rate_vector = [idsRow, ratingsRow];
        await testRoute("Rate Content Batch", "/posts/rate-content", "PATCH", { rate_vector }, true);
      }
    }
    await pause();
  }
}

// --- 🏷️ NOVO SUBMENU DE TAGS ---
async function menuTags() {
  while (true) {
    console.log("\n--- [5] CONTROLE DE TAGS ---");
    console.log(" 1. Criar Nova Tag");
    console.log(" 2. Listar Todas as Tags Ativas (Filtro vazio)");
    console.log(" 3. Buscar/Filtrar Tags (Query Params)");
    console.log(" 4. Imprimir Tags Criadas por um Usuário");
    console.log(" 0. Voltar");

    const opt = await ask("Escolha: ");
    if (opt === '0') break;

    if (opt === '1') {
      const name = await ask("Nome da Tag (mínimo 2 caracteres): ");
      await testRoute("Criar Tag", "/tags/create", "POST", { name }, true);
    }
    else if (opt === '2') {
      await testRoute("Listar Tags Ativas", "/tags/", "GET");
    }
    else if (opt === '3') {
      const q = await ask("Digite o termo de busca (q): ");
      await testRoute("Buscar Tags", `/tags/search?q=${encodeURIComponent(q)}`, "GET");
    }
    else if (opt === '4') {
      const user_id = await ask("ID do Usuário Criador: ");
      await testRoute("Tags por Usuário", `/tags/${user_id}/print`, "GET");
    }
    await pause();
  }
}

async function menuImages() {
  while (true) {
    console.log("\n--- [6] IMAGENS & UPLOADS ---");
    console.log(" 1. Upload Perfil (Usuário)");
    console.log(" 2. Upload Banner (Usuário)");
    console.log(" 3. Upload Perfil (Fórum)");
    console.log(" 4. Upload Banner (Fórum)");
    console.log(" 5. Buscar URLs de Imagem (Usuário)");
    console.log(" 6. Buscar URLs de Imagem (Fórum)");
    console.log(" 0. Voltar");

    const opt = await ask("Escolha: ");
    if (opt === '0') break;

    let loc = "";

    if (opt === '1' || opt === '2') {
      loc = (opt === '1') ? "perfil" : "banner";
      const fileP = await ask("Caminho da imagem: ");
      await testRoute(`Upload ${loc}`, `/image/upload/${loc}`, "PATCH", {}, true, fileP);
    }
    else if (opt === '3' || opt === '4') {
      const fId = await ask("ID do Fórum: ");
      loc = (opt === '3') ? "perfil" : "banner";
      const fileP = await ask("Caminho da imagem: ");
      await testRoute(`Upload Forum ${loc}`, `/image/${fId}/upload/${loc}`, "PATCH", {}, true, fileP);
    }
    else if (opt === '5') {
      const uId = await ask("User ID: ");
      await testRoute("Get URLs User", `/image/get/user/${uId}`);
    }
    else if (opt === '6') {
      const fId = await ask("Forum ID: ");
      await testRoute("Get URLs Forum", `/image/get/forum/${fId}`);
    }
    await pause();
  }
}

function printReportTypes() {
  console.log('Escolha o tipo de denúncia: ');
  console.log("  1. CONTEUDO_INADEQUADO");
  console.log("  2. SPAM");
  console.log("  3. PLÁGIO");
  console.log("  4. ASSÉDIO");
  console.log("  5. INFORMACAO_FALSA");
  console.log("  6. OUTRO");
}

// --- 🚨 SUBMENU DE DENÚNCIAS TOTALMENTE ATUALIZADO COMS OS ENDPOINTS SOLICITADOS ---
async function menuReport() {
  while (true) {
    console.log("\n--- [7] DENÚNCIAS (REPORT) ---");
    console.log(" 1. Denunciar Usuário (/denuncias/usuario)");
    console.log(" 2. Denunciar Conteúdo (/denuncias/conteudo)");
    console.log(" 3. Listar Usuários Denunciados (/denuncias/users) [ADMIN]");
    console.log(" 4. Listar Postagens Denunciadas (/denuncias/posts) [ADMIN]");
    console.log(" 5. Listar Comentários Denunciados (/denuncias/comentarios) [ADMIN]");
    console.log(" 6. Listar Todas as Denúncias (/denuncias/) [ADMIN]");
    console.log(" 7. Resolver Denúncia (/denuncias/:id/resolver) [ADMIN]");
    console.log(" 0. Voltar");

    const opt = await ask("Escolha: ");
    if (opt === '0') break;

    const tipoReportMap = {
      '1': "CONTEUDO_INADEQUADO",
      '2': "SPAM",
      '3': "PLÁGIO",
      '4': "ASSÉDIO",
      '5': "INFORMACAO_FALSA",
      '6': "OUTRO"
    };

    if (opt === '1') {
      printReportTypes();
      const tipoReport = await ask('Escolha a opção do tipo: ');
      const tipo = tipoReportMap[tipoReport];
      const usuario_denunciado_id = parseInt(await ask("User ID do Denunciado: "), 10);
      await testRoute("Report User", `/denuncias/usuario`, "POST", { tipo, usuario_denunciado_id }, true);
    }
    else if (opt === '2') {
      printReportTypes();
      const tipoReport = await ask('Escolha a opção do tipo: ');
      const tipo = tipoReportMap[tipoReport];
      const conteudo_id = parseInt(await ask("ID do Conteúdo Denunciado: "), 10);
      await testRoute("Report Content", `/denuncias/conteudo`, "POST", { tipo, conteudo_id }, true);
    }
    else if (opt === '3') {
      console.log("\nFiltro de Status opcional (Deixe vazio para enviar NULL e usar o padrão):");
      const statusInput = await ask("Status (RESOLVIDA ou IGNORADA): ");
      const payload = statusInput ? { status: statusInput } : { status: null };
      await testRoute("Listar Usuários Denunciados", `/denuncias/users`, "GET", payload, true);
    }
    else if (opt === '4') {
      console.log("\nFiltro de Status opcional (Deixe vazio para enviar NULL e usar o padrão):");
      const statusInput = await ask("Status (RESOLVIDA ou IGNORADA): ");
      const payload = statusInput ? { status: statusInput } : { status: null };
      await testRoute("Listar Postagens Denunciadas", `/denuncias/posts`, "GET", payload, true);
    }
    else if (opt === '5') {
      console.log("\nFiltro de Status opcional (Deixe vazio para enviar NULL e usar o padrão):");
      const statusInput = await ask("Status (RESOLVIDA ou IGNORADA): ");
      const payload = statusInput ? { status: statusInput } : { status: null };
      await testRoute("Listar Comentários Denunciados", `/denuncias/comentarios`, "GET", payload, true);
    }
    else if (opt === '6') {
      await testRoute("Listar Todas as Denúncias", `/denuncias/`, "GET", null, true);
    }
    else if (opt === '7') {
      console.log("\n--- RESOLVER DENÚNCIA ---");
      const denuncia_id = parseInt(await ask("ID da Denúncia que deseja resolver: "), 10);

      console.log("\nDefina o Novo Status:");
      console.log(" 1. RESOLVIDA");
      console.log(" 2. IGNORADA");
      const escolhaStatus = await ask('Escolha o status (1 ou 2): ');
      const statusMap = { '1': "RESOLVIDA", '2': "IGNORADA" };
      const novo_status = statusMap[escolhaStatus];

      if (!novo_status) {
        console.log("   ❌ Opção de status inválida. Operação cancelada.");
        await pause();
        continue;
      }

      let punicao = null;
      let tempo_silencio = null;

      if (novo_status === "RESOLVIDA") {
        console.log("\nDefina a Punição do Infrator:");
        console.log(" 0. Excluir Postagem");
        console.log(" 1. Excluir Postagem + Silenciar Usuário");
        console.log(" 2. Excluir Usuário permanentemente");
        console.log(" N. Nenhuma punição (Apenas fechar)");
        const escolhaPunicao = await ask('Escolha a opção (0, 1, 2 ou N): ');

        if (['0', '1', '2'].includes(escolhaPunicao)) {
          punicao = parseInt(escolhaPunicao, 10);
        }

        if (punicao === 1) {
          console.log("\nDefina o Tempo de Silenciamento:");
          console.log(" 1. 1 Hora ('1 hour')");
          console.log(" 2. 3 Horas ('3 hours')");
          console.log(" 3. 6 Horas ('6 hours')");
          console.log(" 4. 12 Horas ('12 hours')");
          console.log(" 5. 1 Dia ('1 day')");
          console.log(" 6. 3 Dias ('3 days')");
          console.log(" 7. 7 Dias ('7 days')");
          const escolhaTempo = await ask('Escolha a opção (1-7): ');

          const tempoMap = {
            '1': '1 hour',
            '2': '3 hours',
            '3': '6 hours',
            '4': '12 hours',
            '5': '1 day',
            '6': '3 days',
            '7': '7 days'
          };
          tempo_silencio = tempoMap[escolhaTempo] || null;
        }
      }

      const payload = {
        novo_status,
        punicao,
        tempo_silencio
      };

      await testRoute(
        "Resolve Report",
        `/denuncias/${denuncia_id}/resolver`,
        "PATCH",
        payload,
        true
      );
    }

    await pause();
  }
}

const jwt = require('jsonwebtoken');

// --- MENU PRINCIPAL ---
async function showMainMenu() {
  while (true) {
    console.clear();
    console.log("=================================");
    console.log("     PUC-VAULT API TESTER v4     ");
    console.log("=================================");

    let infoUsuarioHeader = "🔒 STATUS: DESLOGADO";

    if (globalToken) {
      try {
        const user = jwt.verify(globalToken, passAccess);
        infoUsuarioHeader = `🔑 ID: ${user.id} | CARGO: ${user.cargo || 'N/A'}`;
      } catch (err) {
        infoUsuarioHeader = "❌ STATUS: TOKEN EXPIRADO / INVÁLIDO";
      }
    }

    console.log(`STATUS: ${infoUsuarioHeader}`);
    console.log("=================================");

    console.log("\n 1. Autenticação & Senhas (PIN / 2FA)");
    console.log(" 2. Usuários (Perfil/Follow/Cargos)");
    console.log(" 3. Fóruns (Criação/Listagem)");
    console.log(" 4. Posts & Comentários");
    console.log(" 5. Controle de Tags");
    console.log(" 6. Imagens & Uploads");
    console.log(" 7. Denúncias");
    console.log(" 0. Sair");

    const choice = await ask("\nEscolha: ");
    if (choice === '0') break;

    if (choice === '1') await menuAuth();
    else if (choice === '2') await menuUser();
    else if (choice === '3') await menuForum();
    else if (choice === '4') await menuPosts();
    else if (choice === '5') await menuTags();
    else if (choice === '6') await menuImages();
    else if (choice === '7') await menuReport();
    else {
      console.log("   ❌ Opção inválida.");
      await pause();
    }
  }
  rl.close();
}

showMainMenu();
