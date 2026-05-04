export default function Footer() {
  return (
    <footer className="border-t border-border bg-card text-card-foreground py-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            <strong>Disclaimer:</strong> This platform is for educational purposes only and does not replace professional medical advice. Always consult with a qualified healthcare provider before starting any new treatment or if you have any questions regarding a medical condition.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} MediGuide. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
