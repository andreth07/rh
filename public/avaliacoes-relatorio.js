document.addEventListener('DOMContentLoaded', () => {
    carregarAvaliacoes();
    carregarFiltros();
    
    // Listeners para filtros
    document.getElementById('filtroMes').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroEquipe').addEventListener('change', aplicarFiltros);
});

async function carregarAvaliacoes(mes = '', equipe = '') {
    try {
        let url = '/api/avaliacoes';
        const params = [];
        if (mes) params.push(`mes=${mes}`);
        if (equipe) params.push(`equipe=${equipe}`);
        if (params.length > 0) url += '?' + params.join('&');

        const response = await fetch(url);
        const avaliacoes = await response.json();
        
        const lista = document.getElementById('avaliacoesLista');
        lista.innerHTML = '';

        if (avaliacoes.length === 0) {
            lista.innerHTML = '<p class="no-data">Nenhuma avaliação encontrada</p>';
            return;
        }

        avaliacoes.forEach(avaliacao => {
            lista.appendChild(criarCardAvaliacao(avaliacao));
        });
    } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        document.getElementById('avaliacoesLista').innerHTML = 
            '<p class="error-message">Erro ao carregar avaliações</p>';
    }
}

function criarCardAvaliacao(avaliacao) {
    const div = document.createElement('div');
    div.className = 'avaliacao-card';
    
    const data = new Date(avaliacao.mesAno);
    const mesAno = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    div.innerHTML = `
        <h3>${avaliacao.equipe.nome}</h3>
        <p class="avaliacao-info">Período: ${mesAno}</p>
        <div class="melhor-funcionario">
            <strong>Melhor Funcionário:</strong> ${avaliacao.melhorFuncionario.nomeCompleto}
            <p class="avaliacao-motivo">${avaliacao.motivoMelhor}</p>
        </div>
        <div class="pior-funcionario">
            <strong>Funcionário que Precisa Melhorar:</strong> ${avaliacao.piorFuncionario.nomeCompleto}
            <p class="avaliacao-motivo">${avaliacao.motivoPior}</p>
        </div>
    `;
    return div;
}

async function carregarFiltros() {
    // Carregar meses únicos
    const meses = await fetch('/api/avaliacoes/meses').then(r => r.json());
    const selectMes = document.getElementById('filtroMes');
    meses.forEach(mes => {
        const data = new Date(mes);
        const mesAno = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        selectMes.innerHTML += `<option value="${mes}">${mesAno}</option>`;
    });

    // Carregar equipes
    const equipes = await fetch('/api/equipes').then(r => r.json());
    const selectEquipe = document.getElementById('filtroEquipe');
    equipes.forEach(equipe => {
        selectEquipe.innerHTML += `<option value="${equipe._id}">${equipe.nome}</option>`;
    });
}

function aplicarFiltros() {
    const mes = document.getElementById('filtroMes').value;
    const equipe = document.getElementById('filtroEquipe').value;
    carregarAvaliacoes(mes, equipe);
}