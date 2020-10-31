Estrutura HTML5 

- Autor: Nilo César Lemos de Castro
- Data: 20/03/2017
- versão : 1.2
- Estrutura feita em HTML5 com foco e controle para conteúdos educacionais ligados a plataformas LMS ou plataformas em gerais. 


#Arquitetura do arquivo data.xml 
##arquivo base de cadastro das telas e informações de controle e compilamento do curso. Ex.:

```
#!html
<estrutura>

    <nivel id='modulo' titulo='Game'>
        <nivel id="a1" titulo="Abertura">
            <nivel id="aa1" titulo="AA1" path="aa1/index.html" avancar="2" transicao="alpha" setas="direita"/>
        </nivel>
        <nivel id="a2" titulo="conteudo>
            <nivel id="aa3" titulo="AA3" path="aa3/index.html" avancar="2" transicao="alpha" setas="ambas"/>
            <nivel id="aa4" titulo="AA4" path="aa4/index.html" avancar="2" transicao="alpha" setas="ambas"/>
            <nivel id="a3" titulo="interno>
                <nivel id="aa5" titulo="AA5" path="aa5/index.html" avancar="2" transicao="alpha" setas="ambas"/>
                <nivel id="aa6" titulo="AA6" path="aa6/index.html" avancar="2" transicao="alpha" setas="ambas"/>
            </nivel>
        </nivel>
        <nivel id="a4" titulo="final>
            <nivel id="aa7" titulo="AA7" path="aa7/index.html" avancar="2" transicao="alpha" setas="ambas"/>
            <nivel id="aa8" titulo="AA8" path="aa8/index.html" avancar="2" transicao="alpha" setas="esquerda"/>
        </nivel>
    </nivel>
    <info>
        <debug>sim</debug>
        <cache>nao</cache>
        <compilador>
            <titulo>Vibarc</titulo>
            <zip_name>vibarc_scorm</zip_name>
            <padrao>scorm1.2</padrao>
            <resize>sim</resize>
            <speed>nao</speed>
            <log>sim</log>
        </compilador>
    </info>
    
</estrutura>
```
O conteúdo inteiro do data.xml ficará dentro da tag /</estrutura/>/.

```
#!html
<nivel id="aa1" titulo="Abertura do treinamento" path="aa1/index.html" avancar="2" transicao="alpha" setas="direita"/>
```

##Subníveis dentro de estrutura com tag /</nivel/>/ serão os definidores dos cadastros das telas. Conforme feito no exemplo acima. 

##Propriedades

* id -> identificador único da tela. [ALERTA] Não se deve repetir em momento algum. 
* titulo -> valor válido para uso em menu ou topo de sites. Pode possuir acento e mais de uma palavra.
* path -> Caminho base de onde se encontra a tela. Caminho de origem que fica dentro de views/telas/..
* avancar -> valor definido em segundos de quando a tela será liberada - caso haja no curso setas de avanço/volta. Caso o valor seja negativo (-1) a tela será liberado apenas quando usado o metado de destravar tela.
* transicão -> Por padrão, há 3 formas de transição entre as telas horizontal, vertical e alpha.
* setas -> Por padrão, há 3 valores possíveis para as setas -. direita (caso queira que veja apenas a seta direita), esquerda e ambas(quando queira as 2 visiveis). 

##A tag /</info/>/ trata de informações importante de controle e gerencimento da compilação do treinamento. 

```
#!html
<info>
 <debug>sim</debug>
 <cache>nao</cache>
 <compilador>
  <titulo>Vibarc</titulo>
  <zip_name>vibarc_scorm</zip_name>
  <padrao>scorm1.2</padrao>
  <resize>sim</resize>
  <speed>nao</speed>
  <log>sim</log>
 </compilador>
</info>
```

##Propriedades

* debug -> Caso o valor seja sim/true o debug será ativado quando o treinamento estiver em desenvolvimento, para facilitar a navegação do treinamento.
* cache -> Caso necessite, durante o desenvolvimento, gravar os valores da paginação ou mesmo do suspendata, para facilirar o desenvolvimento.

##Propriedades de Compilação

* tiluto -> Titulo usado para criar o manifesto do SCORM. [ Essa estrutura cria um pacote com os requisitos mínimos necessarários para rodar em LMS ]. Basta apenas compilar.
* zip_name -> Nome base do arquivo ZIP que será gerado depois de compilado.
* padrão -> scorm1.2 [Por enquanto, a unica versão disponível]
* resize -> Caso necessite o que o navegador redimecione a tela inteira do treinamento com o valor 100%. 
* speed -> Informará no inicio do treinamento, durante o carregamento, o valor de download requisitado pela conexão do usuário. Essa informação será gravada no suspendata.
* log -> Ativar e desativar o log do console.log - Utilizado sempre que o treinamento esteja em sua ultima versão de desenvolvimento.


#Modo de Compilação

Para que o curso sejá compilado será necessário a instalação de apenas uma ferramenta:
[ node ] https://nodejs.org/en/ 
Instale sempre a versão LTS(estável).

##Dentro da pasta do treinamento há 2 arquivos [ compilarWIN e compilarMAC]; 
* O primeiro para uso no Windows.
* O segundo para uso no Mac.

Através da abertura desses arquivos, você será capaz de compilar o seu treinamento, o que gerará uma pasta e um zip na raiz do seu treinamento com a denominação definida por você na propriedade zip_name.  


#Objeto Global com funcionalidades (JS)

##course - É objeto acessível em todas as telas. 
##Caso a tela se trate de um iframe essa valor passa a ser: parent.course ou window.parent.course.


#Métodos e propriedades do course





    

