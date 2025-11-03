<script setup lang="ts"></script>

<template>
  <UDashboardPanel id="users">
    <template #header>
      <UDashboardNavbar title="Página Inicial">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-4 p-6">
        <h1 class="text-2xl font-bold">Bem-vindo ao Sistema</h1>

        <UCard v-if="loggedIn">
          <template #header>
            <h2 class="text-xl font-semibold">Informações do Usuário</h2>
          </template>

          <div class="space-y-2">
            <p>
              <strong>Nome:</strong>
              {{ user?.name }}
            </p>
            <p>
              <strong>Email:</strong>
              {{ user?.email }}
            </p>
            <p>
              <strong>CPF:</strong>
              {{ user?.cpf }}
            </p>
            <p>
              <strong>Telefone:</strong>
              {{ user?.phone || 'Não informado' }}
            </p>
            <p>
              <strong>Roles:</strong>
              {{ user?.roles.join(', ') }}
            </p>
            <p>
              <strong>Status:</strong>
              {{ user?.active ? 'Ativo' : 'Inativo' }}
            </p>
            <p>
              <strong>Logado desde:</strong>
              {{ session ? new Date(session.loggedInAt).toLocaleString('pt-BR') : '' }}
            </p>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
