function ValidateLine(linha){
    var type = "line"
    var linha = document.getElementById("line").value
    Validate(linha, type, 1)
}

function Validate(linha, type, lineNumber){
    if(type == "arq") type = "responseArqLabel"
    if(type == "line") type = "responseLineLabel"
    var inicio = linha.slice(0,3)
    switch(inicio){
        case "000":
            Ooo(linha, type, lineNumber)
        break

        case "350":
            Cccl(linha, type, lineNumber)
        break
    
        case "351":
            Cccli(linha, type, lineNumber)
        break

        case "352":
            Ccclii(linha, type, lineNumber)
        break

        case "353":
            Cccliii(linha, type, lineNumber)
        break

        case "354":
            Cccliv(linha, type, lineNumber)
        break

        case "355":
            Ccclv(linha, type, lineNumber)
        break

        case "":
            Empty()
        break
    }
}

function LerArquivo() {
    const content = document.querySelector("#responseArqLabel");
    const [file] = document.querySelector("input[type=file]").files;
    const leitura = new FileReader();

    leitura.addEventListener("load", () => {
        // O conteúdo do arquivo é lido como string
        // Dividimos o conteúdo por linhas, criando um array
        const a = leitura.result.split(/\r?\n/); // Correção aqui: 'a' dentro do escopo do evento

        ValidateArq(a)
        // Agora você pode acessar a.length dentro do evento
        // var b = a.length; // Correção aqui: uso correto de 'length'
        // console.log(b);  // Exibe o tamanho do array no console
    }, false);

    // Verifica se o arquivo foi selecionado
    if (file) {
        leitura.readAsText(file);  // Lê o arquivo como texto
    }
}

async function ValidateArq(arq){
    var button = document.getElementById('getArq');
    var barraBusca = document.getElementById('buscaArq');
    var type = "arq"
    EmptyArq()
    arq.forEach((element, idx) => {
         const lineNumber = idx + 1;
        Validate(element, type, lineNumber);
    });

    button.style.justifyContent = 'start'
    barraBusca.style.display = 'flex'
    await sleep(200)
    barraBusca.style.transform = 'translateY(10px)'
}

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function differAa(){
    var elemento = document.getElementById('differAa')
    elemento.classList.toggle('biPressed')
}

function searchWholeWord(){
    var elemento = document.getElementById('searchWholeWord')
    elemento.classList.toggle('biPressed')
}
