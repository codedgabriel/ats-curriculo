import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import GenericWarning from "./ui/modals/GenericWarning";

// componentes de UI
import NavBar from "./ui/layout/NavBar";
import Footer from "./ui/layout/Footer";
import ResumeSection from "./ui/sections/ResumeSection";
import Navigation from './ui/layout/Navigation'

// componentes modal
import QRCode from "./ui/modals/QRCode";
import Payment from "./ui/modals/Payment";
import ConfirmPayment from "./ui/modals/ConfirmPayment";
import LoadedDataModal from "./ui/modals/LoadedDataModal";
import Sucess from "./ui/modals/Sucess";

// componentes de seções
import LanguagesSection from "./ui/sections/LanguagesSection";
import CertificationsSection from "./ui/sections/CertificationsSections";
import ExperiencesSection from "./ui/sections/ExperiencesSection";
import PersonalInfoSection from "./ui/sections/PersonalInfoSection";
import EducationSection from "./ui/sections/EducationSection";

// campos utilizadas no preenchimento
import {
  idiomasApp,
  textos,
  paisesTelefone,
  tiposCurso,
  sanitizeForATS,
  curriculumFields,
  meses,
  statusFormacao,
  tiposRedesSociais
} from "./utils/fields";
import TechSkillsSection from "./ui/sections/TechSkillsSection";

function App() {
  const [formData, setFormData] = useState(curriculumFields);
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
          ;
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
              periodoFormatado = `${mesInicio} ${form.anoInicio} - ${idiomaApp === "en"
                ? "Present"
                : idiomaApp === "es"
                  ? "Actual"
                  : "Presente"
                }`;
            } else if (form.status === "trancado") {
              periodoFormatado = `${mesInicio} ${form.anoInicio} - ${idiomaApp === "en"
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
              className={`w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors[`formacao_instituicao_${idx}`] ? "border-red-500" : ""
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
                  className={`flex-1 min-w-0 p-2 ${redeSocial.prefixo
                    ? "rounded-none rounded-r-lg"
                    : "rounded-lg"
                    } border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder={`Ex: ${t.placeholders[link.tipo] || "seu-usuario"
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
                className={`px-4 sm:px-6 py-2 rounded-full text-white font-medium flex items-center justify-center transition-all ${isGenerating
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
      <GenericWarning
        warning="Estamos melhorando a geração de conteúdo 
      com emojis e alguns caracteres especiais. 
      Por enquanto, evite usá-los para garantir o funcionamento."
      />

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Sucess
          message={successMessage}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            gerarPDF();
          }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Seção de Informações Pessoais */}
          <PersonalInfoSection
            t={t}
            section={activeSection}
            data={formData}
            handle={handleChange}
            error={errors}
            phoneCountry={paisesTelefone}
            field={addField}
            renderFields={renderLinkFields}
          />

          {/* Resumo Profissional */}
          <ResumeSection
            section={activeSection}
            t={t}
            data={formData}
            error={errors}
            handle={handleChange}
          />

          {/* Experiência Profissional */}
          <ExperiencesSection
            t={t}
            section={activeSection}
            field={addField}
            data={formData}
            renderFields={renderExperienceFields}
          />

          {/* Formação Acadêmica */}
          <EducationSection
          t={t}
          section={activeSection}
          field={addField}
          renderFields={renderEducationFields}
          />

          {/* Habilidades Técnicas */}
          <TechSkillsSection
          t={t}
          section={activeSection}
          input={habilidadesInput}
          handle={handleHabilidadesChange}
          data={formData}
          />

          {/* Idiomas */}
          <LanguagesSection
            section={activeSection}
            t={t}
            field={addField}
            data={formData}
            renderFields={renderLanguageFields}
          />

          {/* Certificações */}
          <CertificationsSection
            section={activeSection}
            field={addField}
            data={formData}
            renderFields={renderCertificationFields}
          />

          {/* Navegação entre seções */}
          <Navigation
          setSection={setActiveSection}
          section={activeSection}
          click={gerarPDF}
          generatedState={isGenerating}
          t={t}
          />
        </form>
      </main>

      {/* engraçado que o projeto é open-souce, eu coloco um qr code pra galera ajudar a hospedar essa bomba e tão pensando q é pra pagar kkkkk pra quem fala que front é facil é pq nunca teve que lidar com cliente, meu amigo... */}
      <Payment
      paymentModal={showPaymentModal}
      paymentModalState={setShowPaymentModal}
      confirmationModalState={setShowConfirmationModal}
      QRCodeState={setShowQRCode}
      />

      {/* Modal de Confirmação */}
      <ConfirmPayment
        confirmationModalState={showConfirmationModal}
        setConfirmationModalState={setShowConfirmationModal}
        setQRCodeState={setShowQRCode}
      />

      {/* Modal do QR Code */}
      <QRCode
        active={showQRCode}
        setActive={setShowQRCode}
      />

      {/*toast de dados carregados */}
      <LoadedDataModal setData={setFormData} />

      {/* rodapé */}
      <Footer />
    </div>
  );
}

export default App;