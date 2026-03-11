@regression @scenario-management
Feature: Gerenciamento de cenários
  Como usuário
  Quero adicionar e remover cenários
  Para controlar a estrutura dos meus testes

  Background:
    Given que eu acesso a aplicação

  @regression @scenario-management
  Scenario: Adicionar cenário cria um novo card abaixo
    When eu adiciono um cenário
    Then devo ver 2 cenários na tela

  @regression @scenario-management
  Scenario: Remover cenário remove o card da tela
    When eu adiciono um cenário
    Then devo ver 2 cenários na tela
    When eu removo o cenário 2
    Then devo ver 1 cenário na tela

  @regression @scenario-management
  Scenario: Não é possível remover o último cenário
    Then devo ver 1 cenário na tela
    When eu tento remover o cenário 1
    Then devo ver 1 cenário na tela

  @regression @scenario-management
  Scenario: Cenário removido não aparece no JSON gerado
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu adiciono um cenário
    And eu preencho o título do cenário 1 com "Manter"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu preencho o título do cenário 2 com "Remover"
    And eu preencho o Gherkin do cenário 2 com:
      """
      Given x
      When y
      Then z
      """
    And eu removo o cenário 2
    And eu clico em Gerar JSON
    Then o JSON deve conter 1 cenário na ordem da tela
    And o cenário 1 no JSON deve ter summary "Manter"
