'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Utensils, 
  Sun, 
  Moon, 
  Coffee,
  TreePine,
  Camera,
  Hotel,
  Wine,
  Map,
  Baby,
  Crown,
  Phone,
  Mail,
  X,
  Plus,
  Sparkles,
  Timer,
  Zap,
  TrendingUp
} from 'lucide-react';

// Dados mockados para desenvolvimento
const MOCK_DATA = {
  destino: "Gramado - RS",
  diasViagem: 5,
  roteiroGerado: [
    {
      dia: 1,
      manha: "Visita ao Lago Negro + pedalinho",
      almoco: "Restaurante Colosseo (culinária italiana)",
      tarde: "Passeio na Rua Coberta + lojas de chocolate",
      jantar: "Bouquet Garni (fondue completo)"
    },
    {
      dia: 2,
      manha: "Mini Mundo",
      almoco: "Cantina Di Capo",
      tarde: "Tour em fábricas de chocolate + Reino do Chocolate",
      jantar: "Maison Mulller (sequência de fondue)"
    },
    {
      dia: 3,
      manha: "Parque Snowland (atividades na neve)",
      almoco: "Bêrga Motta (dentro do Snowland)",
      tarde: "Mirante do Vale + fotos panorâmicas",
      jantar: "Malbec Restaurante (carnes nobres)"
    },
    {
      dia: 4,
      manha: "Le Jardin – Parque de Lavanda",
      almoco: "Carazal (café colonial da Serra Gaúcha)",
      tarde: "Tour na Cervejaria Rasen Bier",
      jantar: "Chateau de La Fondue"
    },
    {
      dia: 5,
      manha: "Passeio em Canela – Catedral de Pedra",
      almoco: "Empório Canela",
      tarde: "Parque do Caracol + Cascata",
      jantar: "Magnólia Restaurante e Cinema"
    }
  ]
};

type Section = 'roteiro' | 'parques' | 'gastronomia' | 'instagramaveis' | 'hospedagem' | 'vinhos' | 'cidade' | 'kids' | 'premium';
type Ritmo = 'leve' | 'moderada' | 'intensa';

interface Atracao {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  horario: string;
  localizacao: string;
  tempoMinimo: number; // em horas
  tempoMedio: number;
  tempoMaximo: number;
  detalhes?: string;
  dicas?: string[];
}

interface AtracaoSelecionada extends Atracao {
  tempoEscolhido: number;
}

// Dados das atrações de PARQUES com tempo
const ATRACOES_PARQUES: Atracao[] = [
  {
    id: 'snowland',
    nome: 'Snowland',
    descricao: 'Parque temático de neve com diversas atividades como esqui, snowboard e patinação no gelo. Perfeito para toda a família.',
    categoria: 'parques',
    horario: '10:00 - 18:00',
    localizacao: 'Rua da Neve, 123',
    tempoMinimo: 2,
    tempoMedio: 3.5,
    tempoMaximo: 5,
    detalhes: 'O Snowland é o único parque de neve indoor da América Latina. Temperatura de -5°C o ano todo.',
    dicas: [
      'Chegue cedo para evitar filas',
      'Alugue roupas térmicas no local',
      'Experimente o trenó e a montanha de gelo',
      'Tire fotos com os bonecos de neve'
    ]
  },
  {
    id: 'minimundo',
    nome: 'Mini Mundo',
    descricao: 'Réplicas em miniatura de construções famosas da Europa. Ideal para fotos e passeio em família com crianças.',
    categoria: 'parques',
    horario: '09:00 - 17:30',
    localizacao: 'Rua Horácio Cardoso, 291',
    tempoMinimo: 1,
    tempoMedio: 2,
    tempoMaximo: 3,
    detalhes: 'Mais de 24 réplicas em escala 1:24 de castelos, igrejas e construções europeias.',
    dicas: [
      'Melhor horário: manhã para fotos com luz natural',
      'Perfeito para crianças de todas as idades',
      'Não perca a estação ferroviária em miniatura',
      'Loja de souvenirs com miniaturas exclusivas'
    ]
  },
  {
    id: 'caracol',
    nome: 'Parque do Caracol',
    descricao: 'Cascata de 131 metros de altura com trilhas ecológicas e mirantes. Vista espetacular da natureza da Serra Gaúcha.',
    categoria: 'parques',
    horario: '08:30 - 17:30',
    localizacao: 'Rodovia RS-466, Canela',
    tempoMinimo: 1.5,
    tempoMedio: 2.5,
    tempoMaximo: 4,
    detalhes: 'Uma das cascatas mais famosas do Brasil. Trilha com 927 degraus até a base da cachoeira.',
    dicas: [
      'Use calçados confortáveis para trilha',
      'Leve água e lanche',
      'Opção de teleférico para quem não quer descer',
      'Vista panorâmica incrível do mirante superior'
    ]
  }
];

