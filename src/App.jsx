import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import LoadedDataModal from "./ui/modals/LoadedDataModal";
import EmojisWarning from "./ui/modals/EmojisWarning";
import NavBar from "./ui/NavBar";
import Footer from "./ui/Footer";
import ResumeSection from "./ui/sections/ResumeSection";

import {
  idiomasApp,
  textos,
  paisesTelefone,
  tiposCurso,
  sanitizeForATS,
} from "./utils/fields";

function App() {
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    ddd: "",
    codigoPais: "+55",
    cidade: "",
    email: "",
    links: [{ tipo: "linkedin", url: "" }],
    cargoDesejado: "",
    resumo: "",
    experiencias: [],
    formacoes: [
      {
        tipo: "superior",
        curso: "",
        instituicao: "",
        mesInicio: "",
        anoInicio: "",
        mesFim: "",
        anoFim: "",
        emAndamento: false,
        descricao: "",
      },
    ],
    habilidades: [],
    certificacoes: [
      {
        titulo: "",
        emissor: "",
        data: "",
        cargaHoraria: "",
        descricao: "",
        linkValidacao: "",
      },
    ],
    idiomas: [{ idioma: "", nivel: "" }],
  });

  const meses = [
    { valor: "01", label: "Janeiro" },
    { valor: "02", label: "Fevereiro" },
    { valor: "03", label: "Março" },
    { valor: "04", label: "Abril" },
    { valor: "05", label: "Maio" },
    { valor: "06", label: "Junho" },
    { valor: "07", label: "Julho" },
    { valor: "08", label: "Agosto" },
    { valor: "09", label: "Setembro" },
    { valor: "10", label: "Outubro" },
    { valor: "11", label: "Novembro" },
    { valor: "12", label: "Dezembro" },
  ];

  const statusFormacao = [
    { valor: "completo", label: "Completo" },
    { valor: "andamento", label: "Em andamento" },
    { valor: "trancado", label: "Trancado" },
  ];

  const tiposRedesSociais = [
    { valor: "linkedin", label: "LinkedIn", prefixo: "linkedin.com/in/" },
    { valor: "github", label: "GitHub", prefixo: "github.com/" },
    { valor: "gitlab", label: "GitLab", prefixo: "gitlab.com/" },
    { valor: "behance", label: "Behance", prefixo: "behance.net/" },
    { valor: "portfolio", label: "Portfolio", prefixo: "" },
    { valor: "outro", label: "outro", prefixo: "" },
  ];

  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [habilidadesInput, setHabilidadesInput] = useState("");
  const [idiomaApp, setIdiomaApp] = useState("pt");
  const [activeSection, setActiveSection] = useState("info");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGenerationAnimation, setShowGenerationAnimation] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Obter textos traduzidos com base no idioma selecionado
  const t = textos[idiomaApp];

  const validateForm = () => {
    const newErrors = {};
    let firstErrorSection = null;

    // Validação do nome (seção "informações pessoais")
    if (!formData.nome.trim()) {
      newErrors.nome = t.campos.nome.replace("*", "") + " é obrigatório";
      if (!firstErrorSection) firstErrorSection = "info";
    }

    // Validação do email (seção "info")
    if (!formData.email.trim()) {
      newErrors.email = t.campos.email.replace("*", "") + " é obrigatório";
      if (!firstErrorSection) firstErrorSection = "info";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
      if (!firstErrorSection) firstErrorSection = "info";
    }

    // Validação do resumo (seção "resumo")
    if (!formData.resumo.trim()) {
      newErrors.resumo = t.campos.resumo.replace("*", "") + " é obrigatório";
      if (!firstErrorSection) firstErrorSection = "resumo";
    }

    // Removida a validação das formações

    setErrors(newErrors);

    return {
      isValid: Object.keys(newErrors).length === 0,
      firstErrorSection,
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      saveFormDataToLocalStorage(newData);
      return newData;
    });
  };

  const handleArrayChange = (field, index, name, value) => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = { ...newArray[index], [name]: value };
      const newData = { ...prev, [field]: newArray };
      saveFormDataToLocalStorage(newData);
      return newData;
    });
  };

  const addField = (field, initialValue = "") => {
    setFormData((prev) => {
      const newArray = [
        ...prev[field],
        typeof initialValue === "object" ? { ...initialValue } : initialValue,
      ];
      const newData = { ...prev, [field]: newArray };
      saveFormDataToLocalStorage(newData);
      return newData;
    });
  };

  const removeField = (field, index) => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray.splice(index, 1);

      if (field === "certificacoes" && newArray.length === 0) {
        newArray.push({
          titulo: "",
          emissor: "",
          data: "",
          cargaHoraria: "",
          descricao: "",
        });
      }

      const newData = { ...prev, [field]: newArray };
      saveFormDataToLocalStorage(newData);
      return newData;
    });
  };

  const handleHabilidadesChange = (e) => {
    const value = e.target.value;
    setHabilidadesInput(value);

    const habilidadesArray = value
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill);

    setFormData((prev) => ({ ...prev, habilidades: habilidadesArray }));
  };

  const formatarTextoParaPDF = (text, maxWidth, font, fontSize) => {
    if (!text) return [""];

    const paragraphs = text.split("\n");
    let lines = [];

    for (const paragraph of paragraphs) {
      const words = paragraph.split(" ");
      let currentLine = words[0] || "";

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + " " + word;
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

  const saveFormDataToLocalStorage = (data) => {
    try {
      localStorage.setItem("resumeFormData", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save form data", error);
    }
  };

  const gerarPDF = async () => {
    const validation = validateForm();

    if (!validation.isValid) {
      if (validation.firstErrorSection) {
        setActiveSection(validation.firstErrorSection);
        setTimeout(() => {
          const sectionElement = document.getElementById(
            validation.firstErrorSection
          );
          if (sectionElement) {
            sectionElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 100);
      }
      return;
    }

    const formatarMes = (numeroMes, idioma = "pt") => {
      // 'pt' como padrão
      const meses = {
        pt: [
          "Janeiro",
          "Fevereiro",
          "Março",
          "Abril",
          "Maio",
          "Junho",
          "Julho",
          "Agosto",
          "Setembro",
          "Outubro",
          "Novembro",
          "Dezembro",
        ],
        en: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ],
        es: [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ],
      };

      const idiomaValido = meses[idioma] ? idioma : "pt";
      return meses[idiomaValido][parseInt(numeroMes) - 1] || "";
    };

    setIsGenerating(true);
    setShowGenerationAnimation(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setShowPaymentModal(true);

    try {
      // Criar novo documento PDF
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([595, 842]); // Tamanho A4 em pontos (72dpi)
      const { width, height } = page.getSize();

      // Configurações de fonte
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const black = rgb(0, 0, 0);

      // Margens e layout otimizados
      const marginX = 50;
      const marginY = 40; // Margem superior reduzida
      const maxWidth = width - 2 * marginX;
      let y = height - marginY;
      const lineHeight = 12; // Altura de linha reduzida
      const sectionGap = 10; // Espaço entre seções reduzido
      const minY = marginY + 30;

      // Função para desenhar texto com quebra de linha automática (otimizada)
      const drawText = (
        text,
        x,
        y,
        size,
        maxWidth,
        font,
        color,
        lineHeightMultiplier = 1.2
      ) => {
        const lines = formatarTextoParaPDF(text, maxWidth, font, size);
        lines.forEach((line, i) => {
          page.drawText(line, {
            x,
            y: y - i * (size * lineHeightMultiplier),
            size,
            font,
            color,
          });
        });
        return lines.length;
      };

      // Função para verificar se precisa de nova página
      const checkForNewPage = (requiredSpace = lineHeight) => {
        if (y - requiredSpace < minY) {
          const newPage = pdfDoc.addPage([595, 842]);
          y = height - marginY;
          return newPage; // Retorna a nova página
        }
        return page; // Retorna a página atual
      };

      // Função para desenhar título de seção (mais compacta)
      const drawSectionTitle = (title) => {
        const newPage = checkForNewPage(lineHeight * 1.5);
        if (newPage !== page) {
          page = newPage;
        }

        page.drawText(title.toUpperCase(), {
          x: marginX,
          y,
          size: 11, // Tamanho reduzido
          font: boldFont,
          color: black,
        });
        // Linha divisória fina
        page.drawLine({
          start: { x: marginX, y: y - 2 },
          end: { x: marginX + 50, y: y - 2 },
          thickness: 1,
          color: black,
        });
        y -= lineHeight * 1.2;
      };

      // 1. Cabeçalho (Nome e Cargo) - mais compacto
      const nome = sanitizeForATS(formData.nome);
      const cargo = sanitizeForATS(formData.cargoDesejado || "");

      const newPage = checkForNewPage(lineHeight * 2);
      if (newPage !== page) {
        page = newPage;
      }

      page.drawText(nome.toUpperCase(), {
        x: marginX,
        y,
        size: 16, // Tamanho reduzido
        font: boldFont,
        color: black,
      });
      y -= lineHeight * 1.5;

      if (cargo) {
        page.drawText(cargo, {
          x: marginX,
          y,
          size: 12, // Tamanho reduzido
          font,
          color: black,
        });
        y -= lineHeight * 1.2;
      }

      // 2. Informações de Contato (mais compacto)
      const contactInfo = [
        formData.telefone &&
          `${formData.codigoPais} ${formData.ddd} ${formData.telefone}`,
        formData.email,
        formData.cidade,
        ...formData.links
          .filter((link) => link.url)
          .map((link) => {
            const rede = tiposRedesSociais.find((t) => t.valor === link.tipo);
            if (link.tipo === "outro") {
              return link.url; // Mostra apenas a URL para tipo "outro"
            }
            return rede
              ? `${rede.label}: ${rede.prefixo}${link.url}`
              : link.url;
          }),
      ]
        .filter(Boolean)
        .join(" • ");

      const contactLines = drawText(
        sanitizeForATS(contactInfo),
        marginX,
        y,
        9, // Tamanho de fonte menor
        maxWidth,
        font,
        black,
        1.1 // Espaçamento reduzido
      );
      y -= contactLines * (9 * 1.1);
      y -= 8; // Espaço reduzido

      // 3. Resumo Profissional (mais compacto)
      if (formData.resumo) {
        drawSectionTitle(t.secoesPDF.resumo);
        const resumoLines = drawText(
          sanitizeForATS(formData.resumo),
          marginX,
          y,
          10, // Tamanho de fonte menor
          maxWidth,
          font,
          black,
          1.1 // Espaçamento reduzido
        );
        y -= resumoLines * (10 * 1.1);
        y -= sectionGap;
      }

      if (formData.experiencias.length > 0) {
        drawSectionTitle(t.secoesPDF.experiencia);

        formData.experiencias.forEach((exp, idx) => {
          // Formata o período
          const mesInicio = formatarMes(exp.mesInicio);
          const mesFim = formatarMes(exp.mesFim);

          const periodoExp = [
            exp.mesInicio &&
              `${formatarMes(exp.mesInicio, idiomaApp)} ${exp.anoInicio}`,
            exp.atual
              ? idiomaApp === "en"
                ? "Present"
                : idiomaApp === "es"
                ? "Actual"
                : "Atual"
              : exp.mesFim && exp.anoFim
              ? `${formatarMes(exp.mesFim, idiomaApp)} ${exp.anoFim}`
              : "",
          ]
            .filter(Boolean)
            .join(" - ");

          const headerParts = [
            exp.cargo && `${exp.cargo}`,
            exp.empresa && `, ${exp.empresa}`,
            periodoExp && ` (${periodoExp})`,
          ].filter(Boolean);

          const header = headerParts.join("");

          const newPage = checkForNewPage(lineHeight * 1.5);
          if (newPage !== page) {
            page = newPage;
          }

          const headerLines = drawText(
            sanitizeForATS(header),
            marginX,
            y,
            10,
            maxWidth,
            boldFont,
            black,
            1.1
          );
          y -= headerLines * (10 * 1.1);

          // Tecnologias (mantido igual)
          if (exp.tecnologias) {
            const techText = `Tecnologias: ${exp.tecnologias}`;
            const techLines = drawText(
              sanitizeForATS(techText),
              marginX + 10,
              y,
              9,
              maxWidth - 10,
              font,
              black,
              1.1
            );
            y -= techLines * (9 * 1.1);
          }

          // Atividades (mantido igual)
          if (exp.atividades) {
            const atividades = exp.atividades
              .split("\n")
              .filter((a) => a.trim())
              .map((a) => a.trim().replace(/^[-•*]\s*/, ""));

            if (atividades.length > 0) {
              atividades.forEach((atividade) => {
                const newPage = checkForNewPage();
                if (newPage !== page) {
                  page = newPage;
                }

                page.drawText("•", {
                  x: marginX,
                  y: y + 1,
                  size: 9,
                  font,
                  color: black,
                });
                const lines = drawText(
                  sanitizeForATS(atividade),
                  marginX + 8,
                  y,
                  9,
                  maxWidth - 8,
                  font,
                  black,
                  1.1
                );
                y -= lines * (9 * 1.1);
              });
            }
          }

          // Resultados (mantido igual)
          if (exp.resultados) {
            const resultados = exp.resultados
              .split("\n")
              .filter((r) => r.trim())
              .map((r) => r.trim().replace(/^[-•*]\s*/, ""));

            if (resultados.length > 0) {
              resultados.forEach((resultado) => {
                const newPage = checkForNewPage();
                if (newPage !== page) {
                  page = newPage;
                }
                page.drawText("•", {
                  x: marginX,
                  y: y + 1,
                  size: 9,
                  font,
                  color: black,
                });
                const lines = drawText(
                  sanitizeForATS(resultado),
                  marginX + 8,
                  y,
                  9,
                  maxWidth - 8,
                  font,
                  black,
                  1.1
                );
                y -= lines * (9 * 1.1);
              });
            }
          }

          if (idx < formData.experiencias.length - 1) {
            y -= 6;
            const newPage = checkForNewPage();
            if (newPage !== page) {
              page = newPage;
            }
          }
        });
        y -= sectionGap;
      }

      // 5. Formação Acadêmica (compacta)
      if (formData.formacoes.some((f) => f.curso || f.instituicao)) {
        drawSectionTitle(t.secoesPDF.formacao);

        formData.formacoes.forEach((form) => {
          if (form.curso || form.instituicao) {
            const tipoCurso = tiposCurso.find((t) => t.valor === form.tipo);
            let tipoFormacao = tipoCurso?.label || "";

            if (idiomaApp === "en") {
              tipoFormacao = tipoCurso?.label_en || tipoCurso?.label || "";
            } else if (idiomaApp === "es") {
              tipoFormacao = tipoCurso?.label_es || tipoCurso?.label || "";
            }

            const mesInicio = formatarMes(form.mesInicio, idiomaApp);
            const mesFim = formatarMes(form.mesFim, idiomaApp);

            let periodoFormatado = "";
            if (form.status === "andamento") {
              periodoFormatado = `${mesInicio} ${form.anoInicio} - ${
                idiomaApp === "en"
                  ? "Present"
                  : idiomaApp === "es"
                  ? "Actual"
                  : "Presente"
              }`;
            } else if (form.status === "trancado") {
              periodoFormatado = `${mesInicio} ${form.anoInicio} - ${
                idiomaApp === "en"
                  ? "On hold"
                  : idiomaApp === "es"
                  ? "En pausa"
                  : "Trancado"
              }`;
            } else if (form.mesFim && form.anoFim) {
              periodoFormatado = `${mesInicio} ${form.anoInicio} - ${mesFim} ${form.anoFim}`;
            } else {
              periodoFormatado = `${mesInicio} ${form.anoInicio}`;
            }

            // Linha 1: Tipo de formação + curso (se houver)
            const newPage = checkForNewPage();
            if (newPage !== page) {
              page = newPage;
            }
            const linha1 = form.curso
              ? `${tipoFormacao} ${form.curso}`
              : tipoFormacao;
            page.drawText(linha1, {
              x: marginX,
              y,
              size: 10,
              font: boldFont,
              color: black,
            });
            y -= lineHeight * 1.1;

            // Linha 2: Instituição (só se existir)
            if (form.instituicao) {
              const newPage = checkForNewPage();
              if (newPage !== page) {
                page = newPage;
              }
              page.drawText(form.instituicao, {
                x: marginX,
                y,
                size: 9,
                font: font,
                color: black,
              });
              y -= lineHeight * 1.1;
            }

            // Linha 3: Período
            checkForNewPage();
            page.drawText(periodoFormatado, {
              x: marginX,
              y,
              size: 9,
              font: font,
              color: black,
            });
            y -= lineHeight * 1.1;

            // Descrição (se existir)
            if (form.descricao) {
              y -= 4; // Espaço antes da descrição
              const descLines = drawText(
                sanitizeForATS(form.descricao),
                marginX,
                y,
                8, // Tamanho de fonte menor para descrição
                maxWidth,
                font,
                black,
                1.1
              );
              y -= descLines * (8 * 1.1);
            }

            y -= 8; // Espaço entre formações
          }
        });
        y -= sectionGap;
      }

      // 6. Habilidades Técnicas (em colunas)
      if (formData.habilidades.length > 0) {
        drawSectionTitle(t.secoesPDF.habilidades);

        // Remover duplicatas e ordenar
        const uniqueSkills = [
          ...new Set(
            formData.habilidades
              .map((s) => s.trim())
              .filter((s) => s.length > 0)
          ),
        ];

        // Dividir habilidades em 2 colunas para economizar espaço
        const middleIndex = Math.ceil(uniqueSkills.length / 2);
        const column1 = uniqueSkills.slice(0, middleIndex);
        const column2 = uniqueSkills.slice(middleIndex);

        const columnWidth = (maxWidth - 10) / 2; // 10px de espaço entre colunas
        let currentY = y;

        // Desenhar coluna 1
        column1.forEach((skill) => {
          const newPage = checkForNewPage();
          if (newPage !== page) {
            page = newPage;
          }
          page.drawText("•", {
            x: marginX,
            y: currentY + 1,
            size: 9,
            font,
            color: black,
          });
          drawText(
            sanitizeForATS(skill),
            marginX + 8,
            currentY,
            9,
            columnWidth - 8,
            font,
            black,
            1.1
          );
          currentY -= 9 * 1.1;
        });

        // Desenhar coluna 2 (se houver)
        if (column2.length > 0) {
          currentY = y; // Reset para topo
          column2.forEach((skill) => {
            const newPage = checkForNewPage();
            if (newPage !== page) {
              page = newPage;
            }
            page.drawText("•", {
              x: marginX + columnWidth + 10,
              y: currentY + 1,
              size: 9,
              font,
              color: black,
            });
            drawText(
              sanitizeForATS(skill),
              marginX + columnWidth + 18,
              currentY,
              9,
              columnWidth - 8,
              font,
              black,
              1.1
            );
            currentY -= 9 * 1.1;
          });
        }

        y = currentY;
        y -= sectionGap;
      }

      // 7. Idiomas (compacto)
      if (formData.idiomas.some((i) => i.idioma)) {
        drawSectionTitle(t.secoesPDF.idiomas);

        formData.idiomas.forEach((idioma) => {
          if (idioma.idioma) {
            const text = [idioma.idioma, idioma.nivel && `(${idioma.nivel})`]
              .filter(Boolean)
              .join(" ");
            const newPage = checkForNewPage();
            if (newPage !== page) {
              page = newPage;
            }
            page.drawText("•", {
              x: marginX,
              y: y + 1,
              size: 9,
              font,
              color: black,
            });
            const lines = drawText(
              sanitizeForATS(text),
              marginX + 8,
              y,
              9,
              maxWidth - 8,
              font,
              black,
              1.1
            );
            y -= lines * (9 * 1.1);
          }
        });
        y -= sectionGap;
      }

      if (formData.certificacoes.some((c) => c.titulo && c.titulo.trim())) {
        drawSectionTitle(t.secoesPDF.certificacoes);

        formData.certificacoes
          .filter((c) => c.titulo && c.titulo.trim())
          .forEach((cert) => {
            const newPage = checkForNewPage();
            if (newPage !== page) {
              page = newPage;
            }

            // Título e Emissor
            const tituloEmissor = [
              cert.titulo,
              cert.emissor && `(${cert.emissor})`,
            ]
              .filter(Boolean)
              .join(" ");

            page.drawText("•", {
              x: marginX,
              y: y + 1,
              size: 9,
              font,
              color: black,
            });

            const lines1 = drawText(
              sanitizeForATS(tituloEmissor),
              marginX + 8,
              y,
              9,
              maxWidth - 8,
              font,
              black,
              1.1
            );
            y -= lines1 * (9 * 1.1);

            // Data e Carga Horária
            if (cert.data || cert.cargaHoraria) {
              const dataCarga = [
                cert.data,
                cert.cargaHoraria && `- ${cert.cargaHoraria}`,
              ]
                .filter(Boolean)
                .join(" ");

              const lines2 = drawText(
                sanitizeForATS(dataCarga),
                marginX + 8,
                y,
                8,
                maxWidth - 8,
                font,
                rgb(0.3, 0.3, 0.3),
                1.1
              );
              y -= lines2 * (8 * 1.1);
            }

            // Link de validação (se existir)
            if (cert.linkValidacao) {
              const linkText = `Link de validação: ${cert.linkValidacao}`;
              const lines3 = drawText(
                sanitizeForATS(linkText),
                marginX + 8,
                y,
                8,
                maxWidth - 8,
                font,
                rgb(0, 0, 0.8), // Azul mais escuro para links
                1.1
              );
              y -= lines3 * (8 * 1.1);
            }

            // Descrição
            if (cert.descricao) {
              const descLines = drawText(
                sanitizeForATS(cert.descricao),
                marginX + 8,
                y,
                8,
                maxWidth - 8,
                font,
                black,
                1.1
              );
              y -= descLines * (8 * 1.1);
            }

            y -= 4;
          });
      }

      // Gerar e baixar o PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `CV_${formData.nome.replace(/\s+/g, "_")}_ATS.pdf`;
      link.click();

      setSuccessMessage(t.mensagens.sucesso);
      setTimeout(() => setSuccessMessage(""), 10000);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsGenerating(false);
      setShowGenerationAnimation(false);
    }
  };

  const renderExperienceFields = () => {
    return formData.experiencias.map((exp, idx) => (
      <div
        key={idx}
        className="mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-md border border-gray-100 relative"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.campos.cargo}
            </label>
            <input
              type="text"
              value={exp.cargo}
              onChange={(e) =>
                handleArrayChange("experiencias", idx, "cargo", e.target.value)
              }
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.cargo}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.campos.empresa}
            </label>
            <input
              type="text"
              value={exp.empresa}
              onChange={(e) =>
                handleArrayChange(
                  "experiencias",
                  idx,
                  "empresa",
                  e.target.value
                )
              }
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.empresa}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mês Início
            </label>
            <select
              value={exp.mesInicio}
              onChange={(e) =>
                handleArrayChange(
                  "experiencias",
                  idx,
                  "mesInicio",
                  e.target.value
                )
              }
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">Selecione</option>
              {meses.map((mes) => (
                <option key={mes.valor} value={mes.valor}>
                  {mes.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ano Início
            </label>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={exp.anoInicio}
              onChange={(e) =>
                handleArrayChange(
                  "experiencias",
                  idx,
                  "anoInicio",
                  e.target.value
                )
              }
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Ano"
            />
          </div>

          {/* Campos de término - agora condicionais */}
          {!exp.atual && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mês Término
                </label>
                <select
                  value={exp.mesFim}
                  onChange={(e) =>
                    handleArrayChange(
                      "experiencias",
                      idx,
                      "mesFim",
                      e.target.value
                    )
                  }
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Selecione</option>
                  {meses.map((mes) => (
                    <option key={mes.valor} value={mes.valor}>
                      {mes.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ano Término
                </label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={exp.anoFim}
                  onChange={(e) =>
                    handleArrayChange(
                      "experiencias",
                      idx,
                      "anoFim",
                      e.target.value
                    )
                  }
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ano"
                />
              </div>
            </>
          )}

          {/* Checkbox "Atual" estilizado */}
          <div
            className={`flex items-center ${exp.atual ? "md:col-span-2" : ""}`}
          >
            <label className="inline-flex items-center mt-6 cursor-pointer">
              <input
                type="checkbox"
                checked={exp.atual}
                onChange={(e) => {
                  handleArrayChange(
                    "experiencias",
                    idx,
                    "atual",
                    e.target.checked
                  );
                  // Limpa campos de término se marcar como atual
                  if (e.target.checked) {
                    handleArrayChange("experiencias", idx, "mesFim", "");
                    handleArrayChange("experiencias", idx, "anoFim", "");
                  }
                }}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-700">
                Atual
              </span>
            </label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.campos.tecnologias}
            </label>
            <input
              type="text"
              value={exp.tecnologias}
              onChange={(e) =>
                handleArrayChange(
                  "experiencias",
                  idx,
                  "tecnologias",
                  e.target.value
                )
              }
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.tecnologias}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.campos.atividades}
          </label>
          <textarea
            value={exp.atividades}
            onChange={(e) =>
              handleArrayChange(
                "experiencias",
                idx,
                "atividades",
                e.target.value
              )
            }
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            rows={3}
            placeholder={t.placeholders.atividades}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.campos.resultados}
          </label>
          <textarea
            value={exp.resultados}
            onChange={(e) =>
              handleArrayChange(
                "experiencias",
                idx,
                "resultados",
                e.target.value
              )
            }
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    ));
  };

  const renderEducationFields = () => {
    return formData.formacoes.map((form, idx) => (
      <div
        key={idx}
        className="mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-md border border-gray-100 relative"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.campos.tipoFormacao}
            </label>
            <select
              value={form.tipo}
              onChange={(e) =>
                handleArrayChange("formacoes", idx, "tipo", e.target.value)
              }
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              {tiposCurso.map((tipo) => (
                <option key={tipo.valor} value={tipo.valor}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={form.status || "completo"}
              onChange={(e) =>
                handleArrayChange("formacoes", idx, "status", e.target.value)
              }
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              {statusFormacao.map((status) => (
                <option key={status.valor} value={status.valor}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.campos.curso}
            </label>
            <input
              type="text"
              value={form.curso}
              onChange={(e) =>
                handleArrayChange("formacoes", idx, "curso", e.target.value)
              }
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.curso}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.campos.instituicao}
            </label>
            <input
              type="text"
              value={form.instituicao}
              onChange={(e) =>
                handleArrayChange(
                  "formacoes",
                  idx,
                  "instituicao",
                  e.target.value
                )
              }
              className={`w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors[`formacao_instituicao_${idx}`] ? "border-red-500" : ""
              }`}
              placeholder={t.placeholders.instituicao}
            />
            {errors[`formacao_instituicao_${idx}`] && (
              <p className="text-red-500 text-xs mt-2">
                {errors[`formacao_instituicao_${idx}`]}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mês Início
            </label>
            <select
              value={form.mesInicio}
              onChange={(e) =>
                handleArrayChange("formacoes", idx, "mesInicio", e.target.value)
              }
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">Selecione</option>
              {meses.map((mes) => (
                <option key={mes.valor} value={mes.valor}>
                  {mes.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ano Início
            </label>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={form.anoInicio}
              onChange={(e) =>
                handleArrayChange("formacoes", idx, "anoInicio", e.target.value)
              }
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Ano"
            />
          </div>
          {form.status !== "andamento" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mês Término
                </label>
                <select
                  value={form.mesFim}
                  onChange={(e) =>
                    handleArrayChange(
                      "formacoes",
                      idx,
                      "mesFim",
                      e.target.value
                    )
                  }
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Selecione</option>
                  {meses.map((mes) => (
                    <option key={mes.valor} value={mes.valor}>
                      {mes.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ano Término
                </label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={form.anoFim}
                  onChange={(e) =>
                    handleArrayChange(
                      "formacoes",
                      idx,
                      "anoFim",
                      e.target.value
                    )
                  }
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ano"
                />
              </div>
            </>
          )}
        </div>

        {/* Novo campo de descrição adicionado aqui */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição (Opcional)
          </label>
          <textarea
            value={form.descricao}
            onChange={(e) =>
              handleArrayChange("formacoes", idx, "descricao", e.target.value)
            }
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            rows={3}
            placeholder="Ex: TCC sobre inteligência artificial, disciplinas relevantes, projetos acadêmicos..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Adicione detalhes relevantes sobre sua formação
          </p>
        </div>

        {formData.formacoes.length > 1 && (
          <button
            type="button"
            onClick={() => removeField("formacoes", idx)}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-red-500 transition-colors"
            title="Remover formação"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    ));
  };

  const renderCertificationFields = () => {
    return formData.certificacoes.map((cert, idx) => (
      <div
        key={idx}
        className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-md border border-gray-100 relative"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              {t.campos.certificacao}
            </label>
            <input
              type="text"
              value={cert.titulo || ""}
              onChange={(e) =>
                handleArrayChange(
                  "certificacoes",
                  idx,
                  "titulo",
                  e.target.value
                )
              }
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.certificacao}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Emissor/Instituição
            </label>
            <input
              type="text"
              value={cert.emissor || ""}
              onChange={(e) =>
                handleArrayChange(
                  "certificacoes",
                  idx,
                  "emissor",
                  e.target.value
                )
              }
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Ex: Udemy, Alura, AWS"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Data de Conclusão
            </label>
            <input
              type="text"
              value={cert.data || ""}
              onChange={(e) =>
                handleArrayChange("certificacoes", idx, "data", e.target.value)
              }
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Ex: Jun 2023"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Carga Horária
            </label>
            <input
              type="text"
              value={cert.cargaHoraria || ""}
              onChange={(e) =>
                handleArrayChange(
                  "certificacoes",
                  idx,
                  "cargaHoraria",
                  e.target.value
                )
              }
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Ex: 40 horas"
            />
          </div>
        </div>

        {/* Novo campo para link de validação */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Link de Validação
          </label>
          <input
            type="url"
            value={cert.linkValidacao || ""}
            onChange={(e) =>
              handleArrayChange(
                "certificacoes",
                idx,
                "linkValidacao",
                e.target.value
              )
            }
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Ex: https://certificado.instituicao.com/123456"
          />
          <p className="text-xs text-gray-500 mt-1">
            Link para verificar a autenticidade da certificação
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Descrição
          </label>
          <textarea
            value={cert.descricao || ""}
            onChange={(e) =>
              handleArrayChange(
                "certificacoes",
                idx,
                "descricao",
                e.target.value
              )
            }
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            rows={3}
            placeholder="Ex: Curso focado em desenvolvimento de APIs REST com Node.js..."
          />
        </div>

        <button
          type="button"
          onClick={() => removeField("certificacoes", idx)}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-red-500 transition-colors"
          title="Remover certificação"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    ));
  };

  const renderLinkFields = () => {
    return formData.links.map((link, idx) => {
      const redeSocial = tiposRedesSociais.find((t) => t.valor === link.tipo);

      return (
        <div
          key={idx}
          className="mb-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 relative"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Link
              </label>
              <select
                value={link.tipo}
                onChange={(e) =>
                  handleArrayChange("links", idx, "tipo", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {tiposRedesSociais.map((tipo) => (
                  <option key={tipo.valor} value={tipo.valor}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <div className="flex">
                {redeSocial.prefixo && (
                  <span className="inline-flex items-center px-2 rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-sm">
                    {redeSocial.prefixo}
                  </span>
                )}
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) =>
                    handleArrayChange("links", idx, "url", e.target.value)
                  }
                  className={`flex-1 min-w-0 p-2 ${
                    redeSocial.prefixo
                      ? "rounded-none rounded-r-lg"
                      : "rounded-lg"
                  } border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder={`Ex: ${
                    t.placeholders[link.tipo] || "seu-usuario"
                  }`}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => removeField("links", idx)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            title="Remover link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      );
    });
  };

  const renderLanguageFields = () => {
    return formData.idiomas.map((idioma, idx) => (
      <div
        key={idx}
        className="mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-md border border-gray-100 relative"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.campos.idioma}
            </label>
            <input
              type="text"
              value={idioma.idioma}
              onChange={(e) =>
                handleArrayChange("idiomas", idx, "idioma", e.target.value)
              }
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t.placeholders.idioma}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.campos.nivel}
            </label>
            <select
              value={idioma.nivel}
              onChange={(e) =>
                handleArrayChange("idiomas", idx, "nivel", e.target.value)
              }
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">{t.campos.nivel}</option>
              {t.niveisIdioma.map((nivel, i) => (
                <option key={i} value={nivel}>
                  {nivel}
                </option>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
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
              <p className="text-blue-100 mt-1 sm:mt-2 text-sm sm:text-base">
                {t.subtituloApp}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <select
                value={idiomaApp}
                onChange={(e) => setIdiomaApp(e.target.value)}
                className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white transition-all"
              >
                {idiomasApp.map((idioma) => (
                  <option
                    key={idioma.codigo}
                    value={idioma.codigo}
                    className="text-gray-800"
                  >
                    {idioma.icone} {idioma.nome}
                  </option>
                ))}
              </select>

              <button
                onClick={() => gerarPDF()}
                disabled={isGenerating}
                className={`px-4 sm:px-6 py-2 rounded-full text-white font-medium flex items-center justify-center transition-all ${
                  isGenerating
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg"
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-sm sm:text-base">
                      {t.mensagens.gerando}
                    </span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm sm:text-base">
                      {t.botoes.gerarCV}
                    </span>
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Currículo Gerado!
            </h3>
            <p className="text-gray-600 mb-6">
              Seu currículo ATS-friendly está pronto para download.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full animate-progress"
                style={{ animationDuration: "2s" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Barra de navegação */}
      <NavBar
        t={t}
        changeSection={setActiveSection}
        actualSection={activeSection}
      />

      {/* aviso */}
      <EmojisWarning />
      
      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg flex items-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-green-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p>{successMessage}</p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            gerarPDF();
          }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Seção de Informações Pessoais */}
          <div
            id="info"
            className={`space-y-4 sm:space-y-6 ${
              activeSection !== "info" && "hidden"
            }`}
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Informações Pessoais
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  {t.campos.nome}
                </label>
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
                {errors.nome && (
                  <p className="text-red-500 text-xs mt-1 sm:mt-2">
                    {errors.nome}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  {t.campos.cargoDesejado}
                </label>
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

            {/* Telefone com DDD e código do país */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  {t.campos.codigoPais}
                </label>
                <select
                  name="codigoPais"
                  value={formData.codigoPais}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {paisesTelefone.map((pais) => (
                    <option key={pais.codigo} value={pais.codigo}>
                      {pais.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  {t.campos.ddd}
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  {t.campos.telefone}
                </label>
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

            {/* Email e Cidade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  {t.campos.email}
                </label>
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
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 sm:mt-2">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  {t.campos.cidade}
                </label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={t.placeholders.cidade}
                />
              </div>
            </div>

            {/* Links de redes sociais */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Links e Redes Sociais
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    addField("links", { tipo: "linkedin", url: "" })
                  }
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Adicionar Link
                </button>
              </div>

              {formData.links.length > 0 ? (
                renderLinkFields()
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 mx-auto text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">
                    Nenhum link adicionado
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Resumo Profissional */}
          <ResumeSection
            section={activeSection}
            t={t}
            data={formData}
            error={errors}
            handle={handleChange}
          />

          {/* Experiência Profissional */}
          <div
            id="experiencia"
            className={`space-y-4 sm:space-y-6 ${
              activeSection !== "experiencia" && "hidden"
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {t.campos.experiencia}
              </h2>
              <button
                type="button"
                onClick={() =>
                  addField("experiencias", {
                    cargo: "",
                    empresa: "",
                    periodo: "",
                    tecnologias: "",
                    atividades: "",
                    resultados: "",
                  })
                }
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
                {t.botoes.adicionarExperiencia}
              </button>
            </div>

            {formData.experiencias.length > 0 ? (
              renderExperienceFields()
            ) : (
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500">
                  {t.mensagens.nenhumaExperiencia}
                </p>
              </div>
            )}
          </div>

          {/* Formação Acadêmica */}
          <div
            id="formacao"
            className={`space-y-4 sm:space-y-6 ${
              activeSection !== "formacao" && "hidden"
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                  />
                </svg>
                {t.campos.formacao}
              </h2>
              <button
                type="button"
                onClick={() =>
                  addField("formacoes", {
                    tipo: "superior",
                    curso: "",
                    instituicao: "",
                    mesInicio: "",
                    anoInicio: "",
                    mesFim: "",
                    anoFim: "",
                    emAndamento: false,
                    descricao: "", // Novo campo
                  })
                }
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
                {t.botoes.adicionarFormacao}
              </button>
            </div>

            {renderEducationFields()}
          </div>

          {/* Habilidades Técnicas */}
          <div
            id="habilidades"
            className={`space-y-4 sm:space-y-6 ${
              activeSection !== "habilidades" && "hidden"
            }`}
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              {t.campos.habilidades}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                {t.placeholders.habilidades.split(":")[0]}
              </label>
              <input
                type="text"
                value={habilidadesInput}
                onChange={handleHabilidadesChange}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder={t.placeholders.habilidades}
              />
              <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                {t.placeholders.habilidades.split(":")[0]}
              </p>

              {/* Preview das habilidades */}
              {formData.habilidades.length > 0 && (
                <div className="mt-3 sm:mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Pré-visualização:
                  </p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {formData.habilidades.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-800 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Idiomas */}
          <div
            id="idiomas"
            className={`space-y-4 sm:space-y-6 ${
              activeSection !== "idiomas" && "hidden"
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
                {t.campos.idiomas}
              </h2>
              <button
                type="button"
                onClick={() => addField("idiomas", { idioma: "", nivel: "" })}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
                {t.botoes.adicionarIdioma}
              </button>
            </div>

            {formData.idiomas.length > 0 ? (
              renderLanguageFields()
            ) : (
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500">
                  {t.mensagens.nenhumIdioma}
                </p>
              </div>
            )}
          </div>

          {/* Certificações */}
          <div
            id="certificacoes"
            className={`space-y-4 sm:space-y-6 ${
              activeSection !== "certificacoes" && "hidden"
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Certificações/Cursos
              </h2>
              <button
                type="button"
                onClick={() =>
                  addField("certificacoes", {
                    titulo: "",
                    emissor: "",
                    data: "",
                    cargaHoraria: "",
                    descricao: "",
                  })
                }
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
                Adicionar Certificação/Curso
              </button>
            </div>

            {formData.certificacoes.length > 0 ? (
              renderCertificationFields()
            ) : (
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500">
                  Nenhuma certificação ou curso adicionado (opcional)
                </p>
              </div>
            )}
          </div>

          {/* Navegação entre seções */}
          <div className="flex flex-col-reverse sm:flex-row justify-between pt-6 sm:pt-8 border-t border-gray-200 gap-4">
            <button
              type="button"
              onClick={() => {
                const sections = [
                  "info",
                  "resumo",
                  "experiencia",
                  "formacao",
                  "habilidades",
                  "idiomas",
                  "certificacoes",
                ];
                const currentIndex = sections.indexOf(activeSection);
                if (currentIndex > 0) {
                  setActiveSection(sections[currentIndex - 1]);
                }
              }}
              disabled={activeSection === "info"}
              className={`flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors ${
                activeSection === "info"
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Anterior
            </button>

            {activeSection !== "certificacoes" ? (
              <button
                type="button"
                onClick={() => {
                  const sections = [
                    "info",
                    "resumo",
                    "experiencia",
                    "formacao",
                    "habilidades",
                    "idiomas",
                    "certificacoes",
                  ];
                  const currentIndex = sections.indexOf(activeSection);
                  if (currentIndex < sections.length - 1) {
                    setActiveSection(sections[currentIndex + 1]);
                  }
                }}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                Próximo
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => gerarPDF()}
                disabled={isGenerating}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-white font-medium flex items-center justify-center transition-all ${
                  isGenerating
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-sm sm:text-base">
                      {t.mensagens.gerando}
                    </span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm sm:text-base">
                      {t.botoes.gerarCV}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </main>
      {/* engraçado que o projeto é open-souce, eu coloco um qr code pra galera ajudar a hospedar essa bomba e tão pensando q é pra pagar kkkkk pra quem fala que front é facil é pq nunca teve que lidar com cliente, meu amigo... */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPaymentModal(false);
              setShowConfirmationModal(false);
              setShowQRCode(false);
            }
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-2xl animate-[fadeIn_0.3s_ease-out] border border-gray-200 mx-2">
            {/* Botão X */}
            <button
              onClick={() => {
                setShowPaymentModal(false);
                setShowConfirmationModal(false);
                setShowQRCode(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110"
              aria-label="Fechar modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Conteúdo principal */}
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
              2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
              C13.09 3.81 14.76 3 16.5 3 
              19.58 3 22 5.42 22 8.5 
              c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              </div>

              <h3
                id="modal-title"
                className="text-2xl font-bold text-gray-800 mb-2"
              >
                Apoie nosso trabalho
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Gostou do serviço? Considere fazer uma doação para nos ajudar a
                manter e melhorar a plataforma!
              </p>

              {/* Barra de progresso da doação - Textos invertidos */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>R$15,64 doados (ajustado manualmente)</span>
                  <span>Meta: R$40,00</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${(15.64 / 40) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Ajude-nos a alcançar nossa meta para custear o domínio!
                </p>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="space-y-3">
              <button
                onClick={() => setShowConfirmationModal(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Doar
              </button>

              <button
                onClick={() => {
                  window.location.href =
                    "mailto:codegabriel.ti@gmail.com?subject=Problema%20com%20geração%20de%20currículo";
                  setShowPaymentModal(false);
                }}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Reportar um problema
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-[fadeIn_0.3s_ease-out] border border-gray-200 mx-2">
            <button
              onClick={() => setShowConfirmationModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Faça sua doação
              </h3>

              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800 text-center">
                  ⚠️ A contribuição{" "}
                  <span className="font-bold">não é obrigatória</span> para
                  gerar o currículo.
                  <br />
                  Se seu currículo não foi gerado, clique em{" "}
                  <span className="font-semibold">"Reportar um problema"</span>.
                </p>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Sua doação ajuda a manter o serviço gratuito para todos e a
                implementar melhorias.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowConfirmationModal(false);
                  setShowQRCode(true);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg hover:shadow-md transition-all"
              >
                Continuar para doação
              </button>

              <button
                onClick={() => setShowConfirmationModal(false)}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal do QR Code */}
      {showQRCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-[fadeIn_0.3s_ease-out] border border-gray-200 mx-2">
            <button
              onClick={() => setShowQRCode(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="text-center mb-2">
              <h3 className="text-xl font-bold text-gray-800">
                Doação via PIX
              </h3>
              <p className="text-sm text-gray-600">
                Escaneie o QR Code ou copie a chave
              </p>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="p-4 bg-white rounded-xl shadow-lg ring-2 ring-blue-200/50 mb-4">
                <img
                  src="/qrcode.png"
                  alt="QR Code para doação via PIX"
                  className="w-48 h-48 object-contain rounded-lg"
                />
              </div>

              <div
                className="w-full bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4 cursor-pointer hover:bg-blue-100 transition-colors group"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      "80eb8e06-493b-4870-9dfc-47ed230c5d16"
                    );
                    alert("Chave PIX copiada com sucesso!");
                  } catch (err) {
                    console.error("Falha ao copiar:", err);
                    // Fallback para navegadores mais antigos
                    const textArea = document.createElement("textarea");
                    textArea.value = "80eb8e06-493b-4870-9dfc-47ed230c5d16";
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                      document.execCommand("copy");
                      alert("Chave PIX copiada com sucesso!");
                    } catch (err) {
                      alert(
                        "Não foi possível copiar automaticamente. Por favor, copie manualmente."
                      );
                    }
                    document.body.removeChild(textArea);
                  }
                }}
              >
                <p className="text-xs font-medium text-blue-800 mb-1">
                  Chave PIX (clique para copiar):
                </p>
                <div className="flex items-center justify-between bg-white p-2 rounded">
                  <p className="text-xs font-mono text-gray-700 break-all">
                    80eb8e06-493b-4870-9dfc-47ed230c5d16
                  </p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-500 group-hover:text-blue-500 transition-colors"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                    <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                </div>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-lg p-3 w-full">
                <p className="text-xs text-green-800 text-center">
                  Muito obrigado pelo seu apoio! ❤️
                  <br />
                  Sua contribuição nos ajuda a continuar melhorando este
                  projeto.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowQRCode(false)}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
            >
              Voltar
            </button>
          </div>
        </div>
      )}

      {/*toast de dados carregados */}
      <LoadedDataModal setData={setFormData} />


      {/* rodapé */}
      <Footer />
    </div>
  );
}

export default App;