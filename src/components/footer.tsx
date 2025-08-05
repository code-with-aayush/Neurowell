export default function Footer() {
  return (
    <footer className="bg-card shadow-sm mt-auto">
      <div className="container mx-auto px-4 py-4 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MindSync Monitor. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
