Feature: Exportar JSON (validações, conteúdo, formatação e ordem)

  Background:
    Given que estou na aplicação do conversor
    And que eu limpo o estado da aplicação

  @smoke @export-json
  Scenario: Exportar JSON com 1 cenário válido gera estrutura esperada
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário 1"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given que tenho 1
      When eu somo 2
      Then o resultado deve ser 3
      """
    And eu clico em Gerar JSON
    Then devo ver um JSON gerado com indentação de 4 espaços
    And o JSON deve conter 1 cenário na ordem da tela
    And o cenário 1 no JSON deve conter campos obrigatórios e conteúdo consistente

  @regression @export-json
  Scenario: Validar obrigatoriedade do campo Projeto (topo)
    When eu preencho o repositório do cabeçalho com "Squad/Feature"
    And eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given algo
      When acao
      Then resultado
      """
    And eu clico em Gerar JSON
    Then devo ver o erro "O campo \"Projeto\" é obrigatório."

  @regression @export-json
  Scenario: Validar regra de 4 letras para o Projeto (topo)
    When eu preencho o projeto do cabeçalho com "ABC"
    And eu preencho o repositório do cabeçalho com "Squad/Feature"
    And eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given algo
      When acao
      Then resultado
      """
    And eu clico em Gerar JSON
    Then devo ver o erro "O campo \"Projeto\" deve conter 4 letras."

  @regression @export-json
  Scenario: Validar obrigatoriedade do campo Repositório (topo)
    When eu preencho o projeto do cabeçalho com "ABCD"
    And eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given algo
      When acao
      Then resultado
      """
    And eu clico em Gerar JSON
    Then devo ver o erro "O campo \"Repositório\" é obrigatório."

  @regression @export-json
  Scenario: Validar regra de "/" no Repositório (topo)
    When eu preencho o projeto do cabeçalho com "ABCD"
    And eu preencho o repositório do cabeçalho com "SemBarra"
    And eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given algo
      When acao
      Then resultado
      """
    And eu clico em Gerar JSON
    Then devo ver o erro "O campo \"Repositório\" deve conter \"/\"."

  @regression @export-json
  Scenario: Validar obrigatoriedade de Título por cenário
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given algo
      When acao
      Then resultado
      """
    And eu clico em Gerar JSON
    Then devo ver o erro "O campo \"Titulo\" do cenário #1 é obrigatório."

  @regression @export-json
  Scenario: Validar obrigatoriedade de Gherkin por cenário
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário"
    And eu clico em Gerar JSON
    Then devo ver o erro "O campo \"Cenario (Gherkin)\" do cenário #1 é obrigatório."

  @regression @export-json
  Scenario: Validar regra do Then obrigatório
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given algo
      When acao
      And mais uma coisa
      """
    And eu clico em Gerar JSON
    Then devo ver o erro "Cenário #1 deve conter pelo menos um passo \"Then\"."

  @regression @export-json
  Scenario: Normalização PT->EN permite usar "Então" e ainda cumprir regra do Then
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Dado algo
      Quando acao
      Então resultado
      """
    And eu clico em Gerar JSON
    Then o JSON deve conter 1 cenário na ordem da tela

  @regression @export-json
  Scenario: Exportar JSON com múltiplos cenários mantém ordem da tela
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
    And eu clico em Gerar JSON
    Then o JSON deve conter 2 cenários na ordem da tela
    And o cenário 1 no JSON deve ter summary "Primeiro"
    And o cenário 2 no JSON deve ter summary "Segundo"

  @regression @export-json
  Scenario: Download do JSON gera arquivo com extensão .json
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu clico em Gerar JSON
    And eu baixo o JSON gerado
    Then o download do JSON deve ter extensão ".json"

  @regression @export-json
  Scenario: Copiar JSON para clipboard exibe feedback "Copiado"
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu clico em Gerar JSON
    When eu copio o JSON gerado
    Then o botão de copiar deve exibir "Copiado"

  @regression @export-json
  Scenario: Normalização PT->EN converte Dado/Quando/Então para Given/When/Then no JSON
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário PT"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Dado que tenho algo
      Quando eu faço acao
      Então devo ver resultado
      """
    And eu clico em Gerar JSON
    Then o Gherkin do cenário 1 no JSON deve conter "Given"
    And o Gherkin do cenário 1 no JSON deve conter "When"
    And o Gherkin do cenário 1 no JSON deve conter "Then"

  @regression @export-json
  Scenario: A ordem dos cenários no JSON deve seguir a ordem em tela (após mover)
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
      Given a2
      When b2
      Then c2
      """
    And eu movo o cenário 2 para cima
    And eu clico em Gerar JSON
    Then o JSON deve conter 2 cenários na ordem da tela
    And o cenário 1 no JSON deve ter summary "Segundo"
    And o cenário 2 no JSON deve ter summary "Primeiro"

  @regression @export-json
  Scenario: Baixar JSON deve iniciar download
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu clico em Gerar JSON
    When eu baixo o JSON gerado
    Then o download do JSON deve ter extensão ".json"
