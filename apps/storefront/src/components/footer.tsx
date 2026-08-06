export function Footer() {
  return (
    <footer className="mt-24 border-t border-brand-100/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-brand-500 md:flex-row">
        <span className="font-semibold text-brand-800">LuxeRetail</span>
        <span>&copy; {new Date().getFullYear()} LuxeRetail. Built as a portfolio project.</span>
      </div>
    </footer>
  );
}
