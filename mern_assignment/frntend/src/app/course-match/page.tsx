'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CourseMatchInput } from '@/ai/schemas';
import { CourseMatchInputSchema } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Star, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ✅ Recommendation type define locally for frontend use
interface Recommendation {
  title: string;
  description: string;
  category: string;
  level: string;
}

interface CourseMatchOutput {
  recommendations: Recommendation[];
}

export default function CourseMatchPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CourseMatchInput>({
    resolver: zodResolver(CourseMatchInputSchema),
    defaultValues: { description: '' },
  });

  async function fetchRecommendations(values: { description: string; skillLevel?: string }) {
    try {
      setIsLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_RECO_BASE}/recommendations/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error('Failed to fetch recommendations');

      const data: CourseMatchOutput = await res.json();

      // Ensure each recommendation has required fields
      const recs: Recommendation[] = (data.recommendations || []).map((rec) => ({
        title: rec.title || 'Untitled',
        description: rec.description || 'No description',
        category: rec.category || 'General',
        level: rec.level || 'beginner',
      }));

      setRecommendations(recs);
    } catch (e) {
      setError('An error occurred while generating recommendations. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const onSubmit = (values: CourseMatchInput) => {
    fetchRecommendations({ description: values.description || '', skillLevel: values.skillLevel });
  };

  const exampleDescription =
    "I'm a high school student with strong grades in Math and Physics. I love coding, building small robots, and I'm fascinated by artificial intelligence. I'm looking for an undergraduate program at a top-tier university, preferably in the US, that has a great reputation for engineering and a vibrant campus life.";

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="text-center mb-12">
        <Sparkles className="mx-auto h-12 w-12 text-accent mb-4" />
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
          AI Course Match
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Describe your interests, academic background, and what you're looking for in a course. Our AI will suggest the best matches for you.
        </p>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="p-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Your Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'I'm interested in environmental science and want a hands-on program...'"
                        className="min-h-[150px] mt-2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-accent mt-2"
                onClick={() => form.setValue('description', exampleDescription)}
              >
                Use an example
              </Button>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Find My Courses
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {error && (
        <div className="mt-8 text-center text-destructive bg-destructive/10 p-4 rounded-md">
          {error}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mt-12">
          <h2 className="font-headline text-3xl font-bold mb-6 text-center text-primary">
            Your Recommended Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">{rec.title}</CardTitle>
                  <CardDescription>{rec.category}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" /> Level
                      </span>
                      <Badge variant="default">{rec.level}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground pt-2">{rec.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
