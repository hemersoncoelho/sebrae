"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Lock } from "lucide-react";
import { login } from "../actions/auth";

export default function LoginPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [state, formAction] = useActionState(login as any, null as any);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg">
                <div className="text-center">
                    <div className="flex flex-col items-center mb-2">
                        <img src="/sebrae-logo.png" alt="Sebrae" className="h-16 w-auto mb-4" />
                        <h1 className="text-xl font-bold text-gray-900">Relatório de Eventos</h1>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Acesso Restrito</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Insira a senha de administrador para continuar.
                    </p>
                </div>

                <form action={formAction} className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm">
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Senha
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                placeholder="Senha de Acesso"
                            />
                        </div>
                    </div>

                    {state?.error && (
                        <div className="text-center text-sm text-red-600">
                            {state.error}
                        </div>
                    )}

                    <div>
                        <SubmitButton />
                    </div>
                </form>
            </div>
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75"
        >
            {pending ? "Entrando..." : "Entrar"}
        </button>
    );
}
