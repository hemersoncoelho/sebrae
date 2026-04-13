export interface SettingsData {
  organizers: string[];
  eixos: string[];
  projetos: string[];
}

const SETTINGS_KEY = "relatorio_evento_settings";

const DEFAULT_SETTINGS: SettingsData = {
  organizers: [
    "Carla Araújo",
    "Julião Klessio",
    "Aucélio de Sousa",
    "Wandrey Girão",
    "Georgia Nobre",
    "Caio Sabóia"
  ],
  eixos: [
    "Ambiente de Negócios",
    "Rede de Atendimento",
    "Cultura Empreendedora",
    "Ecossistema de Inovação",
    "Competitividade Empresarial"
  ],
  projetos: [
    "COMP. EMP - MODA CARIRI",
    "COMP. EMP. - ROTA TURISTICA DO CARIRI",
    "COMP. EMP. - BOVINOCULTURA DE LEITE E DERIVADOS CARIRI",
    "COMP. EMP. - ALI PRODUTIVIDADE",
    "COMP. EMP. - ALI RURAL",
    "PLURAL CARIRI",
    "EDUCAÇÃO EMPREENDEDORA - JEPP",
    "PARCIAL",
    "R.E - DESENVOLVIMENTO INOVAÇÃO - REGIONAL CARIRI",
    "R.E - CE REDE INTEGRADA DE ECOSSISTEMAS DE INOVAÇÃO",
    "A.N - CIDADE EMPREENDEDORA CARIRI",
    "A.N - POLO EMPREENDEDOR CARIRI",
    "A.N - TERRITÓRIO EMPREENDEDOR CE CARIRI",
    "A.N - QUALIFICAÇÃO E RENDA",
    "R.A. - TERRITÓRIOS DA ESPERANÇA - UR CARIRI"
  ]
};

export const getSettings = (): SettingsData => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : DEFAULT_SETTINGS;
};

export const saveSettings = (settings: SettingsData): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
