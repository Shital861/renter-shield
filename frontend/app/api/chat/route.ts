import { NextResponse } from 'next/server';

// Local cache for registered sessions
const activeSessions = new Set<string>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, renter_id, session_id } = body;

    if (!message || !renter_id || !session_id) {
      return NextResponse.json(
        { error: 'Missing required parameters: message, renter_id, session_id' },
        { status: 400 }
      );
    }

    // 1. Ensure the session exists on the ADK server
    if (!activeSessions.has(session_id)) {
      const sessionUrl = `http://127.0.0.1:8080/apps/app/users/${encodeURIComponent(
        renter_id
      )}/sessions`;

      try {
        const sessionRes = await fetch(sessionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: session_id }),
        });

        if (sessionRes.ok || sessionRes.status === 409) {
          activeSessions.add(session_id);
        } else {
          console.warn(
            `Failed to create session ${session_id} on ADK server: ${sessionRes.status}`
          );
        }
      } catch (sessionErr) {
        console.error(`Error connecting to ADK session creation:`, sessionErr);
      }
    }

    // 2. Call /run to execute the agent run
    const runUrl = 'http://127.0.0.1:8080/run';
    const runPayload = {
      appName: 'app',
      userId: renter_id,
      sessionId: session_id,
      newMessage: {
        role: 'user',
        parts: [{ text: message }],
      },
    };

    const runRes = await fetch(runUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(runPayload),
    });

    if (!runRes.ok) {
      const errText = await runRes.text();
      return NextResponse.json(
        { error: `ADK server returned error ${runRes.status}: ${errText}` },
        { status: 500 }
      );
    }

    const events = await runRes.json();
    const replyParts: string[] = [];
    let loggedIncident: { timestamp: string; description: string } | null = null;

    // 3. Process events to assemble reply and extract incident logs
    if (Array.isArray(events)) {
      let lastLoggedDescription = '';

      for (const event of events) {
        const content = event?.content;
        if (content && typeof content === 'object') {
          const parts = content.parts;
          if (Array.isArray(parts)) {
            for (const part of parts) {
              if (part && typeof part === 'object') {
                // Collect model reply text parts
                if ('text' in part && typeof part.text === 'string') {
                  replyParts.push(part.text);
                }

                // Check for functionCall / toolCall (from model)
                const fc = part.functionCall || part.toolCall;
                if (fc && typeof fc === 'object') {
                  const fcName = fc.name;
                  const fcArgs = fc.args;
                  if (fcName === 'log_incident' && fcArgs && typeof fcArgs === 'object') {
                    lastLoggedDescription = fcArgs.description || '';
                  }
                }

                // Check for functionResponse / toolResponse (from execution output)
                const fr = part.functionResponse || part.toolResponse;
                if (fr && typeof fr === 'object') {
                  const frName = fr.name;
                  const frResponse = fr.response;
                  if (frName === 'log_incident' && frResponse) {
                    let resStr = '';
                    if (typeof frResponse === 'string') {
                      resStr = frResponse;
                    } else if (typeof frResponse === 'object') {
                      resStr = frResponse.output || frResponse.result || JSON.stringify(frResponse);
                    }

                    if (resStr.includes('Successfully logged incident')) {
                      // Extract timestamp using ISO pattern or fall back to current time
                      const isoMatch = resStr.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^ ]*/);
                      const timestamp = isoMatch ? isoMatch[0] : new Date().toISOString();

                      loggedIncident = {
                        timestamp,
                        description: lastLoggedDescription || 'Logged incident',
                      };
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    const reply = replyParts.join('').trim();

    return NextResponse.json({
      reply: reply || 'I received your request but did not generate a reply.',
      session_id,
      logged_incident: loggedIncident,
    });
  } catch (error: any) {
    console.error('Error in /api/chat route:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
