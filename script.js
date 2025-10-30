// Array para armazenar os produtos
let produtos = [];

// Função principal para carregar os produtos
async function carregarProdutos() {
    console.log('Iniciando carregamento...');
    
    try {
        // Buscar o arquivo CSV
        const resposta = await fetch('cremoso.csv');
        const textoCSV = await resposta.text();
        
        console.log('CSV carregado:', textoCSV.substring(0, 200));
        
        // Converter CSV para array de objetos
        const linhas = textoCSV.split('\n');
        console.log('Total de linhas:', linhas.length);
        
        produtos = [];
        
        // Processar cada linha (começando da linha 1, pulando o cabeçalho)
        for (let i = 1; i < linhas.length; i++) {
            if (linhas[i].trim() === '') continue;
            
            const colunas = linhas[i].split(';');
            console.log('Linha', i, 'colunas:', colunas);
            
            if (colunas.length >= 6) {
                // Corrigir o preço - remover espaços e converter
                let preco = colunas[3].trim();
                preco = preco.replace(',', '.').replace(/\s/g, '');
                
                const produto = {
                    codigo: colunas[0].trim(),
                    descricao: colunas[1].trim(),
                    unidade: colunas[2].trim(),
                    preco: parseFloat(preco) || 0,
                    grupo: colunas[4].trim(),
                    subgrupo: colunas[5].trim()
                };
                
                console.log('Produto processado:', produto);
                
                // Só adiciona se tiver descrição
                if (produto.descricao && produto.descricao !== 'DESCRICAO') {
                    produtos.push(produto);
                }
            }
        }
        
        console.log('Produtos carregados:', produtos);
        exibirProdutos();
        
    } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
        document.getElementById('corpo-tabela').innerHTML = 
            '<tr><td colspan="6" style="text-align: center; color: red;">Erro ao carregar produtos: ' + erro.message + '</td></tr>';
    }
}

// Função para exibir produtos na tabela
function exibirProdutos() {
    const corpoTabela = document.getElementById('corpo-tabela');
    
    if (produtos.length === 0) {
        corpoTabela.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum produto encontrado</td></tr>';
        return;
    }
    
    // Criar linhas da tabela
    corpoTabela.innerHTML = produtos.map(produto => `
        <tr>
            <td>${produto.codigo}</td>
            <td><strong>${produto.descricao}</strong></td>
            <td>${produto.unidade}</td>
            <td style="color: #28a745; font-weight: bold;">R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.grupo}</td>
            <td>${produto.subgrupo}</td>
        </tr>
    `).join('');
    
    // Esconder carregando
    document.getElementById('carregando').style.display = 'none';
}

// Função para buscar produtos
function buscarProdutos() {
    const termo = document.getElementById('busca').value.toLowerCase();
    const corpoTabela = document.getElementById('corpo-tabela');
    
    if (termo === '') {
        corpoTabela.innerHTML = produtos.map(produto => `
            <tr>
                <td>${produto.codigo}</td>
                <td><strong>${produto.descricao}</strong></td>
                <td>${produto.unidade}</td>
                <td style="color: #28a745; font-weight: bold;">R$ ${produto.preco.toFixed(2)}</td>
                <td>${produto.grupo}</td>
                <td>${produto.subgrupo}</td>
            </tr>
        `).join('');
    } else {
        const filtrados = produtos.filter(produto => 
            produto.descricao.toLowerCase().includes(termo) ||
            produto.codigo.toLowerCase().includes(termo)
        );
        
        corpoTabela.innerHTML = filtrados.map(produto => `
            <tr>
                <td>${produto.codigo}</td>
                <td><strong>${produto.descricao}</strong></td>
                <td>${produto.unidade}</td>
                <td style="color: #28a745; font-weight: bold;">R$ ${produto.preco.toFixed(2)}</td>
                <td>${produto.grupo}</td>
                <td>${produto.subgrupo}</td>
            </tr>
        `).join('');
    }
}

// Carregar produtos quando a página abrir
carregarProdutos();
