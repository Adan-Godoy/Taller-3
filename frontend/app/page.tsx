'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

interface FileRecord {
  _id: string;
  originalName: string;
  mimeType: string;
  createdAt: string;
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [recentFiles, setRecentFiles] = useState<FileRecord[]>([]);
  const [uploading, setUploading] = useState(false);

  // Obtener archivos recientes desde el Backend
  const fetchRecentFiles = async () => {
    try {
      const response = await axios.get('http://localhost:3000/files/recent');
      setRecentFiles(response.data);
    } catch (error) {
      console.error('Error obteniendo archivos recientes:', error);
    }
  };

  useEffect(() => {
    fetchRecentFiles();
  }, []);

  // Configuración de react-dropzone para múltiples archivos
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true, 
  });

  const handleClearSelection = () => {
    setFiles([]);
  };

  // Subir todos los archivos seleccionados uno por uno
  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        await axios.post('http://localhost:3000/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setFiles([]); 
      fetchRecentFiles(); 
      alert('¡Todos los archivos se cargaron exitosamente!');
    } catch (error) {
      console.error('Error al subir los archivos:', error);
      alert('Hubo un error al subir uno o más archivos.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Mi Drive Clone</h1>

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 border border-gray-100">
        
        {/* Columna Izquierda: Carga de Documentos */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Carga de documentos</h2>
              {files.length > 0 && (
                <button 
                  onClick={handleClearSelection}
                  className="text-xs text-red-500 hover:underline font-medium"
                >
                  Limpiar selección
                </button>
              )}
            </div>
            
            {/* Zona de Drop */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors h-64 overflow-y-auto
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}
            >
              <input {...getInputProps()} />
              {files.length > 0 ? (
                <div className="w-full text-left space-y-2 px-2">
                  <p className="text-xs font-semibold text-gray-400 mb-1">Archivos listos para subir ({files.length}):</p>
                  {files.map((f, idx) => (
                    <div key={idx} className="bg-blue-50 border border-blue-200 rounded p-2 flex justify-between items-center">
                      <p className="text-xs text-blue-700 font-medium truncate max-w-[180px]">{f.name}</p>
                      <p className="text-[10px] text-gray-400">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p className="font-medium">Arrastra y suelta tus archivos aquí</p>
                  <p className="text-sm mt-1">O haz clic para seleccionarlos</p>
                  <p className="text-xs text-gray-400 mt-2">(Soporta documentos, imágenes o videos en lote)</p>
                </div>
              )}
            </div>
          </div>

          {/* Botón Cargar */}
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className={`mt-6 w-full py-3 px-4 rounded-lg font-medium text-white transition-all
              ${files.length === 0 || uploading 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}
          >
            {uploading ? 'Cargando archivos...' : 'Btn Cargar'}
          </button>
        </div>

        {/* Columna Derecha: Sección de archivos recientes */}
        <div className="border-l border-gray-200 pl-0 md:pl-12 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Sección de archivos recientes</h2>
          
          <div className="flex-1 flex flex-col justify-start space-y-4">
            {recentFiles.length === 0 ? (
              <p className="text-gray-400 italic text-center py-12">No hay archivos cargados recientemente.</p>
            ) : (
              recentFiles.map((item) => (
                <div 
                  key={item._id} 
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
                >
                  <div className="truncate pr-4">
                    <p className="font-medium text-gray-800 truncate max-w-[180px] md:max-w-[220px]" title={item.originalName}>
                      {item.originalName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <a
                    href={`http://localhost:3000/files/download/${item._id}`}
                    download
                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors shrink-0"
                  >
                    Descargar
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}