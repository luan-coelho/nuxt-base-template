Implemente a autenticação em uma aplicação Nuxt.js que utiliza um backend Java já existente.
O backend já possui autenticação e autorização implementadas, e em um login bem-sucedido ele retorna dois cookies HTTP-only: um access_token e um refresh_token.
A LLM deve integrar o frontend a esse backend sem alterar o backend.

Requisitos principais:

A autenticação deve ser baseada em cookies HTTP-only retornados pelo backend.
O frontend não deve armazenar tokens manualmente (nem em localStorage, nem em cookies próprios).

Todas as requisições ao backend que exigirem autenticação devem ser feitas com credentials: 'include'.

A lógica deve incluir:

Processo de login (chamada ao endpoint de signin e manipulação automática dos cookies);

Criação de um objeto de sessão reativo (armazenamento do usuário autenticado no estado global);

Middleware global para proteger rotas privadas, validando o cookie com o endpoint /me do backend;

Processo de logout, chamando o endpoint de logout no backend e limpando o estado do usuário no frontend.

A implementação deve ser compatível com SSR (Server-Side Rendering) e CSR (Client-Side Rendering).

O código deve ser organizado em:

Páginas (pages/login.vue, pages/dashboard.vue, etc.)

Composables (useUserSession, useLogout)

Middleware (auth.global.ts)

A autenticação deve funcionar tanto em navegação inicial via SSR quanto em mudanças de rota no cliente.

Deve garantir que o código siga as boas práticas de segurança, incluindo:

Nunca expor tokens no cliente;

Tratar erros de autenticação e redirecionamentos adequadamente.

O resultado final deve ser uma aplicação Nuxt funcional, com autenticação integrada ao backend existente.
