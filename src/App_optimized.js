import { useState, useEffect } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Função de sanitização aprimorada para ATS
const sanitizeForATS = (text) => {
  if (typeof text !== 'string') return "";
  // Normaliza para remover acentos e caracteres diacríticos
  const normalizedText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Mapeamento de caracteres especiais comuns para substituições seguras ou remoção
  const replacements = {
    '•': '-', // Substitui bullet point por hífen
    '–': '-', // En dash
    '—': '-', // Em dash
    '‘': "'", // Aspas simples
    '’': "'",
    '“': '"', // Aspas duplas
    '”': '"',
    '…': '...', // Reticências
    '&': 'e', // '&' pode causar problemas
    // Adicionar outros mapeamentos conforme necessário
  };

  // Remove caracteres não-ASCII e não-imprimíveis, exceto os básicos e substitui
  return normalizedText
    .replace(/[•–—‘’“”…]/g, char => replacements[char] || '')
    .replace(/&/g, 'e')
    .replace(/[^\x20-\x7E]/g, ''); // Remove caracteres não-ASCII restantes
};

function App() {
  const [mostrarErro, setMostrarErro] = useState(true);

  const idiomasApp = [
    { codigo: "pt", nome: "Português", icone: "🇧🇷" },
    { codigo: "en", nome: "English", icone: "🇺🇸" },
    { codigo: "es", nome: "Español", icone: "🇪🇸" },
  ];

  // Textos traduzidos (mantidos para a interface, mas revisados para o PDF)
  const textos = {
    pt: {
      tituloApp: "Gerador de Currículo ATS",
      subtituloApp: "Crie um currículo otimizado para ATS",
      dicasATS: "Dicas para um currículo ATS-friendly",
      dicasLista: [
        "Use palavras-chave da descrição da vaga.",
        "Prefira fontes padrão como Arial ou Calibri.",
        "Use títulos de seção claros (Experiência, Educação...).",
        "Evite tabelas, colunas, imagens e gráficos.",
        "Salve em formato PDF baseado em texto."
      ],
      campos: {
        nome: "Nome Completo*",
        cargoDesejado: "Cargo Desejado",
        codigoPais: "Código do País",
        ddd: "DDD",
        telefone: "Telefone",
        cidade: "Cidade, Estado",
        linkedin: "LinkedIn",
        portfolio: "Portfolio/GitHub/Outro",
        email: "Email*",
        resumo: "Resumo Profissional*",
        experiencia: "Experiência Profissional",
        formacao: "Formação Acadêmica",
        habilidades: "Habilidades",
        idiomas: "Idiomas",
        certificacoes: "Certificações e Cursos",
        dataCertificacao: "Data (MM/AAAA)",
        cargaHoraria: "Carga Horária (opcional)",
        descricaoCertificacao: "Descrição (opcional)",
        tipoFormacao: "Tipo de Formação",
        curso: "Nome do Curso/Área de Estudo",
        instituicao: "Instituição de Ensino",
        periodo: "Período",
        cargo: "Cargo/Posição",
        empresa: "Empresa/Organização",
        tecnologias: "Tecnologias Chave",
        atividades: "Principais Responsabilidades/Atividades (use marcadores simples: - ou *)",
        resultados: "Resultados e Conquistas Quantificáveis (use marcadores simples: - ou *)",
        idioma: "Idioma",
        nivel: "Nível",
        certificacao: "Nome da Certificação/Curso",
        linkValidacao: "Link de Validação (opcional)"
      },
      placeholders: {
        nome: "Seu Nome Completo",
        cargoDesejado: "Ex: Engenheiro de Software Sênior",
        ddd: "Ex: 11",
        telefone: "Ex: 98765-4321",
        cidade: "Ex: São Paulo, SP",
        linkedin: "linkedin.com/in/seu-perfil",
        portfolio: "github.com/seu-usuario ou seusite.com",
        email: "seu.email@provedor.com",
        resumo: "Ex: Profissional [Sua Área] com [X] anos de experiência em [Habilidade 1], [Habilidade 2] e [Habilidade 3]. Histórico comprovado em [Realização Chave 1] e [Realização Chave 2]. Buscando a posição de [Cargo Desejado] para aplicar meus conhecimentos em [Objetivo Chave].",
        curso: "Ex: Bacharelado em Ciência da Computação",
        instituicao: "Ex: Universidade Federal de Minas Gerais",
        periodo: "Ex: 08/2018 - 07/2022",
        cargo: "Ex: Desenvolvedor Full-Stack Pleno",
        empresa: "Ex: Empresa Exemplo Ltda.",
        tecnologias: "Ex: Java, Spring Boot, React, PostgreSQL, AWS, Docker, Kubernetes",
        atividades: "- Desenvolvi e mantive APIs RESTful para o sistema X.\n- Colaborei com equipes multidisciplinares usando metodologias ágeis.\n- Realizei testes unitários e de integração.",
        resultados: "- Reduzi o tempo de processamento de relatórios em 30% otimizando queries SQL.\n- Liderei a migração do módulo Y para microserviços, aumentando a escalabilidade.",
        habilidades: "Liste suas habilidades técnicas e comportamentais separadas por vírgula (Ex: Python, Liderança, Comunicação, Power BI, Inglês Avançado)",
        idioma: "Ex: Inglês",
        certificacao: "Ex: AWS Certified Solutions Architect - Associate",
        linkValidacao: "URL de validação da certificação"
      },
      botoes: {
        adicionarExperiencia: "+ Experiência",
        adicionarFormacao: "+ Formação",
        adicionarIdioma: "+ Idioma",
        adicionarCertificacao: "+ Certificação/Curso",
        gerarCV: "Gerar Currículo ATS em PDF"
      },
      mensagens: {
        nenhumaExperiencia: "Nenhuma experiência adicionada.",
        nenhumIdioma: "Nenhum idioma adicionado.",
        nenhumaCertificacao: "Nenhuma certificação/curso adicionado.",
        sucesso: "Currículo ATS gerado com sucesso!",
        gerando: "Gerando Currículo ATS...",
        carregado: "Dados do último preenchimento carregados."
      },
      // Títulos de seção padrão para ATS
      secoesPDF: {
        resumo: "Resumo Profissional",
        experiencia: "Experiência Profissional",
        formacao: "Formação Acadêmica",
        habilidades: "Habilidades",
        idiomas: "Idiomas",
        certificacoes: "Certificações e Cursos"
      },
      niveisIdioma: [
        "Básico", "Intermediário", "Avançado", "Fluente", "Nativo"
      ]
    },
    en: {
      // ... (Traduções para Inglês seguindo o mesmo padrão PT)
      tituloApp: "ATS Resume Generator",
      subtituloApp: "Create an ATS-optimized resume",
      dicasATS: "Tips for an ATS-friendly resume",
      dicasLista: [
        "Use keywords from the job description.",
        "Prefer standard fonts like Arial or Calibri.",
        "Use clear section headings (Experience, Education...).",
        "Avoid tables, columns, images, and graphics.",
        "Save as a text-based PDF file."
      ],
      campos: {
        nome: "Full Name*",
        cargoDesejado: "Desired Position",
        codigoPais: "Country Code",
        ddd: "Area Code",
        telefone: "Phone Number",
        cidade: "City, State",
        linkedin: "LinkedIn",
        portfolio: "Portfolio/GitHub/Other",
        email: "Email*",
        resumo: "Professional Summary*",
        experiencia: "Professional Experience",
        formacao: "Education",
        habilidades: "Skills",
        idiomas: "Languages",
        certificacoes: "Certifications and Courses",
        dataCertificacao: "Date (MM/YYYY)",
        cargaHoraria: "Duration (optional)",
        descricaoCertificacao: "Description (optional)",
        tipoFormacao: "Degree Type",
        curso: "Major/Field of Study",
        instituicao: "Institution Name",
        periodo: "Period",
        cargo: "Job Title/Position",
        empresa: "Company/Organization",
        tecnologias: "Key Technologies",
        atividades: "Key Responsibilities/Activities (use simple bullets: - or *)",
        resultados: "Quantifiable Results and Achievements (use simple bullets: - or *)",
        idioma: "Language",
        nivel: "Proficiency Level",
        certificacao: "Certification/Course Name",
        linkValidacao: "Validation Link (optional)"
      },
      placeholders: {
        nome: "Your Full Name",
        cargoDesejado: "Ex: Senior Software Engineer",
        ddd: "Ex: 212",
        telefone: "Ex: 555-123-4567",
        cidade: "Ex: New York, NY",
        linkedin: "linkedin.com/in/your-profile",
        portfolio: "github.com/your-username or yoursite.com",
        email: "your.email@provider.com",
        resumo: "Ex: [Your Field] professional with [X] years of experience in [Skill 1], [Skill 2], and [Skill 3]. Proven track record in [Key Achievement 1] and [Key Achievement 2]. Seeking the [Desired Position] role to apply my expertise in [Key Objective].",
        curso: "Ex: Bachelor of Science in Computer Science",
        instituicao: "Ex: University of California, Berkeley",
        periodo: "Ex: 08/2018 - 07/2022",
        cargo: "Ex: Full-Stack Developer",
        empresa: "Ex: Example Corp.",
        tecnologias: "Ex: Python, Django, JavaScript, React, AWS, Docker",
        atividades: "- Developed and maintained RESTful APIs for system X.\n- Collaborated with cross-functional teams using agile methodologies.\n- Performed unit and integration testing.",
        resultados: "- Reduced report processing time by 30% by optimizing SQL queries.\n- Led the migration of module Y to microservices, enhancing scalability.",
        habilidades: "List your technical and soft skills separated by commas (Ex: Python, Leadership, Communication, Power BI, Fluent English)",
        idioma: "Ex: Spanish",
        certificacao: "Ex: Google Cloud Certified - Professional Cloud Architect",
        linkValidacao: "URL for certification validation"
      },
      botoes: {
        adicionarExperiencia: "+ Experience",
        adicionarFormacao: "+ Education",
        adicionarIdioma: "+ Language",
        adicionarCertificacao: "+ Certification/Course",
        gerarCV: "Generate ATS Resume PDF"
      },
      mensagens: {
        nenhumaExperiencia: "No experience added.",
        nenhumIdioma: "No languages added.",
        nenhumaCertificacao: "No certifications/courses added.",
        sucesso: "ATS resume generated successfully!",
        gerando: "Generating ATS Resume...",
        carregado: "Data from last session loaded."
      },
      secoesPDF: {
        resumo: "Professional Summary",
        experiencia: "Professional Experience",
        formacao: "Education",
        habilidades: "Skills",
        idiomas: "Languages",
        certificacoes: "Certifications and Courses"
      },
      niveisIdioma: [
        "Basic", "Intermediate", "Advanced", "Fluent", "Native"
      ]
    },
    es: {
      // ... (Traduções para Espanhol seguindo o mesmo padrão PT)
      tituloApp: "Generador de CV ATS",
      subtituloApp: "Crea un currículum optimizado para ATS",
      dicasATS: "Consejos para un currículum compatible con ATS",
      dicasLista: [
        "Usa palabras clave de la descripción del puesto.",
        "Prefiere fuentes estándar como Arial o Calibri.",
        "Usa encabezados de sección claros (Experiencia, Educación...).",
        "Evita tablas, columnas, imágenes y gráficos.",
        "Guarda en formato PDF basado en texto."
      ],
      campos: {
        nome: "Nombre Completo*",
        cargoDesejado: "Puesto Deseado",
        codigoPais: "Código de País",
        ddd: "Código de Área",
        telefone: "Número de Teléfono",
        cidade: "Ciudad, Provincia/Estado",
        linkedin: "LinkedIn",
        portfolio: "Portfolio/GitHub/Otro",
        email: "Correo Electrónico*",
        resumo: "Resumen Profesional*",
        experiencia: "Experiencia Profesional",
        formacao: "Formación Académica",
        habilidades: "Habilidades",
        idiomas: "Idiomas",
        certificacoes: "Certificaciones y Cursos",
        dataCertificacao: "Fecha (MM/AAAA)",
        cargaHoraria: "Duración (opcional)",
        descricaoCertificacao: "Descripción (opcional)",
        tipoFormacao: "Tipo de Formación",
        curso: "Carrera/Área de Estudio",
        instituicao: "Institución Educativa",
        periodo: "Período",
        cargo: "Cargo/Puesto",
        empresa: "Empresa/Organización",
        tecnologias: "Tecnologías Clave",
        atividades: "Responsabilidades/Actividades Principales (usa viñetas simples: - o *)",
        resultados: "Resultados y Logros Cuantificables (usa viñetas simples: - o *)",
        idioma: "Idioma",
        nivel: "Nivel de Competencia",
        certificacao: "Nombre de la Certificación/Curso",
        linkValidacao: "Enlace de Validación (opcional)"
      },
      placeholders: {
        nome: "Tu Nombre Completo",
        cargoDesejado: "Ej: Ingeniero de Software Senior",
        ddd: "Ej: 11",
        telefone: "Ej: 987 654 321",
        cidade: "Ej: Madrid, Comunidad de Madrid",
        linkedin: "linkedin.com/in/tu-perfil",
        portfolio: "github.com/tu-usuario o tusitio.com",
        email: "tu.email@proveedor.com",
        resumo: "Ej: Profesional de [Tu Área] con [X] años de experiencia en [Habilidad 1], [Habilidad 2] y [Habilidad 3]. Historial comprobado en [Logro Clave 1] y [Logro Clave 2]. Buscando la posición de [Puesto Deseado] para aplicar mis conocimientos en [Objetivo Clave].",
        curso: "Ej: Grado en Ingeniería Informática",
        instituicao: "Ej: Universidad Politécnica de Madrid",
        periodo: "Ej: 09/2018 - 07/2022",
        cargo: "Ej: Desarrollador Full-Stack",
        empresa: "Ej: Empresa Ejemplo S.L.",
        tecnologias: "Ej: Java, Spring, Angular, MySQL, Azure, Docker",
        atividades: "- Desarrollé y mantuve APIs RESTful para el sistema X.\n- Colaboré con equipos multifuncionales usando metodologías ágiles.\n- Realicé pruebas unitarias y de integración.",
        resultados: "- Reduje el tiempo de procesamiento de informes en un 30% optimizando consultas SQL.\n- Lideré la migración del módulo Y a microservicios, mejorando la escalabilidad.",
        habilidades: "Enumera tus habilidades técnicas y blandas separadas por comas (Ej: Python, Liderazgo, Comunicación, Power BI, Inglés Avanzado)",
        idioma: "Ej: Inglés",
        certificacao: "Ej: Microsoft Certified: Azure Solutions Architect Expert",
        linkValidacao: "URL de validación de la certificación"
      },
      botoes: {
        adicionarExperiencia: "+ Experiencia",
        adicionarFormacao: "+ Formación",
        adicionarIdioma: "+ Idioma",
        adicionarCertificacao: "+ Certificación/Curso",
        gerarCV: "Generar CV ATS en PDF"
      },
      mensagens: {
        nenhumaExperiencia: "No se ha añadido experiencia.",
        nenhumIdioma: "No se han añadido idiomas.",
        nenhumaCertificacao: "No se han añadido certificaciones/cursos.",
        sucesso: "¡CV ATS generado con éxito!",
        gerando: "Generando CV ATS...",
        carregado: "Datos de la última sesión cargados."
      },
      secoesPDF: {
        resumo: "Resumen Profesional",
        experiencia: "Experiencia Profesional",
        formacao: "Formación Académica",
        habilidades: "Habilidades",
        idiomas: "Idiomas",
        certificacoes: "Certificaciones y Cursos"
      },
      niveisIdioma: [
        "Básico", "Intermedio", "Avanzado", "Fluido", "Nativo"
      ]
    }
  };

  const paisesTelefone = [
    { codigo: "+55", nome: "Brasil (+55)" },
    { codigo: "+1", nome: "EUA/Canadá (+1)" },
    { codigo: "+54", nome: "Argentina (+54)" },
    { codigo: "+351", nome: "Portugal (+351)" },
    { codigo: "+34", nome: "Espanha (+34)" },
    // Adicionar mais países conforme necessário
  ];

  const tiposCurso = [
    { valor: "superior", label: "Ensino Superior", label_en: "Bachelor's Degree", label_es: "Grado Universitario" },
    { valor: "tecnologo", label: "Tecnólogo", label_en: "Associate's Degree/Technologist", label_es: "Tecnólogo" },
    { valor: "medio", label: "Ensino Médio", label_en: "High School Diploma", label_es: "Bachillerato" },
    { valor: "tecnico", label: "Curso Técnico", label_en: "Technical Course", label_es: "Curso Técnico" },
    { valor: "pos", label: "Pós-Graduação/Especialização", label_en: "Postgraduate/Specialization", label_es: "Posgrado/Especialización" },
    { valor: "mestrado", label: "Mestrado", label_en: "Master's Degree", label_es: "Máster" },
    { valor: "doutorado", label: "Doutorado", label_en: "PhD/Doctorate", label_es: "Doctorado" },
  ];

  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    ddd: "",
    codigoPais: "+55",
    cidade: "",
    email: "",
    links: [{ tipo: "linkedin", url: "" }], // Permitir múltiplos links
    cargoDesejado: "",
    resumo: "",
    experiencias: [],
    formacoes: [{ tipo: "superior", curso: "", instituicao: "", mesInicio: "", anoInicio: "", mesFim: "", anoFim: "", status: "completo", descricao: "" }],
    habilidades: [],
    certificacoes: [],
    idiomas: [],
  });

  const meses = [
    { valor: "01", label: "01" }, { valor: "02", label: "02" }, { valor: "03", label: "03" },
    { valor: "04", label: "04" }, { valor: "05", label: "05" }, { valor: "06", label: "06" },
    { valor: "07", label: "07" }, { valor: "08", label: "08" }, { valor: "09", label: "09" },
    { valor: "10", label: "10" }, { valor: "11", label: "11" }, { valor: "12", label: "12" }
  ];

  const statusFormacao = [
    { valor: "completo", label: "Completo", label_en: "Completed", label_es: "Completo" },
    { valor: "andamento", label: "Em andamento", label_en: "In Progress", label_es: "En curso" },
    { valor: "trancado", label: "Trancado/Interrompido", label_en: "Paused/Interrupted", label_es: "Pausado/Interrumpido" }
  ];

  const tiposLinks = [
    { valor: "linkedin", label: "LinkedIn", prefixo: "linkedin.com/in/" },
    { valor: "github", label: "GitHub", prefixo: "github.com/" },
    { valor: "gitlab", label: "GitLab", prefixo: "gitlab.com/" },
    { valor: "behance", label: "Behance", prefixo: "behance.net/" },
    { valor: "portfolio", label: "Portfolio Pessoal", prefixo: "" }, // Sem prefixo obrigatório
    { valor: "outro", label: "Outro Link", prefixo: "" }, // Sem prefixo obrigatório
  ];

  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [habilidadesInput, setHabilidadesInput] = useState("");
  const [idiomaApp, setIdiomaApp] = useState("pt");
  const [activeSection, setActiveSection] = useState("info");
  const [showLoadedMessage, setShowLoadedMessage] = useState(false);

  // Obter textos traduzidos com base no idioma selecionado
  const t = textos[idiomaApp];

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const savedFormData = localStorage.getItem('resumeFormDataATS');
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
        // Atualizar input de habilidades se houver dados salvos
        if (parsedData.habilidades && parsedData.habilidades.length > 0) {
          setHabilidadesInput(parsedData.habilidades.join(', '));
        }
        setShowLoadedMessage(true);
        setTimeout(() => setShowLoadedMessage(false), 3000);
      } catch (error) {
        console.error('Falha ao carregar dados do localStorage:', error);
        localStorage.removeItem('resumeFormDataATS'); // Limpa dados inválidos
      }
    }
  }, []);

  // Salvar dados no localStorage a cada mudança
  const saveFormDataToLocalStorage = (data) => {
    try {
      localStorage.setItem('resumeFormDataATS', JSON.stringify(data));
    } catch (error) {
      console.error('Falha ao salvar dados no localStorage:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let firstErrorSection = null;

    const setError = (field, message, section) => {
      newErrors[field] = message;
      if (!firstErrorSection) firstErrorSection = section;
    };

    // Validação: Informações Pessoais
    if (!formData.nome.trim()) setError('nome', `${t.campos.nome.replace('*','')} é obrigatório`, 'info');
    if (!formData.email.trim()) {
      setError('email', `${t.campos.email.replace('*','')} é obrigatório`, 'info');
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('email', 'Formato de email inválido', 'info');
    }
    if (!formData.telefone.trim()) setError('telefone', `${t.campos.telefone} é recomendado`, 'info');
    if (!formData.cidade.trim()) setError('cidade', `${t.campos.cidade} é recomendada`, 'info');

    // Validação: Resumo
    if (!formData.resumo.trim()) setError('resumo', `${t.campos.resumo.replace('*','')} é obrigatório`, 'resumo');

    // Validação: Formação (pelo menos uma é recomendada)
    if (formData.formacoes.length === 0 || !formData.formacoes[0]?.curso?.trim() || !formData.formacoes[0]?.instituicao?.trim()) {
       // Apenas um aviso, não bloqueante
       console.warn("Formação acadêmica não preenchida.");
    }
    formData.formacoes.forEach((form, idx) => {
        if (!form.curso?.trim()) setError(`formacao_${idx}_curso`, `Nome do curso é obrigatório para formação ${idx + 1}`, 'formacao');
        if (!form.instituicao?.trim()) setError(`formacao_${idx}_instituicao`, `Instituição é obrigatória para formação ${idx + 1}`, 'formacao');
        if (!form.anoInicio?.trim()) setError(`formacao_${idx}_anoInicio`, `Ano de início é obrigatório para formação ${idx + 1}`, 'formacao');
        if (form.status !== 'andamento' && !form.anoFim?.trim()) {
             setError(`formacao_${idx}_anoFim`, `Ano de fim é obrigatório para formação ${idx + 1} (se não estiver em andamento)`, 'formacao');
        }
    });

    // Validação: Experiência (opcional, mas se preenchida, campos são obrigatórios)
     formData.experiencias.forEach((exp, idx) => {
        if (!exp.cargo?.trim()) setError(`exp_${idx}_cargo`, `Cargo é obrigatório para experiência ${idx + 1}`, 'experiencia');
        if (!exp.empresa?.trim()) setError(`exp_${idx}_empresa`, `Empresa é obrigatória para experiência ${idx + 1}`, 'experiencia');
        if (!exp.anoInicio?.trim()) setError(`exp_${idx}_anoInicio`, `Ano de início é obrigatório para experiência ${idx + 1}`, 'experiencia');
        if (!exp.atual && !exp.anoFim?.trim()) {
             setError(`exp_${idx}_anoFim`, `Ano de fim é obrigatório para experiência ${idx + 1} (se não for atual)`, 'experiencia');
        }
        if (!exp.atividades?.trim()) setError(`exp_${idx}_atividades`, `Atividades são recomendadas para experiência ${idx + 1}`, 'experiencia');
    });

    // Validação: Habilidades (recomendado)
    if (formData.habilidades.length === 0) {
        console.warn("Nenhuma habilidade adicionada.");
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      firstErrorSection
    };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: type === 'checkbox' ? checked : value };
      saveFormDataToLocalStorage(newData);
      return newData;
    });
  };

  const handleArrayChange = (field, index, name, value, type = 'text', checked = false) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = { ...newArray[index], [name]: type === 'checkbox' ? checked : value };
      // Limpar data de fim se marcar 'atual' na experiência
      if (field === 'experiencias' && name === 'atual' && checked) {
          newArray[index] = { ...newArray[index], mesFim: '', anoFim: '' };
      }
      // Limpar data de fim se marcar 'andamento' na formação
      if (field === 'formacoes' && name === 'status' && value === 'andamento') {
          newArray[index] = { ...newArray[index], mesFim: '', anoFim: '' };
      }
      const newData = { ...prev, [field]: newArray };
      saveFormDataToLocalStorage(newData);
      return newData;
    });
  };

  const addField = (field) => {
    let initialValue = {};
    if (field === 'experiencias') initialValue = { cargo: "", empresa: "", mesInicio: "", anoInicio: "", mesFim: "", anoFim: "", atual: false, tecnologias: "", atividades: "", resultados: "" };
    if (field === 'formacoes') initialValue = { tipo: "superior", curso: "", instituicao: "", mesInicio: "", anoInicio: "", mesFim: "", anoFim: "", status: "completo", descricao: "" };
    if (field === 'idiomas') initialValue = { idioma: "", nivel: "" };
    if (field === 'certificacoes') initialValue = { titulo: "", emissor: "", data: "", cargaHoraria: "", descricao: "", linkValidacao: "" };
    if (field === 'links') initialValue = { tipo: "linkedin", url: "" };

    setFormData(prev => {
      const newArray = [...prev[field], initialValue];
      const newData = { ...prev, [field]: newArray };
      saveFormDataToLocalStorage(newData);
      return newData;
    });
  };

  const removeField = (field, index) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray.splice(index, 1);
      // Garante que sempre haja pelo menos um campo inicial para formação e links
      if ((field === 'formacoes' || field === 'links') && newArray.length === 0) {
          if (field === 'formacoes') newArray.push({ tipo: "superior", curso: "", instituicao: "", mesInicio: "", anoInicio: "", mesFim: "", anoFim: "", status: "completo", descricao: "" });
          if (field === 'links') newArray.push({ tipo: "linkedin", url: "" });
      }
      const newData = { ...prev, [field]: newArray };
      saveFormDataToLocalStorage(newData);
      return newData;
    });
  };

  const handleHabilidadesChange = (e) => {
    const value = e.target.value;
    setHabilidadesInput(value);
    const habilidadesArray = value.split(',') // Separa por vírgula
      .map(skill => skill.trim()) // Remove espaços extras
      .filter(skill => skill); // Remove itens vazios

    setFormData(prev => {
        const newData = { ...prev, habilidades: habilidadesArray };
        saveFormDataToLocalStorage(newData);
        return newData;
    });
  };

  // Função auxiliar para formatar texto com quebras de linha para PDF
  const formatTextForPDF = (text, maxWidth, font, fontSize) => {
    if (!text) return [''];
    const paragraphs = text.toString().split('\n'); // Garante que text é string
    let lines = [];
    for (const paragraph of paragraphs) {
        let words = paragraph.split(' ');
        let currentLine = '';
        // Trata marcadores comuns no início do parágrafo
        let prefix = '';
        if (words.length > 0 && (words[0] === '-' || words[0] === '*' || words[0] === '•')) {
            prefix = words.shift() + ' '; // Remove o marcador e adiciona espaço
        }

        if (words.length > 0) {
            currentLine = words[0];
            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const testLine = currentLine + ' ' + word;
                const width = font.widthOfTextAtSize(testLine, fontSize);
                if (width < maxWidth) {
                    currentLine = testLine;
                } else {
                    lines.push(prefix + currentLine);
                    currentLine = word;
                    prefix = ''; // Não repete o prefixo nas linhas seguintes do mesmo parágrafo
                }
            }
        }
        lines.push(prefix + currentLine);
    }
    return lines;
  };

  const gerarPDF = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      // Foca na primeira seção com erro
      if (validation.firstErrorSection) {
        setActiveSection(validation.firstErrorSection);
        setTimeout(() => {
          const errorElement = document.querySelector(`[name*="${Object.keys(errors)[0]}"]`);
          errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          errorElement?.focus();
        }, 100);
      }
      alert("Por favor, corrija os erros indicados antes de gerar o PDF.");
      return;
    }

    setIsGenerating(true);
    setSuccessMessage(""); // Limpa mensagem anterior

    try {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([595, 842]); // A4
      const { width, height } = page.getSize();

      // --- Configurações ATS-Friendly --- 
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica); // Fonte padrão ATS
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const black = rgb(0, 0, 0);
      const gray = rgb(0.3, 0.3, 0.3); // Cinza para detalhes menores

      // Margens (dentro do recomendado 0.5 a 1 polegada = 36 a 72 pt)
      const marginX = 50; // ~0.7 polegadas
      const marginY = 50; // ~0.7 polegadas
      const maxWidth = width - 2 * marginX;
      let y = height - marginY;
      const minY = marginY; // Limite inferior da página

      // Espaçamentos
      const lineSpacing = 1.2; // Multiplicador para altura da linha
      const paragraphSpacing = 6; // Espaço extra após um bloco de texto (ex: descrição)
      const sectionGap = 15; // Espaço entre seções
      const itemGap = 8; // Espaço entre itens (ex: experiências)

      // Tamanhos de Fonte (ATS-friendly)
      const nameSize = 18;
      const positionSize = 14;
      const contactSize = 10;
      const sectionTitleSize = 14;
      const headingSize = 12; // Cargo, Curso
      const bodySize = 11; // Texto principal, Empresa, Instituição, Descrições
      const detailSize = 10; // Datas, Nível Idioma, Tecnologias

      // Função para desenhar texto com quebra automática e atualização de Y
      const drawText = (text, options) => {
        const { x, size, font, color = black, lineHeightMult = lineSpacing, maxWidthOverride = maxWidth } = options;
        const lines = formatTextForPDF(sanitizeForATS(text), maxWidthOverride, font, size);
        let currentY = y;
        lines.forEach((line, i) => {
          // Verifica se precisa de nova página ANTES de desenhar a linha
          if (currentY - (size * lineHeightMult) < minY) {
            page = pdfDoc.addPage([width, height]);
            currentY = height - marginY; // Reseta Y para o topo da nova página
          }
          page.drawText(line, {
            x,
            y: currentY,
            size,
            font,
            color,
          });
          currentY -= size * lineHeightMult;
        });
        y = currentY; // Atualiza o Y global
        return lines.length; // Retorna número de linhas desenhadas
      };

      // Função para desenhar título de seção
      const drawSectionTitle = (title) => {
        y -= sectionGap; // Espaço ANTES do título
        // Verifica espaço para o título e uma linha de conteúdo
        if (y - (sectionTitleSize * lineSpacing) - (bodySize * lineSpacing) < minY) {
          page = pdfDoc.addPage([width, height]);
          y = height - marginY;
        }
        page.drawText(sanitizeForATS(title).toUpperCase(), {
          x: marginX,
          y,
          size: sectionTitleSize,
          font: boldFont,
          color: black,
        });
        y -= sectionTitleSize * lineSpacing;
        // Linha divisória sutil (opcional, mas comum)
        page.drawLine({
          start: { x: marginX, y: y + 2 },
          end: { x: width - marginX, y: y + 2 }, // Linha completa
          thickness: 0.5,
          color: gray,
        });
        y -= 5; // Pequeno espaço após a linha
      };

      // --- Conteúdo do Currículo --- 

      // 1. Cabeçalho: Nome e Cargo Desejado
      drawText(formData.nome, { x: marginX, size: nameSize, font: boldFont });
      if (formData.cargoDesejado) {
        drawText(formData.cargoDesejado, { x: marginX, size: positionSize, font: boldFont, color: gray });
      }
      y -= paragraphSpacing; // Espaço após cabeçalho

      // 2. Informações de Contato (linear)
      let contactInfo = [];
      if (formData.telefone) contactInfo.push(`${formData.codigoPais} ${formData.ddd} ${formData.telefone}`);
      if (formData.email) contactInfo.push(formData.email);
      if (formData.cidade) contactInfo.push(formData.cidade);
      formData.links.forEach(link => {
          if (link.url) {
              const tipo = tiposLinks.find(t => t.valor === link.tipo);
              const prefixo = tipo?.prefixo || '';
              let urlCompleta = link.url.startsWith('http') ? link.url : prefixo ? `https://${prefixo}${link.url}` : link.url;
              // Para ATS, é melhor mostrar a URL completa ou um texto descritivo
              if (link.tipo === 'linkedin' || link.tipo === 'github' || link.tipo === 'portfolio') {
                  contactInfo.push(`${tipo.label}: ${urlCompleta}`);
              } else {
                  contactInfo.push(urlCompleta); // Outros links mostra direto
              }
          }
      });
      drawText(contactInfo.join(' | '), { x: marginX, size: contactSize, font: font, color: gray });

      // 3. Resumo Profissional
      if (formData.resumo) {
        drawSectionTitle(t.secoesPDF.resumo);
        drawText(formData.resumo, { x: marginX, size: bodySize, font: font });
      }

      // 4. Experiência Profissional
      if (formData.experiencias.length > 0 && formData.experiencias.some(e => e.cargo || e.empresa)) {
        drawSectionTitle(t.secoesPDF.experiencia);
        formData.experiencias.forEach((exp, idx) => {
          if (exp.cargo || exp.empresa) {
            // Formata período
            const mesInicio = exp.mesInicio || '';
            const anoInicio = exp.anoInicio || '';
            const mesFim = exp.mesFim || '';
            const anoFim = exp.anoFim || '';
            let periodoExp = '';
            if (anoInicio) {
                periodoExp = `${mesInicio}/${anoInicio} - `;
                if (exp.atual) {
                    periodoExp += (idiomaApp === 'en' ? 'Present' : idiomaApp === 'es' ? 'Actual' : 'Atual');
                } else if (anoFim) {
                    periodoExp += `${mesFim}/${anoFim}`;
                } else {
                     periodoExp = `${mesInicio}/${anoInicio}`; // Caso só tenha início
                }
            }

            // Linha 1: Cargo
            drawText(exp.cargo, { x: marginX, size: headingSize, font: boldFont });
            // Linha 2: Empresa | Período
            let empresaPeriodo = [exp.empresa, periodoExp].filter(Boolean).join(' | ');
            drawText(empresaPeriodo, { x: marginX, size: bodySize, font: font, color: gray });
            y -= 2; // Menor espaço antes das techs/atividades

            // Tecnologias
            if (exp.tecnologias) {
              drawText(`Tecnologias: ${exp.tecnologias}`, { x: marginX, size: detailSize, font: font, color: gray });
              y -= paragraphSpacing / 2;
            }

            // Atividades e Resultados (usando drawText que trata bullets)
            if (exp.atividades) {
              drawText(exp.atividades, { x: marginX, size: bodySize, font: font, maxWidthOverride: maxWidth - 15 }); // Leve indentação para bullets
              y -= paragraphSpacing / 2;
            }
            if (exp.resultados) {
              drawText(exp.resultados, { x: marginX, size: bodySize, font: font, maxWidthOverride: maxWidth - 15 });
            }

            // Espaço entre experiências
            if (idx < formData.experiencias.length - 1) {
              y -= itemGap;
            }
          }
        });
      }

      // 5. Formação Acadêmica
      if (formData.formacoes.length > 0 && formData.formacoes.some(f => f.curso || f.instituicao)) {
        drawSectionTitle(t.secoesPDF.formacao);
        formData.formacoes.forEach((form, idx) => {
          if (form.curso || form.instituicao) {
            const tipoCurso = tiposCurso.find(t => t.valor === form.tipo);
            let tipoLabel = tipoCurso ? (tipoCurso[`label_${idiomaApp}`] || tipoCurso.label) : '';
            let cursoCompleto = [tipoLabel, form.curso].filter(Boolean).join(': ');

            // Formata período
            const mesInicio = form.mesInicio || '';
            const anoInicio = form.anoInicio || '';
            const mesFim = form.mesFim || '';
            const anoFim = form.anoFim || '';
            let periodoForm = '';
             if (anoInicio) {
                periodoForm = `${mesInicio}/${anoInicio} - `;
                const statusLabel = statusFormacao.find(s => s.valor === form.status);
                if (form.status === 'andamento') {
                    periodoForm += (statusLabel[`label_${idiomaApp}`] || statusLabel.label);
                } else if (anoFim) {
                    periodoForm += `${mesFim}/${anoFim}`;
                    if(form.status === 'completo' && statusLabel) {
                         periodoForm += ` (${statusLabel[`label_${idiomaApp}`] || statusLabel.label})`;
                    }
                } else {
                     periodoForm = `${mesInicio}/${anoInicio}`; // Caso só tenha início
                     if(statusLabel) periodoForm += ` (${statusLabel[`label_${idiomaApp}`] || statusLabel.label})`;
                }
            }

            // Linha 1: Curso/Área
            drawText(cursoCompleto, { x: marginX, size: headingSize, font: boldFont });
            // Linha 2: Instituição | Período
            let instituicaoPeriodo = [form.instituicao, periodoForm].filter(Boolean).join(' | ');
            drawText(instituicaoPeriodo, { x: marginX, size: bodySize, font: font, color: gray });

            // Descrição (opcional)
            if (form.descricao) {
              y -= 4;
              drawText(form.descricao, { x: marginX, size: detailSize, font: font, color: gray });
            }

            // Espaço entre formações
            if (idx < formData.formacoes.length - 1) {
              y -= itemGap;
            }
          }
        });
      }

      // 6. Habilidades (Lista Linear Simples)
      if (formData.habilidades.length > 0) {
        drawSectionTitle(t.secoesPDF.habilidades);
        // Junta as habilidades em uma string separada por vírgula ou bullets
        // Opção 1: String única separada por vírgulas (mais comum para ATS)
        // const skillsText = formData.habilidades.join(', ');
        // drawText(skillsText, { x: marginX, size: bodySize, font: font });

        // Opção 2: Lista com marcadores (melhor legibilidade humana, geralmente ok para ATS modernos)
        formData.habilidades.forEach(skill => {
            drawText(`- ${skill}`, { x: marginX, size: bodySize, font: font });
        });
      }

      // 7. Idiomas
      if (formData.idiomas.length > 0 && formData.idiomas.some(i => i.idioma)) {
        drawSectionTitle(t.secoesPDF.idiomas);
        formData.idiomas.forEach(idioma => {
          if (idioma.idioma) {
            const nivelLabel = t.niveisIdioma[idioma.nivel] || idioma.nivel; // Usa tradução se disponível
            const text = `${idioma.idioma}: ${nivelLabel}`;
            drawText(`- ${text}`, { x: marginX, size: bodySize, font: font });
          }
        });
      }

      // 8. Certificações e Cursos
      if (formData.certificacoes.length > 0 && formData.certificacoes.some(c => c.titulo)) {
        drawSectionTitle(t.secoesPDF.certificacoes);
        formData.certificacoes.forEach((cert, idx) => {
          if (cert.titulo) {
            // Linha 1: Título
            drawText(cert.titulo, { x: marginX, size: headingSize, font: boldFont });
            // Linha 2: Emissor | Data | Carga Horária
            let details = [
                cert.emissor,
                cert.data,
                cert.cargaHoraria ? `${cert.cargaHoraria} horas` : null
            ].filter(Boolean).join(' | ');
            drawText(details, { x: marginX, size: detailSize, font: font, color: gray });

            // Descrição (opcional)
            if (cert.descricao) {
              y -= 4;
              drawText(cert.descricao, { x: marginX, size: detailSize, font: font, color: gray });
            }
            // Link (opcional)
             if (cert.linkValidacao) {
              y -= 4;
              drawText(`Validação: ${cert.linkValidacao}`, { x: marginX, size: detailSize, font: font, color: gray });
            }

            // Espaço entre certificações
            if (idx < formData.certificacoes.length - 1) {
              y -= itemGap;
            }
          }
        });
      }

      // Salvar e baixar o PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      // Nome do arquivo mais descritivo
      const fileName = `Curriculo_${formData.nome.replace(/\s+/g, '_')}_ATS_Otimizado.pdf`;
      link.download = sanitizeForATS(fileName).replace(/[^a-zA-Z0-9_.-]/g, '_'); // Sanitiza nome do arquivo
      link.click();
      URL.revokeObjectURL(link.href); // Limpa o objeto URL

      setSuccessMessage(t.mensagens.sucesso);
      setTimeout(() => setSuccessMessage(""), 5000);

    } catch (error) {
      console.error("Erro ao gerar PDF ATS:", error);
      alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Funções de Renderização dos Campos do Formulário (JSX) ---
  // (O código JSX abaixo permanece largamente igual ao original, 
  // apenas ajustando labels/placeholders conforme definido no objeto 'textos' e 
  // garantindo que os 'name' dos inputs correspondam ao 'formData')

  const renderInfoPessoalFields = () => (
    <div id="info" className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">{t.campos.nome}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.nome.replace('*','')}<span className="text-red-500">*</span></label>
          <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder={t.placeholders.nome} className={`input-field ${errors.nome ? 'border-red-500' : ''}`} required />
          {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.cargoDesejado}</label>
          <input type="text" name="cargoDesejado" value={formData.cargoDesejado} onChange={handleChange} placeholder={t.placeholders.cargoDesejado} className="input-field" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.email.replace('*','')}<span className="text-red-500">*</span></label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder={t.placeholders.email} className={`input-field ${errors.email ? 'border-red-500' : ''}`} required />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
                 <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.codigoPais}</label>
                 <select name="codigoPais" value={formData.codigoPais} onChange={handleChange} className="input-field">
                     {paisesTelefone.map(p => <option key={p.codigo} value={p.codigo}>{p.nome}</option>)}
                 </select>
            </div>
             <div className="col-span-2 grid grid-cols-2 gap-2">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.ddd}</label>
                    <input type="text" name="ddd" value={formData.ddd} onChange={handleChange} placeholder={t.placeholders.ddd} className={`input-field ${errors.telefone ? 'border-red-500' : ''}`} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.telefone}</label>
                    <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} placeholder={t.placeholders.telefone} className={`input-field ${errors.telefone ? 'border-red-500' : ''}`} />
                 </div>
             </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.cidade}</label>
          <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} placeholder={t.placeholders.cidade} className={`input-field ${errors.cidade ? 'border-red-500' : ''}`} />
           {errors.cidade && <p className="text-xs text-red-500 mt-1">{errors.cidade}</p>}
        </div>
      </div>
      <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Links Profissionais</label>
          {formData.links.map((link, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                  <select value={link.tipo} onChange={(e) => handleArrayChange('links', idx, 'tipo', e.target.value)} className="input-field w-1/3">
                      {tiposLinks.map(tipo => <option key={tipo.valor} value={tipo.valor}>{tipo.label}</option>)}
                  </select>
                  <input
                      type="text"
                      value={link.url}
                      onChange={(e) => handleArrayChange('links', idx, 'url', e.target.value)}
                      placeholder={tiposLinks.find(t => t.valor === link.tipo)?.prefixo ? `${tiposLinks.find(t => t.valor === link.tipo)?.prefixo}seu-usuario` : t.placeholders.portfolio}
                      className="input-field flex-grow"
                  />
                  {formData.links.length > 1 && (
                      <button type="button" onClick={() => removeField('links', idx)} className="text-red-500 hover:text-red-700 p-1">X</button>
                  )}
              </div>
          ))}
          <button type="button" onClick={() => addField('links')} className="text-sm text-blue-600 hover:text-blue-800">+ Adicionar Link</button>
      </div>
    </div>
  );

  const renderResumoField = () => (
    <div id="resumo" className="space-y-4">
       <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">{t.campos.resumo.replace('*','')}<span className="text-red-500">*</span></h3>
      <textarea name="resumo" value={formData.resumo} onChange={handleChange} placeholder={t.placeholders.resumo} rows={5} className={`input-field ${errors.resumo ? 'border-red-500' : ''}`} required />
      {errors.resumo && <p className="text-xs text-red-500 mt-1">{errors.resumo}</p>}
    </div>
  );

  const renderExperienceFields = () => (
    <div id="experiencia" className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">{t.campos.experiencia}</h3>
      {formData.experiencias.length === 0 ? (
        <p className="text-sm text-gray-500">{t.mensagens.nenhumaExperiencia}</p>
      ) : (
        formData.experiencias.map((exp, idx) => (
          <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative space-y-4">
            <button type="button" onClick={() => removeField("experiencias", idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500" title="Remover Experiência">X</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.cargo}<span className="text-red-500">*</span></label>
                <input type="text" value={exp.cargo} onChange={(e) => handleArrayChange("experiencias", idx, "cargo", e.target.value)} placeholder={t.placeholders.cargo} className={`input-field ${errors[`exp_${idx}_cargo`] ? 'border-red-500' : ''}`} required />
                 {errors[`exp_${idx}_cargo`] && <p className="text-xs text-red-500 mt-1">{errors[`exp_${idx}_cargo`]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.empresa}<span className="text-red-500">*</span></label>
                <input type="text" value={exp.empresa} onChange={(e) => handleArrayChange("experiencias", idx, "empresa", e.target.value)} placeholder={t.placeholders.empresa} className={`input-field ${errors[`exp_${idx}_empresa`] ? 'border-red-500' : ''}`} required />
                 {errors[`exp_${idx}_empresa`] && <p className="text-xs text-red-500 mt-1">{errors[`exp_${idx}_empresa`]}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mês Início</label>
                <select value={exp.mesInicio} onChange={(e) => handleArrayChange("experiencias", idx, "mesInicio", e.target.value)} className="input-field">
                  <option value="">Mês</option>
                  {meses.map(m => <option key={m.valor} value={m.valor}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano Início<span className="text-red-500">*</span></label>
                <input type="number" min="1950" max={new Date().getFullYear()} value={exp.anoInicio} onChange={(e) => handleArrayChange("experiencias", idx, "anoInicio", e.target.value)} placeholder="Ano" className={`input-field ${errors[`exp_${idx}_anoInicio`] ? 'border-red-500' : ''}`} required />
                 {errors[`exp_${idx}_anoInicio`] && <p className="text-xs text-red-500 mt-1">{errors[`exp_${idx}_anoInicio`]}</p>}
              </div>
              {!exp.atual && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mês Fim</label>
                    <select value={exp.mesFim} onChange={(e) => handleArrayChange("experiencias", idx, "mesFim", e.target.value)} className="input-field">
                      <option value="">Mês</option>
                      {meses.map(m => <option key={m.valor} value={m.valor}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ano Fim<span className="text-red-500">*</span></label>
                    <input type="number" min="1950" max={new Date().getFullYear() + 5} value={exp.anoFim} onChange={(e) => handleArrayChange("experiencias", idx, "anoFim", e.target.value)} placeholder="Ano" className={`input-field ${errors[`exp_${idx}_anoFim`] ? 'border-red-500' : ''}`} required />
                     {errors[`exp_${idx}_anoFim`] && <p className="text-xs text-red-500 mt-1">{errors[`exp_${idx}_anoFim`]}</p>}
                  </div>
                </>
              )}
              <div className={`flex items-center ${exp.atual ? 'md:col-span-2 justify-start' : 'justify-start'} pt-5`}>
                <input type="checkbox" id={`atual-${idx}`} checked={exp.atual} onChange={(e) => handleArrayChange("experiencias", idx, "atual", e.target.checked, 'checkbox', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor={`atual-${idx}`} className="ml-2 block text-sm text-gray-900">Trabalho Atual</label>
              </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.tecnologias}</label>
                <input type="text" value={exp.tecnologias} onChange={(e) => handleArrayChange("experiencias", idx, "tecnologias", e.target.value)} placeholder={t.placeholders.tecnologias} className="input-field" />
              </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.atividades}</label>
              <textarea value={exp.atividades} onChange={(e) => handleArrayChange("experiencias", idx, "atividades", e.target.value)} placeholder={t.placeholders.atividades} rows={4} className={`input-field ${errors[`exp_${idx}_atividades`] ? 'border-red-500' : ''}`} />
               {errors[`exp_${idx}_atividades`] && <p className="text-xs text-red-500 mt-1">{errors[`exp_${idx}_atividades`]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.resultados}</label>
              <textarea value={exp.resultados} onChange={(e) => handleArrayChange("experiencias", idx, "resultados", e.target.value)} placeholder={t.placeholders.resultados} rows={3} className="input-field" />
            </div>
          </div>
        ))
      )}
      <button type="button" onClick={() => addField('experiencias')} className="text-sm text-blue-600 hover:text-blue-800">{t.botoes.adicionarExperiencia}</button>
    </div>
  );

 const renderEducationFields = () => (
    <div id="formacao" className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">{t.campos.formacao}</h3>
       {formData.formacoes.length === 0 || !formData.formacoes[0]?.curso ? (
        <p className="text-sm text-gray-500">Nenhuma formação adicionada (recomendado adicionar).</p>
      ) : (
        formData.formacoes.map((form, idx) => (
          <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative space-y-4">
             <button type="button" onClick={() => removeField("formacoes", idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500" title="Remover Formação">X</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.tipoFormacao}</label>
                    <select value={form.tipo} onChange={(e) => handleArrayChange("formacoes", idx, "tipo", e.target.value)} className="input-field">
                        {tiposCurso.map(tc => <option key={tc.valor} value={tc.valor}>{tc[`label_${idiomaApp}`] || tc.label}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.curso}<span className="text-red-500">*</span></label>
                    <input type="text" value={form.curso} onChange={(e) => handleArrayChange("formacoes", idx, "curso", e.target.value)} placeholder={t.placeholders.curso} className={`input-field ${errors[`formacao_${idx}_curso`] ? 'border-red-500' : ''}`} required />
                     {errors[`formacao_${idx}_curso`] && <p className="text-xs text-red-500 mt-1">{errors[`formacao_${idx}_curso`]}</p>}
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.instituicao}<span className="text-red-500">*</span></label>
                    <input type="text" value={form.instituicao} onChange={(e) => handleArrayChange("formacoes", idx, "instituicao", e.target.value)} placeholder={t.placeholders.instituicao} className={`input-field ${errors[`formacao_${idx}_instituicao`] ? 'border-red-500' : ''}`} required />
                     {errors[`formacao_${idx}_instituicao`] && <p className="text-xs text-red-500 mt-1">{errors[`formacao_${idx}_instituicao`]}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={form.status} onChange={(e) => handleArrayChange("formacoes", idx, "status", e.target.value)} className="input-field">
                        {statusFormacao.map(sf => <option key={sf.valor} value={sf.valor}>{sf[`label_${idiomaApp}`] || sf.label}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mês Início</label>
                    <select value={form.mesInicio} onChange={(e) => handleArrayChange("formacoes", idx, "mesInicio", e.target.value)} className="input-field">
                        <option value="">Mês</option>
                        {meses.map(m => <option key={m.valor} value={m.valor}>{m.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ano Início<span className="text-red-500">*</span></label>
                    <input type="number" min="1950" max={new Date().getFullYear()} value={form.anoInicio} onChange={(e) => handleArrayChange("formacoes", idx, "anoInicio", e.target.value)} placeholder="Ano" className={`input-field ${errors[`formacao_${idx}_anoInicio`] ? 'border-red-500' : ''}`} required />
                     {errors[`formacao_${idx}_anoInicio`] && <p className="text-xs text-red-500 mt-1">{errors[`formacao_${idx}_anoInicio`]}</p>}
                </div>
                {form.status !== 'andamento' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mês Fim</label>
                            <select value={form.mesFim} onChange={(e) => handleArrayChange("formacoes", idx, "mesFim", e.target.value)} className="input-field">
                                <option value="">Mês</option>
                                {meses.map(m => <option key={m.valor} value={m.valor}>{m.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ano Fim<span className="text-red-500">*</span></label>
                            <input type="number" min="1950" max={new Date().getFullYear() + 10} value={form.anoFim} onChange={(e) => handleArrayChange("formacoes", idx, "anoFim", e.target.value)} placeholder="Ano" className={`input-field ${errors[`formacao_${idx}_anoFim`] ? 'border-red-500' : ''}`} required />
                             {errors[`formacao_${idx}_anoFim`] && <p className="text-xs text-red-500 mt-1">{errors[`formacao_${idx}_anoFim`]}</p>}
                        </div>
                    </>
                )}
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
                <textarea value={form.descricao} onChange={(e) => handleArrayChange("formacoes", idx, "descricao", e.target.value)} placeholder="Ex: Trabalho de conclusão sobre..., Projeto X" rows={2} className="input-field" />
            </div>
          </div>
        ))
      )}
      <button type="button" onClick={() => addField('formacoes')} className="text-sm text-blue-600 hover:text-blue-800">{t.botoes.adicionarFormacao}</button>
    </div>
  );

  const renderHabilidadesField = () => (
    <div id="habilidades" className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">{t.campos.habilidades}</h3>
      <label className="block text-sm font-medium text-gray-700 mb-1">{t.placeholders.habilidades}</label>
      <textarea
        value={habilidadesInput}
        onChange={handleHabilidadesChange}
        placeholder="Ex: JavaScript, React, Node.js, Liderança, Comunicação"
        rows={4}
        className="input-field"
      />
      <p className="text-xs text-gray-500">Separe as habilidades por vírgula. Elas serão listadas no PDF.</p>
    </div>
  );

  const renderIdiomasFields = () => (
    <div id="idiomas" className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">{t.campos.idiomas}</h3>
        {formData.idiomas.length === 0 ? (
            <p className="text-sm text-gray-500">{t.mensagens.nenhumIdioma}</p>
        ) : (
            formData.idiomas.map((idioma, idx) => (
                <div key={idx} className="flex items-center gap-4 p-2 bg-gray-50 rounded border">
                    <input
                        type="text"
                        value={idioma.idioma}
                        onChange={(e) => handleArrayChange('idiomas', idx, 'idioma', e.target.value)}
                        placeholder={t.placeholders.idioma}
                        className="input-field flex-grow"
                    />
                    <select
                        value={idioma.nivel}
                        onChange={(e) => handleArrayChange('idiomas', idx, 'nivel', e.target.value)}
                        className="input-field w-1/3"
                    >
                        <option value="">Nível</option>
                        {t.niveisIdioma.map((nivel, nIdx) => <option key={nIdx} value={nivel}>{nivel}</option>)}
                    </select>
                    <button type="button" onClick={() => removeField('idiomas', idx)} className="text-red-500 hover:text-red-700 p-1">X</button>
                </div>
            ))
        )}
        <button type="button" onClick={() => addField('idiomas')} className="text-sm text-blue-600 hover:text-blue-800">{t.botoes.adicionarIdioma}</button>
    </div>
  );

 const renderCertificacoesFields = () => (
    <div id="certificacoes" className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">{t.campos.certificacoes}</h3>
      {formData.certificacoes.length === 0 ? (
        <p className="text-sm text-gray-500">{t.mensagens.nenhumaCertificacao}</p>
      ) : (
        formData.certificacoes.map((cert, idx) => (
          <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative space-y-4">
            <button type="button" onClick={() => removeField("certificacoes", idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500" title="Remover Certificação">X</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.certificacao}</label>
                <input type="text" value={cert.titulo} onChange={(e) => handleArrayChange("certificacoes", idx, "titulo", e.target.value)} placeholder={t.placeholders.certificacao} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instituição Emissora</label>
                <input type="text" value={cert.emissor} onChange={(e) => handleArrayChange("certificacoes", idx, "emissor", e.target.value)} placeholder="Ex: Coursera, AWS, Google" className="input-field" />
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.dataCertificacao}</label>
                    <input type="text" value={cert.data} onChange={(e) => handleArrayChange("certificacoes", idx, "data", e.target.value)} placeholder="MM/AAAA" className="input-field" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.cargaHoraria}</label>
                    <input type="text" value={cert.cargaHoraria} onChange={(e) => handleArrayChange("certificacoes", idx, "cargaHoraria", e.target.value)} placeholder="Ex: 40" className="input-field" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.linkValidacao}</label>
                    <input type="text" value={cert.linkValidacao} onChange={(e) => handleArrayChange("certificacoes", idx, "linkValidacao", e.target.value)} placeholder={t.placeholders.linkValidacao} className="input-field" />
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.campos.descricaoCertificacao}</label>
              <textarea value={cert.descricao} onChange={(e) => handleArrayChange("certificacoes", idx, "descricao", e.target.value)} placeholder="Descreva brevemente o que foi aprendido ou o escopo" rows={2} className="input-field" />
            </div>
          </div>
        ))
      )}
      <button type="button" onClick={() => addField('certificacoes')} className="text-sm text-blue-600 hover:text-blue-800">{t.botoes.adicionarCertificacao}</button>
    </div>
  );

  // --- Renderização Principal do App ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Cabeçalho */} 
        <div className="p-6 bg-blue-600 text-white">
            <div className="flex justify-between items-center">
                 <h1 className="text-2xl sm:text-3xl font-bold">{t.tituloApp}</h1>
                 <div className="flex items-center space-x-2">
                    <span className="text-sm">Idioma:</span>
                    <select value={idiomaApp} onChange={(e) => setIdiomaApp(e.target.value)} className="bg-blue-700 text-white border border-blue-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white">
                        {idiomasApp.map(lang => (
                            <option key={lang.codigo} value={lang.codigo}>{lang.icone} {lang.nome}</option>
                        ))}
                    </select>
                 </div>
            </div>
          <p className="mt-1 text-blue-100 text-sm sm:text-base">{t.subtituloApp}</p>
        </div>

        {/* Dicas ATS */} 
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-yellow-50">
            <details>
                <summary className="font-semibold text-yellow-800 cursor-pointer hover:text-yellow-900">{t.dicasATS}</summary>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-yellow-700">
                    {t.dicasLista.map((dica, i) => <li key={i}>{dica}</li>)}
                </ul>
            </details>
        </div>

        {/* Mensagem de Dados Carregados */} 
        {showLoadedMessage && (
            <div className="p-3 bg-green-100 text-green-800 text-sm text-center">
                {t.mensagens.carregado}
            </div>
        )}

        {/* Navegação por Seções */} 
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 sticky top-0 bg-white z-10 flex flex-wrap gap-2 justify-center">
            {['info', 'resumo', 'experiencia', 'formacao', 'habilidades', 'idiomas', 'certificacoes'].map(sectionId => (
                <button
                    key={sectionId}
                    onClick={() => setActiveSection(sectionId)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeSection === sectionId ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    {t.campos[sectionId] || sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}
                </button>
            ))}
        </div>

        {/* Formulário Principal */} 
        <form onSubmit={(e) => { e.preventDefault(); gerarPDF(); }} className="p-4 sm:p-8 space-y-8">
          {/* Renderiza a seção ativa */} 
          {activeSection === 'info' && renderInfoPessoalFields()}
          {activeSection === 'resumo' && renderResumoField()}
          {activeSection === 'experiencia' && renderExperienceFields()}
          {activeSection === 'formacao' && renderEducationFields()}
          {activeSection === 'habilidades' && renderHabilidadesField()}
          {activeSection === 'idiomas' && renderIdiomasFields()}
          {activeSection === 'certificacoes' && renderCertificacoesFields()}

          {/* Botão Gerar PDF */} 
          <div className="pt-6 border-t border-gray-200 text-center">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.mensagens.gerando}
                </>
              ) : (
                t.botoes.gerarCV
              )}
            </button>
            {successMessage && (
              <p className="mt-4 text-sm text-green-600 font-medium">{successMessage}</p>
            )}
          </div>
        </form>
      </div>
       {/* Rodapé simples */}
       <footer className="text-center mt-8 text-xs text-gray-500">
           Gerador de Currículo Otimizado para ATS - {new Date().getFullYear()}
       </footer>
    </div>
  );
}

export default App;

// Estilos CSS Globais (para Tailwind)
/* Adicione ao seu arquivo CSS global ou use um <style jsx global> se estiver usando Next.js
@tailwind base;
@tailwind components;
@tailwind utilities;

.input-field {
  @apply w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm;
}
*/

