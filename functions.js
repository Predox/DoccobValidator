function SetLength(linha,response){

            response = response.concat("<tr><td> </td><td> </td></tr><tr><td><label>TAMANHO LINHA:</label></td><td> " + linha.length + "</td></tr></table></div>")

        return response
}

function ValidateEmptySpace(analise,id,idNumber,responseValidate = "vazio"){
    const statusValidate = [
        [1,1,1,1,1,1,1,1,0,0],
        [1,1,0],
        [1,1,0,0],
        [1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0],
        [1,1,0,1,0],
        [1,0,1,1,1,1,0,0], //Validar os status no doccob
        [1,1,1,1,0]
    ]
    var analiseEmpty = 0
    for(i = 0; i <= analise.length-1; i++){
        if(analise[i] != " "){
            analiseEmpty ++
        }
    }
    if(analiseEmpty == 0){
        if(statusValidate[id][idNumber] == 1){
            responseValidate = "<label class='problem'><i class='bi bi-exclamation-triangle-fill'><span class='alert'>Este item é obrigatório</span></i></label>"
            return responseValidate
        }else{
            return "<label>(" + responseValidate + ")</label>"
            
        }
    }else{
        return analise
    }

}

function Ooo(linha, type){
        var idReg = linha.slice(0,3)
        var idRem = linha.slice(3,38)
        var idDes = linha.slice(38,73)
        var data = [linha.slice(73,75),linha.slice(75,77),linha.slice(77,79)]
        var horario = [linha.slice(79,81),linha.slice(81,83)]
        var idInter = linha.slice(83,95)
        var response = (
            "<div class='containerTable'><table><tr><td><label>IDENTIFICADOR DE REGISTRO:</label></td><td> " + ValidateEmptySpace(idReg,0,0) +
            "</td></tr>\n<tr><td><label>IDENTIFICAÇÃO DO REMETENTE:</label></td><td> " + ValidateEmptySpace(idRem,0,1) +
            "</td></tr>\n<tr><td><label>IDENTIFICAÇÃO DO DESTINATÁRIO:</label></td><td> " + ValidateEmptySpace(idDes,0,2) +
            "</td></tr>\n<tr><td><label>DATA:</label></td><td> " + ValidateEmptySpace(data[0],0,3) + "/" + ValidateEmptySpace(data[1],0,4) + "/" + ValidateEmptySpace(data[2],0,5) +
            "</td></tr>\n<tr><td><label>HORA:</label></td><td> " + ValidateEmptySpace((horario[0]),0,6) + ":" + ValidateEmptySpace(horario[1],0,7) +
            "</td></tr>\n<tr><td><label>IDENTIFICAÇÃO DO INTERCÂMBIO:</label></td><td> " + ValidateEmptySpace(idInter,0,8)
        )  
        var filler = linha.slice(95,169)
        response = SetLength(linha,response)   
        if( type == "responseArqLabel"){
                document.getElementById(type).innerHTML = document.getElementById(type).innerHTML + response
        }
        if( type == "responseLineLabel"){
                document.getElementById(type).innerHTML = response
        }
}

function Cccl(linha, type){
        var idReg = linha.slice(0,3)
        var idRem = linha.slice(3,17)
        var response = (
            "<div class='containerTable'><table><tr><td><label>IDENTIFICADOR DE REGISTRO:</label></td><td> " + ValidateEmptySpace(idReg,1,0) +
            "</td></tr>\n<tr><td><label>IDENTIFICAÇÃO DO REMETENTE:</label></td><td> " + ValidateEmptySpace(idRem,1,1)
        )  
        var filler = linha.slice(17,169)
        response = SetLength(linha,response)
        document.getElementById(type).innerHTML = document.getElementById(type).innerHTML + response
}

