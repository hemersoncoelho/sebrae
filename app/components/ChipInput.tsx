"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

interface ChipInputProps {
    values: string[];
    onChange: (values: string[]) => void;
    label?: string;
    placeholder?: string;
    error?: string;
}

export function ChipInput({ values, onChange, label, placeholder, error }: ChipInputProps) {
    const [inputValue, setInputValue] = React.useState("");

    const handleAdd = () => {
        if (inputValue.trim()) {
            onChange([...values, inputValue.trim()]);
            setInputValue("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        }
    };

    const handleRemove = (index: number) => {
        onChange(values.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full space-y-2">
            {label && <label className="text-sm font-medium leading-none">{label}</label>}
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1"
                />
                <Button type="button" onClick={handleAdd} size="icon" variant="secondary">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {values.map((value, index) => (
                    <Badge key={index} variant="secondary" className="pr-1">
                        {value}
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            className="ml-1 rounded-full p-0.5 hover:bg-gray-200 text-gray-500 hover:text-gray-900"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
