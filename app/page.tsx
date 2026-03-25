import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Paper2Notebook</h1>
        <p className="text-lg text-muted-foreground">
          Upload a research paper PDF and generate a production-quality Jupyter
          notebook that implements the paper&apos;s core algorithms.
        </p>
        <Button size="lg">Get Started</Button>
      </div>
    </main>
  );
}
