import { Head } from "./head";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen bg-default-50 text-default-900">
      <Head />
      <main className="w-full flex-grow">{children}</main>
    </div>
  );
}