function Cccli(linha, type){
        var idReg = linha.slice(0,3)
        var cgm = linha.slice(3,17)
        var razSoc = linha.slice(17,57)
        var response = ("<div class='containerTable'><table><tr><td><label>IDENTIFICADOR DE REGISTRO:</label></td><td> " + ValidateEmptySpace(idReg,2,0) +
                "</td></tr>\n<tr><td><label>C.G.C.:</label></td><td> " + ValidateEmptySpace(cgm,2,1) +
                "</td></tr>\n<tr><td><label>RAZÃO SOCIAL:</label></td><td> " + ValidateEmptySpace(razSoc,2,2)
        )  
        var filler = linha.slice(57,169)
        response = SetLength(linha,response)
        if( type == "responseArqLabel"){
                document.getElementById(type).innerHTML = document.getElementById(type).innerHTML + response
        }
        if( type == "responseLineLabel"){
                document.getElementById(type).innerHTML = response
        }
}

function Ccclii(linha, type){
        var idReg = linha.slice(0,3)
        var filEmiDoc = linha.slice(3,13)
        var tipDocCob = linha.slice(13,14)
        var serDocCob = linha.slice(14,17)
        var numDocCob = linha.slice(17,27)
        var data = [linha.slice(27,29),linha.slice(29,31),linha.slice(31,35)]
        var dataVen = [linha.slice(35,37),linha.slice(37,39),linha.slice(39,43)]
        var valDocCob = [linha.slice(43,56),linha.slice(56,58)]
        var tipCob = linha.slice(58,61)
        var valTotalICMS = [linha.slice(61,72),linha.slice(72,74)]
        var valJurPDia = linha.slice(74,91)
        var dataLimPagDesc = [linha.slice(91,93),linha.slice(93,95),linha.slice(95,99)]
        var valDes = linha.slice(99,114)
        var ideAgeCob = linha.slice(114,149)
        var numAgeBanc = linha.slice(149,153)
        var digVerNumAge = linha.slice(153,154)
        var numConCor = linha.slice(154,164)
        var digVerConCor = linha.slice(164,166)
        var acaoDoc = linha.slice(166,167)
        var response = ("<div class='containerTable'><table><tr><td><label>IDENTIFICADOR DE REGISTRO:</label></td><td> " + ValidateEmptySpace(idReg,3,0) +
                "</td></tr>\n<tr><td><label>FILIAL EMISSORA DO DOCUMENTO:</label></td><td> " + ValidateEmptySpace(filEmiDoc,3,1) +
                "</td></tr>\n<tr><td><label>TIPO DO DOCUMENTO DE COBRANÇA:</label></td><td> " + ValidateEmptySpace(tipDocCob,3,2) +
                "</td></tr>\n<tr><td><label>SÉRIE DO DOCUMENTO DE COBRANÇA:</label></td><td> " + ValidateEmptySpace(serDocCob,3,3) +
                "</td></tr>\n<tr><td><label>NÚMERO DO DOCUMENTO DE COBRANÇA:</label></td><td> " + ValidateEmptySpace(numDocCob,3,4) +
                "</td></tr>\n<tr><td><label>DATA DE EMISSÃO:</label></td><td> " + ValidateEmptySpace(data[0],3,5) + "/" + ValidateEmptySpace(data[1],3,6) + "/" + ValidateEmptySpace(data[2],3,7) +
                "</td></tr>\n<tr><td><label>DATA DE VENCIMENTO:</label></td><td> " + ValidateEmptySpace(dataVen[0],3,8) + "/" + ValidateEmptySpace(dataVen[1],3,9) + "/" + ValidateEmptySpace(dataVen[2],3,10) +
                "</td></tr>\n<tr><td><label>VALOR DO DOCUMENTO DE COBRANÇA:</label></td><td> " + ValidateEmptySpace(valDocCob[0],3,11).replace(/^0+/,"") + "," + ValidateEmptySpace(valDocCob[1],3,12) + " <label class='mini'>(" + valDocCob[0] + "," + valDocCob[1] + ")</label>" +
                "</td></tr>\n<tr><td><label>TIPO DE COBRANÇA:</label></td><td> " + ValidateEmptySpace(tipCob,3,13) +
                "</td></tr>\n<tr><td><label>VALOR TOTAL DO ICMS:</label></td><td> " + ValidateEmptySpace(valTotalICMS[0],3,14).replace(/^0+/,"") + "," + ValidateEmptySpace(valTotalICMS[1],3,15) + " <label class='mini'>(" + valTotalICMS[0] + "," + valTotalICMS[1] + ")</label>" +
                "</td></tr>\n<tr><td><label>VALOR – JUROS POR DIA DE ATRASO:</label></td><td> " + ValidateEmptySpace(valJurPDia,3,16).replace(/^0+(?=0)/, "")+ " <label class='mini'>(" + valJurPDia + ")</label>" +
                "</td></tr>\n<tr><td><label>DATA LIMITE P/ PAGTO C/ DESCONTO:</label></td><td> " + ValidateEmptySpace(dataLimPagDesc[0],3,17) + "/" + ValidateEmptySpace(dataLimPagDesc[1],3,18) + "/" + ValidateEmptySpace(dataLimPagDesc[2],3,19) +
                "</td></tr>\n<tr><td><label>VALOR DO DESCONTO:</label></td><td> " + ValidateEmptySpace(valDes,3,20).replace(/^0+(?=0)/, "") + " <label class='mini'>(" + valDes + ")</label>" +
                "</td></tr>\n<tr><td><label>IDENTIFICAÇÃO DO AGENTE DE COBRANÇA:</label></td><td> " + ValidateEmptySpace(ideAgeCob,3,21) +
                "</td></tr>\n<tr><td><label>NÚMERO DA AGÊNCIA BANCÁRIA:</label></td><td> " + ValidateEmptySpace(numAgeBanc,3,22) +
                "</td></tr>\n<tr><td><label>DÍGITO VERIFICADOR NUM. DA AGÊNCIA:</label></td><td> " + ValidateEmptySpace(digVerNumAge,3,23) +
                "</td></tr>\n<tr><td><label>NÚMERO DA CONTA CORRENTE:</label></td><td> " + ValidateEmptySpace(numConCor,3,24) +
                "</td></tr>\n<tr><td><label>DÍGITO VERIFICADOR CONTA CORRENTE:</label></td><td> " + ValidateEmptySpace(digVerConCor,3,25) +
                "</td></tr>\n<tr><td><label>AÇÃO DO DOCUMENTO:</label></td><td> " + ValidateEmptySpace(acaoDoc,3,26)
        )  
        var filler = linha.slice(167,169)
        response = SetLength(linha,response)
        if( type == "responseArqLabel"){
                document.getElementById(type).innerHTML = document.getElementById(type).innerHTML + response
        }
        if( type == "responseLineLabel"){
                document.getElementById(type).innerHTML = response
        }
}

