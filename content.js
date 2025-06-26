

console.log("📊 Coletando rentabilidade da B3...");

const coletarTabelas = () => {
  
  chrome.storage.local.get(["resultadoConsolidado"], (result) => {
    if (result && typeof result.resultadoConsolidado !== "undefined") {
      const valor = result.resultadoConsolidado;
      const valorFormatado = `R$ ${Math.abs(valor).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
  
      const titulo = document.querySelector(".b3i-total-acumulado__titulo");
      if (titulo) {
        const wrapper = document.createElement("div");
        wrapper.setAttribute("_ngcontent-ng-c266874271", "");
        wrapper.className = "b3i-total-acumulado__card__aside ng-star-inserted";
  
        const dataP = document.createElement("p");
        dataP.setAttribute("_ngcontent-ng-c266874271", "");
        dataP.className = "b3i-total-acumulado__disclaimer b3i-total-acumulado__card__aside__data";
        dataP.innerText = "Resultado Total Acumulado";
  
        const valorH2 = document.createElement("h2");
        valorH2.setAttribute("_ngcontent-ng-c266874271", "");
        valorH2.className = "b3i-total-acumulado__valor ng-star-inserted";
        valorH2.innerText = valorFormatado;
        valorH2.style.color = valor >= 0 ? "green" : "red";
        valorH2.style.fontWeight = "bold";
  
        // Monta a estrutura
        wrapper.appendChild(dataP);
        wrapper.appendChild(document.createComment("----"));
        wrapper.appendChild(valorH2);
        wrapper.appendChild(document.createComment("----"));
  
        // Substitui o título pelo novo conteúdo
        titulo.replaceWith(wrapper);
      }
    } else {
      console.log("⚠️ resultadoConsolidado não encontrado no storage.");
    }
  });
  
  
  
  
  
  const tituloPagina = document.querySelector(".b3i-cabecalho__pagina__titulo")?.innerText.trim();

  if (tituloPagina !== "Rentabilidade") {
    console.log(`⏳ Página atual é "${tituloPagina}". Aguardando "Rentabilidade"...`);
    setTimeout(coletarTabelas, 1000);
    return;
  }

  const tabelas = document.querySelectorAll("table[id^='tabela-ativo-']");

  if (tabelas.length === 0) {
    console.log("⏳ Nenhuma tabela visível ainda. Tentando de novo...");
    setTimeout(coletarTabelas, 1000);
    return;
  }

  const resultados = [];

  tabelas.forEach(tabela => {
    const idTabela = tabela.id;
    const idTitulo = `left_info_${idTabela}_top`;

    const tituloEl = document.getElementById(idTitulo);
    const categoria = tituloEl?.innerText.trim() || "Desconhecido";

    const linhas = tabela.querySelectorAll("tbody tr");

    linhas.forEach(row => {
      const colunas = row.querySelectorAll("td");

      const produto = colunas[0]?.innerText.trim();
      const resultadoBruto = colunas[5]?.innerText.trim();
      const rentabilidadeBruta = colunas[6]?.innerText.trim();

      if (produto && resultadoBruto && rentabilidadeBruta) {
        resultados.push({
          categoria,
          produto,
          resultadoBruto,
          rentabilidadeBruta
        });
      }
    });
  });

  console.log("✅ Dados capturados:", resultados);

  // Calcula a soma total dos resultados brutos
  let resultadoConsolidado = resultados.reduce((acc, item) => {
    let valor = item.resultadoBruto
      .replace("R$", "")         // remove R$
      .replace(/\./g, "")        // remove TODOS os pontos (milhar)
      .replace(",", ".")         // converte vírgula para ponto decimal
      .replace(/\s/g, "")        // remove espaços
      .replace("−", "-");        // usa símbolo unicode de menos, se houver
  
    valor = parseFloat(valor) || 0;
  
    return acc + valor;
  }, 0);
  

  console.log("💰 Resultado consolidado:", resultadoConsolidado.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  }));

  chrome.storage.local.set({
    todasRentabilidades: resultados,
    resultadoConsolidado
  }, () => {
    console.log("💾 Dados e total salvos no storage");
  });


};

window.addEventListener("load", () => {
  setTimeout(coletarTabelas, 1000);
});