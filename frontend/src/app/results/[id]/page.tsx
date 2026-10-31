import ResultsClient from "./ResultsClient";

export function generateStaticParams() {
  return [{ id: "demo" }, { id: "latest" }, { id: "sample" }];
}

export default function Page() {
  return <ResultsClient />;
}
