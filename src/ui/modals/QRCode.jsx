import { useState } from "react";

function QRCode({active, setActive}) {


    return (
        <>

            {active && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-[fadeIn_0.3s_ease-out] border border-gray-200 mx-2">
                        <button
                            onClick={() => setActive(false)}
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
                            onClick={() => setActive(false)}
                            className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default QRCode;