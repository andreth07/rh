document.addEventListener('DOMContentLoaded', () => {
    carregarEquipes();
    
    // Listener para quando uma equipe é selecionada
    document.getElementById('equipeSelect').addEventListener('change', (e) => {
        const equipeId = e.target.value;
        if (equipeId) {
            carregarMembrosEquipe(equipeId);
            document.getElementById('formAvaliacao').style.display = 'block';
        } else {
            document.getElementById('formAvaliacao').style.display = 'none';
        }
    });

    // Form submit
    document.getElementById('avaliacaoForm').addEventListener('submit', handleAvaliacaoSubmit);
});

async function carregarEquipes() {
    try {
        const response = await fetch('/api/equipes');
        const equipes = await response.json();
        
        const select = document.getElementById('equipeSelect');
        select.innerHTML = '<option value="">Escolha uma equipe...</option>';
        
        equipes.forEach(equipe => {
            select.innerHTML += `
                <option value="${equipe._id}">${equipe.nome}</option>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar equipes:', error);
        alert('Erro ao carregar equipes');
    }
}

async function carregarMembrosEquipe(equipeId) {
    try {
        const response = await fetch(`/api/equipes/${equipeId}`);
        const equipe = await response.json();
        
        const melhorSelect = document.getElementById('melhorFuncionario');
        const piorSelect = document.getElementById('piorFuncionario');
        
        // Limpar selects
        melhorSelect.innerHTML = '<option value="">Selecione o funcionário...</option>';
        piorSelect.innerHTML = '<option value="">Selecione o funcionário...</option>';
        
        // Preencher selects com membros da equipe
        equipe.membros.forEach(membro => {
            const option = `
                <option value="${membro._id}">${membro.nomeCompleto}</option>
            `;
            melhorSelect.innerHTML += option;
            piorSelect.innerHTML += option;
        });
    } catch (error) {
        console.error('Erro ao carregar membros:', error);
        alert('Erro ao carregar membros da equipe');
    }
}

async function handleAvaliacaoSubmit(e) {
    e.preventDefault();

    const avaliacao = {
        equipeId: document.getElementById('equipeSelect').value,
        melhorFuncionario: document.getElementById('melhorFuncionario').value,
        piorFuncionario: document.getElementById('piorFuncionario').value,
        motivoMelhor: document.getElementById('motivoMelhor').value,
        motivoPior: document.getElementById('motivoPior').value,
        mesAno: document.getElementById('mesAno').value
    };

    if (avaliacao.melhorFuncionario === avaliacao.piorFuncionario) {
        alert('O melhor e o pior funcionário não podem ser a mesma pessoa');
        return;
    }

    try {
        const response = await fetch('/api/avaliacoes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(avaliacao)
        });

        if (response.ok) {
            alert('Avaliação enviada com sucesso!');
            this.reset();
            document.getElementById('formAvaliacao').style.display = 'none';
            document.getElementById('equipeSelect').value = '';
        } else {
            const data = await response.json();
            alert(data.message || 'Erro ao enviar avaliação');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao enviar avaliação');
    }
}