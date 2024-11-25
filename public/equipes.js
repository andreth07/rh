document.addEventListener('DOMContentLoaded', () => {
    console.log('Página carregada, iniciando carregamento de equipes...'); // Debug
    carregarEquipes();
    carregarFuncionarios();

    // Modal
    const modal = document.getElementById('equipesModal');
    const btnNovaEquipe = document.getElementById('btnNovaEquipe');
    const span = document.getElementsByClassName('close')[0];

    btnNovaEquipe.onclick = () => {
        modal.style.display = 'block';
        document.getElementById('modalTitle').textContent = 'Nova Equipe';
        document.getElementById('equipeForm').reset();
        document.getElementById('contadorMembros').textContent = '0';
    }

    span.onclick = () => {
        modal.style.display = 'none';
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // Form submit
    document.getElementById('equipeForm').addEventListener('submit', handleEquipeSubmit);
});

async function carregarFuncionarios() {
    try {
        const response = await fetch('/api/funcionarios');
        const funcionarios = await response.json();
        console.log('Funcionários carregados:', funcionarios); // Debug
        
        // Preencher select de líder
        const liderSelect = document.getElementById('liderEquipe');
        liderSelect.innerHTML = '<option value="">Selecione um líder</option>';
        
        // Preencher checkboxes de membros
        const membrosDiv = document.getElementById('membrosEquipe');
        membrosDiv.innerHTML = '';

        funcionarios.forEach(funcionario => {
            // Adicionar ao select de líder
            liderSelect.innerHTML += `
                <option value="${funcionario._id}">${funcionario.nomeCompleto}</option>
            `;

            // Adicionar aos checkboxes de membros
            const checkbox = document.createElement('div');
            checkbox.className = 'membro-checkbox';
            checkbox.innerHTML = `
                <input type="checkbox" id="membro_${funcionario._id}" 
                       value="${funcionario._id}" 
                       onchange="atualizarContadorMembros()">
                <label for="membro_${funcionario._id}">
                    ${funcionario.nomeCompleto} (${funcionario.cargo})
                </label>
            `;
            membrosDiv.appendChild(checkbox);
        });
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
    }
}

function atualizarContadorMembros() {
    const checkboxes = document.querySelectorAll('#membrosEquipe input[type="checkbox"]:checked');
    const contador = document.getElementById('contadorMembros');
    contador.textContent = checkboxes.length;
}

async function handleEquipeSubmit(e) {
    e.preventDefault();

    const membrosCheckbox = document.querySelectorAll('#membrosEquipe input[type="checkbox"]:checked');
    if (membrosCheckbox.length < 5) {
        alert('A equipe deve ter no mínimo 5 membros!');
        return;
    }

    const membros = Array.from(membrosCheckbox).map(checkbox => checkbox.value);
    
    const equipe = {
        nome: document.getElementById('nomeEquipe').value,
        lider: document.getElementById('liderEquipe').value,
        membros: membros
    };

    try {
        const response = await fetch('/api/equipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(equipe)
        });

        if (response.ok) {
            alert('Equipe criada com sucesso!');
            document.getElementById('equipesModal').style.display = 'none';
            document.getElementById('equipeForm').reset();
            carregarEquipes();
        } else {
            const data = await response.json();
            alert(data.message || 'Erro ao criar equipe');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao criar equipe');
    }
}

async function carregarEquipes() {
    try {
        console.log('Iniciando carregamento de equipes...'); // Debug
        const response = await fetch('/api/equipes');
        const equipes = await response.json();
        console.log('Equipes carregadas:', equipes); // Debug

        const listaEquipes = document.getElementById('listaEquipes');
        listaEquipes.innerHTML = '';

        if (equipes.length === 0) {
            listaEquipes.innerHTML = '<p class="no-equipes">Nenhuma equipe cadastrada</p>';
            return;
        }

        equipes.forEach(equipe => {
            const card = criarCardEquipe(equipe);
            listaEquipes.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar equipes:', error);
        const listaEquipes = document.getElementById('listaEquipes');
        listaEquipes.innerHTML = '<p class="error-message">Erro ao carregar equipes</p>';
    }
}

function criarCardEquipe(equipe) {
    console.log('Criando card para equipe:', equipe); // Debug
    const div = document.createElement('div');
    div.className = 'equipe-card';
    
    // Verificar se os dados necessários existem
    const nomeEquipe = equipe.nome || 'Nome não disponível';
    const liderNome = equipe.lider?.nomeCompleto || 'Líder não definido';
    const membros = equipe.membros || [];

    div.innerHTML = `
        <h3>${nomeEquipe}</h3>
        <div class="equipe-info">
            <p><strong>Líder:</strong> ${liderNome}</p>
            <div class="equipe-membros">
                <strong>Membros da Equipe:</strong>
                <ul>
                    ${membros.map(membro => 
                        `<li>${membro.nomeCompleto || 'Nome não disponível'}</li>`
                    ).join('')}
                </ul>
            </div>
        </div>
        <div class="equipe-acoes">
            <button class="btn-editar" onclick="editarEquipe('${equipe._id}')">Editar</button>
            <button class="btn-excluir" onclick="excluirEquipe('${equipe._id}')">Excluir</button>
        </div>
    `;
    return div;
}

async function excluirEquipe(id) {
    if (confirm('Tem certeza que deseja excluir esta equipe?')) {
        try {
            const response = await fetch(`/api/equipes/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Equipe excluída com sucesso!');
                carregarEquipes();
            } else {
                alert('Erro ao excluir equipe');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao excluir equipe');
        }
    }
}

async function editarEquipe(id) {
    try {
        const response = await fetch(`/api/equipes/${id}`);
        const equipe = await response.json();

        // Preencher o formulário com os dados da equipe
        document.getElementById('nomeEquipe').value = equipe.nome;
        document.getElementById('liderEquipe').value = equipe.lider._id;

        // Marcar os checkboxes dos membros
        equipe.membros.forEach(membro => {
            const checkbox = document.getElementById(`membro_${membro._id}`);
            if (checkbox) checkbox.checked = true;
        });

        // Atualizar contador de membros
        atualizarContadorMembros();

        // Mostrar modal
        document.getElementById('modalTitle').textContent = 'Editar Equipe';
        document.getElementById('equipesModal').style.display = 'block';

        // Modificar o handler do formulário para atualizar ao invés de criar
        const form = document.getElementById('equipeForm');
        form.onsubmit = (e) => handleEditarEquipe(e, id);

    } catch (error) {
        console.error('Erro ao carregar dados da equipe:', error);
        alert('Erro ao carregar dados da equipe');
    }
}

async function handleEditarEquipe(e, id) {
    e.preventDefault();

    const membrosCheckbox = document.querySelectorAll('#membrosEquipe input[type="checkbox"]:checked');
    if (membrosCheckbox.length < 5) {
        alert('A equipe deve ter no mínimo 5 membros!');
        return;
    }

    const membros = Array.from(membrosCheckbox).map(checkbox => checkbox.value);
    
    const equipe = {
        nome: document.getElementById('nomeEquipe').value,
        lider: document.getElementById('liderEquipe').value,
        membros: membros
    };

    try {
        const response = await fetch(`/api/equipes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(equipe)
        });

        if (response.ok) {
            alert('Equipe atualizada com sucesso!');
            document.getElementById('equipesModal').style.display = 'none';
            document.getElementById('equipeForm').reset();
            // Restaurar o handler original do formulário
            document.getElementById('equipeForm').onsubmit = handleEquipeSubmit;
            carregarEquipes();
        } else {
            const data = await response.json();
            alert(data.message || 'Erro ao atualizar equipe');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar equipe');
    }
}