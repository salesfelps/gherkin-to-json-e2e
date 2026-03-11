@regression @search-replace
Feature: Buscar e substituir
  Como usuário
  Quero buscar e substituir texto nos cenários
  Para editar rapidamente campos repetidos

  Background:
    Given que eu acesso a aplicação

  @regression @search-replace
  Scenario: Abrir painel de busca e substituir via FAB
    When eu abro o painel de busca e substituição
    Then devo ver o painel de busca e substituição aberto

  @regression @search-replace
  Scenario: Buscar texto existente exibe contador de resultados
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário de busca"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given que tenho algo
      When eu faço algo
      Then devo ver algo
      """
    And eu abro o painel de busca e substituição
    And eu busco por "algo"
    Then o contador de resultados de busca deve mostrar "3" ocorrências

  @regression @search-replace
  Scenario: Buscar texto inexistente mostra zero resultados
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given teste
      When teste
      Then teste
      """
    And eu abro o painel de busca e substituição
    And eu busco por "inexistente"
    Then o contador de resultados de busca deve mostrar "0" ocorrências

  @regression @search-replace
  Scenario: Substituir todas as ocorrências
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário substituição"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given que tenho algo
      When eu faço algo
      Then devo ver algo
      """
    And eu abro o painel de busca e substituição
    And eu busco por "algo"
    And eu preencho a substituição com "resultado"
    And eu clico em substituir tudo
    Then o Gherkin do cenário 1 deve conter "resultado"
    And o Gherkin do cenário 1 não deve conter "algo"

  @regression @search-replace
  Scenario: Fechar painel de busca e substituição
    When eu abro o painel de busca e substituição
    Then devo ver o painel de busca e substituição aberto
    When eu fecho o painel de busca e substituição
    Then o painel de busca e substituição deve estar fechado
