function PersonalInfoSection({t, section, data, handle, error, phoneCountry, field, renderFields}) {
    return (
        <>
            <div
                id="info"
                className={`space-y-4 sm:space-y-6 ${section !== "info" && "hidden"
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
                            value={data.nome}
                            onChange={handle}
                            className={`w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${error.nome ? "border-red-500" : ""
                                }`}
                            placeholder={t.placeholders.nome}
                        />
                        {error.nome && (
                            <p className="text-red-500 text-xs mt-1 sm:mt-2">
                                {error.nome}
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
                            value={data.cargoDesejado}
                            onChange={handle}
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
                            value={data.codigoPais}
                            onChange={handle}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                            {phoneCountry.map((pais) => (
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
                            value={data.ddd}
                            onChange={handle}
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
                            value={data.telefone}
                            onChange={handle}
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
                            value={data.email}
                            onChange={handle}
                            className={`w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${error.email ? "border-red-500" : ""
                                }`}
                            placeholder={t.placeholders.email}
                        />
                        {error.email && (
                            <p className="text-red-500 text-xs mt-1 sm:mt-2">
                                {error.email}
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
                            value={data.cidade}
                            onChange={handle}
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
                                field("links", { tipo: "linkedin", url: "" })
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

                    {data.links.length > 0 ? (
                        renderFields()
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
        </>
    )
}

export default PersonalInfoSection;