import { createFileRoute } from "@tanstack/react-router";
import { VimbisoApp } from "@/components/vimbiso/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <VimbisoApp />;
}
