import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib";

// --- Constantes Globais ---
const idiomasApp = [
  { codigo: "pt", nome: "Português", icone: "🇧🇷" },
  { codigo: "en", nome: "English", icone: "🇺🇸" },
  { codigo: "es", nome: "Español", icone: "🇪🇸" },
];

const paisesTelefone = [
  { codigo: "+55", nome: "BR (+55)" }, { codigo: "+1", nome: "US/CA (+1)" },
  { codigo: "+54", nome: "AR (+54)" }, { codigo: "+351", nome: "PT (+351)" },
  { codigo: "+34", nome: "ES (+34)" }, { codigo: "+44", nome: "UK (+44)" },
];

const tiposCurso = [
  { valor: "superior", label: "Ensino Superior", label_en: "Bachelor's Degree", label_es: "Grado Universitario" },
  { valor: "tecnologo", label: "Tecnólogo", label_en: "Associate's Degree", label_es: "Tecnólogo" },
  { valor: "medio", label: "Ensino Médio", label_en: "High School", label_es: "Bachillerato" },
  { valor: "tecnico", label: "Curso Técnico", label_en: "Technical Course", label_es: "Curso Técnico" },
  { valor: "pos", label: "Pós-Graduação", label_en: "Postgraduate", label_es: "Posgrado" },
  { valor: "mestrado", label: "Mestrado", label_en: "Master's Degree", label_es: "Máster" },
  { valor: "doutorado", label: "Doutorado", label_en: "PhD/Doctorate", label_es: "Doctorado" },
];

const statusFormacao = [
  { valor: "completo", label: "Completo", label_en: "Completed", label_es: "Completo" },
  { valor: "andamento", label: "Em andamento", label_en: "In Progress", label_es: "En curso" },
  { valor: "trancado", label: "Interrompido", label_en: "Interrupted", label_es: "Interrumpido" }
];

const tiposLinks = [
  { valor: "linkedin", label: "LinkedIn", prefixo: "linkedin.com/in/" },
  { valor: "github", label: "GitHub", prefixo: "github.com/" },
  { valor: "gitlab", label: "GitLab", prefixo: "gitlab.com/" },
  { valor: "behance", label: "Behance", prefixo: "behance.net/" },
  { valor: "portfolio", label: "Portfolio", prefixo: "" },
  { valor: "outro", label: "Outro", prefixo: "" },
];

const meses = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

const sanitizeInput = (text) => {
  if (typeof text !== 'string') return "";
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
};

// --- Componentes UI (Estilo SAAS - Refinado) ---
const SectionCard = React.memo(({ children, title, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm mb-6 overflow-hidden transition-shadow duration-200 hover:shadow-md ${className}`}>
    {title && (
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/80">
        <h3 className="text-lg font-semibold text-gray-800 tracking-tight">{title}</h3>
      </div>
    )}
    <div className="p-5 md:p-6">
      {children}
    </div>
  </div>
));

const ItemCard = React.memo(({ children, onRemove, removeTitle, summaryHeader, index }) => (
  <div className="bg-white rounded-lg border border-gray-200/80 relative shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200 ease-in-out mb-5 overflow-hidden group">
    {summaryHeader && (
      <div className="bg-gray-50/70 px-5 py-3 border-b border-gray-200/80 flex justify-between items-center">
        <div className="flex-grow mr-4 overflow-hidden text-sm">{summaryHeader}</div>
        <RemoveButton onClick={onRemove} title={removeTitle} />
      </div>
    )}
    <div className="p-5 space-y-4">
      {!summaryHeader && (
         <RemoveButton onClick={onRemove} title={removeTitle} className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
      )}
      {children}
    </div>
  </div>
));

const InputField = React.memo(({ label, name, placeholder, value, onChange, error, warning, type = "text", icon = null, className = "", id }) => (
  <div className={`relative ${className}`}>
    <label htmlFor={id || name} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <div className="relative rounded-md shadow-sm">
      {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-base">{icon}</div>}
      <input
        type={type}
        id={id || name}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className={`block w-full px-4 py-2 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out ${icon ? "pl-10" : "pl-4"} ${error ? "border-red-400 ring-red-300" : warning ? "border-yellow-400 ring-yellow-300" : "border-gray-300 focus:border-indigo-500"}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id || name}-error` : undefined}
      />
    </div>
    {error && <p id={`${id || name}-error`} className="text-xs text-red-600 mt-1.5">{error}</p>}
    {warning && !error && <p className="text-xs text-yellow-600 mt-1.5">Campo recomendado.</p>}
  </div>
));

const TextareaField = React.memo(({ label, name, placeholder, value, onChange, warning, rows = 4, className = "", id }) => (
  <div className={className}>
    {label && <label htmlFor={id || name} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
    <textarea
      id={id || name}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`block w-full px-4 py-2 border rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out ${warning ? "border-yellow-400 ring-yellow-300" : "border-gray-300 focus:border-indigo-500"}`}
    />
     {warning && <p className="text-xs text-yellow-600 mt-1.5">Campo recomendado.</p>}
  </div>
));

const SelectField = React.memo(({ label, name, value, onChange, options, className = "", defaultOptionLabel = "Selecione...", id }) => (
  <div className={className}>
    <label htmlFor={id || name} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <select
      id={id || name}
      name={name}
      value={value || ""}
      onChange={onChange}
      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300 focus:border-indigo-500 sm:text-sm rounded-md appearance-none bg-white bg-no-repeat bg-right pr-8 transition duration-150 ease-in-out"
      style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="%236b7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 8l4 4 4-4"/></svg>')`, backgroundPosition: "right 0.5rem center", backgroundSize: "1.25em 1.25em" }}
    >
      <option value="" disabled>{defaultOptionLabel}</option>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
));

