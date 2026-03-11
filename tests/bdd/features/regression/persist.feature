@regression @persist
Feature: Persistência de dados
  Como usuário
  Quero que meus dados sejam salvos automaticamente
  Para não perder trabalho ao fechar ou recarregar a página

  Background:
    Given que eu acesso a aplicação

  @regression @persist
  Scenario: Dados persistem após recarregar a página
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário persistente"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu recarrego a página
    Then devo ver o título do cenário 1 como "Cenário persistente"
    And devo ver o Gherkin do cenário 1 contendo "Given a"

  @regression @persist
  Scenario: Múltiplos cenários persistem após reload
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu adiciono um cenário
    And eu preencho o título do cenário 1 com "Primeiro"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu preencho o título do cenário 2 com "Segundo"
    And eu preencho o Gherkin do cenário 2 com:
      """
      Given x
      When y
      Then z
      """
    And eu recarrego a página
    Then devo ver o título do cenário 1 como "Primeiro"
    And devo ver o título do cenário 2 como "Segundo"

  @regression @persist
  Scenario: Tema persiste após reload
    When eu troco o tema
    And eu recarrego a página
    Then o tema deve estar diferente do padrão
