"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { getSettings, saveSettings, SettingsData } from "@/app/utils/settings";

export default function SettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = React.useState<SettingsData>({
        organizers: [],
        eixos: [],
        projetos: []
    });
    
    // Form state for new items
    const [newItem, setNewItem] = React.useState({
        organizer: "",
        eixo: "",
        projeto: ""
    });

    React.useEffect(() => {
        setSettings(getSettings());
    }, []);

    const handleSave = () => {
        saveSettings(settings);
    };

    const handleAddItem = (type: keyof SettingsData, itemKey: keyof typeof newItem) => {
        const val = newItem[itemKey].trim();
        if (!val) return;
        
        if (!settings[type].includes(val)) {
            setSettings(prev => ({
                ...prev,
                [type]: [...prev[type], val]
            }));
        }
        
        setNewItem(prev => ({ ...prev, [itemKey]: "" }));
    };

    const handleRemoveItem = (type: keyof SettingsData, valueToRemove: string) => {
        setSettings(prev => ({
            ...prev,
            [type]: prev[type].filter(item => item !== valueToRemove)
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent, type: keyof SettingsData, itemKey: keyof typeof newItem) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddItem(type, itemKey);
        }
    };

    const renderList = (type: keyof SettingsData, itemKey: keyof typeof newItem, title: string, placeholder: string) => (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder={placeholder}
                        value={newItem[itemKey]}
                        onChange={(e) => setNewItem({ ...newItem, [itemKey]: e.target.value })}
                        onKeyDown={(e) => handleKeyDown(e, type, itemKey)}
                    />
                    <Button variant="outline" onClick={() => handleAddItem(type, itemKey)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                    {settings[type].map(item => (
                        <div key={item} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm text-gray-700">
                            <span>{item}</span>
                            <button
                                onClick={() => handleRemoveItem(type, item)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    {settings[type].length === 0 && (
                        <p className="text-sm text-gray-500 italic">Nenhum item cadastrado.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Configurações</h1>
                            <p className="text-xs text-gray-500">Gerenciar opções do sistema</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto mt-8 max-w-3xl px-4 space-y-6">
                {renderList("eixos", "eixo", "Eixos", "Adicionar novo eixo...")}
                {renderList("projetos", "projeto", "Projetos", "Adicionar novo projeto...")}
                {renderList("organizers", "organizer", "Analistas", "Adicionar novo analista...")}

                <div className="flex justify-end pt-4">
                    <Button
                        variant="primary"
                        onClick={() => {
                            handleSave();
                            router.back();
                        }}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Configurações
                    </Button>
                </div>
            </main>
        </div>
    );
}
