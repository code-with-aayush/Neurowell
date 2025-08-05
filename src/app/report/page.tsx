import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, BookText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function ReportContent({ summary, suggestions }: { summary?: string; suggestions?: string }) {
  if (!summary || !suggestions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Report Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested report could not be found. Please return to the dashboard and generate a new report.</p>
        </CardContent>
      </Card>
    );
  }

  const decodedSummary = decodeURIComponent(summary);
  const decodedSuggestions = decodeURIComponent(suggestions);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-4">
            <BookText className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">AI-Generated Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-base whitespace-pre-wrap">{decodedSummary}</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-2 border-accent/20">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Lightbulb className="h-8 w-8 text-accent-foreground" />
            <CardTitle className="text-3xl font-headline">Personalized Suggestions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-base whitespace-pre-wrap">{decodedSuggestions}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportPage({
  searchParams,
}: {
  searchParams: { summary?: string; suggestions?: string };
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="outline">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <Suspense fallback={<div>Loading report...</div>}>
          <ReportContent summary={searchParams.summary} suggestions={searchParams.suggestions} />
        </Suspense>
      </div>
    </div>
  );
}
