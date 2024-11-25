document.addEventListener('DOMContentLoaded', () => {
    carregarEquipesComNotas();

    document.addEventListener('submit', async (e) => {
        if (e.target.classList.contains('form-notas')) {
            e.preventDefault();
            const form = e.target;
            const equipeId = form.dataset.equipeId;
            const notas = Array.from(form.querySelectorAll('.nota-input')).map(input => ({
                membro: input.dataset.membroId,
                nota: parseFloat(input.value) || 0
            }));

            try {
                const response = await fetch(`/api/equipes/${equipeId}/notas`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notas })
                });

                if (response.ok) {
                    alert('Notas salvas com sucesso!');
                } else {
                    alert('Erro ao salvar notas.');
                }
            } catch (error) {
                console.error('Erro ao salvar notas:', error);
                alert('Erro ao salvar notas.');
            }
        }
    });
});

async function carregarEquipesComNotas() {
    try {
        const response = await fetch('/api/equipes');
        const equipes = await response.json();

        const container = document.getElementById('notasContainer');
        container.innerHTML = '';

        if (equipes.length === 0) {
            container.innerHTML = '<p>Nenhuma equipe cadastrada</p>';
            return;
        }

        equipes.forEach(equipe => {
            const div = document.createElement('div');
            div.className = 'equipe-card';
            div.innerHTML = `
                <h3>${equipe.nome}</h3>
                <form class="form-notas" data-equipe-id="${equipe._id}">
                    <div class="equipe-membros">
                        ${equipe.membros.map(membro => `
                            <div class="equipe-membro">
                                <span>${membro.nomeCompleto}</span>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    max="10" 
                                    min="0" 
                                    class="nota-input" 
                                    data-membro-id="${membro._id}" 
                                    value="${equipe.notas?.find(n => n.membro === membro._id)?.nota || ''}"
                                >
                            </div>
                        `).join('')}
                    </div>
                    <button type="submit">Salvar Notas</button>
                </form>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Erro ao carregar equipes:', error);
        alert('Erro ao carregar equipes.');
    }
}
