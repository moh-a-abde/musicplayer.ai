import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI
const API_KEY = process.env.GOOGLE_AI_API_KEY;
if (!API_KEY) {
  console.error('GOOGLE_AI_API_KEY is not set in environment variables');
}
const genAI = new GoogleGenerativeAI(API_KEY || '');

export async function POST(req: Request) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured. Please set GOOGLE_AI_API_KEY in .env.local' },
        { status: 500 }
      );
    }

    const { songs } = await req.json();

    if (!Array.isArray(songs) || songs.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: songs array is required' },
        { status: 400 }
      );
    }

    // Format songs for the prompt
    const songList = songs
      .map((song) => `- ${song.title} by ${song.artist}`)
      .join('\n');

    // Create the prompt
    const prompt = `Act as a music recommendation system. Your task is to analyze the following songs and suggest similar music:

Input songs:
${songList}

Please provide 5 song recommendations in a structured JSON format. Focus on musical elements like genre, style, tempo, and mood.

Required JSON format:
[
  {
    "title": "Song Name",
    "artist": "Artist Name",
    "reason": "Brief explanation of how the song aligns in terms of mood, instrumentation, genre, or vocal style."
  }
]

Rules:

1. Focus on musical qualities only
2. Use proper JSON formatting with double quotes
3. Provide exactly 5 recommendations
4. Keep reasons brief and focused on musical elements`;

    // Get response from Gemini
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro'
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    try {
      // Clean the response text
      const cleanedText = text
        .trim()
        .replace(/```json\n?|\n?```/g, '')  // Remove code blocks
        .replace(/[\u201C\u201D]/g, '"')    // Replace smart quotes
        .replace(/[\r\n\t]/g, '')           // Remove newlines and tabs
        .replace(/,\s*]/g, ']')             // Remove trailing commas
        .replace(/,\s*}/g, '}');            // Remove trailing commas in objects

      // Attempt to extract JSON if wrapped in other text
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      const jsonText = jsonMatch ? jsonMatch[0] : cleanedText;
      
      // Parse and validate JSON
      const recommendations = JSON.parse(jsonText);

      // Validate structure
      if (!Array.isArray(recommendations)) {
        throw new Error('Response is not a JSON array');
      }

      // Ensure exactly 5 recommendations
      const validatedRecommendations = recommendations
        .slice(0, 5)
        .map(rec => ({
          title: String(rec.title || '').trim(),
          artist: String(rec.artist || '').trim(),
          reason: String(rec.reason || '').trim()
        }))
        .filter(rec => rec.title && rec.artist && rec.reason);

      if (validatedRecommendations.length === 0) {
        throw new Error('No valid recommendations received');
      }

      return NextResponse.json({ recommendations: validatedRecommendations });
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw AI response:', text);
      
      // Attempt to create a fallback response
      try {
        // Extract any song titles and artists using regex
        const songMatches = text.match(/["']([^"']+)["']\s*by\s*["']([^"']+)["']/g) || [];
        const fallbackRecommendations = songMatches
          .slice(0, 5)
          .map(match => {
            const [title, artist] = match.split(/\s*by\s*/);
            return {
              title: title.replace(/["']/g, '').trim(),
              artist: artist.replace(/["']/g, '').trim(),
              reason: "Similar musical style and genre"
            };
          });

        if (fallbackRecommendations.length > 0) {
          return NextResponse.json({ recommendations: fallbackRecommendations });
        }
      } catch (fallbackError) {
        console.error('Fallback parsing failed:', fallbackError);
      }

      return NextResponse.json(
        { error: 'Could not generate recommendations. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
