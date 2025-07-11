import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

function App() {
  // Opções de idioma para a aplicação
  const idiomasApp = [
    { codigo: "pt", nome: "Português", icone: "🇵🇹" }, // Alterado ícone para Portugal
    { codigo: "en", nome: "English", icone: "🇺🇸" },
    { codigo: "es", nome: "Español", icone: "🇪🇸" },
  ];

  // Textos traduzidos
  const textos = {
    pt: { // Textos adaptados para Português Europeu (PT-PT)
      tituloApp: "Gerador de Currículos",
      subtituloApp: "Crie um currículo profissional em minutos",
      dicasATS: "Dicas para um currículo compatível com ATS",
      dicasLista: [
        "Utilize palavras-chave relevantes para a vaga",
        "Mantenha o formato simples e legível",
        "Inclua métricas e resultados concretos",
        "Destaque as suas principais competências técnicas"
      ],
      campos: {
        nome: "Nome Completo*",
        cargoDesejado: "Cargo Pretendido",
        palavrasChaveVaga: "Palavras-Chave da Vaga (para análise)", // Novo
        codigoPais: "Indicativo do País",
        ddd: "Indicativo (área)",
        telefone: "Telemóvel/Telefone",
        cidade: "Localidade/Cidade",
        linkedin: "LinkedIn",
        portfolio: "Portfólio/GitHub",
        email: "Email*",
        resumo: "Perfil Profissional*",
        experiencia: "Experiência Profissional",
        formacao: "Formação Académica",
        competenciasTecnicas: "Competências Técnicas", // Renomeado de habilidades
        competenciasInterpessoais: "Competências Interpessoais", // Novo
        projetos: "Projetos", // Novo
        idiomas: "Idiomas",
        certificacoes: "Certificações",
        tipoFormacao: "Tipo de Formação",
        curso: "Curso*",
        instituicao: "Instituição*",
        periodo: "Período",
        cargo: "Cargo",
        empresa: "Empresa",
        tecnologias: "Tecnologias utilizadas",
        atividades: "Responsabilidades/Tarefas",
        resultados: "Resultados alcançados (com métricas)",
        idioma: "Idioma",
        nivel: "Nível",
        certificacao: "Certificação",
        // Campos para Projetos
        nomeProjeto: "Nome do Projeto*",
        descricaoProjeto: "Descrição do Projeto",
        tecnologiasProjeto: "Tecnologias Utilizadas no Projeto",
        linkProjeto: "Link do Projeto"
      },
      placeholders: {
        nome: "Ex: Ana Silva",
        cargoDesejado: "Ex: Programador Front-end React",
        palavrasChaveVaga: "Copie e cole aqui palavras-chave da descrição da vaga, separadas por vírgula", // Novo
        ddd: "Ex: 21",
        telefone: "Ex: 912345678",
        cidade: "Ex: Lisboa, Portugal",
        linkedin: "seuperfil",
        portfolio: "Ex: github.com/seunomeutilizador",
        email: "Ex: seuemail@exemplo.pt",
        resumo: "Ex: Programador Front-end com 5 anos de experiência em React e TypeScript...",
        curso: "Ex: Licenciatura em Engenharia Informática",
        instituicao: "Ex: Universidade de Lisboa",
        periodo: "Ex: 2015 - 2019",
        cargo: "Ex: Programador Front-end React",
        empresa: "Ex: Empresa XPTO",
        tecnologias: "Ex: React, TypeScript, Redux, Node.js",
        atividades: "Descreva as suas responsabilidades (1 item por linha)",
        resultados: "Ex: Reduzi o tempo de carregamento em 40% através de...",
        competenciasTecnicas: "Ex: JavaScript, React, Node.js, HTML/CSS, Git, AWS, Docker (separadas por vírgula)", // Renomeado
        competenciasInterpessoais: "Ex: Comunicação, Trabalho em equipa, Resolução de problemas (separadas por vírgula)", // Novo
        idioma: "Ex: Inglês",
        certificacao: "Ex: Certificação AWS Cloud Practitioner",
        // Placeholders para Projetos
        nomeProjeto: "Ex: Website E-commerce Pessoal",
        descricaoProjeto: "Breve descrição do projeto, objetivos e resultados.",
        tecnologiasProjeto: "Ex: React, Node.js, MongoDB",
        linkProjeto: "Ex: github.com/seunome/meu-projeto"
      },
      botoes: {
        adicionarExperiencia: "Adicionar Experiência",
        adicionarFormacao: "Adicionar Formação",
        adicionarCompetenciaInterpessoal: "Adicionar Competência", // Novo (se for campo repetível, senão não precisa)
        adicionarProjeto: "Adicionar Projeto", // Novo
        adicionarIdioma: "Adicionar Idioma",
        adicionarCertificacao: "Adicionar Certificação",
        gerarCV: "Gerar CV em PDF"
      },
      mensagens: {
        nenhumaExperiencia: "Nenhuma experiência adicionada (opcional)",
        nenhumaCompetenciaInterpessoal: "Nenhuma competência interpessoal adicionada (opcional)", // Novo
        nenhumProjeto: "Nenhum projeto adicionado (opcional)", // Novo
        nenhumIdioma: "Nenhum idioma adicionado (opcional)",
        nenhumaCertificacao: "Nenhuma certificação adicionada (opcional)",
        sucesso: "Currículo gerado com sucesso!",
        gerando: "A gerar currículo..."
      },
      secoesPDF: {
        resumo: "PERFIL",
        experiencia: "EXPERIÊNCIA PROFISSIONAL",
        formacao: "FORMAÇÃO ACADÉMICA",
        habilidades: "COMPETÊNCIAS TÉCNICAS", // Renomeado
        competenciasInterpessoais: "COMPETÊNCIAS INTERPESSOAIS", // Nova secção
        projetos: "PROJETOS", // Nova secção
        idiomas: "IDIOMAS",
        certificacoes: "CERTIFICAÇÕES"
      },
      niveisIdioma: [ // Mantidos, são comuns
        "Básico (A1/A2)", "Intermédio (B1/B2)", "Avançado (C1)", "Fluente (C2)", "Nativo"
      ]
    },
    en: {
      tituloApp: "Resume Generator",
      subtituloApp: "Create a professional resume in minutes",
      dicasATS: "Tips for an ATS-friendly resume",
      dicasLista: [
        "Use relevant keywords for the position",
        "Keep the format simple and readable",
        "Include metrics and concrete results",
        "Highlight your main technical skills"
      ],
      campos: {
        nome: "Full Name*",
        cargoDesejado: "Desired Position",
        palavrasChaveVaga: "Job Keywords (for analysis)", // Novo EN
        codigoPais: "Country Code",
        ddd: "Area Code",
        telefone: "Phone",
        cidade: "City",
        linkedin: "LinkedIn",
        portfolio: "Portfolio/GitHub",
        email: "Email*",
        resumo: "Professional Summary*",
        experiencia: "Professional Experience",
        formacao: "Education",
        competenciasTecnicas: "Technical Skills", // Renomeado de habilidades
        competenciasInterpessoais: "Soft Skills", // Novo
        projetos: "Projects", // Novo
        idiomas: "Languages",
        certificacoes: "Certifications",
        tipoFormacao: "Education Level",
        curso: "Course*",
        instituicao: "Institution*",
        periodo: "Period",
        cargo: "Position",
        empresa: "Company",
        tecnologias: "Technologies used",
        atividades: "Responsibilities",
        resultados: "Achievements (with metrics)",
        idioma: "Language",
        nivel: "Level",
        certificacao: "Certification",
        // Campos para Projetos (EN)
        nomeProjeto: "Project Name*",
        descricaoProjeto: "Project Description",
        tecnologiasProjeto: "Technologies Used in Project",
        linkProjeto: "Project Link"
      },
      placeholders: {
        nome: "Ex: John Smith",
        cargoDesejado: "Ex: React Front-end Developer",
        palavrasChaveVaga: "Copy and paste keywords from the job description, comma-separated", // Novo EN
        ddd: "Ex: 212",
        telefone: "Ex: 555-123-4567",
        cidade: "Ex: New York, NY",
        linkedin: "yourprofile",
        portfolio: "Ex: github.com/youruser",
        email: "Ex: your.email@example.com",
        resumo: "Ex: Front-end Developer with 5 years of experience in React and TypeScript...",
        curso: "Ex: Bachelor's in Computer Science",
        instituicao: "Ex: Example University",
        periodo: "Ex: 2015 - 2019",
        cargo: "Ex: React Front-end Developer",
        empresa: "Ex: Google Inc.",
        tecnologias: "Ex: React, TypeScript, Redux, Node.js",
        atividades: "Describe your responsibilities (1 item per line)",
        resultados: "Ex: Reduced loading time by 40% through...",
        competenciasTecnicas: "Ex: JavaScript, React, Node.js, HTML/CSS, Git, AWS, Docker (comma-separated)", // Renomeado
        competenciasInterpessoais: "Ex: Communication, Teamwork, Problem-solving (comma-separated)", // Novo
        idioma: "Ex: English",
        certificacao: "Ex: AWS Cloud Practitioner Certification",
        // Placeholders para Projetos (EN)
        nomeProjeto: "Ex: Personal E-commerce Website",
        descricaoProjeto: "Brief description of the project, goals, and outcomes.",
        tecnologiasProjeto: "Ex: React, Node.js, MongoDB",
        linkProjeto: "Ex: github.com/youruser/your-project"
      },
      botoes: {
        adicionarExperiencia: "Add Experience",
        adicionarFormacao: "Add Education",
        adicionarCompetenciaInterpessoal: "Add Skill", // Novo
        adicionarProjeto: "Add Project", // Novo
        adicionarIdioma: "Add Language",
        adicionarCertificacao: "Add Certification",
        gerarCV: "Generate PDF Resume"
      },
      mensagens: {
        nenhumaExperiencia: "No experience added (optional)",
        nenhumaCompetenciaInterpessoal: "No soft skills added (optional)", // Novo
        nenhumProjeto: "No projects added (optional)", // Novo
        nenhumIdioma: "No languages added (optional)",
        nenhumaCertificacao: "No certifications added (optional)",
        sucesso: "Resume generated successfully!",
        gerando: "Generating Resume..."
      },
      secoesPDF: {
        resumo: "SUMMARY",
        experiencia: "EXPERIENCE",
        formacao: "EDUCATION",
        habilidades: "TECHNICAL SKILLS", // Renomeado (já estava SKILLS, mas para consistência com PT)
        competenciasInterpessoais: "SOFT SKILLS", // Nova secção
        projetos: "PROJECTS", // Nova secção
        idiomas: "LANGUAGES",
        certificacoes: "CERTIFICATIONS"
      },
      niveisIdioma: [
        "Basic (A1/A2)", "Intermediate (B1/B2)", "Advanced (C1)", "Fluent (C2)", "Native" // Alinhado com PT
      ]
    },
    es: {
      tituloApp: "Generador de Currículum",
      subtituloApp: "Crea un currículum profesional en minutos",
      dicasATS: "Consejos para un currículum compatible con ATS",
      dicasLista: [
        "Usa palabras clave relevantes para el puesto",
        "Mantén el formato simple y legible",
        "Incluye métricas y resultados concretos",
        "Destaca tus principales habilidades técnicas"
      ],
      campos: {
        nome: "Nombre Completo*",
        cargoDesejado: "Puesto Deseado",
        palavrasChaveVaga: "Palabras Clave de la Vacante (para análisis)", // Novo ES
        codigoPais: "Código de País",
        ddd: "Código de Área",
        telefone: "Teléfono",
        cidade: "Ciudad",
        linkedin: "LinkedIn",
        portfolio: "Portfolio/GitHub",
        email: "Email*",
        resumo: "Resumen Profesional*",
        experiencia: "Experiencia Profesional",
        formacao: "Formación Académica",
        competenciasTecnicas: "Habilidades Técnicas", // Renomeado
        competenciasInterpessoais: "Habilidades Interpersonales", // Novo
        projetos: "Proyectos", // Novo
        idiomas: "Idiomas",
        certificacoes: "Certificaciones",
        tipoFormacao: "Nivel de Formación",
        curso: "Curso*",
        instituicao: "Institución*",
        periodo: "Período",
        cargo: "Puesto",
        empresa: "Empresa",
        tecnologias: "Tecnologías utilizadas",
        atividades: "Responsabilidades",
        resultados: "Logros (con métricas)",
        idioma: "Idioma",
        nivel: "Nivel",
        certificacao: "Certificación",
        // Campos para Projetos (ES)
        nomeProjeto: "Nombre del Proyecto*",
        descricaoProjeto: "Descripción del Proyecto",
        tecnologiasProjeto: "Tecnologías Utilizadas en el Proyecto",
        linkProjeto: "Enlace del Proyecto"
      },
      placeholders: {
        nome: "Ej: Juan Pérez",
        cargoDesejado: "Ej: Desarrollador Front-end React",
        palavrasChaveVaga: "Copie y pegue aquí palabras clave de la descripción de la vacante, separadas por coma", // Novo ES
        ddd: "Ej: 11",
        telefone: "Ej: 99999-9999",
        cidade: "Ej: Madrid, España",
        linkedin: "tuperfil",
        portfolio: "Ej: github.com/tuusuario",
        email: "Ej: tu.email@ejemplo.com",
        resumo: "Ej: Desarrollador Front-end con 5 años de experiencia en React y TypeScript...",
        curso: "Ej: Licenciatura en Informática",
        instituicao: "Ej: Universidad Ejemplo",
        periodo: "Ej: 2015 - 2019",
        cargo: "Ej: Desarrollador Front-end React",
        empresa: "Ej: Google Inc.",
        tecnologias: "Ej: React, TypeScript, Redux, Node.js",
        atividades: "Describe tus responsabilidades (1 ítem por línea)",
        resultados: "Ej: Reduje el tiempo de carga en 40% mediante...",
        competenciasTecnicas: "Ej: JavaScript, React, Node.js, HTML/CSS, Git, AWS, Docker (separadas por coma)", // Renomeado
        competenciasInterpessoais: "Ej: Comunicación, Trabajo en equipo, Resolución de problemas (separadas por coma)", // Novo
        idioma: "Ej: Inglés",
        certificacao: "Ej: Certificación AWS Cloud Practitioner",
        // Placeholders para Projetos (ES)
        nomeProjeto: "Ej: Sitio Web E-commerce Personal",
        descricaoProjeto: "Breve descripción del proyecto, objetivos y resultados.",
        tecnologiasProjeto: "Ej: React, Node.js, MongoDB",
        linkProjeto: "Ej: github.com/tuusuario/tu-proyecto"
      },
      botoes: {
        adicionarExperiencia: "Añadir Experiencia",
        adicionarFormacao: "Añadir Formación",
        adicionarCompetenciaInterpessoal: "Añadir Habilidad", // Novo
        adicionarProjeto: "Añadir Proyecto", // Novo
        adicionarIdioma: "Añadir Idioma",
        adicionarCertificacao: "Añadir Certificación",
        gerarCV: "Generar CV en PDF"
      },
      mensagens: {
        nenhumaExperiencia: "Ninguna experiencia añadida (opcional)",
        nenhumaCompetenciaInterpessoal: "Ninguna habilidad interpersonal añadida (opcional)", // Novo
        nenhumProjeto: "Ningún proyecto añadido (opcional)", // Novo
        nenhumIdioma: "Ningún idioma añadido (opcional)",
        nenhumaCertificacao: "Ninguna certificación añadida (opcional)",
        sucesso: "¡Currículum generado con éxito!",
        gerando: "Generando Currículum..."
      },
      secoesPDF: {
        resumo: "RESUMEN",
        experiencia: "EXPERIENCIA",
        formacao: "FORMACIÓN",
        habilidades: "HABILIDADES TÉCNICAS", // Renomeado
        competenciasInterpessoais: "HABILIDADES INTERPERSONALES", // Nova secção
        projetos: "PROYECTOS", // Nova secção
        idiomas: "IDIOMAS",
        certificacoes: "CERTIFICACIONES"
      },
      niveisIdioma: [
        "Básico (A1/A2)", "Intermedio (B1/B2)", "Avanzado (C1)", "Fluido (C2)", "Nativo" // Alinhado com PT
      ]
    }
  };



  const paisesTelefone = [
    { codigo: "+351", nome: "Portugal (+351)" },
    { codigo: "+55", nome: "Brasil (+55)" },
    { codigo: "+1", nome: "EUA/Canadá (+1)" },
    { codigo: "+54", nome: "Argentina (+54)" },
    { codigo: "+34", nome: "Espanha (+34)" },
    { codigo: "+49", nome: "Alemanha (+49)" },
    { codigo: "+33", nome: "França (+33)" },
    { codigo: "+44", nome: "Reino Unido (+44)" },
    { codigo: "+39", nome: "Itália (+39)" },
    { codigo: "+61", nome: "Austrália (+61)" }
    // Adicionar mais países europeus se necessário
  ];

  const tiposCurso = [
    { valor: "licenciatura", label: "Licenciatura" }, // Adaptado
    { valor: "mestrado", label: "Mestrado" },
    { valor: "doutoramento", label: "Doutoramento" }, // Adaptado
    { valor: "pos_graduacao", label: "Pós-Graduação" },
    { valor: "ctesp", label: "CTeSP (Curso Técnico Superior Profissional)" }, // Específico de PT
    { valor: "secundario", label: "Ensino Secundário" }, // Adaptado
    { valor: "profissional", label: "Curso Profissional" }, // Comum em PT
    { valor: "tecnico", label: "Curso Técnico" }, // Mantido como genérico
    { valor: "outro", label: "Outro" }
  ];

  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    ddd: "", // Para Portugal, o 'ddd' (indicativo de área) é menos usado separadamente para telemóveis.
             // O número de telemóvel já inclui o prefixo da rede. Para fixos, ainda é relevante.
             // Considerar se este campo deve ser ajustado ou removido para PT. Por agora, mantenho.
    codigoPais: "+351", // Alterado para Portugal como padrão
    cidade: "",
    email: "",
    linkedin: "",
    portfolio: "",
    cargoDesejado: "",
    resumo: "",
    palavrasChaveVaga: "", // Novo campo para análise de palavras-chave
    experiencias: [],
    formacoes: [{ tipo: "licenciatura", curso: "", instituicao: "", periodo: "" }], // Ajustado tipo padrão
    competenciasTecnicas: [], // Renomeado de habilidades
    competenciasInterpessoais: [], // Nova secção
    projetos: [], // Nova secção: array de objetos { nomeProjeto: "", descricaoProjeto: "", tecnologiasProjeto: "", linkProjeto: "" }
    certificacoes: [],
    idiomas: [{ idioma: "", nivel: "" }],
  });

  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [competenciasTecnicasInput, setCompetenciasTecnicasInput] = useState(""); // Renomeado de habilidadesInput
  const [competenciasInterpessoaisInput, setCompetenciasInterpessoaisInput] = useState(""); // Novo input state
  const [idiomaApp, setIdiomaApp] = useState("pt");
  const [activeSection, setActiveSection] = useState("info");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGenerationAnimation, setShowGenerationAnimation] = useState(false);
  const [analiseCV, setAnaliseCV] = useState(null); // Novo estado para resultados da análise

  // Obter textos traduzidos com base no idioma selecionado
  const t = textos[idiomaApp];

  const textosAnalise = { // Textos para as sugestões da análise - PT-PT
    pt: {
      sugestoesTitulo: "Sugestões de Melhoria:",
      // Sugestões específicas virão da função de análise
      erroAnalise: "Não foi possível realizar a análise de momento.",
      pontuacao: "Pontuação do Currículo:",
      // Critérios específicos
      nomeCompleto: "Preencha o seu nome completo.",
      emailValido: "Forneça um endereço de email válido.",
      telemovel: "Adicione o seu número de telemóvel/telefone.",
      perfilProfissionalPresente: "Escreva um perfil profissional conciso e impactante.",
      perfilProfissionalMinPalavras: (min) => `O seu perfil profissional deve ter pelo menos ${min} palavras.`,
      perfilProfissionalMaxPalavras: (max) => `Tente resumir o seu perfil profissional para menos de ${max} palavras para maior impacto.`,
      experienciaPresente: "Adicione pelo menos uma experiência profissional relevante.",
      formacaoPresente: "Inclua a sua formação académica.",
      cargoNoPerfil: "Considere mencionar o seu 'Cargo Pretendido' ou palavras relacionadas no seu Perfil Profissional.",
      resultadosQuantificados: "Tente quantificar os seus resultados na Experiência Profissional usando números (ex: 'Aumentei as vendas em 20%').",
      linkedinPreenchido: "Adicione um link para o seu perfil LinkedIn.",
      competenciasTecnicas: "Liste as suas competências técnicas.",
      competenciasInterpessoais: "Adicione algumas competências interpessoais (soft skills).",
      projetos: "Considere adicionar projetos relevantes, especialmente se tiver pouca experiência profissional.",
      idiomas: "Se fala outros idiomas, adicione-os ao seu currículo.",
      certificacoes: "Possui certificações? Adicione-as para valorizar o seu perfil.",
      palavrasChaveVagaInfo: "Preencheu o campo 'Palavras-Chave da Vaga'. A análise tentará encontrá-las no seu CV.",
      palavrasChaveAusentes: (palavras) => `Considere incluir termos relevantes para a vaga como: ${palavras.join(', ')}.`,
      palavrasChaveEncontradas: (num, total) => `Encontrámos ${num} de ${total} palavras-chave da vaga no seu CV. Bom trabalho!`
    },
    // Adicionar EN e ES depois, se necessário para completar a funcionalidade de i18n da análise
  };
  const ta = textosAnalise[idiomaApp] || textosAnalise.pt;


  const validateForm = () => {
  const newErrors = {};
  let firstErrorSection = null;
  
  // Validação do nome (seção "info")
  if (!formData.nome.trim()) {
    newErrors.nome = t.campos.nome.replace("*", "") + " é de preenchimento obrigatório"; // Adaptado
    if (!firstErrorSection) firstErrorSection = "info";
  }
  
  // Validação do email (seção "info")
  if (!formData.email.trim()) {
    newErrors.email = t.campos.email.replace("*", "") + " é de preenchimento obrigatório"; // Adaptado
    if (!firstErrorSection) firstErrorSection = "info";
  } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
    newErrors.email = "Email inválido";
    if (!firstErrorSection) firstErrorSection = "info";
  }
  
  // Validação do resumo (seção "resumo")
  if (!formData.resumo.trim()) {
    newErrors.resumo = t.campos.resumo.replace("*", "") + " é de preenchimento obrigatório"; // Adaptado
    if (!firstErrorSection) firstErrorSection = "resumo";
  }
  
  // Validação das formações (seção "formacao")
  formData.formacoes.forEach((form, idx) => {
    if (!form.curso.trim()) {
      newErrors[`formacao_curso_${idx}`] = t.campos.curso.replace("*", "") + " é de preenchimento obrigatório"; // Adaptado
      if (!firstErrorSection) firstErrorSection = "formacao";
    }
    if (!form.instituicao.trim()) {
      newErrors[`formacao_instituicao_${idx}`] = t.campos.instituicao.replace("*", "") + " é de preenchimento obrigatório"; // Adaptado para consistência
      if (!firstErrorSection) firstErrorSection = "formacao";
    }
  });
  
  setErrors(newErrors);
  
  return {
    isValid: Object.keys(newErrors).length === 0,
    firstErrorSection
  };
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, index, name, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = { ...newArray[index], [name]: value };
      return { ...prev, [field]: newArray };
    });
  };

  const addField = (field, initialValue = "") => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], typeof initialValue === "object" ? { ...initialValue } : initialValue]
    }));
  };

  const removeField = (field, index) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const handleCompetenciasTecnicasChange = (e) => { // Renomeada
    const value = e.target.value;
    setCompetenciasTecnicasInput(value);

    const competenciasArray = value.split(",")
      .map(skill => skill.trim())
      .filter(skill => skill);

    setFormData(prev => ({ ...prev, competenciasTecnicas: competenciasArray }));
  };

  const handleCompetenciasInterpessoaisChange = (e) => { // Nova função
    const value = e.target.value;
    setCompetenciasInterpessoaisInput(value);

    const competenciasArray = value.split(",")
      .map(skill => skill.trim())
      .filter(skill => skill);

    setFormData(prev => ({ ...prev, competenciasInterpessoais: competenciasArray }));
  };

  const formatarTextoParaPDF = (text, maxWidth, font, fontSize) => {
  const paragraphs = text.split('\n');
  let lines = [];
  
  for (const paragraph of paragraphs) {
    const words = paragraph.split(' ');
    let currentLine = words[0] || '';
    
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + ' ' + word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      
      if (width < maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  
  return lines;
};




 const gerarPDF = async (fromModal = false) => {
  const validation = validateForm();
  
  if (!validation.isValid) {
    if (validation.firstErrorSection) {
      setActiveSection(validation.firstErrorSection);
      setTimeout(() => {
        const sectionElement = document.getElementById(validation.firstErrorSection);
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
    return;
  }
  
  if (!fromModal) {
    // Mostra a animação primeiro
    setShowGenerationAnimation(true);
    
    // Espera 2 segundos para a animação terminar
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Gera o PDF
    setIsGenerating(true);
    try {
  
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // Tamanho A4 em pontos
    const { width, height } = page.getSize();

    // Configurações de fonte e cores
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const black = rgb(0, 0, 0);

    // Margens e layout
    const marginX = 50;
    const marginY = 50;
    const maxWidth = width - 2 * marginX;
    let y = height - marginY;
    const lineHeight = 14;
    const sectionGap = 16;
    const minY = marginY + 50;

    // Função para verificar nova página
    const checkForNewPage = (requiredSpace = lineHeight) => {
      if (y - requiredSpace < minY) {
        page = pdfDoc.addPage([595, 842]);
        y = height - marginY;
        return true;
      }
      return false;
    };

    // Funções auxiliares de desenho
    const drawTitle = (text, size = 16) => {
      checkForNewPage(size + 8);
      page.drawText(text.toUpperCase(), {
        x: marginX,
        y,
        size,
        font: boldFont,
        color: black,
        lineHeight: size * 1.2
      });
      y -= size + 8;
    };

    const drawSectionHeader = (text, size = 12) => {
      checkForNewPage(size + 6);
      page.drawText(text.toUpperCase(), {
        x: marginX,
        y,
        size,
        font: boldFont,
        color: black,
        lineHeight: size * 1.2
      });
      y -= size + 6;
    };

    const drawText = (text, indent = 0, size = 11) => {
      const lines = Array.isArray(text) ? text : [text || ''];
      lines.forEach(line => {
        if (line.trim()) {
          const formattedLines = formatarTextoParaPDF(line, maxWidth - indent, font, size);
          formattedLines.forEach(formattedLine => {
            checkForNewPage(lineHeight);
            page.drawText(formattedLine, {
              x: marginX + indent,
              y,
              size,
              font,
              color: black,
              lineHeight: size * 1.4
            });
            y -= lineHeight;
          });
        }
      });
    };

    const drawBullet = (text, indent = 15, size = 11) => {
      checkForNewPage(lineHeight);
      page.drawText("•", {
        x: marginX,
        y: y + 4,
        size: size + 2,
        font,
        color: black,
      });
      drawText(text, indent, size);
    };

    const drawDivider = () => {
      checkForNewPage(sectionGap);
      y -= sectionGap/2;
    };

    // Cabeçalho do currículo
    drawTitle(formData.nome, 18);
    
    if (formData.cargoDesejado) {
      drawSectionHeader(formData.cargoDesejado, 14);
      y -= 4;
    }

    // Informações de contato
    const contactInfo = [
      formData.telefone && `${formData.codigoPais} ${formData.ddd} ${formData.telefone}`,
      formData.email,
      formData.linkedin && `linkedin.com/in/${formData.linkedin}`,
      formData.portfolio && (formData.portfolio.includes('github.com') ? 
                           `github.com/${formData.portfolio.split('github.com/').pop()}` : 
                           formData.portfolio),
      formData.cidade
    ].filter(Boolean).join(" | ");

    drawText(contactInfo, 0, 10);
    drawDivider();

    // Seção de Resumo
    if (formData.resumo) {
      drawSectionHeader(t.secoesPDF.resumo);
      drawText(formData.resumo);
      drawDivider();
    }

    // Seção de Experiência Profissional
    if (formData.experiencias.length > 0) {
      drawSectionHeader(t.secoesPDF.experiencia);
      
      formData.experiencias.forEach((exp, index) => {
        if (exp.cargo || exp.empresa) {
          const header = [
            exp.cargo,
            exp.empresa && ` - ${exp.empresa}`,
            exp.periodo && ` (${exp.periodo})`
          ].filter(Boolean).join("");
          drawText(header, 0, 12);
          if (exp.tecnologias) {
            drawText(`${t.campos.tecnologias}: ${exp.tecnologias}`, 0, 10);
            y -= 6;
          }
          if (exp.atividades) {
            drawText(`${t.campos.atividades}:`, 0, 11);
            exp.atividades.split('\n')
              .filter(a => a.trim())
              .forEach(atividade => {
                drawBullet(atividade.trim().replace(/^[-•*]\s*/, ''));
              });
            y -= 6;
          }
          if (exp.resultados) {
            drawText(`${t.campos.resultados}:`, 0, 11);
            exp.resultados.split('\n')
              .filter(r => r.trim())
              .forEach(resultado => {
                drawBullet(resultado.trim().replace(/^[-•*]\s*/, ''));
              });
          }
          if (index < formData.experiencias.length - 1) {
            y -= 12;
            drawDivider();
          }
        }
      });
      drawDivider();
    }

    // Seção de Formação Acadêmica
    if (formData.formacoes.some(f => f.curso || f.instituicao)) {
      drawSectionHeader(t.secoesPDF.formacao);
      formData.formacoes.forEach(form => {
        if (form.curso || form.instituicao) {
          const tipoCursoLabel = tiposCurso.find(tc => tc.valor === form.tipo)?.label || '';
          const title = [
            tipoCursoLabel && `${tipoCursoLabel} -`,
            form.curso,
            form.instituicao && `- ${form.instituicao}`,
            form.periodo && `(${form.periodo})`
          ].filter(Boolean).join(" ");
          drawBullet(title);
        }
      });
      drawDivider();
    }

    // Seção de Competências Técnicas (antiga Habilidades)
    if (formData.competenciasTecnicas.length > 0) {
      drawSectionHeader(t.secoesPDF.habilidades); // Mantém a chave antiga para secoesPDF por enquanto, será atualizada depois se necessário
      const uniqueSkills = [...new Set(formData.competenciasTecnicas
        .map(s => s.trim())
        .filter(s => s.length > 0))];
      uniqueSkills.forEach(skill => {
        drawBullet(skill);
      });
      drawDivider();
    }

    // Seção de Competências Interpessoais
    if (formData.competenciasInterpessoais.length > 0) {
      drawSectionHeader(t.secoesPDF.competenciasInterpessoais);
      const uniqueSoftSkills = [...new Set(formData.competenciasInterpessoais
        .map(s => s.trim())
        .filter(s => s.length > 0))];
      uniqueSoftSkills.forEach(skill => {
        drawBullet(skill);
      });
      drawDivider();
    }

    // Seção de Projetos
    if (formData.projetos.length > 0) {
      drawSectionHeader(t.secoesPDF.projetos);
      formData.projetos.forEach((proj, index) => {
        if (proj.nomeProjeto) {
          let projectHeader = proj.nomeProjeto;
          if (proj.linkProjeto) {
             // Test if link is valid before adding
            try {
                new URL(proj.linkProjeto.startsWith('http') ? proj.linkProjeto : `https://${proj.linkProjeto}`);
                projectHeader += ` - [${proj.linkProjeto.replace(/^https?:\/\//, '')}]`;
            } catch (_) {
                // não adicionar link inválido
            }
          }
          drawText(projectHeader, 0, 12);

          if (proj.descricaoProjeto) {
            drawText(proj.descricaoProjeto, 5, 10);
            y -= 4;
          }
          if (proj.tecnologiasProjeto) {
            drawText(`${t.campos.tecnologiasProjeto}: ${proj.tecnologiasProjeto}`, 5, 10);
            y -= 6;
          }
          if (index < formData.projetos.length - 1) {
            y -= 10;
            drawDivider();
          }
        }
      });
      drawDivider();
    }

    // Seção de Idiomas
    if (formData.idiomas.some(i => i.idioma)) {
      drawSectionHeader(t.secoesPDF.idiomas);
      formData.idiomas.forEach(idioma => {
        if (idioma.idioma) {
          const text = [
            idioma.idioma,
            idioma.nivel && `(${idioma.nivel})`
          ].filter(Boolean).join(" ");
          drawBullet(text);
        }
      });
      drawDivider();
    }

    // Seção de Certificações
    if (formData.certificacoes.length > 0) {
      drawSectionHeader(t.secoesPDF.certificacoes);
      formData.certificacoes
        .filter(c => c.trim())
        .forEach(cert => {
          drawBullet(cert);
        });
      // Não colocar drawDivider() aqui se for a última secção visível
    }

    // Gerar e baixar o PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `CV_${formData.nome.replace(/\s+/g, '_')}_ATS.pdf`;
    link.click();
    
    setSuccessMessage(t.mensagens.sucesso);
    setTimeout(() => setSuccessMessage(""), 3000);
  
    setShowPaymentModal(true);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsGenerating(false);
      setShowGenerationAnimation(false);
    }
  }
};











  const renderExperienceFields = () => {
    return formData.experiencias.map((exp, idx) => (
      <div key={idx} className="mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-md border border-gray-100 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.cargo}</label>
            <input
              type="text"
              value={exp.cargo}
              onChange={(e) => handleArrayChange("experiencias", idx, "cargo", e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.cargo}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.empresa}</label>
            <input
              type="text"
              value={exp.empresa}
              onChange={(e) => handleArrayChange("experiencias", idx, "empresa", e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.empresa}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.periodo}</label>
            <input
              type="text"
              value={exp.periodo}
              onChange={(e) => handleArrayChange("experiencias", idx, "periodo", e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.periodo}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.tecnologias}</label>
            <input
              type="text"
              value={exp.tecnologias}
              onChange={(e) => handleArrayChange("experiencias", idx, "tecnologias", e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.tecnologias}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.atividades}</label>
          <textarea
            value={exp.atividades}
            onChange={(e) => handleArrayChange("experiencias", idx, "atividades", e.target.value)}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            rows={3}
            placeholder={t.placeholders.atividades}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.resultados}</label>
          <textarea
            value={exp.resultados}
            onChange={(e) => handleArrayChange("experiencias", idx, "resultados", e.target.value)}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            rows={3}
            placeholder={t.placeholders.resultados}
          />
        </div>
        
        <button
          type="button"
          onClick={() => removeField("experiencias", idx)}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-red-500 transition-colors"
          title="Remover experiência"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    ));
  };

  const renderEducationFields = () => {
    return formData.formacoes.map((form, idx) => (
      <div key={idx} className="mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-md border border-gray-100 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.tipoFormacao}</label>
            <select
              value={form.tipo}
              onChange={(e) => handleArrayChange("formacoes", idx, "tipo", e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              {tiposCurso.map(tipo => (
                <option key={tipo.valor} value={tipo.valor}>{tipo.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.curso}</label>
            <input
              type="text"
              value={form.curso}
              onChange={(e) => handleArrayChange("formacoes", idx, "curso", e.target.value)}
              className={`w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors[`formacao_curso_${idx}`] ? "border-red-500" : ""
              }`}
              placeholder={t.placeholders.curso}
            />
            {errors[`formacao_curso_${idx}`] && (
              <p className="text-red-500 text-xs mt-2">{errors[`formacao_curso_${idx}`]}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.instituicao}</label>
            <input
              type="text"
              value={form.instituicao}
              onChange={(e) => handleArrayChange("formacoes", idx, "instituicao", e.target.value)}
              className={`w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors[`formacao_instituicao_${idx}`] ? "border-red-500" : ""
              }`}
              placeholder={t.placeholders.instituicao}
            />
            {errors[`formacao_instituicao_${idx}`] && (
              <p className="text-red-500 text-xs mt-2">{errors[`formacao_instituicao_${idx}`]}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.periodo}</label>
            <input
              type="text"
              value={form.periodo}
              onChange={(e) => handleArrayChange("formacoes", idx, "periodo", e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.periodo}
            />
          </div>
        </div>
        
        {formData.formacoes.length > 1 && (
          <button
            type="button"
            onClick={() => removeField("formacoes", idx)}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-red-500 transition-colors"
            title="Remover formação"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    ));
  };

  const renderLanguageFields = () => {
    return formData.idiomas.map((idioma, idx) => (
      <div key={idx} className="mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-md border border-gray-100 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.idioma}</label>
            <input
              type="text"
              value={idioma.idioma}
              onChange={(e) => handleArrayChange("idiomas", idx, "idioma", e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.idioma}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.nivel}</label>
            <select
              value={idioma.nivel}
              onChange={(e) => handleArrayChange("idiomas", idx, "nivel", e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">{t.campos.nivel}</option>
              {t.niveisIdioma.map((nivel, i) => (
                <option key={i} value={nivel}>{nivel}</option>
              ))}
            </select>
          </div>
        </div>

        {formData.idiomas.length > 1 && (
          <button
            type="button"
            onClick={() => removeField("idiomas", idx)}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-red-500 transition-colors"
            title="Remover idioma"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    ));
  };

  const renderCompetenciasInterpessoaisFields = () => { // Nova função de renderização
    return (
      <div className="mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-md border border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.placeholders.competenciasInterpessoais.split(":")[0]}</label>
          <input
            type="text"
            value={competenciasInterpessoaisInput}
            onChange={handleCompetenciasInterpessoaisChange}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder={t.placeholders.competenciasInterpessoais}
          />
          <p className="text-xs text-gray-500 mt-1 sm:mt-2">{t.placeholders.competenciasInterpessoais.split(":")[0] + " (separadas por vírgula)"}</p>

          {formData.competenciasInterpessoais.length > 0 && (
            <div className="mt-3 sm:mt-4">
              <p className="text-sm font-medium text-gray-700 mb-1 sm:mb-2">Pré-visualização:</p>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {formData.competenciasInterpessoais.map((skill, idx) => (
                  <span key={idx} className="bg-green-100 text-green-800 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProjetosFields = () => { // Nova função de renderização
    return formData.projetos.map((proj, idx) => (
      <div key={idx} className="mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-md border border-gray-100 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.nomeProjeto}</label>
            <input
              type="text"
              value={proj.nomeProjeto}
              onChange={(e) => handleArrayChange("projetos", idx, "nomeProjeto", e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.nomeProjeto}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.linkProjeto}</label>
            <input
              type="text"
              value={proj.linkProjeto}
              onChange={(e) => handleArrayChange("projetos", idx, "linkProjeto", e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.linkProjeto}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.tecnologiasProjeto}</label>
          <input
            type="text"
            value={proj.tecnologiasProjeto}
            onChange={(e) => handleArrayChange("projetos", idx, "tecnologiasProjeto", e.target.value)}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder={t.placeholders.tecnologiasProjeto}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.campos.descricaoProjeto}</label>
          <textarea
            value={proj.descricaoProjeto}
            onChange={(e) => handleArrayChange("projetos", idx, "descricaoProjeto", e.target.value)}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            rows={3}
            placeholder={t.placeholders.descricaoProjeto}
          />
        </div>

        <button
          type="button"
          onClick={() => removeField("projetos", idx)}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-red-500 transition-colors"
          title="Remover Projeto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    ));
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header moderno */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{t.tituloApp}</h1>
              <p className="text-blue-100 mt-1 sm:mt-2 text-sm sm:text-base">{t.subtituloApp}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <select
                value={idiomaApp}
                onChange={(e) => {
                  setIdiomaApp(e.target.value);
                  setAnaliseCV(null); // Limpar análise ao mudar idioma
                }}
                className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white transition-all"
              >
                {idiomasApp.map((idioma) => (
                  <option key={idioma.codigo} value={idioma.codigo} className="text-gray-800">
                    {idioma.icone} {idioma.nome}
                  </option>
                ))}
              </select>

              <button
                onClick={analisarCurriculo} // Botão para análise
                className="px-4 sm:px-6 py-2 rounded-full text-white font-medium flex items-center justify-center transition-all bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Analisar CV
              </button>
              
              <button
                onClick={() => gerarPDF()}
                disabled={isGenerating}
                className={`px-4 sm:px-6 py-2 rounded-full text-white font-medium flex items-center justify-center transition-all ${
                  isGenerating ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg"
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm sm:text-base">{t.mensagens.gerando}</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm sm:text-base">{t.botoes.gerarCV}</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          
        </div>
      </header>


                  {showGenerationAnimation && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white p-8 rounded-xl max-w-md text-center animate-pop-in">
      <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-green-100 rounded-full">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-12 w-12 text-green-500 animate-checkmark"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">Currículo Gerado!</h3>
      <p className="text-gray-600 mb-6">Seu currículo ATS-friendly está pronto para download.</p>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full animate-progress" 
          style={{ animationDuration: '2s' }}
        ></div>
      </div>
    </div>
  </div>
)}


      {/* Navegação por seções */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 overflow-x-auto">
          <div className="flex">
            {[
              { id: "info", label: t.campos.nome.split("*")[0] },
              { id: "resumo", label: t.campos.resumo.split("*")[0] },
              { id: "experiencia", label: t.campos.experiencia },
              { id: "formacao", label: t.campos.formacao },
              { id: "competenciasTecnicas", label: t.campos.competenciasTecnicas }, // Atualizado
              { id: "competenciasInterpessoais", label: t.campos.competenciasInterpessoais }, // Novo
              { id: "projetos", label: t.campos.projetos }, // Novo
              { id: "idiomas", label: t.campos.idiomas },
              { id: "certificacoes", label: t.campos.certificacoes }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-3 py-3 font-medium text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeSection === section.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg flex items-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>{successMessage}</p>
          </div>
        )}

        {analiseCV && (
          <div className={`p-4 sm:p-6 rounded-lg mb-6 border-l-4 ${analiseCV.pontuacao >= 75 ? 'bg-green-50 border-green-500' : analiseCV.pontuacao >= 50 ? 'bg-yellow-50 border-yellow-500' : 'bg-red-50 border-red-500'}`}>
            <h3 className={`text-lg font-semibold ${analiseCV.pontuacao >= 75 ? 'text-green-700' : analiseCV.pontuacao >= 50 ? 'text-yellow-700' : 'text-red-700'}`}>
              {ta.pontuacao} {analiseCV.pontuacao}/100
            </h3>
            {analiseCV.sugestoes.length > 0 && (
              <div className="mt-3">
                <p className={`font-medium ${analiseCV.pontuacao >= 75 ? 'text-green-600' : analiseCV.pontuacao >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{ta.sugestoesTitulo}</p>
                <ul className="list-disc list-inside mt-1 text-sm">
                  {analiseCV.sugestoes.map((sugestao, index) => (
                    <li key={index} className={`${analiseCV.pontuacao >= 75 ? 'text-green-600' : analiseCV.pontuacao >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {sugestao}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={(e) => { e.preventDefault(); gerarPDF(); }} className="space-y-6 sm:space-y-8">
          {/* Seção de Informações Pessoais */}
          <div id="info" className={`space-y-4 sm:space-y-6 ${activeSection !== "info" && "hidden"}`}>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t.campos.nome.split("*")[0]}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.nome}</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className={`w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.nome ? "border-red-500" : ""
                  }`}
                  placeholder={t.placeholders.nome}
                />
                {errors.nome && <p className="text-red-500 text-xs mt-1 sm:mt-2">{errors.nome}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.cargoDesejado}</label>
                <input
                  type="text"
                  name="cargoDesejado"
                  value={formData.cargoDesejado}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={t.placeholders.cargoDesejado}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.palavrasChaveVaga}</label>
              <textarea
                name="palavrasChaveVaga"
                value={formData.palavrasChaveVaga}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                rows={3}
                placeholder={t.placeholders.palavrasChaveVaga}
              />
              <p className="text-xs text-gray-500 mt-1">Útil para a funcionalidade "Analisar CV". Separe por vírgulas.</p>
            </div>
            
            {/* Telefone com DDD e código do país */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.codigoPais}</label>
                <select
                  name="codigoPais"
                  value={formData.codigoPais}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {paisesTelefone.map(pais => (
                    <option key={pais.codigo} value={pais.codigo}>{pais.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.ddd}</label>
                <input
                  type="text"
                  name="ddd"
                  value={formData.ddd}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={t.placeholders.ddd}
                  maxLength="2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.telefone}</label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={t.placeholders.telefone}
                />
              </div>
            </div>
            
            {/* Cidade, LinkedIn e Portfolio */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.cidade}</label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={t.placeholders.cidade}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.linkedin}</label>
                <div className="flex">
                  <span className="inline-flex items-center px-2 sm:px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-xs sm:text-sm">
                    linkedin.com/in/
                  </span>
                  <input
                    type="text"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="flex-1 min-w-0 block w-full p-2 sm:p-3 rounded-none rounded-r-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder={t.placeholders.linkedin}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.portfolio}</label>
                <input
                  type="text"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={t.placeholders.portfolio}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.email}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.email ? "border-red-500" : ""
                }`}
                placeholder={t.placeholders.email}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 sm:mt-2">{errors.email}</p>}
            </div>
          </div>
          
          {/* Resumo Profissional */}
          <div id="resumo" className={`space-y-4 sm:space-y-6 ${activeSection !== "resumo" && "hidden"}`}>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t.campos.resumo}
            </h2>
            <textarea
              name="resumo"
              value={formData.resumo}
              onChange={handleChange}
              className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.resumo ? "border-red-500" : ""
              }`}
              rows={5}
              placeholder={t.placeholders.resumo}
            />
            {errors.resumo && <p className="text-red-500 text-xs mt-1 sm:mt-2">{errors.resumo}</p>}
            <p className="text-xs text-gray-500">{t.placeholders.resumo.split(":")[0]}</p>
          </div>
          
          {/* Experiência Profissional */}
          <div id="experiencia" className={`space-y-4 sm:space-y-6 ${activeSection !== "experiencia" && "hidden"}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t.campos.experiencia}
              </h2>
              <button
                type="button"
                onClick={() => addField("experiencias", { cargo: "", empresa: "", periodo: "", tecnologias: "", atividades: "", resultados: "" })}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                {t.botoes.adicionarExperiencia}
              </button>
            </div>
            
            {formData.experiencias.length > 0 ? (
              renderExperienceFields()
            ) : (
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">{t.mensagens.nenhumaExperiencia}</p>
              </div>
            )}
          </div>
          
          {/* Formação Acadêmica */}
          <div id="formacao" className={`space-y-4 sm:space-y-6 ${activeSection !== "formacao" && "hidden"}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                {t.campos.formacao}
              </h2>
              <button
                type="button"
                onClick={() => addField("formacoes", { tipo: "superior", curso: "", instituicao: "", periodo: "" })}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                {t.botoes.adicionarFormacao}
              </button>
            </div>
            
            {renderEducationFields()}
          </div>
          
          {/* Competências Técnicas */}
          <div id="competenciasTecnicas" className={`space-y-4 sm:space-y-6 ${activeSection !== "competenciasTecnicas" && "hidden"}`}>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {t.campos.competenciasTecnicas}
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.placeholders.competenciasTecnicas.split(":")[0]}</label>
              <input
                type="text"
                value={competenciasTecnicasInput}
                onChange={handleCompetenciasTecnicasChange}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder={t.placeholders.competenciasTecnicas}
              />
              <p className="text-xs text-gray-500 mt-1 sm:mt-2">{t.placeholders.competenciasTecnicas.split(":")[0] + " (separadas por vírgula)"}</p>
              
              {formData.competenciasTecnicas.length > 0 && (
                <div className="mt-3 sm:mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-1 sm:mb-2">Pré-visualização:</p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {formData.competenciasTecnicas.map((skill, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Competências Interpessoais */}
          <div id="competenciasInterpessoais" className={`space-y-4 sm:space-y-6 ${activeSection !== "competenciasInterpessoais" && "hidden"}`}>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {t.campos.competenciasInterpessoais}
            </h2>
            {renderCompetenciasInterpessoaisFields()}
          </div>

          {/* Projetos */}
          <div id="projetos" className={`space-y-4 sm:space-y-6 ${activeSection !== "projetos" && "hidden"}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.372 3.414-1.414 3.414H4.828c-1.786 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                {t.campos.projetos}
              </h2>
              <button
                type="button"
                onClick={() => addField("projetos", { nomeProjeto: "", descricaoProjeto: "", tecnologiasProjeto: "", linkProjeto: "" })}
                className="flex items-center bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                {t.botoes.adicionarProjeto}
              </button>
            </div>

            {formData.projetos.length > 0 ? (
              renderProjetosFields()
            ) : (
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">{t.mensagens.nenhumProjeto}</p>
              </div>
            )}
          </div>
          
          {/* Idiomas */}
          <div id="idiomas" className={`space-y-4 sm:space-y-6 ${activeSection !== "idiomas" && "hidden"}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {t.campos.idiomas}
              </h2>
              <button
                type="button"
                onClick={() => addField("idiomas", { idioma: "", nivel: "" })}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                {t.botoes.adicionarIdioma}
              </button>
            </div>
            
            {formData.idiomas.length > 0 ? (
              renderLanguageFields()
            ) : (
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">{t.mensagens.nenhumIdioma}</p>
              </div>
            )}
          </div>
          
          {/* Certificações */}
          <div id="certificacoes" className={`space-y-4 sm:space-y-6 ${activeSection !== "certificacoes" && "hidden"}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>            {t.campos.certificacoes}
          </h2>
          <button
            type="button"
            onClick={() => addField("certificacoes", "")}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            {t.botoes.adicionarCertificacao}
          </button>
        </div>

        {formData.certificacoes.length > 0 ? (
          formData.certificacoes.map((cert, idx) => (
            <div key={idx} className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-md border border-gray-100 relative">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">{t.campos.certificacao}</label>
                <input
                  type="text"
                  value={cert}
                  onChange={(e) => {
                    const newCerts = [...formData.certificacoes];
                    newCerts[idx] = e.target.value;
                    setFormData(prev => ({ ...prev, certificacoes: newCerts }));
                  }}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={t.placeholders.certificacao}
                />
              </div>
              
              <button
                type="button"
                onClick={() => removeField("certificacoes", idx)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-red-500 transition-colors"
                title="Remover certificação"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">{t.mensagens.nenhumaCertificacao}</p>
          </div>
        )}
      </div>

      {/* Navegação entre seções */}
      <div className="flex flex-col-reverse sm:flex-row justify-between pt-6 sm:pt-8 border-t border-gray-200 gap-4">
        <button
          type="button"
          onClick={() => {
            const sections = ["info", "resumo", "experiencia", "formacao", "competenciasTecnicas", "competenciasInterpessoais", "projetos", "idiomas", "certificacoes"];
            const currentIndex = sections.indexOf(activeSection);
            if (currentIndex > 0) {
              setActiveSection(sections[currentIndex - 1]);
            }
          }}
          disabled={activeSection === "info"}
          className={`flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors ${
            activeSection === "info" ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Anterior
</button>
            
            {activeSection !== "certificacoes" ? (
              <button
                type="button"
                onClick={() => {
                  const sections = ["info", "resumo", "experiencia", "formacao", "competenciasTecnicas", "competenciasInterpessoais", "projetos", "idiomas", "certificacoes"];
                  const currentIndex = sections.indexOf(activeSection);
                  if (currentIndex < sections.length - 1) {
                    setActiveSection(sections[currentIndex + 1]);
                  }
                }}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                Seguinte {/* Adaptado */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => gerarPDF()}
                disabled={isGenerating}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-white font-medium flex items-center justify-center transition-all ${
                  isGenerating ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm sm:text-base">{t.mensagens.gerando}</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm sm:text-base">{t.botoes.gerarCV}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </main>

      

      {/* Modal de Doação */}
      {showPaymentModal && (
        
        
        <div
  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  onClick={(e) => {
    // Fecha se clicar fora do modal
    if (e.target === e.currentTarget) setShowPaymentModal(false);
  }}
>
  <div className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl animate-fade-in-scale">
    
    {/* Botão X */}
    <button
      onClick={() => setShowPaymentModal(false)}
      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
      aria-label="Fechar modal"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    {/* Título */}
    <h3 id="modal-title" className="text-2xl font-extrabold text-gray-800 text-center mb-2">
      Ajude a manter este projeto ativo! {/* Adaptado */}
    </h3>
    <p className="text-sm text-gray-500 text-center mb-6">
      O seu apoio faz toda a diferença. Obrigado por fazer parte disto! {/* Adaptado */}
    </p>

    {/* QR Code com pulse animado */}
    <div className="flex justify-center mb-6">
      <div className="relative">
        <div className="absolute inset-0 rounded-lg animate-pulse-ring" />
        <img
          src="/qrcode.png"
          alt="QR Code para doação"
          className="w-44 h-44 object-contain rounded-lg shadow-md relative z-10"
        />
      </div>
    </div>

    {/* Mensagem de incentivo */}
    <p className="text-gray-600 text-center text-sm mb-4">
      Se este website lhe foi útil, considere contribuir com uma pequena doação. A sua ajuda suporta os custos de alojamento (e um café!). {/* Adaptado */}
    </p>

    <div className="flex flex-col sm:flex-row gap-3 mt-6">
      
      <button
  onClick={() => {
    navigator.clipboard.writeText("80eb8e06-493b-4870-9dfc-47ed230c5d16"); // Manter o ID ou substituir por IBAN/outro link no futuro
    alert("Copiado! A sua ajuda faz a diferença 🙌"); // Adaptado
  }}
  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center"
>
  Copiar dados para doação {/* Adaptado e generalizado */}
</button>

    </div>
  </div>
</div>



      )}

  {/* Footer */}
  <footer className="bg-white border-t border-gray-200 py-6 sm:py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-3 sm:space-x-4 mb-4 md:mb-0">
          <a 
            href="https://github.com/codedgabriel/ats-curriculo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="GitHub do projeto"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>
          <a 
            href="https://linkedin.com/in/codegabriel" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-600 transition-colors"
            aria-label="LinkedIn do autor"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
        </div>
        <p className="text-xs sm:text-sm text-gray-500">
          Criado por <span className="font-medium text-gray-700">D. Gabriel</span> - {new Date().getFullYear()}
        </p>
      </div>
    </div>
  </footer>
</div>

);
}

export default App;