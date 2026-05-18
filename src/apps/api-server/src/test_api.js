const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');
const fs = require('fs');
const path = require('path');

const BASE_URL = "http://localhost:8000";
const TOKEN_FILE = path.join(__dirname, '.token_cache');
let globalToken = "";

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

      // --- CAPTURA AUTOMÁTICA DE TOKENS PARA O CACHE EM MEMÓRIA ---
      if (data.token) {
        globalToken = data.token;
        fs.writeFileSync(TOKEN_FILE, globalToken);
        console.log("   💾 Token de acesso final salvo localmente.");
      }
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
    }
    return { status: res.status, data };
  } catch (err) {
    console.log(`❌ Erro na conexão: ${err.message}`);
    return { status: 500 };
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
      await testRoute("Alternar 2FA", `/user/toggle-2fa`, "PATCH", null, true);
    }
    await pause();
  }
}

async function menuForum() {
  while (true) {
    console.log("\n--- [3] FÓRUNS ---");
    console.log(" 1. Criar Fórum");
    console.log(" 2. Imprimir Fóruns");
    console.log(" 3. Ver Fórum Único");
    console.log(" 4. Seguir Fórum");
    console.log(" 0. Voltar");

    const opt = await ask("Escolha: ");
    if (opt === '0') break;

    if (opt === '1') {
      const name = await ask("Nome: ");
      const description = await ask("Descrição: ");
      await testRoute("Criar Fórum", "/forums/create", "POST", { name, description }, true);
    } else if (opt === '2') {
      await testRoute("Imprimir Fóruns", "/forums/print/forums");
    } else if (opt === '3') {
      const id = await ask("ID do Fórum: ");
      await testRoute("Ver Fórum", `/forums/${id}`, "GET", null, true);
    } else if (opt === '4') {
      const id = await ask("Forum ID para seguir: ");
      await testRoute("Seguir Fórum", `/forums/${id}/follow`, "POST", null, true);
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
    console.log(" 7. Avaliar Conteúdo (Like/Dislike)");
    console.log(" 0. Voltar");

    const opt = await ask("Escolha: ");
    if (opt === '0') break;

    if (opt === '1') {
      const fId = await ask("Forum ID: ");
      const title = await ask("Título: ");
      const content = await ask("Conteúdo: ");
      const fileP = await ask("Caminho do anexo (Deixe vazio para nenhum): ");
      await testRoute("Criar Post", `/posts/${fId}/create`, "POST", { title, content }, true, fileP || null);
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
      const cId = await ask("Content ID: ");

      console.log("     1) Dar Like (Upvote)");
      console.log("     2) Dar Dislike (Downvote)");
      const tipoAvaliacao = await ask("Escolha a opção (1 ou 2): ");

      if (tipoAvaliacao === '1') {
        // Dispara o PATCH para a rota de upvote sem passar body, usando a autenticação (true)
        await testRoute("Upvote Content", `/posts/${cId}/upvote`, "PATCH", null, true);
      } else if (tipoAvaliacao === '2') {
        // Dispara o PATCH para a rota de downvote sem passar body, usando a autenticação (true)
        await testRoute("Downvote Content", `/posts/${cId}/downvote`, "PATCH", null, true);
      } else {
        console.log("   ❌ Opção inválida. Operação cancelada.");
      }
    } await pause();
  }
}

async function menuImages() {
  while (true) {
    console.log("\n--- [5] IMAGENS & UPLOADS ---");
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

// --- MENU PRINCIPAL ---
async function showMainMenu() {
  while (true) {
    console.clear();
    console.log("=================================");
    console.log("     PUC-VAULT API TESTER v4     ");
    console.log("=================================");
    console.log(globalToken ? " 🔑 STATUS: LOGADO" : " 🔒 STATUS: DESLOGADO");
    console.log("\n 1. Autenticação & Senhas (PIN / 2FA)");
    console.log(" 2. Usuários (Perfil/Follow/Cargos)");
    console.log(" 3. Fóruns (Criação/Listagem)");
    console.log(" 4. Posts & Comentários");
    console.log(" 5. Imagens & Uploads");
    console.log(" 0. Sair");

    const choice = await ask("\nEscolha: ");
    if (choice === '0') break;

    if (choice === '1') await menuAuth();
    else if (choice === '2') await menuUser();
    else if (choice === '3') await menuForum();
    else if (choice === '4') await menuPosts();
    else if (choice === '5') await menuImages();
    else console.log("   ❌ Opção inválida.");
  }
  rl.close();
}

showMainMenu();
