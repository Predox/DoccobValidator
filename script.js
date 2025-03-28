function ValidateLine(linha){
    var type = "line"
    var linha = document.getElementById("line").value
    Validate(linha, type)
}

function Validate(linha, type){
    if(type == "arq") type = "responseArqLabel"
    if(type == "line") type = "responseLineLabel"
    var inicio = linha.slice(0,3)
    switch(inicio){
        case "000":
            Ooo(linha, type)
        break

        case "350":
            Cccl(linha, type)
        break
    
        case "351":
            Cccli(linha, type)
        break

        case "352":
            Ccclii(linha, type)
        break

        case "353":
            Cccliii(linha, type)
        break

        case "354":
            Cccliv(linha, type)
        break

        case "355":
            Ccclv(linha, type)
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
        const a = leitura.result.split('\r\n'); // Correção aqui: 'a' dentro do escopo do evento

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

function ValidateArq(arq){
    var type = "arq"
    EmptyArq()
    arq.forEach(element => {
        Validate(element, type)
    });
}