const AddItemButton = React.memo(({ onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5 group transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md px-3 py-1.5 hover:bg-indigo-50 active:bg-indigo-100"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
    {label}
  </button>
));

const RemoveButton = React.memo(({ onClick, title, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-gray-400 hover:text-red-600 font-bold text-xl rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-100 active:bg-red-200 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 ${className}`}
    title={title}
    aria-label={title}
  >
    &times;
  </button>
));

const PrimaryButton = React.memo(({ onClick, label, isLoading = false, disabled = false, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isLoading || disabled}
    className={`w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 ease-in-out ${className}`}
  >
    {isLoading ? (
      <>
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {/* Usar tradução aqui se disponível */} Aguarde...
      </>
    ) : (
      label
    )}
  </button>
));

const SkillTag = React.memo(({ skill, onRemove }) => (
  <div className="inline-flex items-center bg-indigo-100 text-indigo-800 rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2 shadow-sm hover:shadow-md hover:bg-indigo-200 transition-all duration-150 ease-in-out">
    <span>{skill}</span>
    {onRemove && (
      <button
        onClick={() => onRemove(skill)}
        className="ml-1.5 -mr-0.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-300 rounded-full p-0.5 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-400"
        aria-label={`Remover ${skill}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
));

const LanguageSelector = React.memo(({ currentLang, onChangeLang }) => (
  <div className="relative">
    <select
      value={currentLang}
      onChange={(e) => onChangeLang(e.target.value)}
      className="bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 appearance-none hover:border-gray-400 transition-colors duration-150"
      style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="%236b7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 8l4 4 4-4"/></svg>')`, backgroundPosition: "right 0.3rem center", backgroundSize: "1.1em 1.1em" }}
    >
      {idiomasApp.map(lang => (
        <option key={lang.codigo} value={lang.codigo}>{lang.icone} {lang.nome}</option>
      ))}
    </select>
  </div>
));

const AlertMessage = React.memo(({ message, type = "success", onDismiss }) => {
  // Animação de entrada/saída pode ser adicionada aqui com Framer Motion ou CSS transitions
  if (!message) return null;

  const baseClasses = "px-4 py-3 rounded-md text-sm font-medium flex justify-between items-center shadow-md mb-4 border";
  const typeClasses = {
    success: "bg-green-50 border-green-300 text-green-800",
    error: "bg-red-50 border-red-300 text-red-800",
    info: "bg-blue-50 border-blue-300 text-blue-800",
    warning: "bg-yellow-50 border-yellow-300 text-yellow-800",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type] || typeClasses.info}`}>
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-3 text-current opacity-70 hover:opacity-100 text-xl font-bold focus:outline-none focus:ring-1 focus:ring-current rounded-full w-6 h-6 flex items-center justify-center">
          &times;
        </button>
      )}
    </div>
  );
});

// --- Hook para localStorage (Mais Robusto) ---
function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Melhorar a lógica de merge para lidar com estruturas aninhadas se necessário
        if (typeof parsedData === 'object' && parsedData !== null && typeof initialValue === 'object' && initialValue !== null) {
            const merged = { ...initialValue };
             Object.keys(initialValue).forEach(k => {
                 if (parsedData.hasOwnProperty(k)) {
                     // Evitar sobrescrever array com não-array do localStorage
                     if (Array.isArray(initialValue[k]) && !Array.isArray(parsedData[k])) {
                         merged[k] = initialValue[k];
                     } else {
                         merged[k] = parsedData[k];
                     }
                 }
             });
             return merged;
        } else if (typeof parsedData === typeof initialValue) {
             return parsedData;
        }
      }
    } catch (error) {
      console.error(`Erro ao carregar estado do localStorage (chave: ${key}):`, error);
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  useEffect(() => {
    try {
      // Evitar salvar o estado inicial vazio no primeiro render, a menos que já exista algo
      const isInitial = JSON.stringify(state) === JSON.stringify(typeof initialValue === 'function' ? initialValue() : initialValue);
      if (!isInitial || localStorage.getItem(key) !== null) {
           localStorage.setItem(key, JSON.stringify(state));
      }
    } catch (error) {
      console.error(`Erro ao salvar estado no localStorage (chave: ${key}):`, error);
    }
    // Dependência 'initialValue' pode causar re-salvamentos desnecessários se for função que muda
    // Se initialValue for sempre estável (como useMemo garante), está ok.
  }, [key, state, initialValue]);

  return [state, setState];
}

// --- Componente Principal --- 
function App() {
  // --- Estados --- 
  const initialFormData = useMemo(() => ({
    nome: "", telefone: "", ddd: "", codigoPais: "+55", cidade: "", email: "",
    links: [], cargoDesejado: "", resumo: "", experiencias: [], formacoes: [],
    habilidades: [], certificacoes: [], idiomas: [],
  }), []);

  const LOCAL_STORAGE_KEY = 'resumeFormData_v3_professional'; // Chave atualizada
  const [formData, setFormData] = usePersistentState(LOCAL_STORAGE_KEY, initialFormData);
  const [tempFields, setTempFields] = useState({ newLinkTipo: "linkedin", newLinkUrl: "" });
  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [habilidadesInput, setHabilidadesInput] = useState("");
  const [idiomaApp, setIdiomaApp] = useState("pt");
  const [showLoadedMessage, setShowLoadedMessage] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const formRef = useRef(null);

   useEffect(() => {
    // Sincronizar input de habilidades com o estado
    if (formData.habilidades) {
      setHabilidadesInput(formData.habilidades.join(', '));
    }
  }, [formData.habilidades]);

  useEffect(() => {
    // Mostrar mensagem de dados carregados apenas uma vez
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData && JSON.stringify(formData) !== JSON.stringify(initialFormData)) {
      setShowLoadedMessage(true);
      const timer = setTimeout(() => setShowLoadedMessage(false), 4000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executar apenas na montagem

  // --- Objeto de traduções (COMPLETO - Mantido da v3) --- 
  const textos = useMemo(() => ({
    pt: {
      tituloApp: "Gerador de Currículo ATS",
      subtituloApp: "Crie um currículo profissional otimizado para ATS",
      dicasATS: "Dicas Rápidas para ATS",
      dicasLista: [
        "Use palavras-chave da vaga.",
        "Fontes padrão (Helvetica, Arial) são seguras para ATS.",
        "Títulos de seção padrão (Experiência, Formação...).",
        "Evite tabelas, colunas, imagens, cabeçalhos/rodapés.",
        "Formato PDF baseado em texto.",
        "Revise antes de enviar!"
      ],
      campos: {
        nome: "Nome Completo", cargoDesejado: "Cargo Desejado", codigoPais: "Cód. País", ddd: "DDD",
        telefone: "Telefone", cidade: "Cidade, Estado", linkedin: "LinkedIn", github: "GitHub", gitlab: "GitLab", behance: "Behance", portfolio: "Portfolio", outro: "Outro",
        email: "Email", resumo: "Resumo Profissional", experiencia: "Experiência Profissional",
        formacao: "Formação Acadêmica", habilidades: "Habilidades (separadas por vírgula)", idiomas: "Idiomas",
        certificacoes: "Certificações e Cursos", dataCertificacao: "Data (MM/AAAA)", cargaHoraria: "Carga Horária (opcional)",
        descricaoCertificacao: "Descrição (opcional)", tipoFormacao: "Tipo", curso: "Curso/Área", instituicao: "Instituição",
        periodo: "Período", cargo: "Cargo", empresa: "Empresa", tecnologias: "Tecnologias (opcional)",
        atividades: "Responsabilidades/Atividades", resultados: "Resultados/Conquistas (opcional)", idioma: "Idioma",
        nivel: "Nível", certificacao: "Certificação/Curso", linkValidacao: "Link Validação (opcional)",
        instituicaoEmissora: "Instituição Emissora", status: "Status", mesInicio: "Mês Início", anoInicio: "Ano Início",
        mesFim: "Mês Fim", anoFim: "Ano Fim", atual: "Atual", tipoLink: "Tipo", urlLink: "URL"
      },
      placeholders: {
        nome: "Seu Nome Completo", cargoDesejado: "Ex: Engenheiro de Software Sênior", ddd: "Ex: 11",
        telefone: "Ex: 98765-4321", cidade: "Ex: São Paulo, SP", linkedin: "linkedin.com/in/seu-perfil",
        portfolio: "github.com/seu-usuario ou seusite.com", email: "seu.email@provedor.com",
        resumo: "Descreva seus objetivos e qualificações chave de forma concisa e impactante.", curso: "Ex: Ciência da Computação",
        instituicao: "Ex: Universidade de São Paulo", periodo: "Ex: 08/2018 - 07/2022",
        cargo: "Ex: Desenvolvedor Full-Stack Pleno", empresa: "Ex: Empresa Exemplo Ltda.",
        tecnologias: "Ex: Java, Spring Boot, React, PostgreSQL, AWS",
        atividades: "- Descreva suas principais tarefas usando marcadores simples (-). Use verbos de ação.",
        resultados: "- Destaque conquistas quantificáveis usando marcadores simples (-). Ex: Reduzi o tempo de carregamento em 20%.",
        habilidades: "Python, Liderança de Projetos, Comunicação Eficaz, Power BI", idioma: "Ex: Inglês",
        certificacao: "Ex: AWS Certified Solutions Architect", linkValidacao: "URL de validação (opcional)",
        instituicaoEmissora: "Ex: Coursera, AWS, Google", dataCertificacao: "MM/AAAA", cargaHoraria: "Ex: 40h",
        descricaoCertificacao: "Descreva brevemente o que foi aprendido ou o projeto desenvolvido", mes: "Mês", ano: "Ano",
        urlLink: "URL completa (ex: https://...)", tipoLink: "Tipo", nivelIdioma: "Nível"
      },
      botoes: {
        adicionarExperiencia: "Adicionar Experiência", adicionarFormacao: "Adicionar Formação",
        adicionarIdioma: "Adicionar Idioma", adicionarCertificacao: "Adicionar Certificação/Curso",
        adicionarLink: "Adicionar Link", remover: "Remover",
        gerarCV: "Gerar Currículo ATS"
      },
      mensagens: {
        nenhumaExperiencia: "Nenhuma experiência profissional adicionada.", nenhumaFormacao: "Nenhuma formação acadêmica adicionada.",
        nenhumIdioma: "Nenhum idioma adicionado.", nenhumaCertificacao: "Nenhuma certificação ou curso adicionado.",
        sucesso: "Currículo ATS gerado com sucesso!", gerando: "Gerando Currículo...",
        carregado: "Dados anteriores carregados do seu navegador.", avisoCampos: "Aviso: Preencher Nome, Email e Resumo é altamente recomendado para um bom currículo.",
        erroGeracao: "Erro ao gerar PDF. Verifique os dados e tente novamente.",
        erroFormatoEmail: "Formato de email inválido",
        erroValidacao: "Por favor, corrija os erros indicados antes de gerar o PDF.",
        erroNaN: "Erro interno ao calcular posição no PDF. Tente novamente ou simplifique o texto.",
        erroLocalStorageCarregar: "Não foi possível carregar os dados salvos anteriormente.",
        erroLocalStorageSalvar: "Não foi possível salvar as alterações recentes."
      },
      secoesPDF: {
        resumo: "Resumo Profissional", experiencia: "Experiência Profissional", formacao: "Formação Acadêmica",
        habilidades: "Habilidades", idiomas: "Idiomas", certificacoes: "Certificações e Cursos",
        contato: "Contato", links: "Links", tecnologias: "Tecnologias", validacao: "Validação"
      },
      niveisIdioma: ["Básico", "Intermediário", "Avançado", "Fluente", "Nativo"],
      labelAtual: "Atual", labelPresent: "Present", labelActual: "Actual",
      selecione: "Selecione...",
      linkGithub: "Projeto no GitHub" // Nova tradução
    },
    en: {
      tituloApp: "ATS Resume Builder",
      subtituloApp: "Create a professional, ATS-optimized resume",
      dicasATS: "Quick ATS Tips",
      dicasLista: [
        "Use keywords from the job description.",
        "Standard fonts (Helvetica, Arial) are ATS-safe.",
        "Use standard section titles (Experience, Education...).",
        "Avoid tables, columns, images, headers/footers.",
        "Use a text-based PDF format.",
        "Proofread before submitting!"
      ],
      campos: {
        nome: "Full Name", cargoDesejado: "Desired Position", codigoPais: "Country Code", ddd: "Area Code",
        telefone: "Phone", cidade: "City, State/Country", linkedin: "LinkedIn", github: "GitHub", gitlab: "GitLab", behance: "Behance", portfolio: "Portfolio", outro: "Other",
        email: "Email", resumo: "Professional Summary", experiencia: "Work Experience",
        formacao: "Education", habilidades: "Skills (comma-separated)", idiomas: "Languages",
        certificacoes: "Certifications & Courses", dataCertificacao: "Date (MM/YYYY)", cargaHoraria: "Hours (optional)",
        descricaoCertificacao: "Description (optional)", tipoFormacao: "Type", curso: "Course/Field", instituicao: "Institution",
        periodo: "Period", cargo: "Position", empresa: "Company", tecnologias: "Technologies (optional)",
        atividades: "Responsibilities/Activities", resultados: "Results/Achievements (optional)", idioma: "Language",
        nivel: "Level", certificacao: "Certification/Course", linkValidacao: "Validation Link (optional)",
        instituicaoEmissora: "Issuing Institution", status: "Status", mesInicio: "Start Month", anoInicio: "Start Year",
        mesFim: "End Month", anoFim: "End Year", atual: "Current", tipoLink: "Type", urlLink: "URL"
      },
      placeholders: {
        nome: "Your Full Name", cargoDesejado: "Ex: Senior Software Engineer", ddd: "Ex: 212",
        telefone: "Ex: 555-1234", cidade: "Ex: New York, NY", linkedin: "linkedin.com/in/your-profile",
        portfolio: "github.com/your-username or yoursite.com", email: "your.email@provider.com",
        resumo: "Describe your objectives and key qualifications concisely and impactfully.", curso: "Ex: Computer Science",
        instituicao: "Ex: University of California", periodo: "Ex: 08/2018 - 07/2022",
        cargo: "Ex: Full-Stack Developer", empresa: "Ex: Example Company Inc.",
        tecnologias: "Ex: Java, Spring Boot, React, PostgreSQL, AWS",
        atividades: "- Describe your main tasks using simple bullet points (-). Use action verbs.",
        resultados: "- Highlight quantifiable achievements using simple bullet points (-). Ex: Reduced loading time by 20%.",
        habilidades: "Python, Project Leadership, Effective Communication, Power BI", idioma: "Ex: English",
        certificacao: "Ex: AWS Certified Solutions Architect", linkValidacao: "Validation URL (optional)",
        instituicaoEmissora: "Ex: Coursera, AWS, Google", dataCertificacao: "MM/YYYY", cargaHoraria: "Ex: 40h",
        descricaoCertificacao: "Briefly describe what was learned or the project developed", mes: "Month", ano: "Year",
        urlLink: "Full URL (e.g., https://...)", tipoLink: "Type", nivelIdioma: "Level"
      },
      botoes: {
        adicionarExperiencia: "Add Experience", adicionarFormacao: "Add Education",
        adicionarIdioma: "Add Language", adicionarCertificacao: "Add Certification/Course",
        adicionarLink: "Add Link", remover: "Remove",
        gerarCV: "Generate ATS Resume"
      },
      mensagens: {
        nenhumaExperiencia: "No work experience added.", nenhumaFormacao: "No education added.",
        nenhumIdioma: "No languages added.", nenhumaCertificacao: "No certifications or courses added.",
        sucesso: "ATS Resume generated successfully!", gerando: "Generating Resume...",
        carregado: "Previous data loaded from your browser.", avisoCampos: "Warning: Filling in Name, Email, and Summary is highly recommended for a good resume.",
        erroGeracao: "Error generating PDF. Check your data and try again.",
        erroFormatoEmail: "Invalid email format",
        erroValidacao: "Please correct the indicated errors before generating the PDF.",
        erroNaN: "Internal error calculating PDF position. Please try again or simplify text.",
        erroLocalStorageCarregar: "Could not load previously saved data.",
        erroLocalStorageSalvar: "Could not save recent changes."
      },
      secoesPDF: {
        resumo: "Professional Summary", experiencia: "Work Experience", formacao: "Education",
        habilidades: "Skills", idiomas: "Languages", certificacoes: "Certifications & Courses",
        contato: "Contact", links: "Links", tecnologias: "Technologies", validacao: "Validation"
      },
      niveisIdioma: ["Basic", "Intermediate", "Advanced", "Fluent", "Native"],
      labelAtual: "Current", labelPresent: "Present", labelActual: "Actual",
      selecione: "Select...",
      linkGithub: "Project on GitHub" // Nova tradução
    },
    es: {
      tituloApp: "Generador de CV ATS",
      subtituloApp: "Crea un currículum profesional optimizado para ATS",
      dicasATS: "Consejos Rápidos para ATS",
      dicasLista: [
        "Usa palabras clave de la oferta de empleo.",
        "Fuentes estándar (Helvetica, Arial) son seguras para ATS.",
        "Títulos de sección estándar (Experiencia, Formación...).",
        "Evita tablas, columnas, imágenes, encabezados/pies de página.",
        "Formato PDF basado en texto.",
        "¡Revisa antes de enviar!"
      ],
      campos: {
        nome: "Nombre Completo", cargoDesejado: "Puesto Deseado", codigoPais: "Cód. País", ddd: "Prefijo",
        telefone: "Teléfono", cidade: "Ciudad, Provincia/País", linkedin: "LinkedIn", github: "GitHub", gitlab: "GitLab", behance: "Behance", portfolio: "Portfolio", outro: "Otro",
        email: "Email", resumo: "Resumen Profesional", experiencia: "Experiencia Profesional",
        formacao: "Formación Académica", habilidades: "Habilidades (separadas por coma)", idiomas: "Idiomas",
        certificacoes: "Certificaciones y Cursos", dataCertificacao: "Fecha (MM/AAAA)", cargaHoraria: "Horas (opcional)",
        descricaoCertificacao: "Descripción (opcional)", tipoFormacao: "Tipo", curso: "Curso/Área", instituicao: "Institución",
        periodo: "Período", cargo: "Puesto", empresa: "Empresa", tecnologias: "Tecnologías (opcional)",
        atividades: "Responsabilidades/Actividades", resultados: "Resultados/Logros (opcional)", idioma: "Idioma",
        nivel: "Nivel", certificacao: "Certificación/Curso", linkValidacao: "Enlace Validación (opcional)",
        instituicaoEmissora: "Institución Emisora", status: "Estado", mesInicio: "Mes Inicio", anoInicio: "Año Inicio",
        mesFim: "Mes Fin", anoFim: "Año Fin", atual: "Actual", tipoLink: "Tipo", urlLink: "URL"
      },
      placeholders: {
        nome: "Tu Nombre Completo", cargoDesejado: "Ej: Ingeniero de Software Senior", ddd: "Ej: 11",
        telefone: "Ej: 15-1234-5678", cidade: "Ej: Buenos Aires, AR", linkedin: "linkedin.com/in/tu-perfil",
        portfolio: "github.com/tu-usuario o tusitio.com", email: "tu.email@proveedor.com",
        resumo: "Describe tus objetivos y cualificaciones clave de forma concisa e impactante.", curso: "Ej: Ciencias de la Computación",
        instituicao: "Ej: Universidad de Buenos Aires", periodo: "Ej: 08/2018 - 07/2022",
        cargo: "Ej: Desarrollador Full-Stack", empresa: "Ej: Empresa Ejemplo S.A.",
        tecnologias: "Ej: Java, Spring Boot, React, PostgreSQL, AWS",
        atividades: "- Describe tus tareas principales usando viñetas simples (-). Usa verbos de acción.",
        resultados: "- Destaca logros cuantificables usando viñetas simples (-). Ej: Reduje el tiempo de carga en un 20%.",
        habilidades: "Python, Liderazgo de Proyectos, Comunicación Efectiva, Power BI", idioma: "Ej: Inglés",
        certificacao: "Ej: AWS Certified Solutions Architect", linkValidacao: "URL de validación (opcional)",
        instituicaoEmissora: "Ej: Coursera, AWS, Google", dataCertificacao: "MM/AAAA", cargaHoraria: "Ej: 40h",
        descricaoCertificacao: "Describe brevemente lo aprendido o el proyecto desarrollado", mes: "Mes", ano: "Año",
        urlLink: "URL completa (ej: https://...)", tipoLink: "Tipo", nivelIdioma: "Nivel"
      },
      botoes: {
        adicionarExperiencia: "Añadir Experiencia", adicionarFormacao: "Añadir Formación",
        adicionarIdioma: "Añadir Idioma", adicionarCertificacao: "Añadir Certificación/Curso",
        adicionarLink: "Añadir Enlace", remover: "Eliminar",
        gerarCV: "Generar CV ATS"
      },
      mensagens: {
        nenhumaExperiencia: "No se ha añadido experiencia profesional.", nenhumaFormacao: "No se ha añadido formación académica.",
        nenhumIdioma: "No se han añadido idiomas.", nenhumaCertificacao: "No se han añadido certificaciones o cursos.",
        sucesso: "¡CV ATS generado con éxito!", gerando: "Generando CV...",
        carregado: "Datos anteriores cargados desde tu navegador.", avisoCampos: "Aviso: Completar Nombre, Email y Resumen es muy recomendable para un buen CV.",
        erroGeracao: "Error al generar PDF. Verifica los datos e inténtalo de nuevo.",
        erroFormatoEmail: "Formato de email inválido",
        erroValidacao: "Por favor, corrige los errores indicados antes de generar el PDF.",
        erroNaN: "Error interno al calcular posición en PDF. Inténtalo de nuevo o simplifica el texto.",
        erroLocalStorageCarregar: "No se pudieron cargar los datos guardados anteriormente.",
        erroLocalStorageSalvar: "No se pudieron guardar los cambios recientes."
      },
      secoesPDF: {
        resumo: "Resumen Profesional", experiencia: "Experiencia Profesional", formacao: "Formación Académica",
        habilidades: "Habilidades", idiomas: "Idiomas", certificacoes: "Certificaciones y Cursos",
        contato: "Contacto", links: "Enlaces", tecnologias: "Tecnologías", validacao: "Validación"
      },
      niveisIdioma: ["Básico", "Intermedio", "Avanzado", "Fluido", "Nativo"],
      labelAtual: "Actual", labelPresent: "Present", labelActual: "Actual",
      selecione: "Selecciona...",
      linkGithub: "Proyecto en GitHub" // Nova tradução
    },
  }), []);

  // --- Handlers (Mantidos da v3, com pequenas otimizações) ---
  const t = useMemo(() => textos[idiomaApp] || textos.pt, [textos, idiomaApp]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name in tempFields) {
        setTempFields(prev => ({ ...prev, [name]: value }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Limpar erro específico ao digitar no campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // Limpar mensagem de erro geral ao interagir com o form
    if (errorMessage) setErrorMessage("");
  }, [errors, errorMessage, tempFields, setFormData]);

  const handleHabilidadesChange = useCallback((e) => {
    const inputText = e.target.value;
    setHabilidadesInput(inputText); // Only update local input state
  }, []); // Removed setFormData dependency

  const handleHabilidadesBlur = useCallback(() => {
    const habilidadesArray = habilidadesInput
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    setFormData(prev => ({ ...prev, habilidades: habilidadesArray }));
  }, [habilidadesInput, setFormData]);

  const handleRemoveHabilidade = useCallback((skillToRemove) => {
    setFormData(prev => {
      const updatedHabilidades = prev.habilidades.filter(h => h !== skillToRemove);
      return { ...prev, habilidades: updatedHabilidades };
    });
  }, [setFormData]);

  const addField = useCallback((fieldType) => {
    setFormData(prev => {
      const newId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const fieldArray = prev[fieldType] || [];
      let newItem = { id: newId };

      if (fieldType === "experiencias") {
        newItem = { ...newItem, cargo: "", empresa: "", mesInicio: "", anoInicio: "", mesFim: "", anoFim: "", atual: false, tecnologias: "", atividades: "", resultados: "" };
      } else if (fieldType === "formacoes") {
        newItem = { ...newItem, tipo: "superior", curso: "", instituicao: "", status: "completo", mesInicio: "", anoInicio: "", mesFim: "", anoFim: "", descricao: "" };
      } else if (fieldType === "idiomas") {
        newItem = { ...newItem, idioma: "", nivel: t.niveisIdioma[0] };
      } else if (fieldType === "certificacoes") {
        newItem = { ...newItem, certificacao: "", instituicaoEmissora: "", dataCertificacao: "", cargaHoraria: "", descricao: "", linkValidacao: "" };
      } else if (fieldType === "links") {
        if (!tempFields.newLinkUrl || !tempFields.newLinkUrl.trim()) return prev; // Não adiciona link vazio
        newItem = { ...newItem, tipo: tempFields.newLinkTipo || "linkedin", url: tempFields.newLinkUrl.trim() };
        setTempFields({ newLinkTipo: "linkedin", newLinkUrl: "" }); // Limpa campos temporários
        return {
          ...prev,
          [fieldType]: [...fieldArray, newItem],
        };
      }

      // Apenas adiciona se não for 'links' (já tratado acima)
      if (fieldType !== "links") {
         return { ...prev, [fieldType]: [...fieldArray, newItem] };
      }
      return prev;
    });
  }, [t, tempFields, setFormData]);

  const handleRemoveItem = useCallback((fieldType, itemId) => {
    setFormData(prev => ({
      ...prev,
      [fieldType]: (prev[fieldType] || []).filter(item => item.id !== itemId)
    }));
  }, [setFormData]);

  const handleItemChange = useCallback((fieldType, itemId, property, e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [fieldType]: (prev[fieldType] || []).map(item =>
        item.id === itemId ? { ...item, [property]: value } : item
      )
    }));
    // Limpar mensagem de erro geral ao interagir com o form
    if (errorMessage) setErrorMessage("");
  }, [errorMessage, setFormData]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.nome || !formData.nome.trim()) newErrors.nome = t.mensagens.erroValidacao; // Usar chave de tradução
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = t.mensagens.erroValidacao;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.mensagens.erroFormatoEmail;
    }
    // Adicionar outras validações se necessário (ex: telefone, datas)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  // --- Geração de PDF (Mantida da v3 - já robusta) --- 
  const generatePDF = useCallback(async () => {
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) {
      setErrorMessage(t.mensagens.erroValidacao);
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField && formRef.current) {
          const errorElement = formRef.current.querySelector(`[name="${firstErrorField}"], #${firstErrorField}`);
          if (errorElement) {
              errorElement.focus({ preventScroll: true });
              errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }
      return;
    }

    setIsGenerating(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let page = pdfDoc.addPage(PageSizes.A4);
      const { width, height } = page.getSize();
      const margin = 50;
      const contentWidth = width - 2 * margin;

      const textColor = rgb(0.15, 0.15, 0.15);
      const headerColor = rgb(0.1, 0.1, 0.1);
      const sectionColor = rgb(0.25, 0.25, 0.25);
      const linkColor = rgb(0.0, 0.0, 0.8);
      const subtleColor = rgb(0.4, 0.4, 0.4);

      let y = height - margin;
      let annotations = [];

      // Função auxiliar segura para obter largura do texto
      const getTextWidth = (text, font, size) => {
        try {
            const widthVal = font.widthOfTextAtSize(text, size);
            return isNaN(widthVal) ? 0 : widthVal; // Retorna 0 se NaN
        } catch (e) {
            console.error(`Error getting text width for: "${text}"`, e);
            return 0; // Retorna 0 em caso de erro
        }
      };

      const checkPageSpace = (neededSpace) => {
        if (y - neededSpace < margin) {
          if (annotations.length > 0) {
              page.node.set(pdfDoc.context.obj('Annots'), pdfDoc.context.obj(annotations));
          }
          annotations = [];
          page.drawText(`${t.secoesPDF.contato}: ${formData.email || ""}`, { x: margin, y: margin / 2, size: 8, font: helveticaFont, color: subtleColor });
          page = pdfDoc.addPage(PageSizes.A4);
          y = height - margin;
          return true;
        }
        return false;
      };

      const drawText = (text, x, yPos, options = {}) => {
        const { font = helveticaFont, size = 10, color = textColor, align = 'left', maxWidth = contentWidth, url = null } = options;
        const sanitizedText = sanitizeInput(text || "");
        if (!sanitizedText) return { height: 0, textWidth: 0 };

        let xPos = x;
        const textWidthValue = getTextWidth(sanitizedText, font, size); // Usa função segura
        const validMaxWidth = isNaN(maxWidth) ? contentWidth : maxWidth;

        if (align === 'center') {
          xPos = x + (validMaxWidth - textWidthValue) / 2;
        } else if (align === 'right') {
          xPos = x + validMaxWidth - textWidthValue;
        }

        // Verificação final de NaN/Infinity antes de desenhar
        if (isNaN(xPos) || !isFinite(xPos)) {
            console.error(`Final xPos is NaN/Infinite. Original x: ${x}, align: ${align}, maxWidth: ${validMaxWidth}, textWidth: ${textWidthValue}, text: "${sanitizedText}"`);
            xPos = margin; // Fallback para margem
        }
        if (isNaN(yPos) || !isFinite(yPos)) {
             console.error(`Final yPos is NaN/Infinite. Original yPos: ${yPos}, text: "${sanitizedText}"`);
             return { height: 0, textWidth: 0 }; // Não desenha se y for inválido
        }

        page.drawText(sanitizedText, { x: xPos, y: yPos, size, font, color });

        if (url && textWidthValue > 0) {
            try {
                const uri = pdfDoc.context.obj(url);
                const rectX1 = xPos;
                const rectY1 = yPos;
                const rectX2 = xPos + textWidthValue;
                const rectY2 = yPos + size;

                if (![rectX1, rectY1, rectX2, rectY2].some(isNaN) && [rectX1, rectY1, rectX2, rectY2].every(isFinite)) {
                    const rect = [rectX1, rectY1, rectX2, rectY2];
                    annotations.push(pdfDoc.context.obj({
                        Type: 'Annot', Subtype: 'Link', Rect: rect, Border: [0, 0, 0],
                        A: { Type: 'Action', S: 'URI', URI: uri }
                    }));
                } else {
                    console.warn(`Skipping link annotation due to invalid coordinates for: ${url}`, {rectX1, rectY1, rectX2, rectY2});
                }
            } catch (linkError) {
                console.warn("Não foi possível criar anotação de link para:", url, linkError);
            }
        }

        return { height: size, textWidth: textWidthValue };
      };

      const drawWrappedText = (text, x, yPos, options = {}) => {
        const { font = helveticaFont, size = 10, color = textColor, maxWidth = contentWidth, lineSpacing = 1.35, url = null } = options;
        if (!text) return 0;
        const sanitizedText = sanitizeInput(text);
        const words = sanitizedText.split(/(\s+)/); // Mantém espaços para cálculo correto
        let line = '';
        let currentYWrapped = yPos;
        let totalHeight = 0;
        const lineHeight = size * lineSpacing;

        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const testLine = line + word;
          const testWidth = getTextWidth(testLine, font, size); // Usa função segura

          if (testWidth > maxWidth && line.length > 0) {
            drawText(line.trimEnd(), x, currentYWrapped, { font, size, color, maxWidth, url });
            line = word.trimStart();
            currentYWrapped -= lineHeight;
            totalHeight += lineHeight;
            if (checkPageSpace(lineHeight)) {
                 currentYWrapped = y; // y foi atualizado por checkPageSpace
            }
          } else {
            line = testLine;
          }
        }

        if (line.trim().length > 0) {
          drawText(line.trimEnd(), x, currentYWrapped, { font, size, color, maxWidth, url });
          totalHeight += lineHeight;
        }

        return totalHeight > 0 ? totalHeight : size; // Retorna pelo menos a altura de uma linha
      };

      const drawSection = (title, yPos) => {
        if (checkPageSpace(30)) {
            yPos = y; // y foi atualizado por checkPageSpace
        }
        const { height: titleHeight } = drawText(title, margin, yPos, { font: helveticaBold, size: 12, color: sectionColor });
        // page.drawLine({ start: { x: margin, y: yPos - titleHeight - 8 }, end: { x: width - margin, y: yPos - titleHeight - 8 }, thickness: 0.8, color: rgb(0.85, 0.85, 0.85) }); // Linha removida conforme solicitado
        return titleHeight + 12; // Retorna a altura usada pela seção
      };

      // --- Desenho do Conteúdo do PDF --- 

      // Nome e Cargo
      const { height: nameHeight } = drawText(formData.nome, margin, y, { font: helveticaBold, size: 18, color: headerColor });
      y -= nameHeight + 6;
      if (formData.cargoDesejado) {
        const { height: cargoHeight } = drawText(formData.cargoDesejado, margin, y, { font: helveticaFont, size: 12, color: sectionColor });
        y -= cargoHeight + 18;
      } else {
        y -= 18;
      }

      // Contato (Linha 1)
      let contactLine1 = [];
      if (formData.email) contactLine1.push({ text: formData.email, url: `mailto:${formData.email}` });
      const phone = `${formData.codigoPais || ""} ${formData.ddd || ""} ${formData.telefone || ""}`.trim();
      if (phone) contactLine1.push({ text: phone });
      if (formData.cidade) contactLine1.push({ text: formData.cidade });

      if (contactLine1.length > 0) {
          let currentX = margin;
          const contactSize = 9.5;
          const separator = "  |  ";
          const separatorWidth = getTextWidth(separator, helveticaFont, contactSize); // Usa função segura

          contactLine1.forEach((item, index) => {
              const { textWidth: itemWidth } = drawText(item.text, currentX, y, { size: contactSize, color: item.url ? linkColor : textColor, url: item.url });
              currentX += itemWidth;
              if (index < contactLine1.length - 1) {
                  drawText(separator, currentX, y, { size: contactSize, color: subtleColor });
                  currentX += separatorWidth;
              }
              if (isNaN(currentX)) {
                  console.error("currentX became NaN in contact loop. Resetting.");
                  currentX = margin; // Reseta se NaN
              }
          });
          y -= contactSize + 5;
      }

      // Links (Linha 2)
      if (formData.links && formData.links.length > 0) {
          let currentXLinks = margin;
          const linkSize = 9.5;
          const separator = "  |  ";
          const separatorWidth = getTextWidth(separator, helveticaFont, linkSize); // Usa função segura
          let firstLink = true;

          formData.links.forEach((link) => {
              if (!link.url) return;
              const cleanUrl = link.url.trim();
              const displayUrl = cleanUrl.replace(/^(https?:\/\/)?(www\.)?/, '');
              const fullUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;

              const linkWidth = getTextWidth(displayUrl, helveticaFont, linkSize); // Usa função segura
              const separatorW = firstLink ? 0 : separatorWidth;

              // Quebra de linha se não couber
              if (currentXLinks + separatorW + linkWidth > width - margin) {
                  y -= linkSize + 3;
                  currentXLinks = margin;
                  firstLink = true;
                  if(checkPageSpace(linkSize + 3)) { /* y updated */ }
              }

              if (!firstLink) {
                  drawText(separator, currentXLinks, y, { size: linkSize, color: subtleColor });
                  currentXLinks += separatorWidth;
              }

              drawText(displayUrl, currentXLinks, y, { size: linkSize, color: linkColor, url: fullUrl });
              currentXLinks += linkWidth;
              firstLink = false;

              if (isNaN(currentXLinks)) {
                  console.error("currentXLinks became NaN in links loop. Resetting.");
                  currentXLinks = margin; // Reseta se NaN
              }
          });
          y -= linkSize + 25; // Espaço maior após links
      }

      // Resumo
      if (formData.resumo) {
        y -= drawSection(t.secoesPDF.resumo, y);
        const resumoHeight = drawWrappedText(formData.resumo, margin, y, { size: 10, lineSpacing: 1.4 });
        y -= resumoHeight + 25;
      }

      // Experiência
      if (formData.experiencias && formData.experiencias.length > 0) {
        y -= drawSection(t.secoesPDF.experiencia, y);
        const drawList = (text, x, startYList, options = {}) => {
            const { font = helveticaFont, size = 10, color = textColor, maxWidth = contentWidth, lineSpacing = 1.35 } = options;
            if (!text) return startYList;
            let currentYList = startYList;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            lines.forEach(line => {
                if(checkPageSpace(20)) {
                    currentYList = y; // y foi atualizado
                }
                const marker = line.trim().startsWith('-') ? '•' : '';
                const content = marker ? line.trim().substring(1).trim() : line.trim();
                let markerWidth = 0;
                if (marker) {
                    const { textWidth } = drawText(marker, x, currentYList, { font, size, color });
                    markerWidth = textWidth + 4; // Mais espaço após o bullet
                }
                const lineHeight = drawWrappedText(content, x + markerWidth, currentYList, { font, size, color, maxWidth: maxWidth - markerWidth, lineSpacing });
                currentYList -= lineHeight;
            });
            return currentYList;
        };
        for (const exp of formData.experiencias) {
          const startYExp = y;
          if(checkPageSpace(120)) { /* y updated */ }

          // Cargo e Empresa na mesma linha (se couber)
          const cargoText = exp.cargo || "";
          const empresaText = exp.empresa || "";
          const cargoWidth = getTextWidth(cargoText, helveticaBold, 11);
          const empresaWidth = getTextWidth(` - ${empresaText}`, helveticaFont, 10);
          const periodoText = `${exp.mesInicio && exp.anoInicio ? `${exp.mesInicio}/${exp.anoInicio}` : ""} - ${exp.atual ? t.labelAtual : (exp.mesFim && exp.anoFim ? `${exp.mesFim}/${exp.anoFim}` : "")}`.trim();
          const periodoWidth = getTextWidth(periodoText, helveticaFont, 10);

          if (cargoWidth + empresaWidth + periodoWidth + 20 < contentWidth) {
              // Desenha Cargo e Empresa juntos
              drawText(cargoText, margin, y, { font: helveticaBold, size: 11 });
              drawText(` - ${empresaText}`, margin + cargoWidth, y, { size: 10 });
              // Desenha Período à direita
              drawText(periodoText, margin, y, { size: 10, align: 'right', color: subtleColor, maxWidth: contentWidth });
              y -= 11 * 1.3; // Altura aproximada
          } else {
              // Desenha Cargo e Período
              drawText(cargoText, margin, y, { font: helveticaBold, size: 11 });
              drawText(periodoText, margin, y, { size: 10, align: 'right', color: subtleColor, maxWidth: contentWidth });
              y -= 11 * 1.3;
              // Desenha Empresa abaixo
              const { height: empresaHeight } = drawText(empresaText, margin, y, { size: 10 });
              y -= empresaHeight + 5;
          }

          // Tecnologias
          if (exp.tecnologias) {
             if(checkPageSpace(25)) { /* y updated */ }
             const techText = `${t.secoesPDF.tecnologias}: ${exp.tecnologias}`;
             const techHeight = drawWrappedText(techText, margin, y, { size: 9.5, color: subtleColor, lineSpacing: 1.3 });
             y -= techHeight + 8;
          }

          // Atividades e Resultados
          if (exp.atividades) {
              y = drawList(exp.atividades, margin + 5, y, { size: 10, maxWidth: contentWidth - 5 });
              y -= 5;
          }
          if (exp.resultados) {
              y = drawList(exp.resultados, margin + 5, y, { size: 10, maxWidth: contentWidth - 5 });
              y -= 5;
          }
          y -= 15; // Espaço entre experiências
        }
      }

      // Formação
      if (formData.formacoes && formData.formacoes.length > 0) {
        y -= drawSection(t.secoesPDF.formacao, y);
        for (const form of formData.formacoes) {
          if(checkPageSpace(80)) { /* y updated */ }

          const tipoFormacao = tiposCurso.find(tc => tc.valor === form.tipo);
          const tipoLabel = tipoFormacao ? (tipoFormacao[`label_${idiomaApp}`] || tipoFormacao.label) : "";
          const cursoText = `${tipoLabel}${form.curso ? ` - ${form.curso}` : ""}`;
          const { height: cursoHeight } = drawText(cursoText, margin, y, { font: helveticaBold, size: 11 });
          y -= cursoHeight + 3;

          if (form.instituicao) {
            const { height: instHeight } = drawText(form.instituicao, margin, y, { size: 10 });
            y -= instHeight + 3;
          }

          let statusText = "";
          const statusObj = statusFormacao.find(sf => sf.valor === form.status);
          if (statusObj) statusText = statusObj[`label_${idiomaApp}`] || statusObj.label;
          let periodoText = "";
          if (form.mesInicio && form.anoInicio) {
            periodoText = `${form.mesInicio}/${form.anoInicio}`;
            if (form.status === "andamento") {
              periodoText += ` - ${t.labelAtual}`;
            } else if (form.mesFim && form.anoFim) {
              periodoText += ` - ${form.mesFim}/${form.anoFim}`;
            }
          }
          const statusPeriodoText = `${statusText}${periodoText ? ` | ${periodoText}` : ""}`;
          if (statusPeriodoText) {
            const { height: statusHeight } = drawText(statusPeriodoText, margin, y, { size: 9.5, color: subtleColor });
            y -= statusHeight + 8;
          }

          if (form.descricao) {
            if(checkPageSpace(30)) { /* y updated */ }
            const descHeight = drawWrappedText(form.descricao, margin + 10, y, { size: 9.5, maxWidth: contentWidth - 10, lineSpacing: 1.3 });
            y -= descHeight + 5;
          }
          y -= 15; // Espaço entre formações
        }
      }

      // Seções em Coluna (Habilidades, Idiomas, Certificações)
      const drawColumnSectionContent = (sectionType, x, startYCol, colWidth) => {
          let currentYCol = startYCol;
          if (sectionType === 'habilidades' && formData.habilidades?.length > 0) {
              const text = formData.habilidades.join(', ');
              const h = drawWrappedText(text, x, currentYCol, { size: 10, maxWidth: colWidth, lineSpacing: 1.4 });
              currentYCol -= h + 15;
          } else if (sectionType === 'idiomas' && formData.idiomas?.length > 0) {
              formData.idiomas.forEach(idioma => {
                  if(checkPageSpace(20)) {
                      currentYCol = y; // y foi atualizado
                  }
                  const text = `${idioma.idioma} - ${idioma.nivel}`;
                  const { height: h } = drawText(text, x, currentYCol, { size: 10, maxWidth: colWidth });
                  currentYCol -= h + 5;
              });
              currentYCol -= 10;
          } else if (sectionType === 'certificacoes' && formData.certificacoes?.length > 0) {
              formData.certificacoes.forEach(cert => {
                  if(checkPageSpace(60)) {
                     currentYCol = y; // y foi atualizado
                  }
                  const { height: titleH } = drawText(cert.certificacao, x, currentYCol, { font: helveticaBold, size: 10 });
                  currentYCol -= titleH + 3;
                  const instText = `${cert.instituicaoEmissora}${cert.dataCertificacao ? ` | ${cert.dataCertificacao}` : ""}${cert.cargaHoraria ? ` (${cert.cargaHoraria})` : ""}`;
                  if (instText.trim() !== "|") {
                      const { height: instH } = drawText(instText, x, currentYCol, { size: 9, color: subtleColor });
                      currentYCol -= instH + 5;
                  }
                  if (cert.descricao) {
                      const descH = drawWrappedText(cert.descricao, x + 5, currentYCol, { size: 9, maxWidth: colWidth - 5, lineSpacing: 1.3 });
                      currentYCol -= descH + 5;
                  }
                  if (cert.linkValidacao) {
                      const cleanUrl = cert.linkValidacao.trim();
                      const fullUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
                      const displayUrl = cleanUrl.replace(/^(https?:\/\/)?(www\.)?/, '');
                      const linkText = `${t.secoesPDF.validacao}: ${displayUrl}`;
                      const linkH = drawWrappedText(linkText, x + 5, currentYCol, { size: 8, color: linkColor, maxWidth: colWidth - 5, url: fullUrl });
                      currentYCol -= linkH + 8;
                  } else {
                      currentYCol -= 8;
                  }
              });
          }
          return currentYCol;
      };

      const sections = [
          { type: 'habilidades', title: t.secoesPDF.habilidades, data: formData.habilidades },
          { type: 'idiomas', title: t.secoesPDF.idiomas, data: formData.idiomas },
          { type: 'certificacoes', title: t.secoesPDF.certificacoes, data: formData.certificacoes },
      ].filter(s => s.data && s.data.length > 0);

      for (const section of sections) {
          y -= drawSection(section.title, y);
          y = drawColumnSectionContent(section.type, margin, y, contentWidth);
          y -= 10; // Espaço após a seção
      }

      // Adiciona anotações à página final
      if (annotations.length > 0) {
          page.node.set(pdfDoc.context.obj('Annots'), pdfDoc.context.obj(annotations));
      }

      // Rodapé da página (opcional, pode poluir ATS)
      // page.drawText(`${t.secoesPDF.contato}: ${formData.email || ""}`, { x: margin, y: margin / 2, size: 8, font: helveticaFont, color: subtleColor });

      // Salvar e Download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const filenameBase = formData.nome ? formData.nome.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'curriculo';
      link.download = `${filenameBase}_ats_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      setSuccessMessage(t.mensagens.sucesso);
      setTimeout(() => setSuccessMessage(""), 5000);

    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      if (error instanceof TypeError && error.message.includes('NaN')) {
          setErrorMessage(t.mensagens.erroNaN);
      } else {
          setErrorMessage(t.mensagens.erroGeracao + `: ${error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [formData, idiomaApp, t, validateForm, errors]); // Adicionado 'errors' como dependência

  // --- Renderização de Seções do Formulário (Refinadas) --- 
  const renderPersonalInfoFields = useCallback(() => (
    <SectionCard title={t.secoesPDF.contato}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <InputField
          id="nome"
          label={t.campos.nome}
          name="nome"
          placeholder={t.placeholders.nome}
          value={formData.nome}
          onChange={handleChange}
          error={errors.nome}
          warning={!formData.nome?.trim()}
          icon="👤"
        />
        <InputField
          id="cargoDesejado"
          label={t.campos.cargoDesejado}
          name="cargoDesejado"
          placeholder={t.placeholders.cargoDesejado}
          value={formData.cargoDesejado}
          onChange={handleChange}
          icon="🎯"
        />
        <InputField
          id="email"
          label={t.campos.email}
          name="email"
          placeholder={t.placeholders.email}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          warning={!formData.email?.trim()}
          type="email"
          icon="✉️"
        />
        <div className="grid grid-cols-12 gap-2 items-end">
          <SelectField
            id="codigoPais"
            label={t.campos.codigoPais}
            name="codigoPais"
            value={formData.codigoPais}
            onChange={handleChange}
            options={paisesTelefone.map(p => ({ value: p.codigo, label: p.nome }))}
            className="col-span-4 sm:col-span-3"
            defaultOptionLabel="Cód."
          />
          <InputField
            id="ddd"
            label={t.campos.ddd}
            name="ddd"
            value={formData.ddd}
            onChange={handleChange}
            placeholder={t.placeholders.ddd}
            className="col-span-3 sm:col-span-3"
            type="tel"
          />
          <InputField
            id="telefone"
            label={t.campos.telefone}
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            placeholder={t.placeholders.telefone}
            className="col-span-5 sm:col-span-6"
            type="tel"
          />
        </div>
        <InputField id="cidade" label={t.campos.cidade} name="cidade" placeholder={t.placeholders.cidade} value={formData.cidade} onChange={handleChange} icon="📍" className="md:col-span-2" />
      </div>
      {/* Seção de Links Refinada */}
      <div className="pt-5 mt-5 border-t border-gray-200/80">
        <label className="block text-base font-semibold text-gray-800 mb-4">{t.secoesPDF.links}</label>
        <div className="space-y-2 mb-4">
          {(formData.links || []).map((link) => (
            <div key={link.id} className="flex items-center justify-between bg-gray-50/70 rounded-md px-3 py-2 text-sm border border-gray-200/80 shadow-sm hover:bg-gray-100 transition-colors">
              <div className="flex items-center overflow-hidden mr-2">
                 <span className="font-medium mr-2 text-indigo-700 flex-shrink-0">{tiposLinks.find(t => t.valor === link.tipo)?.label || link.tipo}:</span>
                 <a href={link.url && (link.url.startsWith('http://') || link.url.startsWith('https://')) ? link.url : `https://${link.url || ''}`} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-indigo-600 truncate transition-colors" title={link.url}>{link.url}</a>
              </div>
              <RemoveButton
                onClick={() => handleRemoveItem("links", link.id)}
                title={`${t.botoes.remover} ${t.campos.tipoLink}`}
                className="flex-shrink-0"
              />
            </div>
          ))}
           {(formData.links || []).length === 0 && (
             <p className="text-sm text-gray-500 italic px-3 py-2">Nenhum link adicionado.</p>
           )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-gray-200/80 pt-4">
          <SelectField
            id="link-tipo-new"
            label={t.campos.tipoLink}
            name="newLinkTipo"
            value={tempFields.newLinkTipo || "linkedin"}
            onChange={handleChange}
            options={tiposLinks.map(tipo => ({ value: tipo.valor, label: t.campos[tipo.valor] || tipo.label }))}
            className="text-sm"
            defaultOptionLabel={t.placeholders.tipoLink}
          />
          <InputField
            id="link-url-new"
            label={t.campos.urlLink}
            name="newLinkUrl"
            value={tempFields.newLinkUrl || ""}
            onChange={handleChange}
            placeholder={tiposLinks.find(t => t.valor === (tempFields.newLinkTipo || "linkedin"))?.prefixo ?
              `${tiposLinks.find(t => t.valor === (tempFields.newLinkTipo || "linkedin"))?.prefixo}seu-usuario` :
              t.placeholders.urlLink}
            className="md:col-span-2 text-sm"
            type="url"
          />
        </div>
        <AddItemButton
          onClick={() => addField("links")}
          label={t.botoes.adicionarLink}
        />
      </div>
    </SectionCard>
  ), [t, formData, tempFields, handleChange, errors, handleRemoveItem, addField]);

  const renderResumoField = useCallback(() => (
    <SectionCard title={t.campos.resumo}>
      <TextareaField id="resumo-text" label="" name="resumo" placeholder={t.placeholders.resumo} value={formData.resumo} onChange={handleChange} warning={!formData.resumo?.trim()} rows={6} />
    </SectionCard>
  ), [t, formData.resumo, handleChange]);

  const renderExperienceFields = useCallback(() => (
    <SectionCard title={t.campos.experiencia}>
      {(formData.experiencias || []).length === 0 ? (
        <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50/70 rounded-lg border border-dashed border-gray-300">{t.mensagens.nenhumaExperiencia}</p>
      ) : (
        <div className="space-y-3">
          {(formData.experiencias || []).map((exp, index) => (
            <ItemCard
              key={exp.id}
              index={index}
              onRemove={() => handleRemoveItem("experiencias", exp.id)}
              removeTitle={`${t.botoes.remover} ${t.campos.experiencia}`}
              summaryHeader={(
                <>
                  <h4 className="font-semibold text-gray-800 truncate">{exp.cargo || `(${t.campos.cargo})`}</h4>
                  <p className="text-xs text-gray-600 truncate">{exp.empresa || `(${t.campos.empresa})`} | {exp.mesInicio && exp.anoInicio ? `${exp.mesInicio}/${exp.anoInicio}` : ""} - {exp.atual ? t.labelAtual : (exp.mesFim && exp.anoFim ? `${exp.mesFim}/${exp.anoFim}` : "")}</p>
                </>
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField id={`exp-cargo-${exp.id}`} label={t.campos.cargo} name={`exp-cargo-${exp.id}`} placeholder={t.placeholders.cargo} value={exp.cargo} onChange={(e) => handleItemChange("experiencias", exp.id, "cargo", e)} />
                <InputField id={`exp-empresa-${exp.id}`} label={t.campos.empresa} name={`exp-empresa-${exp.id}`} placeholder={t.placeholders.empresa} value={exp.empresa} onChange={(e) => handleItemChange("experiencias", exp.id, "empresa", e)} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end border-t border-gray-100 pt-4 mt-4">
                <SelectField
                  id={`exp-mesInicio-${exp.id}`}
                  label={t.campos.mesInicio}
                  name={`exp-mesInicio-${exp.id}`}
                  value={exp.mesInicio || ""}
                  onChange={(e) => handleItemChange("experiencias", exp.id, "mesInicio", e)}
                  options={meses.map(m => ({ value: m, label: m }))}
                  className="col-span-1 text-xs"
                  defaultOptionLabel={t.placeholders.mes}
                />
                <InputField
                  id={`exp-anoInicio-${exp.id}`}
                  label={t.campos.anoInicio}
                  name={`exp-anoInicio-${exp.id}`}
                  value={exp.anoInicio || ""}
                  onChange={(e) => handleItemChange("experiencias", exp.id, "anoInicio", e)}
                  placeholder={t.placeholders.ano}
                  className="col-span-1 text-xs"
                  type="number" min="1950" max={new Date().getFullYear()}
                />
                {!exp.atual && (
                  <>
                    <SelectField
                      id={`exp-mesFim-${exp.id}`}
                      label={t.campos.mesFim}
                      name={`exp-mesFim-${exp.id}`}
                      value={exp.mesFim || ""}
                      onChange={(e) => handleItemChange("experiencias", exp.id, "mesFim", e)}
                      options={meses.map(m => ({ value: m, label: m }))}
                      className="col-span-1 text-xs"
                      defaultOptionLabel={t.placeholders.mes}
                    />
                    <InputField
                      id={`exp-anoFim-${exp.id}`}
                      label={t.campos.anoFim}
                      name={`exp-anoFim-${exp.id}`}
                      value={exp.anoFim || ""}
                      onChange={(e) => handleItemChange("experiencias", exp.id, "anoFim", e)}
                      placeholder={t.placeholders.ano}
                      className="col-span-1 text-xs"
                      type="number" min="1950" max={new Date().getFullYear() + 10}
                    />
                  </>
                )}
                <div className={`flex items-center ${exp.atual ? "md:col-span-3" : "md:col-span-1"} justify-start md:justify-end pt-5 md:pt-0`}>
                  <input type="checkbox" id={`exp-atual-${exp.id}`} checked={exp.atual || false} onChange={(e) => handleItemChange("experiencias", exp.id, "atual", e)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer" />
                  <label htmlFor={`exp-atual-${exp.id}`} className="ml-2 block text-sm text-gray-700 cursor-pointer">{t.campos.atual}</label>
                </div>
              </div>

              <InputField id={`exp-tech-${exp.id}`} label={t.campos.tecnologias} name={`exp-tech-${exp.id}`} placeholder={t.placeholders.tecnologias} value={exp.tecnologias} onChange={(e) => handleItemChange("experiencias", exp.id, "tecnologias", e)} className="mt-3" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <TextareaField id={`exp-ativ-${exp.id}`} label={t.campos.atividades} name={`exp-ativ-${exp.id}`} placeholder={t.placeholders.atividades} value={exp.atividades} onChange={(e) => handleItemChange("experiencias", exp.id, "atividades", e)} rows={4} />
                <TextareaField id={`exp-res-${exp.id}`} label={t.campos.resultados} name={`exp-res-${exp.id}`} placeholder={t.placeholders.resultados} value={exp.resultados} onChange={(e) => handleItemChange("experiencias", exp.id, "resultados", e)} rows={4} />
              </div>
            </ItemCard>
          ))}
        </div>
      )}
      <AddItemButton onClick={() => addField("experiencias")} label={t.botoes.adicionarExperiencia} />
    </SectionCard>
  ), [t, formData.experiencias, handleRemoveItem, handleItemChange, addField]);

  const renderEducationFields = useCallback(() => (
    <SectionCard title={t.campos.formacao}>
      {(formData.formacoes || []).length === 0 ? (
        <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50/70 rounded-lg border border-dashed border-gray-300">{t.mensagens.nenhumaFormacao}</p>
      ) : (
        <div className="space-y-3">
          {(formData.formacoes || []).map((form, index) => (
            <ItemCard
              key={form.id}
              index={index}
              onRemove={() => handleRemoveItem("formacoes", form.id)}
              removeTitle={`${t.botoes.remover} ${t.campos.formacao}`}
              summaryHeader={(
                 <>
                  <h4 className="font-semibold text-gray-800 truncate">
                    {tiposCurso.find(tc => tc.valor === form.tipo)?.[`label_${idiomaApp}`] || tiposCurso.find(tc => tc.valor === form.tipo)?.label || `(${t.campos.tipoFormacao})`}
                    {form.curso ? ` - ${form.curso}` : ''}
                  </h4>
                  <p className="text-xs text-gray-600 truncate">
                    {form.instituicao || `(${t.campos.instituicao})`} | {form.mesInicio && form.anoInicio ? `${form.mesInicio}/${form.anoInicio}` : ""} - {form.status === "andamento" ? t.labelAtual : (form.mesFim && form.anoFim ? `${form.mesFim}/${form.anoFim}` : "")}
                  </p>
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">
                    {statusFormacao.find(sf => sf.valor === form.status)?.[`label_${idiomaApp}`] || statusFormacao.find(sf => sf.valor === form.status)?.label}
                  </p>
                </>
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField id={`form-tipo-${form.id}`} label={t.campos.tipoFormacao} name={`form-tipo-${form.id}`} value={form.tipo || "superior"} onChange={(e) => handleItemChange("formacoes", form.id, "tipo", e)}
                  options={tiposCurso.map(tc => ({ value: tc.valor, label: tc[`label_${idiomaApp}`] || tc.label }))}
                  defaultOptionLabel={t.placeholders.tipoLink} />
                <InputField id={`form-curso-${form.id}`} label={t.campos.curso} name={`form-curso-${form.id}`} placeholder={t.placeholders.curso} value={form.curso} onChange={(e) => handleItemChange("formacoes", form.id, "curso", e)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <InputField id={`form-inst-${form.id}`} label={t.campos.instituicao} name={`form-inst-${form.id}`} placeholder={t.placeholders.instituicao} value={form.instituicao} onChange={(e) => handleItemChange("formacoes", form.id, "instituicao", e)} />
                <SelectField id={`form-status-${form.id}`} label={t.campos.status} name={`form-status-${form.id}`} value={form.status || "completo"} onChange={(e) => handleItemChange("formacoes", form.id, "status", e)}
                  options={statusFormacao.map(sf => ({ value: sf.valor, label: sf[`label_${idiomaApp}`] || sf.label }))}
                  defaultOptionLabel={t.campos.status} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end border-t border-gray-100 pt-4 mt-4">
                <SelectField
                  id={`form-mesInicio-${form.id}`}
                  label={t.campos.mesInicio}
                  name={`form-mesInicio-${form.id}`}
                  value={form.mesInicio || ""}
                  onChange={(e) => handleItemChange("formacoes", form.id, "mesInicio", e)}
                  options={meses.map(m => ({ value: m, label: m }))}
                  className="col-span-1 text-xs"
                  defaultOptionLabel={t.placeholders.mes}
                />
                <InputField
                  id={`form-anoInicio-${form.id}`}
                  label={t.campos.anoInicio}
                  name={`form-anoInicio-${form.id}`}
                  value={form.anoInicio || ""}
                  onChange={(e) => handleItemChange("formacoes", form.id, "anoInicio", e)}
                  placeholder={t.placeholders.ano}
                  className="col-span-1 text-xs"
                  type="number" min="1950" max={new Date().getFullYear()}
                />
                {form.status !== "andamento" && (
                  <>
                    <SelectField
                      id={`form-mesFim-${form.id}`}
                      label={t.campos.mesFim}
                      name={`form-mesFim-${form.id}`}
                      value={form.mesFim || ""}
                      onChange={(e) => handleItemChange("formacoes", form.id, "mesFim", e)}
                      options={meses.map(m => ({ value: m, label: m }))}
                      className="col-span-1 text-xs"
                      defaultOptionLabel={t.placeholders.mes}
                    />
                    <InputField
                      id={`form-anoFim-${form.id}`}
                      label={t.campos.anoFim}
                      name={`form-anoFim-${form.id}`}
                      value={form.anoFim || ""}
                      onChange={(e) => handleItemChange("formacoes", form.id, "anoFim", e)}
                      placeholder={t.placeholders.ano}
                      className="col-span-1 text-xs"
                      type="number" min="1950" max={new Date().getFullYear() + 10}
                    />
                  </>
                )}
                {form.status === "andamento" && <div className="col-span-2"></div>}
              </div>

              <TextareaField id={`form-desc-${form.id}`} label={t.campos.descricaoCertificacao} name={`form-desc-${form.id}`} placeholder={t.placeholders.descricaoCertificacao} value={form.descricao} onChange={(e) => handleItemChange("formacoes", form.id, "descricao", e)} rows={3} className="mt-3" />
            </ItemCard>
          ))}
        </div>
      )}
      <AddItemButton onClick={() => addField("formacoes")} label={t.botoes.adicionarFormacao} />
    </SectionCard>
  ), [t, formData.formacoes, idiomaApp, handleRemoveItem, handleItemChange, addField]);

  const renderHabilidadesField = useCallback(() => (
    <SectionCard title={t.campos.habilidades}>
      <TextareaField id="habilidades-text" label="" name="habilidadesInput" placeholder={t.placeholders.habilidades} value={habilidadesInput} onChange={handleHabilidadesChange} onBlur={handleHabilidadesBlur} rows={3} />

      <div className="mt-4 p-4 bg-gray-50/70 rounded-lg border border-gray-200/80 min-h-[60px]">
        <p className="text-sm font-medium text-gray-700 mb-3">Habilidades adicionadas:</p>
        <div className="flex flex-wrap">
          {formData.habilidades.map((skill, index) => (
            <SkillTag key={`${skill}-${index}`} skill={skill} onRemove={handleRemoveHabilidade} />
          ))}
          {formData.habilidades.length === 0 && (
            <p className="text-sm text-gray-500 italic">Nenhuma habilidade adicionada. Digite acima e separe por vírgulas.</p>
          )}
        </div>
      </div>
    </SectionCard>
  ), [t, habilidadesInput, formData.habilidades, handleHabilidadesChange, handleRemoveHabilidade]);

  const renderIdiomasFields = useCallback(() => (
    <SectionCard title={t.campos.idiomas}>
      {(formData.idiomas || []).length === 0 ? (
        <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50/70 rounded-lg border border-dashed border-gray-300">{t.mensagens.nenhumIdioma}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(formData.idiomas || []).map((idioma, index) => (
            <ItemCard
              key={idioma.id}
              index={index}
              onRemove={() => handleRemoveItem("idiomas", idioma.id)}
              removeTitle={`${t.botoes.remover} ${t.campos.idioma}`}
            >
              <div className="flex flex-col space-y-3">
                 <InputField
                    id={`idioma-nome-${idioma.id}`}
                    label={t.campos.idioma}
                    name={`idioma-nome-${idioma.id}`}
                    value={idioma.idioma || ""}
                    onChange={(e) => handleItemChange("idiomas", idioma.id, "idioma", e)}
                    placeholder={t.placeholders.idioma}
                    className="text-sm"
                  />
                  <SelectField
                    id={`idioma-nivel-${idioma.id}`}
                    label={t.campos.nivel}
                    name={`idioma-nivel-${idioma.id}`}
                    value={idioma.nivel || t.niveisIdioma[0]}
                    onChange={(e) => handleItemChange("idiomas", idioma.id, "nivel", e)}
                    options={t.niveisIdioma.map((nivel) => ({ value: nivel, label: nivel }))}
                    className="text-sm"
                    defaultOptionLabel={t.placeholders.nivelIdioma}
                  />
              </div>
            </ItemCard>
          ))}
        </div>
      )}
      <AddItemButton onClick={() => addField("idiomas")} label={t.botoes.adicionarIdioma} />
    </SectionCard>
  ), [t, formData.idiomas, handleRemoveItem, handleItemChange, addField]);

  const renderCertificacoesFields = useCallback(() => (
    <SectionCard title={t.campos.certificacoes}>
      {(formData.certificacoes || []).length === 0 ? (
        <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50/70 rounded-lg border border-dashed border-gray-300">{t.mensagens.nenhumaCertificacao}</p>
      ) : (
        <div className="space-y-3">
          {(formData.certificacoes || []).map((cert, index) => (
            <ItemCard
              key={cert.id}
              index={index}
              onRemove={() => handleRemoveItem("certificacoes", cert.id)}
              removeTitle={`${t.botoes.remover} ${t.campos.certificacao}`}
              summaryHeader={(
                <>
                  <h4 className="font-semibold text-gray-800 truncate">{cert.certificacao || `(${t.campos.certificacao})`}</h4>
                  <p className="text-xs text-gray-600 truncate">{cert.instituicaoEmissora || `(${t.campos.instituicaoEmissora})`} {cert.dataCertificacao ? `| ${cert.dataCertificacao}` : ""}</p>
                </>
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField id={`cert-nome-${cert.id}`} label={t.campos.certificacao} name={`cert-nome-${cert.id}`} placeholder={t.placeholders.certificacao} value={cert.certificacao} onChange={(e) => handleItemChange("certificacoes", cert.id, "certificacao", e)} />
                <InputField id={`cert-inst-${cert.id}`} label={t.campos.instituicaoEmissora} name={`cert-inst-${cert.id}`} placeholder={t.placeholders.instituicaoEmissora} value={cert.instituicaoEmissora} onChange={(e) => handleItemChange("certificacoes", cert.id, "instituicaoEmissora", e)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                 <InputField
                    id={`cert-data-${cert.id}`}
                    label={t.campos.dataCertificacao}
                    name={`cert-data-${cert.id}`}
                    placeholder={t.placeholders.dataCertificacao}
                    value={cert.dataCertificacao}
                    onChange={(e) => handleItemChange("certificacoes", cert.id, "dataCertificacao", e)}
                  />
                 <InputField
                    id={`cert-carga-${cert.id}`}
                    label={t.campos.cargaHoraria}
                    name={`cert-carga-${cert.id}`}
                    placeholder={t.placeholders.cargaHoraria}
                    value={cert.cargaHoraria}
                    onChange={(e) => handleItemChange("certificacoes", cert.id, "cargaHoraria", e)}
                  />
              </div>
              <InputField id={`cert-link-${cert.id}`} label={t.campos.linkValidacao} name={`cert-link-${cert.id}`} placeholder={t.placeholders.linkValidacao} value={cert.linkValidacao} onChange={(e) => handleItemChange("certificacoes", cert.id, "linkValidacao", e)} type="url" className="mt-3" />
              <TextareaField id={`cert-desc-${cert.id}`} label={t.campos.descricaoCertificacao} name={`cert-desc-${cert.id}`} placeholder={t.placeholders.descricaoCertificacao} value={cert.descricao} onChange={(e) => handleItemChange("certificacoes", cert.id, "descricao", e)} rows={3} className="mt-3" />
            </ItemCard>
          ))}
        </div>
      )}
      <AddItemButton onClick={() => addField("certificacoes")} label={t.botoes.adicionarCertificacao} />
    </SectionCard>
  ), [t, formData.certificacoes, handleRemoveItem, handleItemChange, addField]);

  // --- Renderização Principal (Layout SAAS Refinado) --- 
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      
<header className="bg-white/95 backdrop-blur-lg shadow-sm sticky top-0 z-40 border-b border-gray-200/80">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center py-3">
      <div className="flex items-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-500 shadow-md mr-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent tracking-tight">
          {t.tituloApp}
        </span>
      </div>

      {/* Seletor de Idioma com Dropdown */}
      <div className="relative">
        <button 
          onClick={() => setIsLangOpen(!isLangOpen)}
          className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-xs hover:shadow-md transition-all group"
          aria-label="Seletor de idioma"
        >
          <span className="text-sm font-medium text-gray-700">
            {idiomaApp === 'pt' ? 'Português' : 
             idiomaApp === 'es' ? 'Español' : 'English'}
          </span>
          
          <div className="relative w-4 h-4">
            {/* Ícone de seta padrão */}
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform absolute ${isLangOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            
            {/* Ícone giratório quando aberto */}
            <svg 
              className={`w-4 h-4 text-indigo-500 absolute transition-opacity duration-300 ${isLangOpen ? 'opacity-100 animate-spin' : 'opacity-0'}`}
              style={{ animationDuration: '1.5s' }}
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </button>

        {isLangOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
            <button
              onClick={() => { setIdiomaApp('pt'); setIsLangOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center ${idiomaApp === 'pt' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <span className="w-5 h-5 rounded-full bg-green-500 mr-2 flex items-center justify-center text-xs text-white">PT</span>
              Português
            </button>
            <button
              onClick={() => { setIdiomaApp('es'); setIsLangOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center ${idiomaApp === 'es' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <span className="w-5 h-5 rounded-full bg-yellow-500 mr-2 flex items-center justify-center text-xs text-white">ES</span>
              Español
            </button>
            <button
              onClick={() => { setIdiomaApp('en'); setIsLangOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center ${idiomaApp === 'en' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <span className="w-5 h-5 rounded-full bg-blue-500 mr-2 flex items-center justify-center text-xs text-white">EN</span>
              English
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
</header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Mensagens de Alerta */}
        <div className="px-4 sm:px-0 mb-6">
          <AlertMessage message={successMessage} type="success" onDismiss={() => setSuccessMessage("")} />
          <AlertMessage message={errorMessage} type="error" onDismiss={() => setErrorMessage("")} />
          <AlertMessage message={showLoadedMessage ? t.mensagens.carregado : ""} type="info" onDismiss={() => setShowLoadedMessage(false)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Coluna Principal (Formulário) */}
          <div className="lg:col-span-2 space-y-6">
            <form ref={formRef} className="space-y-6">
              {renderPersonalInfoFields()}
              {renderResumoField()}
              {renderExperienceFields()}
              {renderEducationFields()}
              {renderHabilidadesField()}
              {renderIdiomasFields()}
              {renderCertificacoesFields()}
            </form>
          </div>

          {/* Coluna Lateral (Ações e Dicas) */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            <SectionCard title="Ações" className="shadow-lg">
              <PrimaryButton
                onClick={generatePDF}
                label={t.botoes.gerarCV}
                isLoading={isGenerating}
              />
              {Object.keys(errors).length > 0 && (
                 <p className="text-xs text-red-600 mt-3 text-center">{t.mensagens.erroValidacao}</p>
              )}
            </SectionCard>

            <SectionCard title={t.dicasATS} className="bg-indigo-50/30 border-indigo-100">
              <ul className="space-y-2 text-sm text-gray-700">
                {t.dicasLista.map((dica, index) => (
                    <li key={index} className="flex items-start">
                        <svg className="flex-shrink-0 h-4 w-4 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{dica}</span>
                    </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        </div>
      </main>

      {/* Footer Refinado com Link GitHub */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 border-t border-gray-700 mt-16">
  <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6">
      <span className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
        &copy; {new Date().getFullYear()} {t.tituloApp}
      </span>
      
      <span className="hidden sm:inline text-gray-500">•</span>
      
      <a
        href="https://github.com/codedgabriel/ats-curriculo"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-indigo-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-3 py-1"
        aria-label="GitHub repository"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
        {t.linkGithub}
      </a>
    </div>
    
    <div className="mt-4 flex justify-center">
      <p className="text-xs text-gray-500 text-center max-w-md">
        Ferramenta gratuita para criar currículos otimizados para sistemas ATS (Applicant Tracking Systems)
      </p>
    </div>
  </div>
</footer>
    </div>
  );
}

export default App;

