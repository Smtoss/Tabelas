// Array para armazenar os produtos
let produtos = [];
let produtosFiltrados = [];

// Função principal para carregar os produtos
async function carregarProdutos() {
    mostrarCarregando();
    
    try {
        // Buscar o arquivo CSV
        const resposta = await fetch('cremoso.csv');
        const textoCSV = await resposta.text();
        
        // Converter CSV para array de objetos
        const linhas = textoCSV.split('\n');
        const cabecalho = linhas[0].split(';');
        
        produtos = [];
        
        // Processar cada linha (começando da linha 1, pulando o cabeçalho)
        for (let i = 1; i < linhas.length; i++) {
            if (linhas[i].trim() === '') continue;
            
            const colunas = linhas[i].split(';');
            
            if (colunas.length >= 6) {
                const produto = {
                    codigo: colunas[0].trim(),
                    descricao: colunas[1].trim(),
                    unidade: colunas[2].trim(),
                    preco: parseFloat(colunas[3].replace(',', '.')),
                    grupo: colunas[4].trim(),
                    subgrupo: colunas[5].trim()
                };
                
                // Só adiciona se tiver descrição
                if (produto.descricao) {
                    produtos.push(produto);
                }
            }
        }
        
        produtosFiltrados = [...produtos];
        exibirProdutos();
        atualizarInfo();
        
    } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
        document.getElementById('corpo-tabela').innerHTML = 
            '<tr><td colspan="6" style="text-align: center; color: red;">Erro ao carregar produtos. Verifique o arquivo CSV.</td></tr>';
    }
}

// Função para exibir produtos na tabela
function exibirProdutos() {
    const corpoTabela = document.getElementById('corpo-tabela');
    const semProdutos = document.getElementById('sem-produtos');
    
    if (produtosFiltrados.length === 0) {
        corpoTabela.innerHTML = '';
        semProdutos.style.display = 'block';
        document.getElementById('tabela-produtos').style.display = 'none';
        return;
    }
    
    semProdutos.style.display = 'none';
    document.getElementById('tabela-produtos').style.display = 'block';
    
    // Criar linhas da tabela
    corpoTabela.innerHTML = produtosFiltrados.map(produto => `
        <tr>
            <td>${produto.codigo}</td>
            <td><strong>${produto.descricao}</strong></td>
            <td>${produto.unidade}</td>
            <td style="color: #28a745; font-weight: bold;">R$ ${produto.preco.toFixed(2)}</td>
            <td><span class="badge">${produto.grupo}</span></td>
            <td><span class="badge">${produto.subgrupo}</span></td>
        </tr>
    `).join('');
}

// Função para atualizar informações
function atualizarInfo() {
    const totalElement = document.getElementById('total-produtos');
    const totalProdutos = produtosFiltrados.length;
    
    totalElement.textContent = `${totalProdutos} produto${totalProdutos !== 1 ? 's' : ''} encontrado${totalProdutos !== 1 ? 's' : ''}`;
}

// Função para mostrar estado de carregamento
function mostrarCarregando() {
    document.getElementById('carregando').style.display = 'block';
    document.getElementById('tabela-produtos').style.display = 'none';
    document.getElementById('sem-produtos').style.display = 'none';
}

// Função para buscar produtos
function buscarProdutos() {
    const termo = document.getElementById('busca').value.toLowerCase();
    
    if (termo === '') {
        produtosFiltrados = [...produtos];
    } else {
        produtosFiltrados = produtos.filter(produto => 
            produto.descricao.toLowerCase().includes(termo) ||
            produto.codigo.toLowerCase().includes(termo) ||
            produto.grupo.toLowerCase().includes(termo) ||
            produto.subgrupo.toLowerCase().includes(termo)
        );
    }
    
    exibirProdutos();
    atualizarInfo();
}

// Configurar eventos quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Carregar produtos automaticamente
    carregarProdutos();
    
    // Configurar busca em tempo real
    document.getElementById('busca').addEventListener('input', buscarProdutos);
    
    // Adicionar alguns estilos extras
    const style = document.createElement('style');
    style.textContent = `
        .badge {
            background: #e9ecef;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            color: #495057;
        }
    `;
    document.head.appendChild(style);
});
