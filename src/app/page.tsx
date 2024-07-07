"use client";

import { ThemeSwitch } from "@/components/theme-switch";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/core";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";

type OutputFormat = {
    format: string;
    label: string;
};

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [inputPath, setInputPath] = useState<string>();
    const [outputFormats, setOutputFormats] = useState<OutputFormat[]>();
    const handleInput = async (inputFormat: string) => {
        try {
            const response = await invoke<string>("handle_input", {
                inputFormat,
            });
            setInputPath(response);
            switch (inputFormat) {
                case "png":
                    setOutputFormats([
                        {
                            format: "jpg",
                            label: "JPG",
                        },
                    ]);
                    break;
                case "jpg":
                    setOutputFormats([
                        {
                            format: "png",
                            label: "PNG",
                        },
                    ]);
                    break;
                default:
                    toast.error(
                        "Could not identify output file format based on given input file"
                    );
            }
        } catch (e) {
            toast.error("Error while handling input", {
                description: String(e),
            });
        }
    };

    const handleOutput = async (inputPath: string, outputFormat: string) => {
        setLoading(true);
        try {
            await invoke("handle_output", {
                inputPath,
                outputFormat,
            });
            toast.success("Generated output file!");
        } catch (e) {
            toast.error("Error while handling output", {
                description: String(e),
            });
        }
        setLoading(false);
    };

    return (
        <main className="flex min-h-screen flex-col items-center p-24">
            <div className="ml-auto">
                <ThemeSwitch />
            </div>
            <div className="flex flex-col space-y-4">
                <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
                    File Converter Tool
                </h1>
                {/* Input file selection */}
                <div>
                    <p>1. Choose an input file:</p>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={async () => await handleInput("png")}
                            className="w-fit mt-2"
                        >
                            PNG
                        </Button>
                        <Button
                            onClick={async () => await handleInput("jpg")}
                            className="w-fit mt-2"
                        >
                            JPG
                        </Button>
                    </div>
                    {inputPath && (
                        <p>
                            Input path:{" "}
                            <span
                                onClick={async () =>
                                    await invoke("show_file", {
                                        filePath: inputPath,
                                    })
                                }
                                className="text-blue-400 dark:text-blue-300 font-semibold cursor-pointer hover:underline"
                            >
                                {inputPath}
                            </span>
                        </p>
                    )}
                </div>
                {/* Output file selection */}
                {inputPath && (
                    <div>
                        <div className="flex gap-2">
                            <p>2. Save to an output file:</p>
                            {loading && (
                                <Loader2Icon className="animate-spin" />
                            )}
                        </div>
                        {outputFormats &&
                            outputFormats.map(
                                (outputFormat: OutputFormat, index: number) => (
                                    <Button
                                        key={index}
                                        onClick={async () =>
                                            await handleOutput(
                                                inputPath,
                                                outputFormat.format
                                            )
                                        }
                                        className="w-fit mt-2"
                                    >
                                        {outputFormat.label}
                                    </Button>
                                )
                            )}
                    </div>
                )}
            </div>
        </main>
    );
}
