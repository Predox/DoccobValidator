function ValidateLine(linha){
    var linha = document.getElementById("line").value
    Validate(linha)
}

function Validate(linha){
    var inicio = linha.slice(0,3)
    switch(inicio){
        case "000":
            Ooo(linha)
        break

        case "350":
            Cccl(linha)
        break
    
        case "351":
            Cccli(linha)
        break

        case "352":
            Ccclii(linha)
        break

        case "353":
            Cccliii(linha)
        break

        case "354":
            Cccliv(linha)
        break

        case "355":
            Ccclv(linha)
        break

        case "":
            Empty()
        break
    }
}

function LerArquivo() {
    const content = document.querySelector(".exibir");
    const [file] = document.querySelector("input[type=file]").files;
    const leitura = new FileReader();

    leitura.addEventListener("load", () => {
        // O conteúdo do arquivo é lido como string
        // Dividimos o conteúdo por linhas, criando um array
        const a = leitura.result.split('\r\n'); // Correção aqui: 'a' dentro do escopo do evento
        console.log(a);
        
        // Exibe as linhas no elemento com a classe 'exibir'
        content.innerHTML = a.join('<br>');
        
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
    arq.forEach(element => {
        Validate(element)
    });
}


