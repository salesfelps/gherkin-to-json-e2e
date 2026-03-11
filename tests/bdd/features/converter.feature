Feature: Conversor Gherkin -> JSON

  Background:
    Given que estou na aplicação do conversor

  @smoke
  Scenario: Abrir a aplicação
    Then devo ver que a página carregou

  @converter
  Scenario: Gerar JSON com cenário preenchido produz saída válida
    When eu preencho o campo Gherkin com:
      """
      Given que tenho 1
      When eu somo 2
      Then o resultado deve ser 3
      """
    And eu clico em Converter
    Then devo ver um JSON gerado
