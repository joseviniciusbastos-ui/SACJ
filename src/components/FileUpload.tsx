'use client';

import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
    onFileProcessed: (data: any) => void;
}

export default function FileUpload({ onFileProcessed }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            await processFile(droppedFile);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            await processFile(selectedFile);
        }
    };

    const processFile = async (selectedFile: File) => {
        setError('');

        // Validate file type
        const allowedTypes = ['application/pdf', 'text/xml', 'application/xml'];
        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Apenas arquivos PDF ou XML são permitidos');
            return;
        }

        // Validate file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('O arquivo deve ter no máximo 10MB');
            return;
        }

        setFile(selectedFile);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('/api/parse', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao processar arquivo');
            }

            onFileProcessed(data);
        } catch (err: any) {
            setError(err.message || 'Erro ao processar arquivo');
            setFile(null);
        } finally {
            setUploading(false);
        }
    };

    const removeFile = () => {
        setFile(null);
        setError('');
    };

    return (
        <Card className="p-6">
            {!file ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging
                            ? 'border-slate-400 bg-slate-50'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                >
                    <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <p className="text-lg font-medium text-slate-700 mb-2">
                        Arraste um arquivo PDF ou XML aqui
                    </p>
                    <p className="text-sm text-slate-500 mb-4">
                        ou clique para selecionar
                    </p>
                    <input
                        type="file"
                        accept=".pdf,.xml"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload">
                        <Button asChild className="bg-slate-700 hover:bg-slate-800">
                            <span>Selecionar Arquivo</span>
                        </Button>
                    </label>
                    {error && (
                        <div className="mt-4 text-sm text-red-600">{error}</div>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-slate-600" />
                        <div>
                            <p className="font-medium text-slate-900">{file.name}</p>
                            <p className="text-sm text-slate-500">
                                {(file.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                    </div>
                    {uploading ? (
                        <div className="text-sm text-slate-600">Processando...</div>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                            className="text-slate-600 hover:text-slate-900"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            )}
        </Card>
    );
}
