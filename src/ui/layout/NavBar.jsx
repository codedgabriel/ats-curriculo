function NavBar({t, changeSection, actualSection}) {
  return (
    <div className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 overflow-x-auto">
        <div className="flex">
          {[
            { id: "info", label: t.campos.nome.split("*")[0] },
            { id: "resumo", label: t.campos.resumo.split("*")[0] },
            { id: "experiencia", label: t.campos.experiencia },
            { id: "formacao", label: t.campos.formacao },
            { id: "habilidades", label: t.campos.habilidades },
            { id: "idiomas", label: t.campos.idiomas },
            { id: "certificacoes", label: t.campos.certificacoes },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => changeSection(section.id)}
              className={`px-3 py-3 font-medium text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors ${
                actualSection === section.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NavBar;
