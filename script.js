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
            
            // Verificar se tem colunas suficientes
            if (colunas.length >= 11) {
                // CORREÇÃO: Agora pegando as colunas corretas do seu CSV
                // CODIGO = coluna 0, DESCRIÇÃO = coluna 3, UNIDADE = coluna 6, VL-UNIT = coluna 10, DES.GRUPO = coluna 14, DES.SUBGRUPO = coluna 16
                
                // Extrair preço da coluna 10 (VL-UNIT)
                let precoTexto = colunas[10].trim();
                
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
                
                // Só adiciona se tiver descrição e não for cabeçalho
                if (produto.descricao && produto.descricao !== 'DESCRIÇÃO') {
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

// FUNÇÃO DE BUSCA MELHORADA - COM "LIKE" PARA PARTE DO NOME
function buscarProdutos() {
    const termo = document.getElementById('busca').value.toLowerCase().trim();
    const corpoTabela = document.getElementById('corpo-tabela');
    
    if (termo === '') {
        // Mostrar todos os produtos se busca estiver vazia
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
        // BUSCA COM "LIKE" - encontra qualquer parte do texto
        const filtrados = produtos.filter(produto => {
            // Verificar em cada campo se contém o termo de busca
            return (
                produto.descricao.toLowerCase().includes(termo) ||
                produto.codigo.toLowerCase().includes(termo) ||
                produto.grupo.toLowerCase().includes(termo) ||
                produto.subgrupo.toLowerCase().includes(termo)
            );
        });
        
        if (filtrados.length === 0) {
            corpoTabela.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #666;">
                        🔍 Nenhum produto encontrado para "<strong>${termo}</strong>"
                    </td>
                </tr>
            `;
        } else {
            // Destacar o termo buscado nos resultados
            corpoTabela.innerHTML = filtrados.map(produto => {
                // Função para destacar o texto encontrado
                const destacarTexto = (texto) => {
                    if (!termo) return texto;
                    
                    const regex = new RegExp(`(${termo})`, 'gi');
                    return texto.replace(regex, '<mark>$1</mark>');
                };
                
                return `
                    <tr>
                        <td>${destacarTexto(produto.codigo)}</td>
                        <td><strong>${destacarTexto(produto.descricao)}</strong></td>
                        <td>${produto.unidade}</td>
                        <td style="color: #28a745; font-weight: bold;">R$ ${produto.preco.toFixed(2)}</td>
                        <td>${destacarTexto(produto.grupo)}</td>
                        <td>${destacarTexto(produto.subgrupo)}</td>
                    </tr>
                `;
            }).join('');
        }
        
        // Atualizar contador
        document.getElementById('total-produtos').textContent = 
            `${filtrados.length} produto${filtrados.length !== 1 ? 's' : ''} encontrado${filtrados.length !== 1 ? 's' : ''} para "${termo}"`;
    }
}

// Configurar eventos quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Carregar produtos automaticamente
    carregarProdutos();
    
    // Configurar busca em tempo real
    document.getElementById('busca').addEventListener('input', buscarProdutos);
    
    // Focar no campo de busca automaticamente
    document.getElementById('busca').focus();
});

// Adicionar CSS para o destaque
const estilo = document.createElement('style');
estilo.textContent = `
    mark {
        background-color: #ffeb3b;
        padding: 2px 4px;
        border-radius: 3px;
        font-weight: bold;
    }
    
    #busca {
        transition: all 0.3s ease;
    }
    
    #busca:focus {
        border-color: #4CAF50;
        box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
        outline: none;
    }
`;
document.head.appendChild(estilo);
