import PatchClient from "./PatchClient";

export function generateStaticParams() {
  return [{ id: "demo" }, { id: "latest" }, { id: "sample" }];
}

export default function Page() {
  return <PatchClient />;
}
