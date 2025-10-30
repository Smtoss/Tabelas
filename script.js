// Array para armazenar os produtos
let produtos = [];

// Função principal para carregar os produtos
async function carregarProdutos() {
    console.log('🔍 Carregando produtos...');
    
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
            console.log('Linha', i, 'colunas:', colunas.length);
            
            // Verificar se tem colunas suficientes
            if (colunas.length >= 11) {
                // CORREÇÃO: Agora pegando as colunas corretas do seu CSV
                // CODIGO = coluna 0, DESCRIÇÃO = coluna 3, UNIDADE = coluna 6, VL-UNIT = coluna 10, DES.GRUPO = coluna 14, DES.SUBGRUPO = coluna 16
                
                // Extrair preço da coluna 10 (VL-UNIT)
                let precoTexto = colunas[10].trim();
                console.log('Preço texto:', precoTexto);
                
                // Converter preço - remover espaços e trocar vírgula por ponto
                let preco = parseFloat(precoTexto.replace(',', '.').replace(/\s/g, '')) || 0;
                
                const produto = {
                    codigo: colunas[0].trim(),
                    descricao: colunas[3].trim(),      // DESCRIÇÃO está na coluna 3
                    unidade: colunas[6].trim(),        // UNIDADE está na coluna 6
                    preco: preco,
                    grupo: colunas[14].trim(),         // DES.GRUPO está na coluna 14
                    subgrupo: colunas[16].trim()       // DES.SUBGRUPO está na coluna 16
                };
                
                console.log('Produto processado:', produto);
                
                // Só adiciona se tiver descrição e não for cabeçalho
                if (produto.descricao && produto.descricao !== 'DESCRIÇÃO') {
                    produtos.push(produto);
                }
            } else {
                console.log('Linha ignorada - poucas colunas:', colunas.length);
            }
        }
        
        console.log(`🎉 ${produtos.length} produtos carregados!`);
        exibirProdutos();
        
    } catch (erro) {
        console.error('❌ Erro ao carregar produtos:', erro);
        document.getElementById('carregando').innerHTML = 
            '<div style="color: red; text-align: center; padding: 20px;">' +
            '❌ Erro ao carregar produtos: ' + erro.message +
            '</div>';
    }
}

// Função para exibir produtos na tabela
function exibirProdutos() {
    const corpoTabela = document.getElementById('corpo-tabela');
    const carregando = document.getElementById('carregando');
    
    if (produtos.length === 0) {
        corpoTabela.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum produto carregado</td></tr>';
        carregando.style.display = 'none';
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
    carregando.style.display = 'none';
    
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
        
        document.getElementById('total-produtos').textContent = 
            `${produtos.length} produto${produtos.length !== 1 ? 's' : ''}`;
    } else {
        // Filtrar produtos
        const filtrados = produtos.filter(produto => 
            produto.descricao.toLowerCase().includes(termo) ||
            produto.codigo.toLowerCase().includes(termo) ||
            produto.grupo.toLowerCase().includes(termo) ||
            produto.subgrupo.toLowerCase().includes(termo)
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
