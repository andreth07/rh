document.addEventListener('DOMContentLoaded', () => {
    carregarCurriculos();
    
    // Form submit
    document.getElementById('curriculoForm').addEventListener('submit', handleCurriculoSubmit);
});

async function handleCurriculoSubmit(e) {
    e.preventDefault();

    const curriculo = {
        nome: document.getElementById('nome').value,
        cargoPretendido: document.getElementById('cargoPretendido').value,
        linkCurriculo: document.getElementById('linkCurriculo').value
    };

    try {
        const response = await fetch('/api/curriculos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(curriculo)
        });

        if (response.ok) {
            alert('Currículo cadastrado com sucesso!');
            this.reset();
            carregarCurriculos();
        } else {
            const data = await response.json();
            alert(data.message || 'Erro ao cadastrar currículo');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao cadastrar currículo');
    }
}

async function carregarCurriculos() {
    try {
        const response = await fetch('/api/curriculos');
        const curriculos = await response.json();
        
        const listaCurriculos = document.getElementById('listaCurriculos');
        listaCurriculos.innerHTML = '';

        if (curriculos.length === 0) {
            listaCurriculos.innerHTML = '<p class="no-curriculos">Nenhum currículo cadastrado</p>';
            return;
        }

        curriculos.forEach(curriculo => {
            const card = criarCardCurriculo(curriculo);
            listaCurriculos.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar currículos:', error);
        const listaCurriculos = document.getElementById('listaCurriculos');
        listaCurriculos.innerHTML = '<p class="error-message">Erro ao carregar currículos</p>';
    }
}

function criarCardCurriculo(curriculo) {
    const div = document.createElement('div');
    div.className = 'curriculo-card';
    div.innerHTML = `
        <h3>${curriculo.nome}</h3>
        <div class="curriculo-info">
            <p><strong>Cargo Pretendido:</strong> ${curriculo.cargoPretendido}</p>
            <a href="${curriculo.linkCurriculo}" target="_blank" class="curriculo-link">
                Ver Currículo
            </a>
        </div>
        <div class="curriculo-acoes">
            <button class="btn-excluir" onclick="excluirCurriculo('${curriculo._id}')">Excluir</button>
        </div>
    `;
    return div;
}

async function excluirCurriculo(id) {
    if (confirm('Tem certeza que deseja excluir este currículo?')) {
        try {
            const response = await fetch(`/api/curriculos/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Currículo excluído com sucesso!');
                carregarCurriculos();
            } else {
                alert('Erro ao excluir currículo');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao excluir currículo');
        }
    }
}