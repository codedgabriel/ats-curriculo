function ConfirmPayment({confirmationModalState, setConfirmationModalState, setQRCodeState}) {
    return (
        <>
            {confirmationModalState && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-[fadeIn_0.3s_ease-out] border border-gray-200 mx-2">
                        <button
                            onClick={() => setConfirmationModalState(false)}
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
                                    setConfirmationModalState(false);
                                    setQRCodeState(true);
                                }}
                                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg hover:shadow-md transition-all"
                            >
                                Continuar para doação
                            </button>

                            <button
                                onClick={() => setConfirmationModalState(false)}
                                className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                            >
                                Voltar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ConfirmPayment;