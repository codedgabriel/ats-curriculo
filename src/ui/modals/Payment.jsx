function Payment({paymentModal, paymentModalState, confirmationModalState, QRCodeState}) {
    return (
        <>
            {paymentModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            paymentModalState(false);
                            confirmationModalState(false);
                            QRCodeState(false);
                        }
                    }}
                >
                    <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-2xl animate-[fadeIn_0.3s_ease-out] border border-gray-200 mx-2">
                        {/* Botão X */}
                        <button
                            onClick={() => {
                                paymentModalState(false);
                                confirmationModalState(false);
                                QRCodeState(false);
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
                                onClick={() => confirmationModalState(true)}
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
                                    paymentModalState(false);
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
        </>
    )
}

export default Payment;