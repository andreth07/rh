require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(cors());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Schema do Funcionário
const funcionarioSchema = new mongoose.Schema({
    nomeCompleto: {
        type: String,
        required: true
    },
    cargo: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    equipe: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Schema da Equipe
const equipeSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        unique: true
    },
    lider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Funcionario',
        required: true
    },
    membros: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Funcionario'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Schema do Currículo
const curriculoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    cargoPretendido: {
        type: String,
        required: true
    },
    linkCurriculo: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Funcionario = mongoose.model('Funcionario', funcionarioSchema);
const Equipe = mongoose.model('Equipe', equipeSchema);
const Curriculo = mongoose.model('Curriculo', curriculoSchema);

// Rota raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rotas para Funcionários
app.get('/api/funcionarios', async (req, res) => {
    try {
        const funcionarios = await Funcionario.find();
        res.json(funcionarios);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar funcionários', error: error.message });
    }
});

app.post('/api/funcionarios', async (req, res) => {
    try {
        const funcionario = new Funcionario(req.body);
        await funcionario.save();
        res.status(201).json(funcionario);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Email já cadastrado' });
        } else {
            res.status(500).json({ message: 'Erro ao cadastrar funcionário', error: error.message });
        }
    }
});

app.put('/api/funcionarios/:id', async (req, res) => {
    try {
        const funcionario = await Funcionario.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!funcionario) {
            return res.status(404).json({ message: 'Funcionário não encontrado' });
        }
        res.json(funcionario);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar funcionário', error: error.message });
    }
});

app.delete('/api/funcionarios/:id', async (req, res) => {
    try {
        const funcionario = await Funcionario.findByIdAndDelete(req.params.id);
        if (!funcionario) {
            return res.status(404).json({ message: 'Funcionário não encontrado' });
        }
        res.json({ message: 'Funcionário removido com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover funcionário', error: error.message });
    }
});

// Rotas para Equipes
app.get('/api/equipes', async (req, res) => {
    try {
        const equipes = await Equipe.find()
            .populate('lider', 'nomeCompleto')
            .populate('membros', 'nomeCompleto');
        res.json(equipes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar equipes', error: error.message });
    }
});

app.get('/api/equipes/:id', async (req, res) => {
    try {
        const equipe = await Equipe.findById(req.params.id)
            .populate('lider', 'nomeCompleto')
            .populate('membros', 'nomeCompleto');
        if (!equipe) {
            return res.status(404).json({ message: 'Equipe não encontrada' });
        }
        res.json(equipe);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar equipe', error: error.message });
    }
});

app.post('/api/equipes', async (req, res) => {
    try {
        if (req.body.membros.length < 5) {
            return res.status(400).json({ message: 'A equipe deve ter no mínimo 5 membros' });
        }

        const equipe = new Equipe(req.body);
        await equipe.save();
        
        const equipePopulada = await Equipe.findById(equipe._id)
            .populate('lider', 'nomeCompleto')
            .populate('membros', 'nomeCompleto');
            
        res.status(201).json(equipePopulada);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Já existe uma equipe com este nome' });
        } else {
            res.status(500).json({ message: 'Erro ao criar equipe', error: error.message });
        }
    }
});

app.put('/api/equipes/:id', async (req, res) => {
    try {
        if (req.body.membros && req.body.membros.length < 5) {
            return res.status(400).json({ message: 'A equipe deve ter no mínimo 5 membros' });
        }

        const equipe = await Equipe.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
        .populate('lider', 'nomeCompleto')
        .populate('membros', 'nomeCompleto');

        if (!equipe) {
            return res.status(404).json({ message: 'Equipe não encontrada' });
        }

        res.json(equipe);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar equipe', error: error.message });
    }
});

app.delete('/api/equipes/:id', async (req, res) => {
    try {
        const equipe = await Equipe.findByIdAndDelete(req.params.id);
        if (!equipe) {
            return res.status(404).json({ message: 'Equipe não encontrada' });
        }
        res.json({ message: 'Equipe removida com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover equipe', error: error.message });
    }
});

// Rotas para Currículos
app.get('/api/curriculos', async (req, res) => {
    try {
        const curriculos = await Curriculo.find().sort({ createdAt: -1 });
        res.json(curriculos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar currículos', error: error.message });
    }
});

app.post('/api/curriculos', async (req, res) => {
    try {
        const curriculo = new Curriculo(req.body);
        await curriculo.save();
        res.status(201).json(curriculo);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao cadastrar currículo', error: error.message });
    }
});

app.delete('/api/curriculos/:id', async (req, res) => {
    try {
        const curriculo = await Curriculo.findByIdAndDelete(req.params.id);
        if (!curriculo) {
            return res.status(404).json({ message: 'Currículo não encontrado' });
        }
        res.json({ message: 'Currículo removido com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover currículo', error: error.message });
    }
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Algo deu errado!', error: err.message });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});