function CertificationsSection({section, field, data, renderFields }) {
    return (
        <>
            <div
                id="certificacoes"
                className={`space-y-4 sm:space-y-6 ${section !== "certificacoes" && "hidden"
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
                            field("certificacoes", {
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

                {data.certificacoes.length > 0 ? (
                    renderFields()
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
        </>
    )
}

export default CertificationsSection;