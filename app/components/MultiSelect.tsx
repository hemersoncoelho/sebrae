"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/app/utils/cn";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

interface MultiSelectProps {
    options: string[];
    values: string[];
    onChange: (values: string[]) => void;
    label?: string;
    placeholder?: string;
    className?: string;
}

export function MultiSelect({
    options,
    values,
    onChange,
    label,
    placeholder = "Selecione...",
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (option: string) => {
        const newValues = values.includes(option)
            ? values.filter((v) => v !== option)
            : [...values, option];
        onChange(newValues);
    };

    const removeValue = (valueToRemove: string) => {
        onChange(values.filter((v) => v !== valueToRemove));
    };

    return (
        <div className={cn("space-y-2", className)} ref={containerRef}>
            {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
            <div className="relative">
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between hover:bg-white bg-white text-left font-normal h-auto min-h-[2.5rem] py-2"
                    onClick={() => setOpen(!open)}
                >
                    <span className="truncate">
                        {values.length > 0
                            ? `${values.length} selecionado(s)`
                            : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>

                {open && (
                    <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-white shadow-md">
                        <div className="max-h-60 overflow-auto p-1">
                            {options.map((option) => (
                                <div
                                    key={option}
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 hover:text-gray-900",
                                        values.includes(option) ? "bg-blue-50 text-blue-900" : ""
                                    )}
                                    onClick={() => toggleOption(option)}
                                >
                                    <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                        values.includes(option) ? "bg-primary text-primary-foreground" : "opacity-50"
                                    )}>
                                        {values.includes(option) && <Check className="h-3 w-3 text-blue-600" />}
                                    </div>
                                    <span>{option}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
                {values.map((value) => (
                    <Badge key={value} variant="secondary" className="pr-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                        {value}
                        <button
                            type="button"
                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            onClick={() => removeValue(value)}
                        >
                            <X className="h-3 w-3 hover:text-red-500" />
                            <span className="sr-only">Remove {value}</span>
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
    );
}
