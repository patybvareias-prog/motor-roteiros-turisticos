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
  TrendingUp,
  Check,
  AlertCircle,
  GripVertical,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// ===== TIPOS E INTERFACES =====
type Section = 'roteiro' | 'parques' | 'gastronomia' | 'instagramaveis' | 'hospedagem' | 'vinhos' | 'cidade' | 'kids' | 'premium';
type Ritmo = 'leve' | 'moderada' | 'intensa';

interface Atracao {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  city: string;
  horario: string;
  localizacao: string;
  tempo_minimo: number;
  tempo_medio: number;
  tempo_maximo: number;
  detalhes?: string;
  dicas?: string[];
  subcategoria?: string; // Para identificar "Almoço" em gastronomia
}

interface AtracaoSelecionada extends Atracao {
  tempo_escolhido: number;
}

interface AtividadeAgendada {
  id: string;
  titulo: string;
  tempo_medio: number;
  inicio: string;
  fim: string;
  categoria: string;
  subcategoria?: string;
  isNoturno?: boolean; // Gastronomia noturna não consome tempo
}

interface DiaRoteiro {
  dia: number;
  atividades: AtividadeAgendada[];
  tempo_total: number;
}

interface RoteiroOtimizado {
  dias: DiaRoteiro[];
  pendentes: string[];
  avisos: string[];
}

// ===== DADOS MOCKADOS (Simulando API) =====
const ATRACOES_DISPONIVEIS: Atracao[] = [
  // PARQUES
  {
    id: 'snowland',
    titulo: 'Snowland',
    descricao: 'Parque temático de neve com diversas atividades como esqui, snowboard e patinação no gelo. Perfeito para toda a família.',
    categoria: 'parques',
    city: 'Gramado',
    horario: '10:00 - 18:00',
    localizacao: 'Rua da Neve, 123',
    tempo_minimo: 2,
    tempo_medio: 3.5,
    tempo_maximo: 5,
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
    titulo: 'Mini Mundo',
    descricao: 'Réplicas em miniatura de construções famosas da Europa. Ideal para fotos e passeio em família com crianças.',
    categoria: 'parques',
    city: 'Gramado',
    horario: '09:00 - 17:30',
    localizacao: 'Rua Horácio Cardoso, 291',
    tempo_minimo: 1,
    tempo_medio: 2,
    tempo_maximo: 3,
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
    titulo: 'Parque do Caracol',
    descricao: 'Cascata de 131 metros de altura com trilhas ecológicas e mirantes. Vista espetacular da natureza da Serra Gaúcha.',
    categoria: 'parques',
    city: 'Canela',
    horario: '08:30 - 17:30',
    localizacao: 'Rodovia RS-466, Canela',
    tempo_minimo: 1.5,
    tempo_medio: 2.5,
    tempo_maximo: 4,
    detalhes: 'Uma das cascatas mais famosas do Brasil. Trilha com 927 degraus até a base da cachoeira.',
    dicas: [
      'Use calçados confortáveis para trilha',
      'Leve água e lanche',
      'Opção de teleférico para quem não quer descer',
      'Vista panorâmica incrível do mirante superior'
    ]
  },
  // GASTRONOMIA
  {
    id: 'colosseo',
    titulo: 'Colosseo Restaurante',
    descricao: 'Culinária italiana autêntica com massas artesanais e ambiente acolhedor. Especialidade em risotos e carnes.',
    categoria: 'gastronomia',
    city: 'Gramado',
    horario: '12:00 - 23:00',
    localizacao: 'Centro de Gramado',
    tempo_minimo: 1,
    tempo_medio: 1.5,
    tempo_maximo: 2,
    subcategoria: 'Almoço'
  },
  {
    id: 'bouquet',
    titulo: 'Bouquet Garni',
    descricao: 'Fondue completo (queijo, carne e chocolate) em ambiente romântico. Perfeito para casais e ocasiões especiais.',
    categoria: 'gastronomia',
    city: 'Gramado',
    horario: '19:00 - 23:30',
    localizacao: 'Av. Borges de Medeiros',
    tempo_minimo: 1.5,
    tempo_medio: 2,
    tempo_maximo: 3
  },
  {
    id: 'casa_di_paolo',
    titulo: 'Casa di Paolo',
    descricao: 'Restaurante italiano com vista panorâmica. Especialidade em massas frescas e vinhos selecionados.',
    categoria: 'gastronomia',
    city: 'Gramado',
    horario: '12:00 - 23:00',
    localizacao: 'Rua São Pedro, 123',
    tempo_minimo: 1,
    tempo_medio: 1.5,
    tempo_maximo: 2
  }
];

