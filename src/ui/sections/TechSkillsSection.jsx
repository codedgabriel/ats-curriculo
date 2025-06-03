function TechSkillsSection({t, section, input, handle, data}) {
    return (
        <>
            <div
                id="habilidades"
                className={`space-y-4 sm:space-y-6 ${section !== "habilidades" && "hidden"
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
                        value={input}
                        onChange={handle}
                        className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder={t.placeholders.habilidades}
                    />
                    <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                        {t.placeholders.habilidades.split(":")[0]}
                    </p>

                    {/* Preview das habilidades */}
                    {data.habilidades.length > 0 && (
                        <div className="mt-3 sm:mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Pré-visualização:
                            </p>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                                {data.habilidades.map((skill, idx) => (
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
        </>
    )
}

export default TechSkillsSection;