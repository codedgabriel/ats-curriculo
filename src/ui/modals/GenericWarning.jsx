import { useState } from "react";

function GenericWarning({warning}) {
  const [mostrarErro, setMostrarErro] = useState(true);

  return (
    <>
      {mostrarErro && (
        <div className="flex justify-center">
          <div className="bg-yellow-100 border w-fit self-center border-yellow-400 text-yellow-800 px-4 py-3 rounded relative m-4">
            <strong className="font-bold">Atenção:</strong>
            <span className="block sm:inline ml-2">
              {warning}
            </span>

            <button
              onClick={() => setMostrarErro(false)}
              className="ml-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default GenericWarning;
