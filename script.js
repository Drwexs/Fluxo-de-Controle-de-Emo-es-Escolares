document.addEventListener('DOMContentLoaded', function () {
    
    // -----------------------------------------------------------------------
    // *** MANTER OS DADOS ATÉ O USUÁRIO LIMPAR MANUALMENTE ***
    // Se quiser limpar automaticamente a cada visita, descomente a linha abaixo.
    // -----------------------------------------------------------------------
    // localStorage.removeItem('emocoesEscolares'); 

    // --- Variáveis Globais ---
    const EMOTION_LABELS = ['Feliz', 'Triste', 'Normal', 'Raiva'];
    const EMOTION_COLORS = {
        'Feliz': '#4CAF50',
        'Triste': '#2196F3',
        'Normal': '#ff9800',
        'Raiva': '#f44336'
    };

    // --- Elementos HTML ---
    const alunoNomeInput = document.getElementById('alunoNome');
    const alunoTurmaSelect = document.getElementById('alunoTurma');
    const iniciarRegistroBtn = document.getElementById('iniciar-registro-btn');
    const salvarRegistroBtn = document.getElementById('salvar-registro-btn');
    const recarregarBtn = document.getElementById('recarregar-pagina-btn');
    const limparDadosBtn = document.getElementById('limpar-dados-btn'); 
    
    const entradaDadosSection = document.getElementById('entrada-dados');
    const registroSection = document.getElementById('registro');
    const analiseSection = document.getElementById('analise');
    const alunoInfoDisplay = document.getElementById('aluno-info-display');
    const statusAnalise = document.getElementById('status-analise');
    const ctx = document.getElementById('emocaoChart');

    let emocaoChart = null;

    // --- Funções de Armazenamento ---
    function loadEmotionsData() {
        const data = localStorage.getItem('emocoesEscolares');
        return data ? JSON.parse(data) : {};
    }

    function saveEmotionsData(data) {
        localStorage.setItem('emocoesEscolares', JSON.stringify(data));
    }

    // --- 1. Início do Registro ---
    iniciarRegistroBtn.addEventListener('click', function (event) {
        event.preventDefault();
        
        const nome = alunoNomeInput.value.trim();
        const turma = alunoTurmaSelect.value;
        
        if (nome === "" || turma === "") {
            alert("Por favor, preencha seu nome e selecione a turma.");
            return;
        }

        alunoInfoDisplay.innerHTML = `Aluno(a): ${nome}, Turma: ${turma}`;
        entradaDadosSection.style.display = 'none';
        registroSection.style.display = 'flex';
        registroSection.scrollIntoView({ behavior: 'smooth' });
    });

    // --- 2. Salvar Registro ---
    salvarRegistroBtn.addEventListener('click', function (event) {
        event.preventDefault();

        const nome = alunoNomeInput.value.trim();
        const turma = alunoTurmaSelect.value;
        const emocaoInput = document.querySelector('input[name="temp_user_emocao"]:checked');
        
        if (!emocaoInput) {
            alert("Por favor, selecione uma emoção antes de salvar.");
            return;
        }

        const emocao = emocaoInput.value;
        const alunoKey = `${turma}_${nome.replace(/\s/g, '-')}`; 

        let allData = loadEmotionsData();
        
        if (!allData[turma]) {
            allData[turma] = {};
        }

        allData[turma][alunoKey] = emocao;
        saveEmotionsData(allData);

        alert(`Registro salvo com sucesso! (${emocao} para ${nome}, Turma ${turma})`);
        generateAndShowChart();
    });

    // --- 3. Geração do Gráfico ---
    function generateAndShowChart() {
        const allData = loadEmotionsData();
        let contagemGeral = { 'Feliz': 0, 'Triste': 0, 'Normal': 0, 'Raiva': 0 };
        let totalRegistros = 0;

        for (const turma in allData) {
            const alunosNaTurma = allData[turma];
            for (const alunoKey in alunosNaTurma) {
                const emocao = alunosNaTurma[alunoKey];
                if (contagemGeral.hasOwnProperty(emocao)) {
                    contagemGeral[emocao]++;
                    totalRegistros++;
                }
            }
        }

        const labels = EMOTION_LABELS;
        const dataSet = labels.map(label => contagemGeral[label]); 
        const backgroundColors = labels.map(label => EMOTION_COLORS[label]);

        statusAnalise.textContent = `Total de registros no sistema: ${totalRegistros}. Análise Geral das Emoções.`;

        entradaDadosSection.style.display = 'none';
        registroSection.style.display = 'none';
        analiseSection.style.display = 'flex';
        analiseSection.scrollIntoView({ behavior: 'smooth' });

        if (emocaoChart) emocaoChart.destroy();

        emocaoChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Frequência de Emoções',
                    data: dataSet,
                    backgroundColor: backgroundColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Número de Registros' },
                        ticks: { stepSize: 1 }
                    }
                },
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Distribuição de Emoções (Geral)' }
                }
            }
        });
    }

    // --- 4. Botões Extras ---
    recarregarBtn.addEventListener('click', function(event) {
        event.preventDefault();
        window.location.reload(); 
    });

    limparDadosBtn.addEventListener('click', function(event) {
        event.preventDefault();
        if (confirm("ATENÇÃO: Você tem certeza que deseja apagar TODOS os registros de emoções? Esta ação não pode ser desfeita.")) {
            localStorage.removeItem('emocoesEscolares');
            alert("Todos os dados foram apagados. A página será recarregada.");
            window.location.reload();
        }
    });

    document.querySelector('.botao_secundario').addEventListener('click', function(event) {
        event.preventDefault();
        generateAndShowChart();
    });
});
