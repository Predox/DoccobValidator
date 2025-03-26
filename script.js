function ValidateLine(linha){
    var linha = document.getElementById("line").value
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

function Teste(){
    console.log("aaa")
}


function ValidateArq(){
    
}


