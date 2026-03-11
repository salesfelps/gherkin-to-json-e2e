@regression @priority
Feature: Prioridade de cenários
  Como usuário
  Quero definir prioridade para cenários
  Para organizar a importância dos testes

  Background:
    Given que eu acesso a aplicação

  @regression @priority
  Scenario: Prioridade padrão é "3 - Médio"
    When eu preencho o título do cenário 1 com "Cenário"
    Then a prioridade do cenário 1 deve ser "3 - Médio"

  @regression @priority
  Scenario: Alterar prioridade para "5 - Crítico"
    When eu preencho o título do cenário 1 com "Cenário crítico"
    And eu altero a prioridade do cenário 1 para "5 - Crítico"
    Then a prioridade do cenário 1 deve ser "5 - Crítico"

  @regression @priority
  Scenario: Alterar prioridade para "1 - Muito Baixo"
    When eu preencho o título do cenário 1 com "Cenário baixo"
    And eu altero a prioridade do cenário 1 para "1 - Muito Baixo"
    Then a prioridade do cenário 1 deve ser "1 - Muito Baixo"

  @regression @priority
  Scenario: Prioridade reflete no JSON gerado
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário com prioridade"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu altero a prioridade do cenário 1 para "4 - Alto"
    And eu clico em Gerar JSON
    Then o JSON do cenário 1 deve conter prioridade "4 - Alto"
