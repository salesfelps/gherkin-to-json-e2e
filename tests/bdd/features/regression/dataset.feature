Feature: Dataset (modal, normalização e exportação de CSV adicional)

  Background:
    Given que estou na aplicação do conversor
    And que eu limpo o estado da aplicação

  @smoke @dataset
  Scenario: Criar Dataset manualmente e exportar gera chip db- e download CSV
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário com Dataset"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given que tenho <User Id>
      When eu somo <valor>
      Then o resultado deve ser <resultado>
      """
    And eu abro o modal de Dataset do cenário 1
    And eu adiciono o parâmetro de dataset "User Id"
    And eu adiciono o parâmetro de dataset "valor"
    And eu adiciono o parâmetro de dataset "resultado"
    And eu adiciono uma variável (linha) no dataset
    And eu preencho a célula do dataset (variável 1, parâmetro "User_Id") com "10"
    And eu preencho a célula do dataset (variável 1, parâmetro "valor") com "2"
    And eu preencho a célula do dataset (variável 1, parâmetro "resultado") com "12"
    And eu salvo o dataset
    When eu clico em Gerar JSON (com Dataset)
    Then deve abrir um aviso de Dataset com a mensagem de importação via CSV
    And deve existir ao menos 1 arquivo de Dataset gerado para download
    When eu baixo o primeiro CSV de Dataset gerado
    Then o download do Dataset deve ter extensão ".csv"

  @regression @dataset
  Scenario: Auto-detect de parâmetros a partir do Gherkin cria parâmetros normalizados
    When eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given que tenho <User Id>
      When eu somo <valor>
      Then o resultado deve ser <resultado>
      """
    And eu abro o modal de Dataset do cenário 1
    And eu importo parâmetros do cenário Gherkin
    Then devo ver o parâmetro "UserId" listado no dataset

  @regression @dataset
  Scenario: Impedir adicionar parâmetro duplicado exibe mensagem específica
    When eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given que tenho <User Id>
      When eu somo <valor>
      Then o resultado deve ser <resultado>
      """
    And eu abro o modal de Dataset do cenário 1
    And eu adiciono o parâmetro de dataset "User Id"
    And eu tento adicionar o parâmetro de dataset duplicado "User Id"
    Then devo ver o erro do dataset "Já existe um parâmetro com este nome."

  @regression @dataset
  Scenario: Alterações não salvas impedem fechar pelo X e mostram aviso
    When eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given que tenho <User Id>
      When eu somo <valor>
      Then o resultado deve ser <resultado>
      """
    And eu abro o modal de Dataset do cenário 1
    And eu adiciono o parâmetro de dataset "User Id"
    When eu tento fechar o dataset pelo botão "Fechar"
    Then devo ver o aviso de alterações não salvas no dataset
    When eu cancelo o dataset (descartar)
    Then o modal de dataset deve estar fechado

  @regression @dataset
  Scenario: Remover parâmetro e variável do Dataset
    When eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given que tenho <User Id>
      When eu somo <valor>
      Then o resultado deve ser <resultado>
      """
    And eu abro o modal de Dataset do cenário 1
    And eu adiciono o parâmetro de dataset "User Id"
    And eu adiciono o parâmetro de dataset "valor"
    And eu adiciono uma variável (linha) no dataset
    And eu preencho a célula do dataset (variável 1, parâmetro "User_Id") com "10"
    When eu removo o parâmetro "User_Id" do dataset
    Then não devo ver o parâmetro "User_Id" listado no dataset
    When eu cancelo o dataset (descartar)
    Then o modal de dataset deve estar fechado

  @regression @dataset
  Scenario: Importar CSV dentro do modal de Dataset popula parâmetros e variáveis
    When eu preencho o título do cenário 1 com "Cenário CSV"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given que tenho <User Id>
      When eu somo <valor>
      Then o resultado deve ser <resultado>
      """
    And eu abro o modal de Dataset do cenário 1
    And eu importo CSV no modal de Dataset com o arquivo "dataset-import.csv"
    Then devo ver o parâmetro "User_Id" listado no dataset
