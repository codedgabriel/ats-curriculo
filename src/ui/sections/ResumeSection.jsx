function ResumeSection({section, t, data, error, handle}) {
  return (
    <div
      id="resumo"
      className={`space-y-4 sm:space-y-6 ${
        section !== "resumo" && "hidden"
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {t.campos.resumo}
      </h2>
      <textarea
        name="resumo"
        value={data.resumo}
        onChange={handle}
        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
          error.resumo ? "border-red-500" : ""
        }`}
        rows={5}
        placeholder={t.placeholders.resumo}
      />
      {error.resumo && (
        <p className="text-red-500 text-xs mt-1 sm:mt-2">{error.resumo}</p>
      )}
      <p className="text-xs text-gray-500">
        {t.placeholders.resumo.split(":")[0]}
      </p>
    </div>
  );
}

export default ResumeSection;
