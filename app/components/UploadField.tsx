"use client";

import * as React from "react";
import { cn } from "@/app/utils/cn";
import { Upload, X } from "lucide-react";
import { Button } from "./ui/Button";

interface UploadFieldProps {
    value: string;
    onChange: (base64: string, file: File | null) => void;
    label?: string;
    error?: string;
}

export function UploadField({ value, onChange, label, error }: UploadFieldProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            onChange(reader.result as string, file);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full space-y-2">
            {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}

            {value ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                    <img src={value} alt="Preview" className="h-full w-full object-cover" />
                    <Button
                        size="icon"
                        variant="danger"
                        className="absolute right-2 top-2 h-8 w-8 rounded-full"
                        onClick={() => onChange("", null)}
                        type="button"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div
                    className={cn(
                        "relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100",
                        isDragging && "border-blue-500 bg-blue-50",
                        error && "border-red-500 bg-red-50"
                    )}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <div className="flex flex-col items-center justify-center space-y-2 pb-6 pt-5 text-center">
                        <div className="rounded-full bg-gray-100 p-3 mb-2">
                            <Upload className="h-6 w-6 text-gray-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                            Clique para fazer upload ou arraste e solte
                        </p>
                        <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                    </div>
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleChange}
                    />
                </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
