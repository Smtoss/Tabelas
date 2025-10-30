// Array para armazenar os produtos
let produtos = [];

// Função principal para carregar os produtos
async function carregarProdutos() {
    console.log('🔍 Tentando carregar cremoso.csv...');
    
    try {
        // Buscar o arquivo CSV
        const resposta = await fetch('cremoso.csv');
        
        if (!resposta.ok) {
            throw new Error(`Arquivo não encontrado! Status: ${resposta.status}`);
        }
        
        const textoCSV = await resposta.text();
        console.log('✅ CSV carregado com sucesso!');
        
        // Converter CSV para array de objetos
        const linhas = textoCSV.split('\n');
        console.log('📊 Total de linhas no CSV:', linhas.length);
        
        produtos = [];
        
        // Processar cada linha (começando da linha 1, pulando o cabeçalho)
        for (let i = 1; i < linhas.length; i++) {
            if (linhas[i].trim() === '') continue;
            
            const colunas = linhas[i].split(';');
            
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
                
                // Só adiciona se tiver descrição
                if (produto.descricao && produto.descricao !== 'DESCRICAO') {
                    produtos.push(produto);
                }
            }
        }
        
        console.log(`🎉 ${produtos.length} produtos carregados!`);
        exibirProdutos();
        
    } catch (erro) {
        console.error('❌ Erro ao carregar produtos:', erro);
        document.getElementById('carregando').innerHTML = 
            '<div style="color: red; text-align: center; padding: 20px;">' +
            '❌ Arquivo cremoso.csv não encontrado!<br>' +
            'Verifique se o arquivo foi enviado para o GitHub.' +
            '</div>';
    }
}

// Função para exibir produtos na tabela
function exibirProdutos() {
    const corpoTabela = document.getElementById('corpo-tabela');
    
    if (produtos.length === 0) {
        corpoTabela.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum produto carregado</td></tr>';
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
    
    // Atualizar contador
    document.getElementById('total-produtos').textContent = 
        `${produtos.length} produto${produtos.length !== 1 ? 's' : ''} carregado${produtos.length !== 1 ? 's' : ''}`;
}

// Função para buscar produtos
function buscarProdutos() {
    const termo = document.getElementById('busca').value.toLowerCase();
    const corpoTabela = document.getElementById('corpo-tabela');
    
    if (termo === '') {
        // Mostrar todos os produtos
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
        // Filtrar produtos
        const filtrados = produtos.filter(produto => 
            produto.descricao.toLowerCase().includes(termo) ||
            produto.codigo.toLowerCase().includes(termo) ||
            produto.grupo.toLowerCase().includes(termo)
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
        
        // Atualizar contador
        document.getElementById('total-produtos').textContent = 
            `${filtrados.length} produto${filtrados.length !== 1 ? 's' : ''} encontrado${filtrados.length !== 1 ? 's' : ''}`;
    }
}

// Configurar eventos quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Carregar produtos automaticamente
    carregarProdutos();
    
    // Configurar busca em tempo real
    document.getElementById('busca').addEventListener('input', buscarProdutos);
});