function Cccliii(linha, type){
        var idReg = linha.slice(0,3)
        var filEmiDoc = linha.slice(3,13)
        var serCon = linha.slice(13,18)
        var numCon = linha.slice(18,30)
        var response = ("<div class='containerTable'><table><tr><td><label>IDENTIFICADOR DE REGISTRO:</label></td><td> " + ValidateEmptySpace(idReg,4,0) +
                "</td></tr>\n<tr><td><label>FILIAL EMISSORA DO DOCUMENTO:</label></td><td> " + ValidateEmptySpace(filEmiDoc,4,1) +
                "</td></tr>\n<tr><td><label>SÉRIE DO CONHECIMENTO:</label></td><td> " + ValidateEmptySpace(serCon,4,2) +
                "</td></tr>\n<tr><td><label>NÚMERO DO CONHECIMENTO:</label></td><td> " + ValidateEmptySpace(numCon,4,3)
        )  
        var filler = linha.slice(30,169)
        response = SetLength(linha,response)
        if( type == "responseArqLabel"){
                document.getElementById(type).innerHTML = document.getElementById(type).innerHTML + response
        }
        if( type == "responseLineLabel"){
                document.getElementById(type).innerHTML = response
        }
}

function Cccliv(linha, type){
        const status = [1,0,1,1,1,1,1,1,1,1,0,0]// 1 = M --- 0 = C
        var idReg = linha.slice(0,3)
        var serie = linha.slice(3,6)
        var numNF = linha.slice(6,14)
        var dataEmiNF = [linha.slice(14,16),linha.slice(16,18),linha.slice(18,22)]
        var pesNF = [linha.slice(22,27),linha.slice(27,29)]
        var valMerNF = [linha.slice(29,42),linha.slice(42,44)]
        var cgcEmiNF = linha.slice(44,58)
        var response = ("<div class='containerTable'><table><tr><td><label>IDENTIFICADOR DE REGISTRO:</label></td><td> " + ValidateEmptySpace(idReg,5,0) +
                "</td></tr>\n<tr><td><label>SÉRIE:</label></td><td> " + ValidateEmptySpace(serie,5,1) +
                "</td></tr>\n<tr><td><label>NÚMERO DA NOTA FISCAL:</label></td><td> " + ValidateEmptySpace(numNF,5,2) +
                "</td></tr>\n<tr><td><label>DATA DE EMISSÃO DA NOTA FISCAL:</label></td><td> " + ValidateEmptySpace(dataEmiNF[0],5,3) + "/" + ValidateEmptySpace(dataEmiNF[1],5,4) + "/" + ValidateEmptySpace(dataEmiNF[2],5,5) +
                "</td></tr>\n<tr><td><label>PESO DA NOTA FISCAL:</label></td><td> " + ValidateEmptySpace(pesNF[0],5,6).replace(/^0+/,"") + "," + ValidateEmptySpace(pesNF[1],5,7) + " <label class='mini'>(" + pesNF[0] + "," + pesNF[1] + ")</label>" +
                "</td></tr>\n<tr><td><label>VALOR DA MERCADORIA NA NOTA FISCAL:</label></td><td> " + ValidateEmptySpace(valMerNF[0],5,8).replace(/^0+/,"") + "," + ValidateEmptySpace(valMerNF[1],5,9) + " <label class='mini'>(" + valMerNF[0] + "," + valMerNF[1] + ")</label>" +
                "</td></tr>\n<tr><td><label>CGC DO EMISSOR DA NOTA FISCAL:</label></td><td> " + ValidateEmptySpace(cgcEmiNF,5,10)
        )  
        filler = linha.slice(58,169)
        response = SetLength(linha,response)
        if( type == "responseArqLabel"){
                document.getElementById(type).innerHTML = document.getElementById(type).innerHTML + response
        }
        if( type == "responseLineLabel"){
                document.getElementById(type).innerHTML = response
        }
}

