// Array para armazenar os produtos
let produtos = [];

// Função para remover acentos
function removerAcentos(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

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

// FUNÇÃO DE BUSCA CORRIGIDA - REMOVENDO ACENTOS
function buscarProdutos() {
    const termo = document.getElementById('busca').value.trim();
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
        // DIVIDIR EM MÚLTIPLAS PALAVRAS (separadas por espaço) e REMOVER ACENTOS
        const palavras = termo.split(' ')
            .filter(palavra => palavra.length >= 3)
            .map(palavra => removerAcentos(palavra.toLowerCase()));
        
        console.log('Palavras para buscar (sem acentos):', palavras);
        
        if (palavras.length === 0) {
            // Se todas as palavras têm menos de 3 caracteres, mostrar mensagem
            corpoTabela.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #666;">
                        ⚠️ Digite pelo menos 3 letras para cada palavra
                    </td>
                </tr>
            `;
            document.getElementById('total-produtos').textContent = 'Digite palavras com 3+ letras';
            return;
        }
        
        // BUSCA COM MÚLTIPLAS PALAVRAS - REMOVENDO ACENTOS DA DESCRIÇÃO TAMBÉM
        const filtrados = produtos.filter(produto => {
            // Remover acentos da descrição para comparar
            const descricaoSemAcentos = removerAcentos(produto.descricao.toLowerCase());
            
            // Verificar se TODAS as palavras estão presentes na DESCRIÇÃO (sem acentos)
            return palavras.every(palavra => {
                return descricaoSemAcentos.includes(palavra);
            });
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
            // Destacar as palavras nos resultados (considerando acentos originais)
            corpoTabela.innerHTML = filtrados.map(produto => {
                // Função para destacar múltiplas palavras (considerando que o usuário pode ter digitado com ou sem acento)
                const destacarMultiplosTextos = (texto) => {
                    let resultado = texto;
                    palavras.forEach(palavraBusca => {
                        // Criar regex que encontra a palavra com possíveis acentos
                        // Ex: se buscou "acai", destaca "açaí", "acai", etc.
                        const textoSemAcentos = removerAcentos(texto.toLowerCase());
                        const indices = [];
                        let index = textoSemAcentos.indexOf(palavraBusca);
                        
                        while (index !== -1) {
                            indices.push(index);
                            index = textoSemAcentos.indexOf(palavraBusca, index + 1);
                        }
                        
                        // Destacar no texto original
                        if (indices.length > 0) {
                            let novoTexto = '';
                            let ultimoIndex = 0;
                            
                            indices.forEach(idx => {
                                // Adicionar parte não destacada
                                novoTexto += texto.substring(ultimoIndex, idx);
                                // Adicionar parte destacada
                                const comprimentoOriginal = texto.substring(idx, idx + palavraBusca.length).length;
                                novoTexto += '<mark>' + texto.substring(idx, idx + comprimentoOriginal) + '</mark>';
                                ultimoIndex = idx + comprimentoOriginal;
                            });
                            
                            // Adicionar resto do texto
                            novoTexto += texto.substring(ultimoIndex);
                            resultado = novoTexto;
                        }
                    });
                    return resultado;
                };
                
                return `
                    <tr>
                        <td>${produto.codigo}</td>
                        <td><strong>${destacarMultiplosTextos(produto.descricao)}</strong></td>
                        <td>${produto.unidade}</td>
                        <td style="color: #28a745; font-weight: bold;">R$ ${produto.preco.toFixed(2)}</td>
                        <td>${produto.grupo}</td>
                        <td>${produto.subgrupo}</td>
                    </tr>
                `;
            }).join('');
        }
        
        // Atualizar contador
        const palavrasTexto = palavras.length > 1 ? `palavras "${termo}"` : `"${termo}"`;
        document.getElementById('total-produtos').textContent = 
            `${filtrados.length} produto${filtrados.length !== 1 ? 's' : ''} encontrado${filtrados.length !== 1 ? 's' : ''} para ${palavrasTexto}`;
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
    
    // Adicionar placeholder com exemplo
    document.getElementById('busca').placeholder = '🔍 Ex: acai ou limao (busca ignora acentos)';
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
