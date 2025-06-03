function Navigation({setSection, section, click, generatedState, t,}) {
    return (
        <>
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
                        const currentIndex = sections.indexOf(section);
                        if (currentIndex > 0) {
                            setSection(sections[currentIndex - 1]);
                        }
                    }}
                    disabled={section === "info"}
                    className={`flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors ${section === "info"
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

                {section !== "certificacoes" ? (
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
                            const currentIndex = sections.indexOf(section);
                            if (currentIndex < sections.length - 1) {
                                setSection(sections[currentIndex + 1]);
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
                        onClick={() => click()}
                        disabled={generatedState}
                        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-white font-medium flex items-center justify-center transition-all ${generatedState
                            ? "bg-gray-500 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                            }`}
                    >
                        {generatedState ? (
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

        </>
    )
}

export default Navigation;