function Ccclv(linha, type){
        const status = [1,1,1,1,0]// 1 = M --- 0 = C
        var idReg = linha.slice(0,3)
        var qTotDocCob = linha.slice(3,7)
        var vTotDocCob = [linha.slice(7,20),linha.slice(20,22)]
        var response = ("<div class='containerTable'><table><tr><td><label>IDENTIFICADOR DE REGISTRO:</label></td><td> " + ValidateEmptySpace(idReg,6,0) +
                "</td></tr>\n<tr><td><label>QTDE. TOTAL DOCTOS. DE COBRANÇA:</label></td><td> " + ValidateEmptySpace(qTotDocCob,6,1) +
                "</td></tr>\n<tr><td><label>VALOR TOTAL DOCTOS. DE COBRANÇA:</label></td><td> " + ValidateEmptySpace(vTotDocCob[0],6,2).replace(/^0+/,"") + "," + ValidateEmptySpace(vTotDocCob[1],6,3) + " <label class='mini'>(" + vTotDocCob[0] + "," + vTotDocCob[1] + ")</label>"
        )  
        var filler = linha.slice(30,169)
        response = SetLength(linha,response)
        if( type == "responseArqLabel"){
                document.getElementById(type).innerHTML = document.getElementById(type).innerHTML + response
        }
        if( type == "responseLineLabel"){
                document.getElementById(type).innerHTML = response
        }
}

function Empty(){
    document.getElementById("responseLineLabel").innerHTML = ""
}

function EmptyArq(){
        document.getElementById("responseArqLabel").innerHTML = ""
    }
