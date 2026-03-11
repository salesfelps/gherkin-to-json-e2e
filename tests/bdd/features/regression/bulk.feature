Feature: Colar cenários (bulk paste)

  Background:
    Given que estou na aplicação do conversor
    And que eu limpo o estado da aplicação

  @smoke @bulk
  Scenario: Converter bulk com texto inválido mostra erro específico
    When eu abro o modo de colar cenários
    And eu colo o texto bulk:
      """
      @smoke
      @regression
      """
    And eu clico em Converter (bulk)
    Then devo ver o erro de bulk "Não foi possível identificar cenários. Verifique o texto colado."

  @regression @bulk
  Scenario: Converter bulk com 2 cenários em PT/EN cria cenários no DOM
    When eu abro o modo de colar cenários
    And eu colo o texto bulk:
      """
      Cenário: Primeiro
        Dado que tenho 1
        Quando eu somo 2
        Então o resultado deve ser 3

      Scenario: Second
        Given I have 1
        When I add 2
        Then I should see 3
      """
    And eu clico em Converter (bulk)
    Then devo ver 2 cenários na tela

  @regression @bulk @dataset
  Scenario: Bulk com Scenario Outline + Examples cria Dataset automaticamente
    When eu abro o modo de colar cenários
    And eu colo o texto bulk:
      """
      Scenario Outline: Soma com exemplos
        Given que tenho <User Id>
        When eu somo <valor>
        Then o resultado deve ser <resultado>

      Examples:
        | User Id | valor | resultado |
        | 10      | 2     | 12        |
      """
    And eu clico em Converter (bulk)
    Then devo ver 1 cenário na tela
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu clico em Gerar JSON
    Then deve existir ao menos 1 arquivo de Dataset gerado para download

  @regression @bulk
  Scenario: Bulk com 60 cenários exibe overlay de carregamento (com mensagem de progresso)
    When eu abro o modo de colar cenários
    And eu colo 60 cenários válidos no bulk
    And eu clico em Converter (bulk)
    Then devo ver 60 cenários na tela

  @regression @bulk
  Scenario: Converter bulk com textarea vazio mostra erro
    When eu abro o modo de colar cenários
    And eu clico em Converter (bulk)
    Then devo ver o erro de bulk "Não foi possível identificar cenários. Verifique o texto colado."