export default function DashboardPage() {
  const [dadosRoteiro, setDadosRoteiro] = useState<typeof MOCK_DATA | null>(null);
  const [diaSelecionado, setDiaSelecionado] = useState(1);
  const [secaoAtiva, setSecaoAtiva] = useState<Section>('roteiro');
  const [atracaoModal, setAtracaoModal] = useState<Atracao | null>(null);
  const [atracoesPendentes, setAtracoesPendentes] = useState<AtracaoSelecionada[]>([]);
  const [ritmo, setRitmo] = useState<Ritmo>('moderada');

  useEffect(() => {
    // Tenta buscar dados reais do sessionStorage/localStorage
    const dadosReais = typeof window !== 'undefined' 
      ? sessionStorage.getItem('dadosTriagem') || localStorage.getItem('dadosTriagem')
      : null;

    if (dadosReais) {
      try {
        const parsed = JSON.parse(dadosReais);
        setDadosRoteiro(parsed);
      } catch (error) {
        console.log('Usando dados mockados (erro ao parsear dados reais)');
        setDadosRoteiro(MOCK_DATA);
      }
    } else {
      // Se não houver dados reais, usa os mockados
      console.log('Usando dados mockados para desenvolvimento');
      setDadosRoteiro(MOCK_DATA);
    }
  }, []);

  // Cálculo do tempo disponível
  const calcularTempoDisponivel = () => {
    if (!dadosRoteiro) return { total: 0, usado: 0, restante: 0 };
    
    // 8h por dia (9h-17h) - 1h almoço = 7h úteis por dia
    const horasPorDia = 7;
    const totalHoras = horasPorDia * dadosRoteiro.diasViagem;
    
    // Soma o tempo das atrações pendentes
    const horasUsadas = atracoesPendentes.reduce((acc, atracao) => acc + atracao.tempoEscolhido, 0);
    
    return {
      total: totalHoras,
      usado: horasUsadas,
      restante: totalHoras - horasUsadas
    };
  };

  const tempoDisponivel = calcularTempoDisponivel();
  const percentualUsado = (tempoDisponivel.usado / tempoDisponivel.total) * 100;

  const adicionarAtracao = (atracao: Atracao) => {
    // Define o tempo baseado no ritmo escolhido
    let tempoEscolhido = atracao.tempoMedio;
    if (ritmo === 'leve') tempoEscolhido = atracao.tempoMaximo;
    if (ritmo === 'intensa') tempoEscolhido = atracao.tempoMinimo;

    const novaAtracao: AtracaoSelecionada = {
      ...atracao,
      tempoEscolhido
    };

    setAtracoesPendentes([...atracoesPendentes, novaAtracao]);
    setAtracaoModal(null);
  };

  const removerAtracao = (id: string) => {
    setAtracoesPendentes(atracoesPendentes.filter(a => a.id !== id));
  };

  const otimizarRoteiro = () => {
    alert('Funcionalidade de otimização será implementada em breve! Por enquanto, as atrações estão organizadas na ordem que você adicionou.');
  };

  if (!dadosRoteiro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu roteiro...</p>
        </div>
      </div>
    );
  }

  const diaAtual = dadosRoteiro.roteiroGerado[diaSelecionado - 1];

  const secoes = [
    { id: 'roteiro' as Section, nome: 'Roteiro', icon: Calendar },
    { id: 'parques' as Section, nome: 'Parques', icon: TreePine },
    { id: 'gastronomia' as Section, nome: 'Gastronomia', icon: Utensils },
    { id: 'instagramaveis' as Section, nome: 'Instagramáveis', icon: Camera },
    { id: 'hospedagem' as Section, nome: 'Hospedagem', icon: Hotel },
    { id: 'vinhos' as Section, nome: 'Rota dos Vinhos', icon: Wine },
    { id: 'cidade' as Section, nome: 'Passeio pela Cidade', icon: Map },
    { id: 'kids' as Section, nome: 'Passeios Kids', icon: Baby },
    { id: 'premium' as Section, nome: 'Roteiro Guiado', icon: Crown },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MapPin className="text-indigo-600" size={32} />
                Seu Roteiro Personalizado
              </h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <Calendar size={18} />
                {dadosRoteiro.destino} • {dadosRoteiro.diasViagem} dias
              </p>
            </div>
          </div>
        </div>

        {/* Navegação por Seções */}
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
              {secoes.map((secao) => {
                const Icon = secao.icon;
                return (
                  <button
                    key={secao.id}
                    onClick={() => setSecaoAtiva(secao.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-300 ${
                      secaoAtiva === secao.id
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={18} />
                    {secao.nome}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seção: ROTEIRO */}
        {secaoAtiva === 'roteiro' && (
          <div className="space-y-8">
            {/* Controle de Ritmo */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="text-yellow-600" size={24} />
                Preferência de Ritmo
              </h2>
              <p className="text-gray-600 mb-4 text-sm">
                Escolha quanto tempo você quer dedicar a cada atração:
              </p>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setRitmo('leve')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    ritmo === 'leve'
                      ? 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🐢</div>
                    <div className="font-bold text-gray-800">Leve</div>
                    <div className="text-xs text-gray-600 mt-1">Tempo máximo em cada local</div>
                  </div>
                </button>
                <button
                  onClick={() => setRitmo('moderada')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    ritmo === 'moderada'
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🚶</div>
                    <div className="font-bold text-gray-800">Moderada</div>
                    <div className="text-xs text-gray-600 mt-1">Tempo médio em cada local</div>
                  </div>
                </button>
                <button
                  onClick={() => setRitmo('intensa')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    ritmo === 'intensa'
                      ? 'border-orange-500 bg-orange-50 shadow-lg'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🏃</div>
                    <div className="font-bold text-gray-800">Intensa</div>
                    <div className="text-xs text-gray-600 mt-1">Tempo mínimo em cada local</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Tempo Disponível */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Timer className="text-indigo-600" size={24} />
                Tempo Disponível
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tempo usado: {tempoDisponivel.usado.toFixed(1)}h</span>
                  <span>Tempo restante: {tempoDisponivel.restante.toFixed(1)}h</span>
                  <span>Total: {tempoDisponivel.total}h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 flex items-center justify-center text-xs font-bold text-white ${
                      percentualUsado > 90 ? 'bg-red-500' : percentualUsado > 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(percentualUsado, 100)}%` }}
                  >
                    {percentualUsado > 10 && `${percentualUsado.toFixed(0)}%`}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  * Cálculo baseado em 7h úteis por dia (9h-17h, descontando 1h de almoço)
                </p>
              </div>
            </div>

            {/* Atrações Pendentes */}
            {atracoesPendentes.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl shadow-lg p-6 border-2 border-amber-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Sparkles className="text-amber-600" size={24} />
                    Atrações Pendentes ({atracoesPendentes.length})
                  </h2>
                  <button
                    onClick={otimizarRoteiro}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <TrendingUp size={20} />
                    Otimizar Roteiro
                  </button>
                </div>
                <div className="space-y-3">
                  {atracoesPendentes.map((atracao) => (
                    <div
                      key={atracao.id}
                      className="bg-white rounded-lg p-4 flex items-center justify-between shadow-md hover:shadow-lg transition-all"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{atracao.nome}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Clock size={14} />
                          Tempo estimado: {atracao.tempoEscolhido}h
                          <span className="text-xs text-gray-400">
                            ({ritmo === 'leve' ? 'máximo' : ritmo === 'moderada' ? 'médio' : 'mínimo'})
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => removerAtracao(atracao.id)}
                        className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seletor de Dias */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="text-indigo-600" size={24} />
                Roteiro Base - Selecione o Dia
              </h2>
              <div className="flex gap-3 flex-wrap">
                {dadosRoteiro.roteiroGerado.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setDiaSelecionado(index + 1)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                      diaSelecionado === index + 1
                        ? 'bg-indigo-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Dia {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Roteiro do Dia */}
            <div className="grid gap-6">
              {/* Manhã */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-500 p-3 rounded-full">
                    <Sun className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Manhã</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock size={14} />
                      08:00 - 12:00
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 text-lg">{diaAtual.manha}</p>
              </div>

              {/* Almoço */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-500 p-3 rounded-full">
                    <Utensils className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Almoço</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock size={14} />
                      12:00 - 14:00
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 text-lg">{diaAtual.almoco}</p>
              </div>

              {/* Tarde */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-500 p-3 rounded-full">
                    <Coffee className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Tarde</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock size={14} />
                      14:00 - 18:00
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 text-lg">{diaAtual.tarde}</p>
              </div>

              {/* Jantar */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500 p-3 rounded-full">
                    <Moon className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Jantar</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock size={14} />
                      19:00 - 22:00
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 text-lg">{diaAtual.jantar}</p>
              </div>
            </div>

            {/* Navegação entre dias */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setDiaSelecionado(Math.max(1, diaSelecionado - 1))}
                disabled={diaSelecionado === 1}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  diaSelecionado === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                }`}
              >
                ← Dia Anterior
              </button>
              <button
                onClick={() => setDiaSelecionado(Math.min(dadosRoteiro.diasViagem, diaSelecionado + 1))}
                disabled={diaSelecionado === dadosRoteiro.diasViagem}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  diaSelecionado === dadosRoteiro.diasViagem
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                }`}
              >
                Próximo Dia →
              </button>
            </div>
          </div>
        )}

        {/* Seção: PARQUES */}
        {secaoAtiva === 'parques' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <TreePine className="text-green-600" size={32} />
                Parques e Atrações
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ATRACOES_PARQUES.map((atracao) => {
                  const jaAdicionada = atracoesPendentes.some(a => a.id === atracao.id);
                  return (
                    <div
                      key={atracao.id}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200 hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => !jaAdicionada && setAtracaoModal(atracao)}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{atracao.nome}</h3>
                      <p className="text-gray-600 mb-4 text-sm">{atracao.descricao}</p>
                      
                      {/* Tempo de duração */}
                      <div className="bg-white rounded-lg p-3 mb-4">
                        <div className="text-xs font-semibold text-gray-500 mb-2">DURAÇÃO RECOMENDADA</div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Mín</div>
                            <div className="font-bold text-green-600">{atracao.tempoMinimo}h</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Médio</div>
                            <div className="font-bold text-blue-600">{atracao.tempoMedio}h</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Máx</div>
                            <div className="font-bold text-orange-600">{atracao.tempoMaximo}h</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4">
                        <div className="flex gap-2 items-center">
                          <Clock size={16} />
                          <span>{atracao.horario}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <MapPin size={16} />
                          <span>{atracao.localizacao}</span>
                        </div>
                      </div>

                      {jaAdicionada ? (
                        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-center font-semibold text-sm">
                          ✓ Adicionada ao roteiro
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAtracaoModal(atracao);
                          }}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={18} />
                          Ver Detalhes
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Seção: GASTRONOMIA */}
        {secaoAtiva === 'gastronomia' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Utensils className="text-orange-600" size={32} />
                Gastronomia Local
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Restaurante 1 */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200 hover:shadow-xl transition-all">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Colosseo Restaurante</h3>
                  <p className="text-gray-600 mb-4">Culinária italiana autêntica com massas artesanais e ambiente acolhedor. Especialidade em risotos e carnes.</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <div className="flex gap-1 items-center">
                      <MapPin size={16} />
                      <span>Centro de Gramado</span>
                    </div>
                    <div className="flex gap-1 items-center">
                      <Clock size={16} />
                      <span>12:00 - 23:00</span>
                    </div>
                  </div>
                </div>

                {/* Restaurante 2 */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200 hover:shadow-xl transition-all">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Bouquet Garni</h3>
                  <p className="text-gray-600 mb-4">Fondue completo (queijo, carne e chocolate) em ambiente romântico. Perfeito para casais e ocasiões especiais.</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <div className="flex gap-1 items-center">
                      <MapPin size={16} />
                      <span>Av. Borges de Medeiros</span>
                    </div>
                    <div className="flex gap-1 items-center">
                      <Clock size={16} />
                      <span>19:00 - 23:30</span>
                    </div>
                  </div>
                </div>

                {/* Restaurante 3 */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200 hover:shadow-xl transition-all">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Malbec Restaurante</h3>
                  <p className="text-gray-600 mb-4">Carnes nobres grelhadas e carta de vinhos premiada. Ambiente sofisticado com vista panorâmica.</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <div className="flex gap-1 items-center">
                      <MapPin size={16} />
                      <span>Rua Garibaldi, 152</span>
                    </div>
                    <div className="flex gap-1 items-center">
                      <Clock size={16} />
                      <span>18:00 - 23:00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seção: INSTAGRAMÁVEIS */}
        {secaoAtiva === 'instagramaveis' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Camera className="text-pink-600" size={32} />
                Lugares Instagramáveis
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Local 1 */}
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-6 border border-pink-200 hover:shadow-xl transition-all">
                  <div className="aspect-square bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg mb-4 flex items-center justify-center">
                    <Camera className="text-white" size={48} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Lago Negro</h3>
                  <p className="text-gray-600 text-sm">Lago com pedalinhos e paisagem europeia. Perfeito para fotos românticas e em família.</p>
                </div>

                {/* Local 2 */}
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-6 border border-pink-200 hover:shadow-xl transition-all">
                  <div className="aspect-square bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg mb-4 flex items-center justify-center">
                    <Camera className="text-white" size={48} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Rua Coberta</h3>
                  <p className="text-gray-600 text-sm">Rua charmosa com lojas de chocolate e arquitetura europeia. Ideal para fotos durante o dia e à noite.</p>
                </div>

                {/* Local 3 */}
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-6 border border-pink-200 hover:shadow-xl transition-all">
                  <div className="aspect-square bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg mb-4 flex items-center justify-center">
                    <Camera className="text-white" size={48} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Le Jardin Parque de Lavanda</h3>
                  <p className="text-gray-600 text-sm">Campos de lavanda com cenário de filme. Melhor época: primavera e verão para flores em plena floração.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seção: HOSPEDAGEM */}
        {secaoAtiva === 'hospedagem' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Hotel className="text-blue-600" size={32} />
                Opções de Hospedagem
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Hotel 1 */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200 hover:shadow-xl transition-all">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Hotel Serra Azul</h3>
                  <p className="text-gray-600 mb-4">Hotel 4 estrelas com café colonial incluso, piscina aquecida e spa. Localização central próxima às principais atrações.</p>
                  <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <div className="flex gap-2 items-center">
                      <MapPin size={16} />
                      <span>Centro de Gramado - 500m da Rua Coberta</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="font-semibold text-blue-600">A partir de R$ 450/noite</span>
                    </div>
                  </div>
                </div>

                {/* Hotel 2 */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200 hover:shadow-xl transition-all">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Pousada Vale dos Sonhos</h3>
                  <p className="text-gray-600 mb-4">Pousada charmosa com arquitetura europeia, lareira e vista para as montanhas. Ambiente acolhedor e familiar.</p>
                  <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <div className="flex gap-2 items-center">
                      <MapPin size={16} />
                      <span>Bairro Planalto - Vista panorâmica</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="font-semibold text-blue-600">A partir de R$ 320/noite</span>
                    </div>
                  </div>
                </div>

                {/* Hotel 3 */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200 hover:shadow-xl transition-all">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Resort Baviera Premium</h3>
                  <p className="text-gray-600 mb-4">Resort 5 estrelas all-inclusive com restaurantes, spa completo, quadras esportivas e kids club. Luxo e conforto total.</p>
                  <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <div className="flex gap-2 items-center">
                      <MapPin size={16} />
                      <span>Zona rural - 8km do centro</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="font-semibold text-blue-600">A partir de R$ 890/noite</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seção: ROTA DOS VINHOS */}
        {secaoAtiva === 'vinhos' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Wine className="text-purple-600" size={32} />
                Rota dos Vinhos
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Vinícola 1 */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200 hover:shadow-xl transition-all">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Vinícola Ravanello</h3>
                  <p className="text-gray-600 mb-4">Vinhos premiados com degustação guiada. Especialidade em espumantes e tintos. Tour pelos parreirais incluído.</p>
                  <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <div className="flex gap-2 items-center">
                      <MapPin size={16} />
                      <span>Bento Gonçalves - 40km de Gramado</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Clock size={16} />
                      <span>09:00 - 17:00 (Seg-Sáb)</span>
                    </div>
                  </div>
                </div>

                {/* Vinícola 2 */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200 hover:shadow-xl transition-all">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Casa Valduga</h3>
                  <p className="text-gray-600 mb-4">Vinícola tradicional com restaurante gourmet. Experiência completa de enoturismo com harmonização de vinhos e pratos.</p>
                  <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <div className="flex gap-2 items-center">
                      <MapPin size={16} />
                      <span>Vale dos Vinhedos - 45km de Gramado</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Clock size={16} />
                      <span>10:00 - 18:00 (Todos os dias)</span>
                    </div>
                  </div>
                </div>

                {/* Vinícola 3 */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200 hover:shadow-xl transition-all">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Vinícola Aurora</h3>
                  <p className="text-gray-600 mb-4">Maior cooperativa vinícola do Brasil. Tour pela fábrica, degustação e loja com preços especiais. Ótimo custo-benefício.</p>
                  <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <div className="flex gap-2 items-center">
                      <MapPin size={16} />
                      <span>Bento Gonçalves - 42km de Gramado</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Clock size={16} />
                      <span>08:00 - 17:30 (Seg-Sáb)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seção: PASSEIO PELA CIDADE */}
        {secaoAtiva === 'cidade' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Map className="text-indigo-600" size={32} />
                Passeio pela Cidade
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Ponto 1 */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200 hover:shadow-xl transition-all">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Rua Coberta</h3>
                  <p className="text-gray-600 mb-4">Coração de Gramado com lojas de chocolate, malhas e souvenirs. Arquitetura charmosa e eventos culturais frequentes.</p>
                  <div className="flex gap-2 items-center text-sm text-gray-500">
                    <MapPin size={16} />
                    <span>Centro - Av. Borges de Medeiros</span>
                  </div>
                </div>

                {/* Ponto 2 */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200 hover:shadow-xl transition-all">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Catedral de Pedra (Canela)</h3>
                  <p className="text-gray-600 mb-4">Igreja gótica construída em pedra com arquitetura impressionante. Símbolo da região e ponto turístico obrigatório.</p>
                  <div className="flex gap-2 items-center text-sm text-gray-500">
                    <MapPin size={16} />
                    <span>Centro de Canela - 8km de Gramado</span>
                  </div>
                </div>

                {/* Ponto 3 */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200 hover:shadow-xl transition-all">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Praça Major Nicoletti</h3>
                  <p className="text-gray-600 mb-4">Praça central com fonte luminosa, flores e eventos. Ponto de encontro e início de passeios pelo centro histórico.</p>
                  <div className="flex gap-2 items-center text-sm text-gray-500">
                    <MapPin size={16} />
                    <span>Centro - Próximo à Rua Coberta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seção: PASSEIOS KIDS */}
        {secaoAtiva === 'kids' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Baby className="text-yellow-600" size={32} />
                Passeios Kids
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Atração 1 */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200 hover:shadow-xl transition-all">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Aldeia do Papai Noel</h3>
                  <p className="text-gray-600 mb-4">Casa do Papai Noel com decoração natalina o ano todo. Crianças podem tirar fotos e conhecer a fábrica de brinquedos.</p>
                  <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <div className="flex gap-2 items-center">
                      <span>👶 Idade recomendada: 2-10 anos</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Clock size={16} />
                      <span>Duração: 1h30min</span>
                    </div>
                  </div>
                </div>

                {/* Atração 2 */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200 hover:shadow-xl transition-all">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Reino do Chocolate</h3>
                  <p className="text-gray-600 mb-4">Fábrica de chocolate com tour interativo. Crianças aprendem sobre o processo e podem fazer suas próprias criações.</p>
                  <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <div className="flex gap-2 items-center">
                      <span>👶 Idade recomendada: 4-12 anos</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Clock size={16} />
                      <span>Duração: 2h</span>
                    </div>
                  </div>
                </div>

                {/* Atração 3 */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200 hover:shadow-xl transition-all">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Snowland Kids</h3>
                  <p className="text-gray-600 mb-4">Área kids do Snowland com atividades na neve adaptadas para crianças. Trenó, bonecos de neve e diversão garantida.</p>
                  <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <div className="flex gap-2 items-center">
                      <span>👶 Idade recomendada: 3-12 anos</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Clock size={16} />
                      <span>Duração: 3h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seção: ROTEIRO GUIADO */}
        {secaoAtiva === 'premium' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl shadow-2xl p-8 border-2 border-amber-300">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full mb-4">
                  <Crown className="text-white" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                  Roteiro Guiado
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Tenha acesso direto a mim e minha equipe para criar um roteiro personalizado e detalhado, 
                  ajustado minuto a minuto para sua viagem perfeita.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Clock className="text-amber-500" size={24} />
                    O que está incluído
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Consultoria personalizada via call</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Roteiro cronometrado minuto a minuto</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Reservas e indicações exclusivas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Suporte durante toda a viagem</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Ajustes em tempo real</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Crown className="text-amber-500" size={24} />
                    Diferenciais Premium
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">★</span>
                      <span>Acesso a lugares exclusivos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">★</span>
                      <span>Otimização de tempo e custos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">★</span>
                      <span>Dicas de insider local</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">★</span>
                      <span>Roteiro adaptado ao seu perfil</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">★</span>
                      <span>Garantia de satisfação</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-md text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Entre em Contato
                </h3>
                <p className="text-gray-600 mb-6">
                  Agende uma call gratuita de 15 minutos para conhecer o serviço e tirar suas dúvidas.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://wa.me/5500000000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Phone size={24} />
                    WhatsApp
                  </a>
                  <a
                    href="mailto:contato@seuroteiro.com"
                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Mail size={24} />
                    E-mail
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes da Atração */}
      {atracaoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{atracaoModal.nome}</h2>
                  <div className="flex flex-col gap-2 text-green-50 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{atracaoModal.horario}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{atracaoModal.localizacao}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setAtracaoModal(null)}
                  className="ml-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Descrição */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Sobre</h3>
                <p className="text-gray-600">{atracaoModal.descricao}</p>
                {atracaoModal.detalhes && (
                  <p className="text-gray-600 mt-2">{atracaoModal.detalhes}</p>
                )}
              </div>

              {/* Tempo de Duração */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Timer className="text-blue-600" size={20} />
                  Tempo Recomendado de Visita
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-md">
                      <div className="text-xs text-gray-500 mb-1">MÍNIMO</div>
                      <div className="text-3xl font-bold text-green-600">{atracaoModal.tempoMinimo}h</div>
                      <div className="text-xs text-gray-500 mt-1">Visita rápida</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-md border-2 border-blue-400">
                      <div className="text-xs text-gray-500 mb-1">MÉDIO</div>
                      <div className="text-3xl font-bold text-blue-600">{atracaoModal.tempoMedio}h</div>
                      <div className="text-xs text-gray-500 mt-1">Recomendado</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-md">
                      <div className="text-xs text-gray-500 mb-1">MÁXIMO</div>
                      <div className="text-3xl font-bold text-orange-600">{atracaoModal.tempoMaximo}h</div>
                      <div className="text-xs text-gray-500 mt-1">Aproveitar tudo</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600 bg-white rounded-lg p-3">
                  <strong>Seu ritmo atual: {ritmo === 'leve' ? '🐢 Leve' : ritmo === 'moderada' ? '🚶 Moderada' : '🏃 Intensa'}</strong>
                  <br />
                  Tempo que será usado: <strong>{ritmo === 'leve' ? atracaoModal.tempoMaximo : ritmo === 'moderada' ? atracaoModal.tempoMedio : atracaoModal.tempoMinimo}h</strong>
                </div>
              </div>

              {/* Dicas */}
              {atracaoModal.dicas && atracaoModal.dicas.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Sparkles className="text-yellow-600" size={20} />
                    Dicas Importantes
                  </h3>
                  <ul className="space-y-2">
                    {atracaoModal.dicas.map((dica, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{dica}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Botão Adicionar */}
              <button
                onClick={() => adicionarAtracao(atracaoModal)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Plus size={24} />
                Adicionar ao Roteiro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