export default function Home() {
  // ===== ESTADOS =====
  const [secaoAtiva, setSecaoAtiva] = useState<Section>('roteiro');
  const [atracaoModal, setAtracaoModal] = useState<Atracao | null>(null);
  const [atracoesPendentes, setAtracoesPendentes] = useState<AtracaoSelecionada[]>([]);
  const [atracoesAgendadas, setAtracoesAgendadas] = useState<AtracaoSelecionada[]>([]);
  const [ritmo, setRitmo] = useState<Ritmo>('moderada');
  const [roteiroOtimizado, setRoteiroOtimizado] = useState<RoteiroOtimizado | null>(null);
  const [duracaoViagem, setDuracaoViagem] = useState(3);
  const [carregandoOtimizacao, setCarregandoOtimizacao] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // ===== FILTRAR APENAS ATRAÇÕES DE GRAMADO =====
  const atracoesGramado = ATRACOES_DISPONIVEIS.filter(a => a.city === 'Gramado');

  // ===== CÁLCULO DO TEMPO DISPONÍVEL =====
  const calcularTempoDisponivel = () => {
    const horasPorDia = 7;
    const totalHoras = horasPorDia * duracaoViagem;
    
    // Soma apenas atrações que NÃO são gastronomia noturna (sem subcategoria Almoço)
    const horasUsadas = [...atracoesPendentes, ...atracoesAgendadas]
      .filter(atracao => {
        // Gastronomia sem subcategoria "Almoço" = noturna (não consome tempo)
        if (atracao.categoria === 'gastronomia' && atracao.subcategoria !== 'Almoço') {
          return false;
        }
        return true;
      })
      .reduce((acc, atracao) => acc + atracao.tempo_escolhido, 0);
    
    return {
      total: totalHoras,
      usado: horasUsadas,
      restante: totalHoras - horasUsadas
    };
  };

  const tempoDisponivel = calcularTempoDisponivel();
  const percentualUsado = (tempoDisponivel.usado / tempoDisponivel.total) * 100;

  // ===== ADICIONAR ATRAÇÃO AOS PENDENTES =====
  const adicionarAtracao = (atracao: Atracao) => {
    if (atracao.city !== 'Gramado') {
      setErro('Apenas atrações de Gramado podem ser adicionadas ao roteiro.');
      setTimeout(() => setErro(null), 3000);
      return;
    }

    // Define o tempo baseado no ritmo escolhido
    let tempo_escolhido = atracao.tempo_medio;
    if (ritmo === 'leve') tempo_escolhido = atracao.tempo_maximo;
    if (ritmo === 'intensa') tempo_escolhido = atracao.tempo_minimo;

    // Se for gastronomia com subcategoria "Almoço", força 1h
    if (atracao.categoria === 'gastronomia' && atracao.subcategoria === 'Almoço') {
      tempo_escolhido = 1;
    }

    const novaAtracao: AtracaoSelecionada = {
      ...atracao,
      tempo_escolhido
    };

    setAtracoesPendentes([...atracoesPendentes, novaAtracao]);
    setAtracaoModal(null);
  };

  // ===== REMOVER ATRAÇÃO DOS PENDENTES =====
  const removerAtracao = (id: string) => {
    setAtracoesPendentes(atracoesPendentes.filter(a => a.id !== id));
  };

  // ===== OTIMIZAR ROTEIRO (Integração com IA) =====
  const otimizarRoteiro = async () => {
    if (atracoesPendentes.length === 0) {
      setErro('Adicione pelo menos uma atração antes de otimizar o roteiro.');
      setTimeout(() => setErro(null), 3000);
      return;
    }

    setCarregandoOtimizacao(true);
    setErro(null);

    try {
      const entrada = {
        tipo_requisicao: 'otimizar',
        duracao_viagem: duracaoViagem,
        ritmo: ritmo,
        atracoes_disponiveis: atracoesGramado.map(a => ({
          id: a.id,
          titulo: a.titulo,
          categoria: a.categoria,
          tempo_medio: a.tempo_medio,
          city: a.city,
          subcategoria: a.subcategoria
        })),
        atracoes_pendentes: atracoesPendentes.map(a => a.id),
        atracoes_agendadas: atracoesAgendadas.map(a => ({
          id: a.id,
          titulo: a.titulo,
          tempo_medio: a.tempo_escolhido
        }))
      };

      const response = await simularChamadaIA(entrada);

      if (response.error) {
        setErro(response.error);
      } else {
        setRoteiroOtimizado(response);
        setAtracoesAgendadas([...atracoesAgendadas, ...atracoesPendentes]);
        setAtracoesPendentes([]);
      }
    } catch (error) {
      setErro('Erro ao otimizar roteiro. Tente novamente.');
      console.error(error);
    } finally {
      setCarregandoOtimizacao(false);
    }
  };

  // ===== SIMULAÇÃO DE CHAMADA À IA =====
  const simularChamadaIA = async (entrada: any): Promise<RoteiroOtimizado | { error: string }> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const atracoesGramadoCount = entrada.atracoes_disponiveis.filter(
      (a: any) => a.city === 'Gramado'
    ).length;

    if (atracoesGramadoCount === 0) {
      return { error: 'Sem atrações de Gramado' };
    }

    const diasRoteiro: DiaRoteiro[] = [];

    for (let dia = 1; dia <= entrada.duracao_viagem; dia++) {
      const atividadesDia: AtividadeAgendada[] = [];
      let tempoTotalDia = 0;
      let horaInicio = 9;

      const atracoesDia = entrada.atracoes_pendentes.slice(
        (dia - 1) * 3, 
        dia * 3
      );

      // Primeiro, adiciona almoços às 12h
      atracoesDia.forEach((idAtracao: string) => {
        const atracao = atracoesPendentes.find(a => a.id === idAtracao);
        if (atracao && atracao.categoria === 'gastronomia' && atracao.subcategoria === 'Almoço') {
          atividadesDia.push({
            id: atracao.id,
            titulo: atracao.titulo,
            tempo_medio: 1,
            inicio: '12:00',
            fim: '13:00',
            categoria: atracao.categoria,
            subcategoria: atracao.subcategoria
          });
          tempoTotalDia += 1;
        }
      });

      // Depois, adiciona outras atrações (exceto gastronomia)
      atracoesDia.forEach((idAtracao: string) => {
        const atracao = atracoesPendentes.find(a => a.id === idAtracao);
        if (atracao && atracao.categoria !== 'gastronomia' && tempoTotalDia + atracao.tempo_escolhido <= 7) {
          const inicio = `${Math.floor(horaInicio)}:${(horaInicio % 1) * 60 || '00'}`;
          horaInicio += atracao.tempo_escolhido;
          const fim = `${Math.floor(horaInicio)}:${(horaInicio % 1) * 60 || '00'}`;

          atividadesDia.push({
            id: atracao.id,
            titulo: atracao.titulo,
            tempo_medio: atracao.tempo_escolhido,
            inicio,
            fim,
            categoria: atracao.categoria
          });

          tempoTotalDia += atracao.tempo_escolhido;
        }
      });

      // Por fim, adiciona gastronomia noturna (19h-22h) - NÃO consome tempo
      atracoesDia.forEach((idAtracao: string) => {
        const atracao = atracoesPendentes.find(a => a.id === idAtracao);
        if (atracao && atracao.categoria === 'gastronomia' && atracao.subcategoria !== 'Almoço') {
          atividadesDia.push({
            id: atracao.id,
            titulo: atracao.titulo,
            tempo_medio: atracao.tempo_escolhido,
            inicio: '19:00',
            fim: '22:00',
            categoria: atracao.categoria,
            isNoturno: true
          });
          // NÃO adiciona ao tempo total
        }
      });

      diasRoteiro.push({
        dia,
        atividades: atividadesDia,
        tempo_total: tempoTotalDia
      });
    }

    return {
      dias: diasRoteiro,
      pendentes: entrada.atracoes_pendentes.slice(entrada.duracao_viagem * 3),
      avisos: [
        'Roteiro otimizado considerando horários de funcionamento',
        'Restaurantes noturnos (19h-22h) não consomem tempo do roteiro',
        'Almoços agendados automaticamente às 12h com 1h de duração',
        'Tempo de deslocamento não incluído - adicione 15-30min entre atrações'
      ]
    };
  };

  // ===== FUNÇÕES DE EDIÇÃO DO ROTEIRO =====
  const alterarDuracaoAtividade = (diaIndex: number, atividadeId: string, novaDuracao: number) => {
    if (!roteiroOtimizado) return;

    const novoRoteiro = { ...roteiroOtimizado };
    const dia = novoRoteiro.dias[diaIndex];
    const atividadeIndex = dia.atividades.findIndex(a => a.id === atividadeId);
    
    if (atividadeIndex === -1) return;

    const atividade = dia.atividades[atividadeIndex];
    const diferencaTempo = novaDuracao - atividade.tempo_medio;

    // Atualiza duração
    atividade.tempo_medio = novaDuracao;

    // Recalcula horários subsequentes
    const [horaInicio, minInicio] = atividade.inicio.split(':').map(Number);
    const novaHoraFim = horaInicio + novaDuracao;
    atividade.fim = `${Math.floor(novaHoraFim)}:${Math.round((novaHoraFim % 1) * 60).toString().padStart(2, '0')}`;

    // Atualiza tempo total do dia (se não for noturno)
    if (!atividade.isNoturno) {
      dia.tempo_total += diferencaTempo;
    }

    setRoteiroOtimizado(novoRoteiro);
  };

  const alterarHorarioAtividade = (diaIndex: number, atividadeId: string, novoHorario: string) => {
    if (!roteiroOtimizado) return;

    const novoRoteiro = { ...roteiroOtimizado };
    const dia = novoRoteiro.dias[diaIndex];
    const atividadeIndex = dia.atividades.findIndex(a => a.id === atividadeId);
    
    if (atividadeIndex === -1) return;

    const atividade = dia.atividades[atividadeIndex];
    const [novaHora, novoMin] = novoHorario.split(':').map(Number);
    const novaHoraFim = novaHora + atividade.tempo_medio;

    atividade.inicio = novoHorario;
    atividade.fim = `${Math.floor(novaHoraFim)}:${Math.round((novaHoraFim % 1) * 60).toString().padStart(2, '0')}`;

    setRoteiroOtimizado(novoRoteiro);
  };

  const moverAtividade = (diaIndex: number, atividadeIndex: number, direcao: 'up' | 'down') => {
    if (!roteiroOtimizado) return;

    const novoRoteiro = { ...roteiroOtimizado };
    const dia = novoRoteiro.dias[diaIndex];
    const novoIndex = direcao === 'up' ? atividadeIndex - 1 : atividadeIndex + 1;

    if (novoIndex < 0 || novoIndex >= dia.atividades.length) return;

    // Troca posições
    [dia.atividades[atividadeIndex], dia.atividades[novoIndex]] = 
    [dia.atividades[novoIndex], dia.atividades[atividadeIndex]];

    setRoteiroOtimizado(novoRoteiro);
  };

  // ===== NAVEGAÇÃO =====
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
                Lasy - Roteiro Gramado
              </h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <Calendar size={18} />
                Gramado - RS • {duracaoViagem} dias
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

      {/* Mensagem de Erro */}
      {erro && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-500" size={24} />
            <p className="text-red-700 font-semibold">{erro}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seção: ROTEIRO */}
        {secaoAtiva === 'roteiro' && (
          <div className="space-y-8">
            {/* Controle de Duração da Viagem */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="text-indigo-600" size={24} />
                Duração da Viagem
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setDuracaoViagem(Math.max(1, duracaoViagem - 1))}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all font-bold"
                >
                  -
                </button>
                <div className="text-3xl font-bold text-indigo-600">{duracaoViagem} dias</div>
                <button
                  onClick={() => setDuracaoViagem(Math.min(10, duracaoViagem + 1))}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all font-bold"
                >
                  +
                </button>
              </div>
            </div>

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
                  <br />
                  * Gastronomia noturna (19h-22h) não consome tempo do roteiro
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
                    disabled={carregandoOtimizacao}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl ${
                      carregandoOtimizacao
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                    }`}
                  >
                    {carregandoOtimizacao ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Otimizando...
                      </>
                    ) : (
                      <>
                        <TrendingUp size={20} />
                        Otimizar Roteiro
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-3">
                  {atracoesPendentes.map((atracao) => (
                    <div
                      key={atracao.id}
                      className="bg-white rounded-lg p-4 flex items-center justify-between shadow-md hover:shadow-lg transition-all"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{atracao.titulo}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Clock size={14} />
                          {atracao.categoria === 'gastronomia' && atracao.subcategoria === 'Almoço' ? (
                            <>Almoço às 12h (1h de duração)</>
                          ) : atracao.categoria === 'gastronomia' ? (
                            <>Jantar noturno 19h-22h (não consome tempo)</>
                          ) : (
                            <>
                              Tempo estimado: {atracao.tempo_escolhido}h
                              <span className="text-xs text-gray-400">
                                ({ritmo === 'leve' ? 'máximo' : ritmo === 'moderada' ? 'médio' : 'mínimo'})
                              </span>
                            </>
                          )}
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

            {/* Roteiro Otimizado */}
            {roteiroOtimizado && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-2 border-green-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Check className="text-green-600" size={32} />
                  Roteiro Otimizado
                </h2>

                {/* Avisos */}
                {roteiroOtimizado.avisos.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                      <AlertCircle size={18} />
                      Avisos Importantes
                    </h3>
                    <ul className="space-y-1">
                      {roteiroOtimizado.avisos.map((aviso, index) => (
                        <li key={index} className="text-sm text-blue-700">• {aviso}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dias do Roteiro */}
                <div className="space-y-6">
                  {roteiroOtimizado.dias.map((dia, diaIndex) => (
                    <div key={dia.dia} className="bg-white rounded-lg p-6 shadow-md">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Dia {dia.dia} - {dia.tempo_total.toFixed(1)}h de atividades
                      </h3>
                      <div className="space-y-3">
                        {dia.atividades.map((atividade, atividadeIndex) => (
                          <div key={atividade.id} className={`p-4 rounded-lg border-2 ${
                            atividade.isNoturno 
                              ? 'bg-purple-50 border-purple-200' 
                              : atividade.subcategoria === 'Almoço'
                              ? 'bg-orange-50 border-orange-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-start gap-4">
                              {/* Controles de Movimento */}
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => moverAtividade(diaIndex, atividadeIndex, 'up')}
                                  disabled={atividadeIndex === 0}
                                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ChevronUp size={16} />
                                </button>
                                <GripVertical size={16} className="text-gray-400" />
                                <button
                                  onClick={() => moverAtividade(diaIndex, atividadeIndex, 'down')}
                                  disabled={atividadeIndex === dia.atividades.length - 1}
                                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ChevronDown size={16} />
                                </button>
                              </div>

                              {/* Informações da Atividade */}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <input
                                    type="time"
                                    value={atividade.inicio}
                                    onChange={(e) => alterarHorarioAtividade(diaIndex, atividade.id, e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm font-semibold text-indigo-600"
                                  />
                                  <span className="text-gray-400">-</span>
                                  <span className="text-sm font-semibold text-gray-600">{atividade.fim}</span>
                                  {atividade.isNoturno && (
                                    <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-semibold">
                                      🌙 Noturno (não consome tempo)
                                    </span>
                                  )}
                                  {atividade.subcategoria === 'Almoço' && (
                                    <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full font-semibold">
                                      🍽️ Almoço
                                    </span>
                                  )}
                                </div>
                                <div className="font-semibold text-gray-800 mb-1">{atividade.titulo}</div>
                                <div className="flex items-center gap-3">
                                  <label className="text-xs text-gray-500">Duração:</label>
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0.5"
                                    max="8"
                                    value={atividade.tempo_medio}
                                    onChange={(e) => alterarDuracaoAtividade(diaIndex, atividade.id, parseFloat(e.target.value))}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                    disabled={atividade.isNoturno || atividade.subcategoria === 'Almoço'}
                                  />
                                  <span className="text-xs text-gray-500">horas</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pendentes Restantes */}
                {roteiroOtimizado.pendentes.length > 0 && (
                  <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-bold text-yellow-800 mb-2">
                      Atrações que não couberam no roteiro ({roteiroOtimizado.pendentes.length})
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Considere aumentar a duração da viagem ou escolher ritmo mais intenso.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Seção: PARQUES */}
        {secaoAtiva === 'parques' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <TreePine className="text-green-600" size={32} />
                Parques e Atrações em Gramado
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {atracoesGramado.filter(a => a.categoria === 'parques').map((atracao) => {
                  const jaAdicionada = atracoesPendentes.some(a => a.id === atracao.id) || 
                                      atracoesAgendadas.some(a => a.id === atracao.id);
                  return (
                    <div
                      key={atracao.id}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200 hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => !jaAdicionada && setAtracaoModal(atracao)}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{atracao.titulo}</h3>
                      <p className="text-gray-600 mb-4 text-sm">{atracao.descricao}</p>
                      
                      <div className="bg-white rounded-lg p-3 mb-4">
                        <div className="text-xs font-semibold text-gray-500 mb-2">DURAÇÃO RECOMENDADA</div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Mín</div>
                            <div className="font-bold text-green-600">{atracao.tempo_minimo}h</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Médio</div>
                            <div className="font-bold text-blue-600">{atracao.tempo_medio}h</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Máx</div>
                            <div className="font-bold text-orange-600">{atracao.tempo_maximo}h</div>
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
                Gastronomia em Gramado
              </h2>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800">
                  <strong>💡 Dica:</strong> Restaurantes com almoço são agendados automaticamente às 12h (1h de duração). 
                  Restaurantes noturnos são agendados das 19h às 22h e não consomem tempo do seu roteiro diurno!
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {atracoesGramado.filter(a => a.categoria === 'gastronomia').map((atracao) => {
                  const jaAdicionada = atracoesPendentes.some(a => a.id === atracao.id) || 
                                      atracoesAgendadas.some(a => a.id === atracao.id);
                  const isAlmoco = atracao.subcategoria === 'Almoço';
                  return (
                    <div
                      key={atracao.id}
                      className={`rounded-lg p-6 border-2 hover:shadow-xl transition-all cursor-pointer ${
                        isAlmoco 
                          ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200'
                          : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
                      }`}
                      onClick={() => !jaAdicionada && setAtracaoModal(atracao)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{atracao.titulo}</h3>
                        {isAlmoco ? (
                          <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full font-semibold">
                            🍽️ Almoço
                          </span>
                        ) : (
                          <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-semibold">
                            🌙 Noturno
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4">{atracao.descricao}</p>
                      <div className="flex gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex gap-1 items-center">
                          <MapPin size={16} />
                          <span>{atracao.localizacao}</span>
                        </div>
                        <div className="flex gap-1 items-center">
                          <Clock size={16} />
                          <span>{atracao.horario}</span>
                        </div>
                      </div>
                      {isAlmoco && (
                        <div className="bg-white rounded-lg p-3 mb-4 text-sm">
                          <strong className="text-orange-700">Agendamento automático:</strong>
                          <br />
                          <span className="text-gray-600">12:00 - 13:00 (1h de duração)</span>
                        </div>
                      )}
                      {!isAlmoco && (
                        <div className="bg-white rounded-lg p-3 mb-4 text-sm">
                          <strong className="text-purple-700">Período noturno:</strong>
                          <br />
                          <span className="text-gray-600">19:00 - 22:00 (não consome tempo do roteiro)</span>
                        </div>
                      )}
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
                          className={`w-full text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                            isAlmoco
                              ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700'
                              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                          }`}
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

        {/* Outras seções mantidas como placeholders */}
        {secaoAtiva === 'instagramaveis' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Lugares Instagramáveis</h2>
            <p className="text-gray-600">Em breve: lugares perfeitos para fotos em Gramado!</p>
          </div>
        )}

        {secaoAtiva === 'hospedagem' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Opções de Hospedagem</h2>
            <p className="text-gray-600">Em breve: melhores hotéis e pousadas de Gramado!</p>
          </div>
        )}

        {secaoAtiva === 'vinhos' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Rota dos Vinhos</h2>
            <p className="text-gray-600">Em breve: vinícolas e degustações próximas a Gramado!</p>
          </div>
        )}

        {secaoAtiva === 'cidade' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Passeio pela Cidade</h2>
            <p className="text-gray-600">Em breve: principais pontos turísticos do centro de Gramado!</p>
          </div>
        )}

        {secaoAtiva === 'kids' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Passeios Kids</h2>
            <p className="text-gray-600">Em breve: atrações perfeitas para crianças em Gramado!</p>
          </div>
        )}

        {secaoAtiva === 'premium' && (
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
        )}
      </div>

      {/* Modal de Detalhes da Atração */}
      {atracaoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{atracaoModal.titulo}</h2>
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

              {/* Informações de Agendamento para Gastronomia */}
              {atracaoModal.categoria === 'gastronomia' && (
                <div className={`rounded-lg p-4 ${
                  atracaoModal.subcategoria === 'Almoço'
                    ? 'bg-orange-50 border-2 border-orange-200'
                    : 'bg-purple-50 border-2 border-purple-200'
                }`}>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Clock className={atracaoModal.subcategoria === 'Almoço' ? 'text-orange-600' : 'text-purple-600'} size={20} />
                    Agendamento Automático
                  </h3>
                  {atracaoModal.subcategoria === 'Almoço' ? (
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <strong>Horário:</strong> 12:00 - 13:00
                      </p>
                      <p className="text-gray-700">
                        <strong>Duração:</strong> 1 hora (fixo)
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        ✓ Será inserido automaticamente no horário de almoço
                      </p>
                      <p className="text-sm text-gray-600">
                        ✓ Consome 1h do tempo disponível do dia
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <strong>Período:</strong> Noturno (19:00 - 22:00)
                      </p>
                      <p className="text-gray-700">
                        <strong>Duração:</strong> {atracaoModal.tempo_medio}h
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        ✓ Será agendado no período noturno
                      </p>
                      <p className="text-sm text-gray-600">
                        ✓ NÃO consome tempo do roteiro diurno
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tempo de Duração (apenas para não-gastronomia) */}
              {atracaoModal.categoria !== 'gastronomia' && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Timer className="text-blue-600" size={20} />
                    Tempo Recomendado de Visita
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="bg-white rounded-lg p-4 shadow-md">
                        <div className="text-xs text-gray-500 mb-1">MÍNIMO</div>
                        <div className="text-3xl font-bold text-green-600">{atracaoModal.tempo_minimo}h</div>
                        <div className="text-xs text-gray-500 mt-1">Visita rápida</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-white rounded-lg p-4 shadow-md border-2 border-blue-400">
                        <div className="text-xs text-gray-500 mb-1">MÉDIO</div>
                        <div className="text-3xl font-bold text-blue-600">{atracaoModal.tempo_medio}h</div>
                        <div className="text-xs text-gray-500 mt-1">Recomendado</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-white rounded-lg p-4 shadow-md">
                        <div className="text-xs text-gray-500 mb-1">MÁXIMO</div>
                        <div className="text-3xl font-bold text-orange-600">{atracaoModal.tempo_maximo}h</div>
                        <div className="text-xs text-gray-500 mt-1">Aproveitar tudo</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600 bg-white rounded-lg p-3">
                    <strong>Seu ritmo atual: {ritmo === 'leve' ? '🐢 Leve' : ritmo === 'moderada' ? '🚶 Moderada' : '🏃 Intensa'}</strong>
                    <br />
                    Tempo que será usado: <strong>{ritmo === 'leve' ? atracaoModal.tempo_maximo : ritmo === 'moderada' ? atracaoModal.tempo_medio : atracaoModal.tempo_minimo}h</strong>
                  </div>
                </div>
              )}

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
