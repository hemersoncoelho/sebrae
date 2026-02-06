"use client";

import React from "react";
import { Brain } from "lucide-react";

export function BrainLoader() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="relative flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20 duration-1000"></div>
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-black/5">
                        <Brain className="h-10 w-10 animate-pulse text-blue-600" />
                    </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <h3 className="text-lg font-semibold text-gray-900">Gerando Matéria...</h3>
                    <p className="text-sm text-gray-500 animate-pulse">A inteligência artificial está trabalhando</p>
                </div>
            </div>
        </div>
    );
}
